import { NextResponse } from 'next/server';
import {
  validateDeliveryAddress,
  evaluateShipmentPackaging,
  createAggregatorDispatch,
  lookupTracking,
} from '@/lib/services/shippingAggregator';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { action, orderNumber, customerName, street, city, state, postalCode, country, items } = body;

    if (action === 'validate_address') {
      const result = validateDeliveryAddress({ street, city, postalCode, country });
      return NextResponse.json(result);
    }

    if (action === 'check_lq_hazard') {
      const evaluation = evaluateShipmentPackaging(items || []);
      return NextResponse.json(evaluation);
    }

    if (action === 'dispatch_order') {
      const validation = validateDeliveryAddress({ street, city, postalCode, country });
      if (!validation.isValid) {
        return NextResponse.json({ error: validation.error }, { status: 400 });
      }

      const shipment = createAggregatorDispatch({
        orderNumber: orderNumber || `RY-${Date.now().toString().slice(-5)}`,
        customerName: customerName || 'Valued Customer',
        street,
        city,
        state: state || 'NY',
        postalCode,
        country: country || 'United States',
        items: items || [],
      });

      return NextResponse.json({
        success: true,
        message: 'Order dispatched through aggregator.',
        shipment,
      });
    }

    return NextResponse.json({ error: 'Unknown action parameter.' }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Dispatch processing error' }, { status: 500 });
  }
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get('q');

  if (!query) {
    return NextResponse.json({ error: 'Tracking query parameter q is required' }, { status: 400 });
  }

  const shipment = lookupTracking(query);
  if (!shipment) {
    return NextResponse.json({ error: 'Shipment not found' }, { status: 404 });
  }

  return NextResponse.json(shipment);
}
