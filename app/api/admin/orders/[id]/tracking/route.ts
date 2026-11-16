import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendOrderShippedEmail } from "@/lib/email";
import { revalidatePath } from "next/cache";

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } | Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await Promise.resolve(params);
    const orderId = resolvedParams.id;
    const { status, trackingNumber, carrier, trackingUrl } = await req.json();

    const existingOrder = await prisma.order.findUnique({
      where: { id: orderId },
      include: { items: true },
    });

    if (!existingOrder) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const isNewlyShipped =
      status === "SHIPPED" &&
      (existingOrder.status !== "SHIPPED" ||
        existingOrder.trackingNumber !== trackingNumber);

    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: {
        status,
        trackingNumber: trackingNumber?.trim() || null,
        carrier: carrier?.trim() || null,
        trackingUrl: trackingUrl?.trim() || null,
        shippedAt:
          status === "SHIPPED"
            ? existingOrder.shippedAt ?? new Date()
            : existingOrder.shippedAt,
      },
      include: { items: true },
    });

    // Trigger dispatch email with tracking details when marked as SHIPPED
    if (isNewlyShipped && updatedOrder.trackingNumber) {
      const shippingAddr = (updatedOrder.shippingAddress || {}) as Record<string, any>;
      const resolvedCustomerName =
        updatedOrder.customerName || shippingAddr.name || "Valued Client";
      const resolvedCustomerEmail =
        updatedOrder.customerEmail ||
        updatedOrder.guestEmail ||
        shippingAddr.email ||
        "";

      if (resolvedCustomerEmail) {
        try {
          await sendOrderShippedEmail({
            orderNumber: updatedOrder.orderNumber,
            customerName: resolvedCustomerName,
            customerEmail: resolvedCustomerEmail,
            totalAmount: (
              updatedOrder.totalAmount ||
              updatedOrder.total ||
              0
            ).toString(),
            trackingNumber: updatedOrder.trackingNumber,
            carrier: updatedOrder.carrier,
            trackingUrl: updatedOrder.trackingUrl,
            items: updatedOrder.items.map((i) => ({
              productName: i.productName || i.productTitle,
              quantity: i.quantity,
              price: (i.price || i.unitPrice || 0).toString(),
            })),
          });
        } catch (emailErr) {
          console.warn("Order shipped email error:", emailErr);
        }
      }
    }

    revalidatePath("/admin/orders");
    revalidatePath("/dashboard/orders");
    revalidatePath("/dashboard/admin");
    revalidatePath("/dashboard/user");
    revalidatePath("/track");

    return NextResponse.json({ order: updatedOrder });
  } catch (error: any) {
    console.error("Failed to update tracking details:", error);
    return NextResponse.json(
      { error: "Failed to update tracking details." },
      { status: 500 }
    );
  }
}
