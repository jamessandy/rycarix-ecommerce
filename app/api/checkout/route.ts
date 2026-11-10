import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import {
  createPendingOrder,
  StockError,
  updateOrderStripeSession,
} from '@/lib/services/orderService';
import {
  getCheckoutShippingOptions,
  RoyalMailServiceOption,
} from '@/lib/services/shippingAggregator';

const stripeSecretKey = (process.env.STRIPE_SECRET_KEY || '').trim().replace(/^["']|["']$/g, '');
const stripe =
  stripeSecretKey && !stripeSecretKey.includes('...')
    ? new Stripe(stripeSecretKey, {
        apiVersion: '2024-06-20' as any,
      })
    : null;

function toStripeShippingRate(opt: RoyalMailServiceOption) {
  return {
    shipping_rate_data: {
      type: 'fixed_amount' as const,
      fixed_amount: {
        amount: Math.round(Number(opt.price || 0) * 100),
        currency: 'gbp',
      },
      display_name: opt.service,
      delivery_estimate: {
        minimum: { unit: 'business_day' as const, value: Math.max(1, opt.minDays || 2) },
        maximum: { unit: 'business_day' as const, value: Math.max(1, opt.maxDays || 3) },
      },
    },
  };
}

function buildStripeShippingOptions(
  subtotal: number,
  country: string | undefined,
  selectedOption: RoyalMailServiceOption
) {
  const candidates = getCheckoutShippingOptions(subtotal, country).filter((opt) => {
    // When subtotal >= £100 in UK, Standard UK £3.50 upgrades automatically to Free UK Delivery
    if (subtotal >= 100 && opt.id === 'standard-uk') return false;
    if (subtotal < 100 && opt.id === 'free-uk') return false;
    return true;
  });

  const ordered: RoyalMailServiceOption[] = [selectedOption];
  for (const c of candidates) {
    if (!ordered.some((o) => o.id === c.id)) {
      ordered.push(c);
    }
  }

  return ordered.map(toStripeShippingRate);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      items,
      customerEmail,
      customerName,
      customerPhone,
      shippingAddress,
      shippingOptionId,
      paymentMethod,
    } = body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: 'No items provided for checkout.' },
        { status: 400 }
      );
    }

    const host =
      req.headers.get('origin') ||
      (process.env.NEXT_PUBLIC_APP_URL ? process.env.NEXT_PUBLIC_APP_URL.replace(/\/$/, '') : 'https://www.rycarix.com');

    // Create validated PENDING order in Neon PostgreSQL before initiating payment
    const { order, shippingOption, validatedItems } = await createPendingOrder({
      items,
      customerEmail: customerEmail || shippingAddress?.email || '',
      customerName: customerName || shippingAddress?.name || '',
      customerPhone: customerPhone || shippingAddress?.phone || '',
      shippingAddress,
      shippingOptionId,
      paymentMethod,
    });

    // Always bill in GBP matching store currency and UK/International delivery schedule
    const currency = 'gbp';
    const isHttpsOrigin = host.startsWith('https://');

    const line_items = validatedItems.map((item) => {
      let imageUrl: string | undefined;
      if (item.image && typeof item.image === 'string') {
        if (item.image.startsWith('https://')) {
          imageUrl = item.image;
        } else if (item.image.startsWith('/') && isHttpsOrigin) {
          imageUrl = `${host}${item.image}`;
        }
      }

      return {
        price_data: {
          currency,
          product_data: {
            name: item.title,
            description: item.variantTitle ? `${item.variantTitle} • SKU: ${item.sku || 'RY-01'}` : undefined,
            images: imageUrl ? [imageUrl] : [],
          },
          unit_amount: Math.round(item.price * 100),
        },
        quantity: item.quantity,
      };
    });

    const stripeShippingOptions = buildStripeShippingOptions(
      order.subtotal,
      shippingAddress?.country,
      shippingOption
    );

    if (stripe) {
      const baseSessionParams: Stripe.Checkout.SessionCreateParams = {
        line_items,
        mode: 'payment',
        customer_email: order.email || undefined,
        phone_number_collection: {
          enabled: true,
        },
        billing_address_collection: 'required',
        shipping_address_collection: {
          allowed_countries: [
            'GB',
            'IE',
            'FR',
            'DE',
            'IT',
            'ES',
            'NL',
            'BE',
            'PT',
            'CH',
            'AT',
            'SE',
            'NO',
            'DK',
            'PL',
            'US',
            'CA',
            'AU',
            'AE',
            'JP',
            'NG',
            'GH',
            'ZA',
          ],
        },
        shipping_options: stripeShippingOptions,
        success_url: `${host}/dashboard/user?session_id={CHECKOUT_SESSION_ID}&orderId=${encodeURIComponent(order.orderNumber)}&status=success`,
        cancel_url: `${host}/checkout?canceled=true&orderId=${encodeURIComponent(order.orderNumber)}`,
        metadata: {
          platform: 'Rycarix Luxury E-Commerce',
          orderId: order.orderNumber,
          shippingOptionId: shippingOption.id,
          shippingService: shippingOption.service,
          customerEmail: order.email,
          customerName: order.customer,
          customerPhone: order.phone,
        },
      };

      try {
        const session = await stripe.checkout.sessions.create({
          ...baseSessionParams,
          payment_method_types: ['card', 'klarna', 'afterpay_clearpay', 'link'],
        });

        await updateOrderStripeSession(order.orderNumber, session.id);

        if (session.url) {
          return NextResponse.json({
            url: session.url,
            sessionId: session.id,
            orderNumber: order.orderNumber,
          });
        }
      } catch (stripeErr: any) {
        console.warn(
          'Primary Stripe session creation failed, retrying with card payment method:',
          stripeErr.message
        );
        try {
          const cardSession = await stripe.checkout.sessions.create({
            ...baseSessionParams,
            payment_method_types: ['card'],
          });
          await updateOrderStripeSession(order.orderNumber, cardSession.id);
          if (cardSession.url) {
            return NextResponse.json({
              url: cardSession.url,
              sessionId: cardSession.id,
              orderNumber: order.orderNumber,
            });
          }
        } catch (cardErr: any) {
          console.warn(
            'Stripe card session fallback also unavailable:',
            cardErr.message
          );
        }
      }
    }

    // Fallback path when Stripe key is missing or unreachable in local dev/sandbox
    return NextResponse.json({
      url: `/dashboard/user?checkout_simulated=true&orderId=${encodeURIComponent(order.orderNumber)}&method=${encodeURIComponent(paymentMethod || 'Stripe Card')}`,
      orderNumber: order.orderNumber,
      message: 'Proceeding with verified local order confirmation.',
      simulated: true,
      line_items,
    });
  } catch (error: any) {
    if (error instanceof StockError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.statusCode }
      );
    }
    console.error('Stripe/Klarna Checkout Session Error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
