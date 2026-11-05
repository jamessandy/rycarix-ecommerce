import { NextRequest, NextResponse } from 'next/server';
import {
  buildDispatchNotificationEmailHtml,
  sendEmail,
  DispatchNotificationEmailData,
} from '@/lib/services/emailService';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const data: DispatchNotificationEmailData = {
      orderNumber: body.orderNumber || `RY-${Date.now().toString().slice(-5)}`,
      customerName: body.customerName || 'Valued Client',
      customerEmail: body.customerEmail || body.email,
      carrier: body.carrier || 'Royal Mail Tracked',
      trackingNumber: body.trackingNumber || `RY-RM-${Date.now().toString().slice(-6)}GB`,
      serviceLevel: body.serviceLevel || `${body.carrier || 'Royal Mail'} Priority Tracked`,
      estimatedDelivery: body.estimatedDelivery || 'In 1–2 Business Days',
      trackingUrl: body.trackingUrl,
      items: body.items,
      address: body.address,
    };

    if (!data.customerEmail) {
      return NextResponse.json({ error: 'Customer email is required.' }, { status: 400 });
    }

    const html = buildDispatchNotificationEmailHtml(data);
    const subject = `Dispatched: Your Rycarix Parcel #${data.orderNumber} is on the way (${data.carrier})`;

    const result = await sendEmail({
      to: data.customerEmail,
      subject,
      html,
      type: 'DISPATCH_NOTIFICATION',
      orderNumber: data.orderNumber,
      carrier: data.carrier,
      trackingNumber: data.trackingNumber,
    });

    return NextResponse.json({
      success: true,
      message: 'Dispatch notification email generated and processed.',
      deliveryId: result.id,
      status: result.status,
      recipient: data.customerEmail,
      orderNumber: data.orderNumber,
      carrier: data.carrier,
      trackingNumber: data.trackingNumber,
    });
  } catch (error: any) {
    console.error('Dispatch notification email error:', error);
    return NextResponse.json({ error: error.message || 'Dispatch email failed' }, { status: 500 });
  }
}
