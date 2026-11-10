import { NextRequest, NextResponse } from 'next/server';
import { listOrders, markOrderDispatched, StockError } from '@/lib/services/orderService';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get('email') || undefined;
    const orderId = searchParams.get('orderId') || undefined;

    const orders = await listOrders({ email, orderId });
    return NextResponse.json({ orders });
  } catch (error: any) {
    console.error('Error in /api/orders GET:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch orders' },
      { status: 500 }
    );
  }
}

async function handleDispatchUpdate(req: NextRequest) {
  try {
    const body = await req.json();
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
        { error: 'Missing orderId or orderNumber.' },
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
    console.error('Error updating order dispatch:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update order dispatch' },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  return handleDispatchUpdate(req);
}

export async function POST(req: NextRequest) {
  return handleDispatchUpdate(req);
}
