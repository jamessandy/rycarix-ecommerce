import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

// Initialize Stripe server client
const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
const stripe =
  stripeSecretKey && !stripeSecretKey.includes('...')
    ? new Stripe(stripeSecretKey, {
        apiVersion: '2024-06-20' as any,
      })
    : null;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { items, customerEmail } = body;

    if (!items || !items.length) {
      return NextResponse.json(
        { error: 'No items provided for checkout.' },
        { status: 400 }
      );
    }

    const host = req.headers.get('origin') || 'https://www.rycarix.com';

    // Determine user currency based on location or language headers
    let currency = 'gbp'; // UK default
    const country = req.headers.get('x-vercel-ip-country');
    const acceptLanguage = req.headers.get('accept-language') || '';
    
    if (country) {
      if (country === 'US') currency = 'usd';
      else if (country === 'CA') currency = 'cad';
      else if (['FR', 'DE', 'IT', 'ES', 'NL', 'AT', 'BE', 'FI', 'GR', 'IE', 'PT'].includes(country)) currency = 'eur';
      else if (country === 'AU') currency = 'aud';
      else if (country === 'JP') currency = 'jpy';
    } else if (acceptLanguage) {
      if (acceptLanguage.includes('en-US')) currency = 'usd';
      else if (acceptLanguage.includes('en-CA')) currency = 'cad';
      else if (acceptLanguage.includes('en-AU')) currency = 'aud';
      else if (acceptLanguage.includes('fr') || acceptLanguage.includes('de') || acceptLanguage.includes('it') || acceptLanguage.includes('es') || acceptLanguage.includes('nl')) currency = 'eur';
    }

    // Map items to Stripe line items
    const line_items = items.map((item: any) => ({
      price_data: {
        currency: currency,
        product_data: {
          name: item.title,
          description: `${item.variantTitle} • SKU: ${item.sku || 'RY-01'}`,
          images: item.image ? [item.image] : [],
        },
        unit_amount: Math.round(item.price * 100), // Stripe expects cents
      },
      quantity: item.quantity,
    }));

    // If Stripe API key is configured, create an authentic Stripe + Klarna session
    if (stripe) {
      const session = await stripe.checkout.sessions.create({
        // Enable card AND Klarna as primary payment methods, Link for Apple Pay / Google Pay
        payment_method_types: ['card', 'klarna', 'link'],
        payment_method_options: {
          klarna: {
            preferred_locale: 'en-US',
          } as any,
        },
        line_items,
        mode: 'payment',
        customer_email: customerEmail || undefined,
        billing_address_collection: 'required',
        shipping_address_collection: {
          allowed_countries: ['US', 'CA', 'GB', 'FR', 'DE', 'AE', 'JP'],
        },
        shipping_options: [
          {
            shipping_rate_data: {
              type: 'fixed_amount',
              fixed_amount: { amount: 0, currency: currency },
              display_name: 'Complimentary White-Glove Courier',
              delivery_estimate: {
                minimum: { unit: 'business_day', value: 2 },
                maximum: { unit: 'business_day', value: 3 },
              },
            },
          },
          {
            shipping_rate_data: {
              type: 'fixed_amount',
              fixed_amount: { amount: 2500, currency: currency },
              display_name: 'Priority Next-Morning Express',
              delivery_estimate: {
                minimum: { unit: 'business_day', value: 1 },
                maximum: { unit: 'business_day', value: 1 },
              },
            },
          },
        ],
        success_url: `${host}/dashboard/user?session_id={CHECKOUT_SESSION_ID}&status=success`,
        cancel_url: `${host}/?checkout_canceled=true`,
        metadata: {
          platform: 'Rycarix Haute E-Commerce',
          paymentChannel: 'Klarna_Installments_Preferred',
        },
      });

      return NextResponse.json({ url: session.url, sessionId: session.id });
    }

    // Graceful Simulated Luxury Checkout for Sandbox/Preview mode
    // Allows immediate testing even before production STRIPE_SECRET_KEY is plugged in
    return NextResponse.json({
      url: `/checkout`,
      message: 'Demo mode: Proceeding to simulated checkout.',
      simulated: true,
      line_items,
    });
  } catch (error: any) {
    console.error('Stripe/Klarna Checkout Session Error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
