import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import prisma from '@/lib/prisma';
import { buildOrderConfirmationEmailHtml, sendEmail } from '@/lib/services/emailService';

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

        // Send automated Order Confirmation email
        const customerEmail = session.customer_details?.email || session.customer_email;
        if (customerEmail) {
          try {
            const orderNumber = session.metadata?.orderId || `RY-${session.id.slice(-6).toUpperCase()}`;
            const customerName = session.customer_details?.name || 'Valued Client';
            const shipping = session.shipping_details;
            const totalAmount = session.amount_total ? session.amount_total / 100 : 0;

            const emailHtml = buildOrderConfirmationEmailHtml({
              orderNumber,
              customerName,
              customerEmail,
              date: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
              total: totalAmount,
              paymentMethod: isKlarna ? 'Klarna Pay in 3 (0% APR)' : 'Authorized Card (Stripe)',
              items: [
                {
                  title: 'Rycarix Atelier Formulations',
                  variantTitle: 'Curated Edition',
                  quantity: 1,
                  price: totalAmount,
                },
              ],
              address: {
                name: customerName,
                street: shipping?.address?.line1 || 'Address on file',
                city: shipping?.address?.city || 'London',
                state: shipping?.address?.state || 'Greater London',
                postalCode: shipping?.address?.postal_code || '',
                country: shipping?.address?.country || 'United Kingdom',
              },
            });

            await sendEmail({
              to: customerEmail,
              subject: `Order Confirmed • ${orderNumber} • Rycarix Atelier`,
              html: emailHtml,
              type: 'ORDER_CONFIRMATION',
              orderNumber,
            });
          } catch (emailErr) {
            console.warn('[Rycarix Webhook] Could not send confirmation email:', emailErr);
          }
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
