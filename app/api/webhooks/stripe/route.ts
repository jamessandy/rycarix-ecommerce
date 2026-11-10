import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import Stripe from 'stripe';
import { confirmOrderCompletion } from '@/lib/services/orderService';

const stripeSecretKey = (process.env.STRIPE_SECRET_KEY || '').trim().replace(/^["']|["']$/g, '');
const webhookSecret = (process.env.STRIPE_WEBHOOK_SECRET || '').trim().replace(/^["']|["']$/g, '');

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
        console.log(`[Rycarix Order] Checkout webhook completed for session ${session.id}`);
        try {
          await confirmOrderCompletion({
            orderNumber: session.metadata?.orderId,
            sessionId: session.id,
          });
          revalidatePath('/');
          revalidatePath('/products');
          revalidatePath('/category/[slug]', 'page');
          revalidatePath('/products/[slug]', 'page');
        } catch (confirmErr) {
          console.warn('[Rycarix Webhook] Order confirmation warning:', confirmErr);
        }
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
