import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import prisma from '@/lib/prisma';

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

const stripe = stripeSecretKey
  ? new Stripe(stripeSecretKey, { apiVersion: '2024-06-20' as any })
  : null;

export async function POST(req: NextRequest) {
  if (!stripe || !webhookSecret) {
    return NextResponse.json(
      { message: 'Stripe webhook listener inactive (keys not configured).' },
      { status: 200 }
    );
  }

  const signature = req.headers.get('stripe-signature');
  if (!signature) {
    return NextResponse.json({ error: 'Missing stripe signature.' }, { status: 400 });
  }

  try {
    const rawBody = await req.text();
    const event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const isKlarna = session.payment_method_types?.includes('klarna');

        console.log(`[Rycarix Order] Checkout completed for session ${session.id}. Klarna: ${isKlarna}`);

        // Update database Order and Payment status
        // e.g., await prisma.order.update({ where: { ... }, data: { status: 'PAID' } })
        break;
      }

      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        const paymentMethodType = paymentIntent.payment_method_types?.[0];

        console.log(`[Rycarix Settlement] Payment Intent ${paymentIntent.id} succeeded via ${paymentMethodType}`);
        break;
      }

      case 'payment_intent.payment_failed': {
        const failedIntent = event.data.object as Stripe.PaymentIntent;
        console.error(`[Rycarix Alert] Payment failed: ${failedIntent.id}, Reason: ${failedIntent.last_payment_error?.message}`);
        break;
      }

      default:
        console.log(`Unhandled Stripe event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (err: any) {
    console.error('Stripe webhook verification error:', err.message);
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
  }
}
