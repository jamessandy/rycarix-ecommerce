import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendOrderConfirmationEmail } from "@/lib/email";
import { revalidatePath } from "next/cache";
import { listOrders, markOrderDispatched, StockError } from "@/lib/services/orderService";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get("email") || undefined;
    const orderId = searchParams.get("orderId") || undefined;

    const orders = await listOrders({ email, orderId });
    return NextResponse.json({ orders });
  } catch (error: any) {
    console.error("Error in /api/orders GET:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch orders" },
      { status: 500 }
    );
  }
}

async function handleDispatchUpdate(body: any) {
  try {
    const {
      orderId,
      orderNumber,
      carrier,
      trackingNumber,
      trackingUrl,
      estimatedDelivery,
      currentStatus,
    } = body;

    if (!(orderId || orderNumber)) {
      return NextResponse.json(
        { error: "Missing orderId or orderNumber." },
        { status: 400 }
      );
    }

    const updated = await markOrderDispatched({
      orderNumber: orderNumber || orderId,
      orderId,
      carrier,
      trackingNumber,
      trackingUrl,
      estimatedDelivery,
      currentStatus,
    });

    return NextResponse.json({
      success: true,
      order: updated,
      updated,
    });
  } catch (error: any) {
    if (error instanceof StockError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode });
    }
    console.error("Error updating order dispatch:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update order dispatch" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  const body = await req.json();
  return handleDispatchUpdate(body);
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { userId, customerEmail, customerName, shippingAddress, items } = body;

    // Handle legacy dispatch call if no cart items
    if (!items || !Array.isArray(items) || items.length === 0) {
      if (body.orderId || body.orderNumber) {
        return handleDispatchUpdate(body);
      }
      return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
    }

    const orderNumber = `RYC-${Date.now().toString().slice(-6)}-${Math.random()
      .toString(36)
      .substring(2, 5)
      .toUpperCase()}`;

    const order = await prisma.$transaction(async (tx) => {
      let calculatedTotal = 0;
      const orderItemsPayload = [];

      for (const item of items) {
        // Atomic stock verification and deduction
        const updatedCount = await tx.product.updateMany({
          where: {
            id: item.productId,
            stock: { gte: item.quantity },
            isLive: true,
          },
          data: {
            stock: { decrement: item.quantity },
          },
        });

        if (updatedCount.count === 0) {
          throw new Error(`Insufficient stock for "${item.name || "selected item"}".`);
        }

        const product = await tx.product.findUnique({
          where: { id: item.productId },
        });

        if (!product) {
          throw new Error("Product not found.");
        }

        const lineTotal = Number(product.price) * item.quantity;
        calculatedTotal += lineTotal;

        orderItemsPayload.push({
          productId: product.id,
          productName: product.name,
          productTitle: product.name,
          productImage: product.images?.[0] || null,
          quantity: item.quantity,
          price: product.price,
          unitPrice: product.price,
          total: lineTotal,
          sku: product.sku || `SKU-${Date.now().toString().slice(-4)}`,
        });
      }

      return tx.order.create({
        data: {
          orderNumber,
          userId: userId || null,
          customerEmail: customerEmail || null,
          customerName: customerName || null,
          guestEmail: customerEmail || null,
          shippingAddress: shippingAddress || {},
          totalAmount: calculatedTotal,
          subtotal: calculatedTotal,
          total: calculatedTotal,
          currency: "GBP",
          status: "PREPARING",
          items: {
            create: orderItemsPayload,
          },
        },
        include: { items: true },
      });
    });

    // Send confirmation email asynchronously
    try {
      await sendOrderConfirmationEmail({
        orderNumber: order.orderNumber,
        customerName: order.customerName || customerName || "Valued Client",
        customerEmail: order.customerEmail || customerEmail || "",
        totalAmount: (order.totalAmount || order.total).toString(),
        items: order.items.map((i) => ({
          productName: i.productName || i.productTitle,
          quantity: i.quantity,
          price: (i.price || i.unitPrice).toString(),
        })),
      });
    } catch (emailErr) {
      console.warn("Order confirmation email failed:", emailErr);
    }

    revalidatePath("/shop");
    revalidatePath("/admin/products");
    revalidatePath("/admin/orders");

    return NextResponse.json({ order }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to place order." },
      { status: 400 }
    );
  }
}
