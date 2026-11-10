import { NextRequest, NextResponse } from 'next/server';
import {
  buildOrderConfirmationEmailHtml,
  sendEmail,
  OrderConfirmationEmailData,
} from '@/lib/services/emailService';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const recipientEmail = body.recipientEmail || body.customerEmail || body.email;
    const rawAddr = body.address || body.shippingAddress || {};

    const data: OrderConfirmationEmailData = {
      orderNumber: body.orderNumber || `RY-${Date.now().toString().slice(-5)}`,
      customerName: body.customerName || 'Valued Client',
      customerEmail: recipientEmail,
      customerPhone: body.customerPhone || body.phone || rawAddr.phone,
      date:
        body.date ||
        new Date().toLocaleDateString('en-GB', {
          day: 'numeric',
          month: 'short',
          year: 'numeric',
        }),
      total: Number(body.total) || 0,
      subtotal: body.subtotal !== undefined ? Number(body.subtotal) : undefined,
      shippingCost: body.shippingCost !== undefined ? Number(body.shippingCost) : undefined,
      shippingMethod: body.shippingMethod || body.shippingService || 'Standard UK Delivery',
      paymentMethod: body.paymentMethod || 'Stripe / Klarna',
      items:
        Array.isArray(body.items) && body.items.length > 0
          ? body.items
          : [
              {
                title: typeof body.items === 'string' ? body.items : 'Rycarix Order',
                variantTitle: 'Standard',
                quantity: 1,
                price: Number(body.total) || 0,
              },
            ],
      address: {
        name: rawAddr.name || body.customerName || 'Valued Client',
        street: rawAddr.street || 'Address on file',
        city: rawAddr.city || '',
        state: rawAddr.state || '',
        postalCode: rawAddr.postalCode || '',
        country: rawAddr.country || 'United Kingdom',
      },
      trackingUrl: body.trackingUrl,
    };

    if (!data.customerEmail) {
      return NextResponse.json({ error: 'Customer email is required.' }, { status: 400 });
    }

    const html = buildOrderConfirmationEmailHtml(data);
    const subject = `Order Confirmed • ${data.orderNumber} • Rycarix Store`;

    const result = await sendEmail({
      to: data.customerEmail,
      subject,
      html,
      type: 'ORDER_CONFIRMATION',
      orderNumber: data.orderNumber,
    });

    return NextResponse.json({
      success: true,
      message: 'Order confirmation email generated and processed.',
      deliveryId: result.id,
      status: result.status,
      recipient: data.customerEmail,
      orderNumber: data.orderNumber,
    });
  } catch (error: any) {
    console.error('Order confirmation email error:', error);
    return NextResponse.json({ error: error.message || 'Email processing failed' }, { status: 500 });
  }
}
