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

/**
 * Build Stripe shipping_options for the given currency.
 * UK (GBP): Standard £3.50, Tracked 48 £4.50, Tracked 24 £5.00
 * EUR:      Standard €3.50, Express €5.00
 * Other:    Standard + Express in local currency
 */
function getShippingOptionsForCurrency(currency: string) {
  if (currency === 'gbp') {
    return [
      {
        shipping_rate_data: {
          type: 'fixed_amount' as const,
          fixed_amount: { amount: 350, currency: 'gbp' },
          display_name: 'Standard Delivery',
          delivery_estimate: {
            minimum: { unit: 'business_day' as const, value: 2 },
            maximum: { unit: 'business_day' as const, value: 3 },
          },
        },
      },
      {
        shipping_rate_data: {
          type: 'fixed_amount' as const,
          fixed_amount: { amount: 450, currency: 'gbp' },
          display_name: 'Tracked 48',
          delivery_estimate: {
            minimum: { unit: 'business_day' as const, value: 2 },
            maximum: { unit: 'business_day' as const, value: 3 },
          },
        },
      },
      {
        shipping_rate_data: {
          type: 'fixed_amount' as const,
          fixed_amount: { amount: 500, currency: 'gbp' },
          display_name: 'Tracked 24',
          delivery_estimate: {
            minimum: { unit: 'business_day' as const, value: 1 },
            maximum: { unit: 'business_day' as const, value: 2 },
          },
        },
      },
    ];
  }

  if (currency === 'eur') {
    return [
      {
        shipping_rate_data: {
          type: 'fixed_amount' as const,
          fixed_amount: { amount: 350, currency: 'eur' },
          display_name: 'Standard Delivery',
          delivery_estimate: {
            minimum: { unit: 'business_day' as const, value: 2 },
            maximum: { unit: 'business_day' as const, value: 3 },
          },
        },
      },
      {
        shipping_rate_data: {
          type: 'fixed_amount' as const,
          fixed_amount: { amount: 500, currency: 'eur' },
          display_name: 'Express Delivery',
          delivery_estimate: {
            minimum: { unit: 'business_day' as const, value: 1 },
            maximum: { unit: 'business_day' as const, value: 2 },
          },
        },
      },
    ];
  }

  // USD, CAD, AUD, etc. — international rates
  return [
    {
      shipping_rate_data: {
        type: 'fixed_amount' as const,
        fixed_amount: { amount: 500, currency },
        display_name: 'Standard International Delivery',
        delivery_estimate: {
          minimum: { unit: 'business_day' as const, value: 5 },
          maximum: { unit: 'business_day' as const, value: 7 },
        },
      },
    },
    {
      shipping_rate_data: {
        type: 'fixed_amount' as const,
        fixed_amount: { amount: 800, currency },
        display_name: 'Express International Delivery',
        delivery_estimate: {
          minimum: { unit: 'business_day' as const, value: 3 },
          maximum: { unit: 'business_day' as const, value: 5 },
        },
      },
    },
  ];
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { items, customerEmail, customerName, customerPhone, shippingAddress } = body;

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
          description: item.variantTitle ? `${item.variantTitle} • SKU: ${item.sku || 'RY-01'}` : undefined,
          images: item.image && typeof item.image === 'string' && item.image.startsWith('http') ? [item.image] : [],
        },
        unit_amount: Math.round(item.price * 100), // Stripe expects cents
      },
      quantity: item.quantity,
    }));

    // If Stripe API key is configured, create an authentic Stripe + Klarna session
    if (stripe) {
      try {
        const payment_method_types: Stripe.Checkout.SessionCreateParams.PaymentMethodType[] =
          ['card', 'klarna', 'afterpay_clearpay', 'link'];

        const session = await stripe.checkout.sessions.create({
          payment_method_types,
          line_items,
          mode: 'payment',
          customer_email: customerEmail || undefined,
          phone_number_collection: {
            enabled: true,
          },
          billing_address_collection: 'required',
          shipping_address_collection: {
            allowed_countries: (currency === 'gbp'
              ? ['GB', 'US', 'CA', 'FR', 'DE', 'AE', 'JP']
              : currency === 'usd'
              ? ['US', 'CA', 'GB', 'FR', 'DE', 'AE', 'JP']
              : ['FR', 'DE', 'GB', 'US', 'CA', 'AE', 'JP']) as any,
          },
          shipping_options: getShippingOptionsForCurrency(currency),
          success_url: `${host}/dashboard/user?session_id={CHECKOUT_SESSION_ID}&status=success`,
          cancel_url: `${host}/?checkout_canceled=true`,
          metadata: {
            platform: 'Rycarix Luxury E-Commerce',
            paymentChannel: 'Klarna_Clearpay_Installments_Preferred',
            orderId: `RY-${Date.now().toString().slice(-5)}`,
            customerEmail: customerEmail || shippingAddress?.email || '',
            customerName: customerName || shippingAddress?.name || '',
            customerPhone: customerPhone || shippingAddress?.phone || '',
          },
        });

        if (session.url) {
          return NextResponse.json({ url: session.url, sessionId: session.id });
        }
      } catch (stripeErr: any) {
        console.warn('Stripe checkout session failed, falling back to simulated checkout:', stripeErr.message);
        return NextResponse.json({
          url: `/checkout`,
          message: 'Redirecting to checkout...',
          simulated: true,
          line_items,
          fallbackReason: stripeErr.message,
        });
      }
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
