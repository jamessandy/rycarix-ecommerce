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
    const rawId = resolvedParams?.id ? decodeURIComponent(resolvedParams.id).trim() : "";
    const body = await req.json().catch(() => ({}));
    const { status, carrier, trackingUrl } = body;
    let trackingNumber = body.trackingNumber;

    if (!rawId) {
      return NextResponse.json({ error: "Order reference is required." }, { status: 400 });
    }

    // Resolve order by either cuid id or orderNumber (e.g., RY-6620626), case-insensitively
    const existingOrder = await prisma.order.findFirst({
      where: {
        OR: [
          { id: rawId },
          { orderNumber: rawId },
          { orderNumber: { equals: rawId, mode: "insensitive" } },
        ],
      },
      include: { items: true },
    });

    if (!existingOrder) {
      return NextResponse.json(
        { error: `Order "${rawId}" not found in database.` },
        { status: 404 }
      );
    }

    const ord = existingOrder as any;
    const resolvedCarrier = (carrier || ord.carrier || "Royal Mail Tracked").trim();
    if (status === "SHIPPED" && (!trackingNumber || !trackingNumber.trim())) {
      trackingNumber = ord.trackingNumber || `GB${Date.now().toString().slice(-8)}RY`;
    }

    const isNewlyShipped =
      status === "SHIPPED" &&
      (ord.status !== "SHIPPED" ||
        ord.trackingNumber !== trackingNumber);

    const billingObj = (ord.billingAddress || {}) as Record<string, any>;
    const meta = (billingObj._meta || {}) as Record<string, any>;

    const updateData: any = {
      status,
      fulfillmentStatus:
        status === "SHIPPED" || status === "DELIVERED"
          ? "FULFILLED"
          : ord.fulfillmentStatus,
      trackingNumber: trackingNumber?.trim() || null,
      carrier: resolvedCarrier || null,
      trackingUrl: trackingUrl?.trim() || null,
      billingAddress: {
        ...billingObj,
        _meta: {
          ...meta,
          carrier: resolvedCarrier,
          fulfillment:
            status === "DELIVERED"
              ? "Delivered"
              : status === "SHIPPED"
              ? "Dispatched"
              : "Ready for Dispatch",
          currentStatus:
            status === "DELIVERED"
              ? "DELIVERED"
              : status === "SHIPPED"
              ? "IN_TRANSIT"
              : "DISPATCH_PENDING",
          dispatchEmailSent: isNewlyShipped ? true : Boolean(meta.dispatchEmailSent),
        },
      },
    };

    if (status === "SHIPPED") {
      updateData.shippedAt = ord.shippedAt ?? new Date();
    } else if (ord.shippedAt) {
      updateData.shippedAt = ord.shippedAt;
    }

    const updatedOrder: any = await prisma.order.update({
      where: { id: ord.id },
      data: updateData,
      include: { items: true },
    });

    // Trigger dispatch email with tracking details when marked as SHIPPED
    if (isNewlyShipped && updatedOrder.trackingNumber) {
      const shippingAddr = (updatedOrder.shippingAddress || {}) as Record<string, any>;
      const resolvedCustomerName =
        updatedOrder.customerName ||
        meta.customerName ||
        shippingAddr.name ||
        "Valued Client";
      const resolvedCustomerEmail =
        updatedOrder.customerEmail ||
        updatedOrder.guestEmail ||
        meta.customerEmail ||
        shippingAddr.email ||
        "";

      if (resolvedCustomerEmail) {
        try {
          const rawItems = Array.isArray(updatedOrder.items) ? updatedOrder.items : [];
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
            items: rawItems.map((i: any) => ({
              productName: i.productName || i.productTitle || "Rycarix Product",
              quantity: Number(i.quantity || 1),
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
