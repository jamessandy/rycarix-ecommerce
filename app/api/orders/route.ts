import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import fs from 'fs';
import path from 'path';

const stripeSecretKey = (process.env.STRIPE_SECRET_KEY || '').trim().replace(/^["']|["']$/g, '');
const stripe = stripeSecretKey && !stripeSecretKey.includes('...')
  ? new Stripe(stripeSecretKey, { apiVersion: '2024-06-20' as any })
  : null;

const CACHE_FILE = path.join('/tmp', 'rycarix_fulfillment_overrides.json');

function loadOverrides(): Record<
  string,
  {
    fulfillment?: string;
    carrier?: string;
    trackingNumber?: string;
    currentStatus?: 'DISPATCH_PENDING' | 'IN_TRANSIT' | 'OUT_FOR_DELIVERY' | 'DELIVERED';
    estimatedDelivery?: string;
  }
> {
  try {
    if (fs.existsSync(CACHE_FILE)) {
      return JSON.parse(fs.readFileSync(CACHE_FILE, 'utf8'));
    }
  } catch (e) {}
  return {};
}

function saveOverrides(data: Record<string, any>) {
  try {
    fs.writeFileSync(CACHE_FILE, JSON.stringify(data, null, 2), 'utf8');
  } catch (e) {}
}

// In-memory + persistent cache store for fulfillment updates
const fulfillmentOverrides: Record<
  string,
  {
    fulfillment?: string;
    carrier?: string;
    trackingNumber?: string;
    currentStatus?: 'DISPATCH_PENDING' | 'IN_TRANSIT' | 'OUT_FOR_DELIVERY' | 'DELIVERED';
    estimatedDelivery?: string;
  }
> = loadOverrides();

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const emailFilter = searchParams.get('email')?.toLowerCase();

    const orders: any[] = [];

    if (stripe) {
      try {
        const sessions = await stripe.checkout.sessions.list({
          limit: 50,
          status: 'complete',
          expand: ['data.payment_intent'],
        });

        for (const s of sessions.data) {
          const email = (s.customer_details?.email || s.customer_email || '').toLowerCase();
          if (emailFilter && email !== emailFilter) {
            continue;
          }

          let lineItems: Stripe.LineItem[] = [];
          try {
            const itemsRes = await stripe.checkout.sessions.listLineItems(s.id, { limit: 10 });
            lineItems = itemsRes.data;
          } catch (e) {
            console.warn(`Could not fetch line items for session ${s.id}`, e);
          }

          const pi = typeof s.payment_intent === 'object' ? (s.payment_intent as any) : null;
          const piMeta = pi?.metadata || {};

          const orderId = s.metadata?.orderId || piMeta.orderId || `RY-${s.created.toString().slice(-5)}`;
          const override = fulfillmentOverrides[orderId] || fulfillmentOverrides[s.id] || {};

          const street = [
            s.shipping_details?.address?.line1,
            s.shipping_details?.address?.line2,
          ]
            .filter(Boolean)
            .join(', ') || '18 Grosvenor Gardens';

          const city = s.shipping_details?.address?.city || 'London';
          const state = s.shipping_details?.address?.state || 'Greater London';
          const postalCode = s.shipping_details?.address?.postal_code || 'SW1W 0DH';
          const countryRaw = s.shipping_details?.address?.country;
          const country = countryRaw === 'GB' ? 'United Kingdom' : (countryRaw || 'United Kingdom');

          const itemsText = lineItems.map((i) => `${i.description || 'Item'} (x${i.quantity || 1})`).join(', ') || 'Atelier Order';
          const itemsList = lineItems.map((i) => ({
            title: i.description || 'Botanical Formulation',
            variantTitle: 'Atelier Packaging',
            quantity: i.quantity || 1,
            price: (i.amount_total || 0) / 100 / (i.quantity || 1),
            image: 'https://images.unsplash.com/photo-1594035910387-fea47794261f?q=80&w=600&auto=format&fit=crop',
          }));

          const isPerfume = itemsText.toLowerCase().includes('parfum') || itemsText.toLowerCase().includes('fragrance');

          const fulfillmentStatus =
            override.fulfillment ||
            piMeta.fulfillment ||
            s.metadata?.fulfillment ||
            'Ready for Dispatch';

          const carrierName =
            override.carrier ||
            piMeta.carrier ||
            s.metadata?.carrier ||
            (isPerfume ? 'Royal Mail Tracked 24 (LQ Perfume)' : 'Evri Express');

          const trackingNum =
            override.trackingNumber ||
            piMeta.trackingNumber ||
            s.metadata?.trackingNumber ||
            (fulfillmentStatus.toLowerCase().includes('dispatched')
              ? `RY-EVRI-${s.created.toString().slice(-4)}`
              : '');

          const currentStatus =
            override.currentStatus ||
            piMeta.currentStatus ||
            (fulfillmentStatus.toLowerCase().includes('dispatched') ? 'IN_TRANSIT' : 'DISPATCH_PENDING');

          const estDelivery =
            override.estimatedDelivery ||
            piMeta.estimatedDelivery ||
            (carrierName.toLowerCase().includes('royal') ? 'Tomorrow by 1:00 PM' : 'In 1-2 Business Days');

          const customerName =
            s.customer_details?.name || s.shipping_details?.name || s.metadata?.customerName || 'Valued Client';
          const customerEmail =
            s.customer_details?.email || s.customer_email || s.metadata?.customerEmail || 'client@rycarix.com';
          const customerPhone =
            s.customer_details?.phone || s.shipping_details?.phone || s.metadata?.customerPhone || '';

          orders.push({
            id: orderId,
            stripeSessionId: s.id,
            customer: customerName,
            email: customerEmail,
            phone: customerPhone,
            items: itemsText,
            itemsList,
            itemCategory: isPerfume ? 'Haute Parfumerie' : 'Hair',
            total: (s.amount_total || 0) / 100,
            currency: '£',
            paymentMethod: s.payment_method_types?.includes('klarna')
              ? 'Klarna Pay in 3'
              : s.payment_method_types?.includes('afterpay_clearpay')
              ? 'Clearpay Pay in 4'
              : 'Stripe Card (1-Click)',
            currentStatus,
            estimatedDelivery: estDelivery,
            fulfillment: fulfillmentStatus,
            carrier: carrierName,
            trackingNumber: trackingNum,
            date: new Date(s.created * 1000).toLocaleDateString('en-GB', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
            }),
            address: {
              name: customerName,
              email: customerEmail,
              phone: customerPhone,
              street,
              city,
              state,
              postalCode,
              country,
            },
          });
        }
      } catch (stripeErr: any) {
        console.warn('Could not list Stripe checkout sessions:', stripeErr.message);
      }
    }

    return NextResponse.json({ orders });
  } catch (error: any) {
    console.error('Error in /api/orders GET:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch orders' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { orderId, stripeSessionId, fulfillment, carrier, trackingNumber, currentStatus, estimatedDelivery } = body;

    if (orderId && (fulfillment || carrier || trackingNumber || currentStatus)) {
      const updateData = {
        fulfillment: fulfillment || 'Dispatched via Courier',
        carrier: carrier || 'Royal Mail Tracked 24',
        trackingNumber: trackingNumber || '',
        currentStatus: (currentStatus as any) || 'IN_TRANSIT',
        estimatedDelivery: estimatedDelivery || (carrier?.includes('Royal') ? 'Tomorrow by 1:00 PM' : 'In 1-2 Business Days'),
      };

      fulfillmentOverrides[orderId] = updateData;
      if (stripeSessionId) {
        fulfillmentOverrides[stripeSessionId] = updateData;
      }
      saveOverrides(fulfillmentOverrides);

      // Persist to Stripe PaymentIntent metadata directly so it never reverts across serverless restarts
      if (stripe) {
        try {
          let targetSessionId = stripeSessionId;
          if (!targetSessionId) {
            const list = await stripe.checkout.sessions.list({ limit: 30, status: 'complete' });
            const match = list.data.find(
              (s) => s.metadata?.orderId === orderId || `RY-${s.created.toString().slice(-5)}` === orderId || s.id === orderId
            );
            if (match) targetSessionId = match.id;
          }

          if (targetSessionId) {
            const sess = await stripe.checkout.sessions.retrieve(targetSessionId);
            if (sess.payment_intent) {
              const piId = typeof sess.payment_intent === 'string' ? sess.payment_intent : sess.payment_intent.id;
              await stripe.paymentIntents.update(piId, {
                metadata: {
                  ...updateData,
                  orderId,
                },
              });
            }
          }
        } catch (stripeUpdateErr) {
          console.warn('Could not update Stripe PI metadata:', stripeUpdateErr);
        }
      }

      return NextResponse.json({ success: true, updated: updateData });
    }

    return NextResponse.json({ error: 'Missing orderId or update fields.' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to update order' }, { status: 500 });
  }
}

