import { NextRequest, NextResponse } from 'next/server';
import {
  loadEmailLogs,
  buildOrderConfirmationEmailHtml,
  buildDispatchNotificationEmailHtml,
} from '@/lib/services/emailService';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  const type = searchParams.get('type') || 'order_confirmation';

  if (id) {
    const logs = loadEmailLogs();
    const match = logs.find((l) => l.id === id);
    if (match && match.html) {
      return new NextResponse(match.html, {
        headers: { 'Content-Type': 'text/html; charset=utf-8' },
      });
    }
  }

  // Sample preview
  if (type === 'dispatch_notification') {
    const sampleHtml = buildDispatchNotificationEmailHtml({
      orderNumber: 'RY-84920',
      customerName: 'Éléonore de Vance',
      customerEmail: 'eleonore.devance@example.com',
      carrier: 'Royal Mail',
      trackingNumber: 'GB84920123RY',
      serviceLevel: 'Standard UK Delivery (Dangerous Goods LQ Compliant)',
      estimatedDelivery: '2–3 working days',
      items: [
        {
          title: 'Princess Reef Extrait de Parfum',
          variantTitle: '100ml / 3.4 fl. oz.',
          quantity: 1,
          price: 39.99,
        },
      ],
      address: {
        street: '42 Kensington Palace Gardens',
        city: 'London',
        state: 'Greater London',
        postalCode: 'W8 4QP',
        country: 'United Kingdom',
      },
    });

    return new NextResponse(sampleHtml, {
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
    });
  }

  const sampleHtml = buildOrderConfirmationEmailHtml({
    orderNumber: 'RY-84920',
    customerName: 'Éléonore de Vance',
    customerEmail: 'eleonore.devance@example.com',
    customerPhone: '+44 7946 0991',
    date: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
    total: 43.49,
    subtotal: 39.99,
    shippingCost: 3.50,
    shippingMethod: 'Standard UK Delivery',
    paymentMethod: 'Klarna Pay in 3 (0% APR)',
    items: [
      {
        title: 'Princess Reef Extrait de Parfum',
        variantTitle: '100ml / 3.4 fl. oz.',
        quantity: 1,
        price: 39.99,
      },
    ],
    address: {
      name: 'Éléonore de Vance',
      street: '42 Kensington Palace Gardens',
      city: 'London',
      state: 'Greater London',
      postalCode: 'W8 4QP',
      country: 'United Kingdom',
    },
  });

  return new NextResponse(sampleHtml, {
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  });
}

