import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { confirmOrderCompletion, StockError } from '@/lib/services/orderService';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { orderNumber, orderId, sessionId, simulated, paymentMethod } = body;

    const order = await confirmOrderCompletion({
      orderNumber: orderNumber || orderId,
      sessionId,
      simulated: Boolean(simulated),
      paymentMethod,
    });

    try {
      revalidatePath('/');
      revalidatePath('/products');
      revalidatePath('/category/[slug]', 'page');
      revalidatePath('/products/[slug]', 'page');
    } catch (e) {
      // Non-fatal in test contexts
    }

    return NextResponse.json({ success: true, order });
  } catch (error: any) {
    if (error instanceof StockError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.statusCode }
      );
    }
    console.error('Error confirming order completion:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to confirm order completion' },
      { status: 500 }
    );
  }
}

