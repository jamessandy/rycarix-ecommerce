import { NextRequest, NextResponse } from 'next/server';
import {
  buildOrderConfirmationEmailHtml,
  sendEmail,
  OrderConfirmationEmailData,
} from '@/lib/services/emailService';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const data: OrderConfirmationEmailData = {
      orderNumber: body.orderNumber || `RY-${Date.now().toString().slice(-5)}`,
      customerName: body.customerName || 'Valued Client',
      customerEmail: body.customerEmail || body.email,
      customerPhone: body.customerPhone || body.phone,
      date: body.date || new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
      total: Number(body.total) || 0,
      subtotal: body.subtotal ? Number(body.subtotal) : undefined,
      shippingCost: body.shippingCost !== undefined ? Number(body.shippingCost) : undefined,
      shippingMethod: body.shippingMethod || body.shippingService || 'Royal Mail Tracked 48',
      paymentMethod: body.paymentMethod || 'Authorized Card / Klarna',
      items: Array.isArray(body.items) && body.items.length > 0 ? body.items : [
        {
          title: typeof body.items === 'string' ? body.items : 'Rycarix Product',
          variantTitle: '100ml / 3.4 fl. oz.',
          quantity: 1,
          price: Number(body.total) || 0,
        }
      ],
      address: body.address || {
        street: '42 Kensington Palace Gardens',
        city: 'London',
        state: 'Greater London',
        postalCode: 'W8 4QP',
        country: 'United Kingdom',
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

