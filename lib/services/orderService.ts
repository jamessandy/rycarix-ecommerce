import Stripe from 'stripe';
import { PaymentProvider } from '@prisma/client';
import prisma from '@/lib/prisma';
import { catalogService } from '@/lib/services/catalogService';
import {
  buildDispatchNotificationEmailHtml,
  buildOrderConfirmationEmailHtml,
  sendEmail,
} from '@/lib/services/emailService';
import {
  RoyalMailServiceOption,
  resolveCheckoutShippingOption,
} from '@/lib/services/shippingAggregator';

export class StockError extends Error {
  statusCode: number;
  constructor(message: string, statusCode = 400) {
    super(message);
    this.name = 'StockError';
    this.statusCode = statusCode;
  }
}

export interface FormattedOrderItem {
  productId: string;
  title: string;
  variantTitle: string;
  sku: string;
  quantity: number;
  price: number;
  total: number;
  image: string;
  category?: string;
}

export interface FormattedOrder {
  id: string;
  dbId: string;
  orderNumber: string;
  stripeSessionId: string;
  customer: string;
  email: string;
  phone: string;
  items: string;
  itemsList: FormattedOrderItem[];
  itemCategory: string;
  subtotal: number;
  shippingCost: number;
  total: number;
  currency: string;
  paymentMethod: string;
  status: string;
  fulfillmentStatus: string;
  fulfillment: string;
  currentStatus: 'ORDER_PLACED' | 'DISPATCH_PENDING' | 'IN_TRANSIT' | 'OUT_FOR_DELIVERY' | 'DELIVERED';
  carrier: string;
  trackingNumber: string;
  trackingUrl: string;
  estimatedDelivery: string;
  shippingService: string;
  shippingMethod: string;
  shippingOptionId: string;
  shippingRecommendation: string;
  date: string;
  createdAt: string;
  address: {
    name: string;
    email: string;
    phone: string;
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
}

function getStripeClient(): Stripe | null {
  const key = (process.env.STRIPE_SECRET_KEY || '').trim().replace(/^["']|["']$/g, '');
  if (!key || key.includes('...')) return null;
  return new Stripe(key, { apiVersion: '2024-06-20' as any });
}

const PAID_ORDER_STATUSES = ['PAID', 'AUTHORIZED', 'PROCESSING', 'SHIPPED', 'DELIVERED'] as const;

export function formatDbOrderForClient(order: any): FormattedOrder {
  const shippingAddr = (order.shippingAddress || {}) as Record<string, any>;
  const billingObj = (order.billingAddress || {}) as Record<string, any>;
  const meta = (billingObj._meta || {}) as Record<string, any>;

  const itemsList: FormattedOrderItem[] = Array.isArray(order.items)
    ? order.items.map((item: any) => {
        const snap = (item.attributesSnapshot || {}) as Record<string, any>;
        const productImg =
          snap.image ||
          (Array.isArray(item.product?.images) && item.product.images[0]) ||
          '/images/perfumes/princess-reef.jpg';
        return {
          productId: item.productId,
          title: item.productTitle || item.product?.name || 'Rycarix Product',
          variantTitle: item.variantTitle || 'Standard',
          sku: item.sku || '',
          quantity: Number(item.quantity || 1),
          price: Number(item.unitPrice || 0),
          total: Number(item.total || 0),
          image: productImg,
          category: snap.category || item.product?.category || '',
        };
      })
    : [];

  const isDispatched = Boolean(
    order.status === 'SHIPPED' ||
      order.status === 'DELIVERED' ||
      order.fulfillmentStatus === 'FULFILLED' ||
      (order.trackingNumber && String(order.trackingNumber).trim().length > 0)
  );

  let currentStatus: FormattedOrder['currentStatus'] = 'DISPATCH_PENDING';
  if (isDispatched) {
    if (order.status === 'DELIVERED' || meta.currentStatus === 'DELIVERED') {
      currentStatus = 'DELIVERED';
    } else if (meta.currentStatus === 'OUT_FOR_DELIVERY') {
      currentStatus = 'OUT_FOR_DELIVERY';
    } else {
      currentStatus = 'IN_TRANSIT';
    }
  }

  const customerName =
    meta.customerName ||
    shippingAddr.name ||
    order.user?.name ||
    'Valued Client';
  const customerEmail = (
    meta.customerEmail ||
    shippingAddr.email ||
    order.guestEmail ||
    order.user?.email ||
    ''
  ).trim();
  const customerPhone = (
    meta.customerPhone ||
    shippingAddr.phone ||
    order.user?.phone ||
    ''
  ).trim();

  const itemsSummary =
    itemsList.map((i) => `${i.title} (x${i.quantity})`).join(', ') || 'Rycarix Order';
  const itemCategory = itemsList
    .map((i) => i.category)
    .filter(Boolean)
    .join(', ');

  return {
    id: order.orderNumber,
    dbId: order.id,
    orderNumber: order.orderNumber,
    stripeSessionId: meta.stripeSessionId || '',
    customer: customerName,
    email: customerEmail,
    phone: customerPhone,
    items: itemsSummary,
    itemsList,
    itemCategory,
    subtotal: Number(order.subtotal || 0),
    shippingCost: Number(order.shippingCost || 0),
    total: Number(order.total || 0),
    currency: '£',
    paymentMethod: meta.paymentMethod || 'Stripe Card',
    status: order.status,
    fulfillmentStatus: order.fulfillmentStatus,
    fulfillment:
      currentStatus === 'DELIVERED'
        ? 'Delivered'
        : isDispatched
        ? 'Dispatched'
        : 'Ready for Dispatch',
    currentStatus,
    carrier: isDispatched ? order.carrier || meta.carrier || 'Royal Mail Tracked' : '',
    trackingNumber: isDispatched ? order.trackingNumber || '' : '',
    trackingUrl: isDispatched ? order.trackingUrl || '' : '',
    estimatedDelivery: isDispatched
      ? meta.estimatedDelivery || meta.shippingRecommendation || '2–3 working days'
      : 'Awaiting Dispatch',
    shippingService: meta.shippingService || 'Standard UK Delivery',
    shippingMethod: meta.shippingService || 'Standard UK Delivery',
    shippingOptionId: meta.shippingOptionId || '',
    shippingRecommendation: meta.shippingRecommendation || '',
    date: new Date(order.createdAt).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }),
    createdAt: new Date(order.createdAt).toISOString(),
    address: {
      name: shippingAddr.name || customerName,
      email: customerEmail,
      phone: customerPhone,
      street: shippingAddr.street || 'Address on file',
      city: shippingAddr.city || '',
      state: shippingAddr.state || '',
      postalCode: shippingAddr.postalCode || '',
      country: shippingAddr.country || 'United Kingdom',
    },
  };
}

async function resolveCatalogProduct(rawItem: any) {
  const rawId = String(rawItem.productId || rawItem.id || '').trim();
  const rawSlug = String(rawItem.slug || '').trim();
  const rawSku = String(rawItem.sku || '').trim();
  const rawTitle = String(rawItem.title || rawItem.name || '').trim();

  const orConditions: any[] = [];
  if (rawId) {
    orConditions.push({ id: rawId });
    orConditions.push({ slug: rawId });
    if (rawId.includes('-')) {
      const prefixId = rawId.split('-')[0];
      if (prefixId && prefixId.length >= 8) {
        orConditions.push({ id: prefixId });
      }
    }
  }
  if (rawSlug) {
    orConditions.push({ slug: rawSlug });
  }
  if (rawSku) {
    orConditions.push({ sku: rawSku });
  }
  if (rawTitle) {
    orConditions.push({ name: { equals: rawTitle, mode: 'insensitive' } });
    orConditions.push({ title: { equals: rawTitle, mode: 'insensitive' } });
  }

  if (orConditions.length === 0) return null;

  return prisma.product.findFirst({
    where: {
      status: { not: 'ARCHIVED' },
      OR: orConditions,
    },
  });
}

export interface CreatePendingOrderInput {
  items: any[];
  customerEmail: string;
  customerName?: string;
  customerPhone?: string;
  shippingAddress?: {
    name?: string;
    email?: string;
    phone?: string;
    street?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
  };
  shippingOptionId?: string;
  paymentMethod?: string;
}

export async function createPendingOrder(input: CreatePendingOrderInput): Promise<{
  order: FormattedOrder;
  shippingOption: RoyalMailServiceOption;
  validatedItems: FormattedOrderItem[];
}> {
  await catalogService.ensureSeeded();

  const rawItems = Array.isArray(input.items) ? input.items : [];
  if (rawItems.length === 0) {
    throw new StockError('Your shopping bag is empty.');
  }

  const email = (input.customerEmail || input.shippingAddress?.email || '').trim().toLowerCase();
  if (!email || !email.includes('@')) {
    throw new StockError('A valid email address is required to proceed.');
  }

  const customerName = (
    input.customerName ||
    input.shippingAddress?.name ||
    email.split('@')[0] ||
    'Valued Client'
  ).trim();
  const customerPhone = (input.customerPhone || input.shippingAddress?.phone || '').trim();

  // Resolve and validate every requested item against Neon Postgres
  const resolvedRows: Array<{
    product: any;
    variantId: string | null;
    title: string;
    variantTitle: string;
    sku: string;
    unitPrice: number;
    quantity: number;
    total: number;
    image: string;
    category: string;
  }> = [];

  const requestedByProduct = new Map<string, { product: any; qty: number }>();

  for (const item of rawItems) {
    const qty = Math.max(1, Math.floor(Number(item.quantity || 1)));
    const product = await resolveCatalogProduct(item);

    if (!product) {
      throw new StockError(`"${item.title || item.name || 'Requested product'}" is no longer available.`);
    }
    if (!product.isLive || product.status === 'DRAFT' || product.status === 'ARCHIVED') {
      throw new StockError(`"${product.name}" is currently unavailable.`);
    }
    if (product.isComingSoon) {
      throw new StockError(`"${product.name}" is coming soon and cannot be ordered yet.`);
    }

    const prevEntry = requestedByProduct.get(product.id);
    const cumulativeQty = (prevEntry?.qty || 0) + qty;
    requestedByProduct.set(product.id, { product, qty: cumulativeQty });

    let matchedVariantId: string | null = null;
    let unitPrice = Number(product.price);
    if (item.variantId && item.variantId !== 'default') {
      const matchedVariant = await prisma.productVariant.findFirst({
        where: { id: String(item.variantId), productId: product.id },
      });
      if (matchedVariant) {
        matchedVariantId = matchedVariant.id;
        unitPrice = Number(matchedVariant.price);
      }
    }

    const img =
      (typeof item.image === 'string' && item.image.trim()) ||
      (Array.isArray(product.images) && product.images[0]) ||
      '/images/perfumes/princess-reef.jpg';

    resolvedRows.push({
      product,
      variantId: matchedVariantId,
      title: product.name || item.title || 'Rycarix Product',
      variantTitle: String(item.variantTitle || 'Standard'),
      sku: product.sku || item.sku || `RYC-${product.id.slice(-6).toUpperCase()}`,
      unitPrice,
      quantity: qty,
      total: Math.round(unitPrice * qty * 100) / 100,
      image: img,
      category: product.category || 'perfume',
    });
  }

  for (const { product, qty } of Array.from(requestedByProduct.values())) {
    if (product.stock <= 0) {
      throw new StockError(`"${product.name}" is out of stock.`);
    }
    if (product.stock < qty) {
      throw new StockError(
        `Only ${product.stock} unit${product.stock === 1 ? '' : 's'} of "${product.name}" remaining in stock.`
      );
    }
  }

  const subtotal =
    Math.round(resolvedRows.reduce((acc, row) => acc + row.total, 0) * 100) / 100;
  const country = (input.shippingAddress?.country || 'United Kingdom').trim() || 'United Kingdom';
  const shippingOption = resolveCheckoutShippingOption(subtotal, country, input.shippingOptionId);
  const shippingCost = Number(shippingOption.price || 0);
  const total = Math.round((subtotal + shippingCost) * 100) / 100;

  // Link to registered user if one exists in Neon Postgres
  let linkedUserId: string | null = null;
  const existingUser = await prisma.user.findFirst({
    where: { email: { equals: email, mode: 'insensitive' } },
  });
  if (existingUser) {
    linkedUserId = existingUser.id;
    if (!existingUser.phone && customerPhone) {
      await prisma.user.update({
        where: { id: existingUser.id },
        data: { phone: customerPhone },
      });
    }
  }

  const addressSnapshot = {
    name: customerName,
    email,
    phone: customerPhone,
    street: (input.shippingAddress?.street || 'Address on file').trim(),
    city: (input.shippingAddress?.city || '').trim(),
    state: (input.shippingAddress?.state || '').trim(),
    postalCode: (input.shippingAddress?.postalCode || '').trim(),
    country,
  };

  const billingMeta = {
    _meta: {
      shippingOptionId: shippingOption.id,
      shippingService: shippingOption.service,
      shippingRecommendation: shippingOption.recommendation,
      paymentMethod: input.paymentMethod || 'Stripe Card',
      customerName,
      customerEmail: email,
      customerPhone,
      stockDeducted: false,
      confirmationEmailSent: false,
      dispatchEmailSent: false,
    },
  };

  let created: any = null;
  for (let attempt = 0; attempt < 4; attempt++) {
    const orderNumber = `RY-${Date.now().toString().slice(-5)}${Math.floor(10 + Math.random() * 89)}`;
    try {
      created = await prisma.order.create({
        data: {
          orderNumber,
          userId: linkedUserId,
          guestEmail: email,
          status: 'PENDING',
          fulfillmentStatus: 'UNFULFILLED',
          currency: 'GBP',
          subtotal,
          tax: 0,
          shippingCost,
          discountTotal: 0,
          total,
          shippingAddress: addressSnapshot,
          billingAddress: billingMeta,
          items: {
            create: resolvedRows.map((row) => ({
              productId: row.product.id,
              variantId: row.variantId,
              productTitle: row.title,
              variantTitle: row.variantTitle,
              sku: row.sku,
              unitPrice: row.unitPrice,
              quantity: row.quantity,
              total: row.total,
              attributesSnapshot: {
                image: row.image,
                category: row.category,
              },
            })),
          },
        },
        include: {
          items: { include: { product: { select: { images: true, category: true, slug: true } } } },
          user: true,
        },
      });
      break;
    } catch (err: any) {
      if (err?.code === 'P2002' && attempt < 3) {
        continue;
      }
      throw err;
    }
  }

  return {
    order: formatDbOrderForClient(created),
    shippingOption,
    validatedItems: resolvedRows.map((r) => ({
      productId: r.product.id,
      title: r.title,
      variantTitle: r.variantTitle,
      sku: r.sku,
      quantity: r.quantity,
      price: r.unitPrice,
      total: r.total,
      image: r.image,
      category: r.category,
    })),
  };
}

export async function updateOrderStripeSession(orderNumber: string, stripeSessionId: string): Promise<void> {
  const existing = await prisma.order.findUnique({ where: { orderNumber } });
  if (!existing) return;
  const billingObj = (existing.billingAddress || {}) as Record<string, any>;
  const meta = (billingObj._meta || {}) as Record<string, any>;
  await prisma.order.update({
    where: { id: existing.id },
    data: {
      billingAddress: {
        ...billingObj,
        _meta: {
          ...meta,
          stripeSessionId,
        },
      },
    },
  });
}

export async function confirmOrderCompletion(params: {
  orderNumber?: string;
  sessionId?: string;
  simulated?: boolean;
  paymentMethod?: string;
}): Promise<FormattedOrder> {
  const stripe = getStripeClient();
  let session: Stripe.Checkout.Session | null = null;

  if (params.sessionId && !params.simulated && stripe) {
    session = await stripe.checkout.sessions.retrieve(params.sessionId, {
      expand: ['shipping_cost.shipping_rate', 'payment_intent.payment_method'],
    });
    const isPaid =
      session.payment_status === 'paid' ||
      session.payment_status === 'no_payment_required' ||
      session.status === 'complete';
    if (!isPaid) {
      throw new StockError('Payment has not completed for this checkout session.', 402);
    }
  }

  const targetOrderNumber =
    params.orderNumber || session?.metadata?.orderId || undefined;

  let order: any = null;
  if (targetOrderNumber) {
    order = await prisma.order.findUnique({
      where: { orderNumber: targetOrderNumber },
      include: {
        items: { include: { product: { select: { images: true, category: true, slug: true } } } },
        user: true,
      },
    });
  }
  if (!order && params.sessionId) {
    order = await prisma.order.findFirst({
      where: {
        billingAddress: {
          path: ['_meta', 'stripeSessionId'],
          equals: params.sessionId,
        },
      },
      include: {
        items: { include: { product: { select: { images: true, category: true, slug: true } } } },
        user: true,
      },
    });
  }

  if (!order) {
    throw new StockError('Order record not found for confirmation.', 404);
  }

  const { confirmedId, shouldSendConfirmationEmail } = await prisma.$transaction(async (tx) => {
    await tx.$executeRaw`SELECT id FROM "Order" WHERE id = ${order.id} FOR UPDATE`;

    const freshOrder = await tx.order.findUnique({
      where: { id: order.id },
      include: { items: true, user: true },
    });
    if (!freshOrder) {
      throw new StockError('Order record disappeared.', 404);
    }

    const billingObj = (freshOrder.billingAddress || {}) as Record<string, any>;
    const meta = (billingObj._meta || {}) as Record<string, any>;
    const shippingAddr = (freshOrder.shippingAddress || {}) as Record<string, any>;

    // Deduct stock atomically once per order
    if (!meta.stockDeducted) {
      const qtyByProduct = new Map<string, number>();
      for (const item of freshOrder.items) {
        qtyByProduct.set(
          item.productId,
          (qtyByProduct.get(item.productId) || 0) + Number(item.quantity || 1)
        );
      }

      for (const [productId, totalQty] of Array.from(qtyByProduct.entries())) {
        const decremented = await tx.product.updateMany({
          where: { id: productId, stock: { gte: totalQty } },
          data: { stock: { decrement: totalQty } },
        });
        if (decremented.count === 0) {
          const prod = await tx.product.findUnique({
            where: { id: productId },
            select: { name: true, stock: true },
          });
          throw new StockError(
            prod
              ? `Insufficient stock for "${prod.name}". Only ${prod.stock} remaining.`
              : 'Product stock is no longer available.'
          );
        }
      }
    }

    const stripeShippingDetails =
      (session as any)?.shipping_details ||
      (session as any)?.collected_information?.shipping_details;

    const resolvedEmail = (
      session?.customer_details?.email ||
      session?.customer_email ||
      meta.customerEmail ||
      shippingAddr.email ||
      freshOrder.guestEmail ||
      ''
    )
      .trim()
      .toLowerCase();

    const resolvedName = (
      session?.customer_details?.name ||
      stripeShippingDetails?.name ||
      meta.customerName ||
      shippingAddr.name ||
      'Valued Client'
    ).trim();

    const resolvedPhone = (
      session?.customer_details?.phone ||
      stripeShippingDetails?.phone ||
      meta.customerPhone ||
      shippingAddr.phone ||
      freshOrder.user?.phone ||
      ''
    ).trim();

    const stripeStreet = [
      stripeShippingDetails?.address?.line1,
      stripeShippingDetails?.address?.line2,
    ]
      .filter(Boolean)
      .join(', ');

    const mergedAddress = {
      name: resolvedName,
      email: resolvedEmail,
      phone: resolvedPhone,
      street: stripeStreet || shippingAddr.street || 'Address on file',
      city: stripeShippingDetails?.address?.city || shippingAddr.city || '',
      state: stripeShippingDetails?.address?.state || shippingAddr.state || '',
      postalCode: stripeShippingDetails?.address?.postal_code || shippingAddr.postalCode || '',
      country:
        stripeShippingDetails?.address?.country === 'GB'
          ? 'United Kingdom'
          : stripeShippingDetails?.address?.country || shippingAddr.country || 'United Kingdom',
    };

    const resolvedShippingCost =
      session?.shipping_cost?.amount_total !== undefined && session?.shipping_cost?.amount_total !== null
        ? session.shipping_cost.amount_total / 100
        : Number(freshOrder.shippingCost || 0);

    const shippingRateObj =
      session?.shipping_cost?.shipping_rate && typeof session.shipping_cost.shipping_rate === 'object'
        ? (session.shipping_cost.shipping_rate as Stripe.ShippingRate)
        : null;

    const resolvedShippingService =
      shippingRateObj?.display_name || meta.shippingService || 'Standard UK Delivery';

    const resolvedTotal =
      session?.amount_total !== undefined && session?.amount_total !== null
        ? session.amount_total / 100
        : Number(freshOrder.total || 0);

    const piObj =
      session?.payment_intent && typeof session.payment_intent === 'object'
        ? (session.payment_intent as any)
        : null;
    const actualMethodType = piObj?.payment_method?.type;
    let resolvedPaymentMethod = params.paymentMethod || meta.paymentMethod || 'Stripe Card';
    if (actualMethodType === 'klarna') resolvedPaymentMethod = 'Klarna Pay in 3';
    else if (actualMethodType === 'afterpay_clearpay') resolvedPaymentMethod = 'Clearpay Pay in 4';
    else if (actualMethodType === 'card') resolvedPaymentMethod = 'Stripe Card';

    const nextStatus =
      freshOrder.status === 'SHIPPED' || freshOrder.status === 'DELIVERED'
        ? freshOrder.status
        : 'PAID';

    const claimConfirmationEmail = !meta.confirmationEmailSent && Boolean(resolvedEmail);

    await tx.order.update({
      where: { id: freshOrder.id },
      data: {
        status: nextStatus,
        guestEmail: resolvedEmail || freshOrder.guestEmail,
        shippingCost: resolvedShippingCost,
        total: resolvedTotal,
        shippingAddress: mergedAddress,
        billingAddress: {
          ...billingObj,
          _meta: {
            ...meta,
            stripeSessionId: params.sessionId || meta.stripeSessionId || '',
            shippingService: resolvedShippingService,
            paymentMethod: resolvedPaymentMethod,
            customerName: resolvedName,
            customerEmail: resolvedEmail,
            customerPhone: resolvedPhone,
            stockDeducted: true,
            confirmationEmailSent: claimConfirmationEmail ? true : Boolean(meta.confirmationEmailSent),
          },
        },
      },
    });

    if (freshOrder.userId && resolvedPhone && !freshOrder.user?.phone) {
      await tx.user.update({
        where: { id: freshOrder.userId },
        data: { phone: resolvedPhone },
      });
    }

    const txId =
      (typeof session?.payment_intent === 'string'
        ? session.payment_intent
        : piObj?.id) ||
      params.sessionId ||
      `sim-${freshOrder.orderNumber}`;

    const provider: PaymentProvider = resolvedPaymentMethod.toLowerCase().includes('klarna')
      ? 'STRIPE_KLARNA'
      : 'STRIPE_CARD';

    await tx.payment.upsert({
      where: { providerTransactionId: txId },
      update: {
        status: 'SUCCEEDED',
        amount: resolvedTotal,
        currency: 'GBP',
        settledAt: new Date(),
      },
      create: {
        orderId: freshOrder.id,
        provider,
        providerTransactionId: txId,
        status: 'SUCCEEDED',
        amount: resolvedTotal,
        currency: 'GBP',
        isKlarnaInstallment: provider === 'STRIPE_KLARNA',
        settledAt: new Date(),
      },
    });

    return {
      confirmedId: freshOrder.id,
      shouldSendConfirmationEmail: claimConfirmationEmail,
    };
  });

  const confirmedOrder = await prisma.order.findUnique({
    where: { id: confirmedId },
    include: {
      items: { include: { product: { select: { images: true, category: true, slug: true } } } },
      user: true,
    },
  });

  if (!confirmedOrder) {
    throw new StockError('Confirmed order could not be reloaded.', 500);
  }

  const formatted = formatDbOrderForClient(confirmedOrder);
  const billingObj = (confirmedOrder.billingAddress || {}) as Record<string, any>;
  const meta = (billingObj._meta || {}) as Record<string, any>;

  // Send itemized confirmation email exactly once after payment confirmation
  if (shouldSendConfirmationEmail && formatted.email) {
    try {
      const html = buildOrderConfirmationEmailHtml({
        orderNumber: formatted.orderNumber,
        customerName: formatted.customer,
        customerEmail: formatted.email,
        customerPhone: formatted.phone,
        date: formatted.date,
        total: formatted.total,
        subtotal: formatted.subtotal,
        shippingCost: formatted.shippingCost,
        shippingMethod: formatted.shippingService,
        paymentMethod: formatted.paymentMethod,
        items: formatted.itemsList.map((i) => ({
          title: i.title,
          variantTitle: i.variantTitle,
          quantity: i.quantity,
          price: i.price,
          image: i.image,
        })),
        address: {
          name: formatted.address.name,
          street: formatted.address.street,
          city: formatted.address.city,
          state: formatted.address.state,
          postalCode: formatted.address.postalCode,
          country: formatted.address.country,
        },
      });

      await sendEmail({
        to: formatted.email,
        subject: `Order Confirmed • ${formatted.orderNumber} • Rycarix Store`,
        html,
        type: 'ORDER_CONFIRMATION',
        orderNumber: formatted.orderNumber,
      });
    } catch (emailErr) {
      console.warn('[orderService] Order confirmation email failed:', emailErr);
      await prisma.order
        .update({
          where: { id: confirmedOrder.id },
          data: {
            billingAddress: {
              ...billingObj,
              _meta: {
                ...meta,
                confirmationEmailSent: false,
              },
            },
          },
        })
        .catch(() => {});
    }
  }

  return formatted;
}

export async function markOrderDispatched(input: {
  orderNumber?: string;
  orderId?: string;
  carrier?: string;
  trackingNumber?: string;
  trackingUrl?: string;
  estimatedDelivery?: string;
  currentStatus?: 'IN_TRANSIT' | 'OUT_FOR_DELIVERY' | 'DELIVERED';
}): Promise<FormattedOrder> {
  const lookup = (input.orderNumber || input.orderId || '').trim();
  if (!lookup) {
    throw new StockError('Order reference is required to confirm dispatch.');
  }

  const existing = await prisma.order.findFirst({
    where: {
      OR: [{ orderNumber: lookup }, { id: lookup }],
    },
    include: {
      items: { include: { product: { select: { images: true, category: true, slug: true } } } },
      user: true,
    },
  });

  if (!existing) {
    throw new StockError(`Order ${lookup} was not found in database.`, 404);
  }

  const chosenCarrier = (input.carrier || existing.carrier || 'Royal Mail Tracked').trim();
  let resolvedTracking = (input.trackingNumber || existing.trackingNumber || '').trim();
  if (!resolvedTracking) {
    resolvedTracking = chosenCarrier.toLowerCase().includes('evri')
      ? `RY-EVRI-${Date.now().toString().slice(-6)}`
      : `GB${Date.now().toString().slice(-8)}RY`;
  }

  const nextStatus = input.currentStatus === 'DELIVERED' ? 'DELIVERED' : 'SHIPPED';
  const nextCurrentStatus = input.currentStatus || 'IN_TRANSIT';
  const billingObj = (existing.billingAddress || {}) as Record<string, any>;
  const meta = (billingObj._meta || {}) as Record<string, any>;
  const estDelivery =
    input.estimatedDelivery ||
    meta.estimatedDelivery ||
    meta.shippingRecommendation ||
    '2–3 working days';

  const updated = await prisma.order.update({
    where: { id: existing.id },
    data: {
      status: nextStatus,
      fulfillmentStatus: 'FULFILLED',
      carrier: chosenCarrier,
      trackingNumber: resolvedTracking,
      trackingUrl: input.trackingUrl || existing.trackingUrl || null,
      billingAddress: {
        ...billingObj,
        _meta: {
          ...meta,
          carrier: chosenCarrier,
          fulfillment: nextStatus === 'DELIVERED' ? 'Delivered' : 'Dispatched',
          currentStatus: nextCurrentStatus,
          estimatedDelivery: estDelivery,
        },
      },
    },
    include: {
      items: { include: { product: { select: { images: true, category: true, slug: true } } } },
      user: true,
    },
  });

  const formatted = formatDbOrderForClient(updated);

  if (formatted.email && (!meta.dispatchEmailSent || existing.trackingNumber !== resolvedTracking)) {
    try {
      const html = buildDispatchNotificationEmailHtml({
        orderNumber: formatted.orderNumber,
        customerName: formatted.customer,
        customerEmail: formatted.email,
        carrier: formatted.carrier,
        trackingNumber: formatted.trackingNumber,
        serviceLevel: formatted.shippingService || formatted.carrier,
        estimatedDelivery: formatted.estimatedDelivery,
        trackingUrl: formatted.trackingUrl || undefined,
        items: formatted.itemsList.map((i) => ({
          title: i.title,
          variantTitle: i.variantTitle,
          quantity: i.quantity,
          price: i.price,
          image: i.image,
        })),
        address: {
          street: formatted.address.street,
          city: formatted.address.city,
          state: formatted.address.state,
          postalCode: formatted.address.postalCode,
          country: formatted.address.country,
        },
      });

      await sendEmail({
        to: formatted.email,
        subject: `Dispatched: Your Rycarix Parcel #${formatted.orderNumber} is on the way (${formatted.carrier})`,
        html,
        type: 'DISPATCH_NOTIFICATION',
        orderNumber: formatted.orderNumber,
        carrier: formatted.carrier,
        trackingNumber: formatted.trackingNumber,
      });

      await prisma.order.update({
        where: { id: updated.id },
        data: {
          billingAddress: {
            ...billingObj,
            _meta: {
              ...meta,
              carrier: chosenCarrier,
              fulfillment: nextStatus === 'DELIVERED' ? 'Delivered' : 'Dispatched',
              currentStatus: nextCurrentStatus,
              estimatedDelivery: estDelivery,
              dispatchEmailSent: true,
            },
          },
        },
      });
    } catch (emailErr) {
      console.warn('[orderService] Dispatch email notification failed:', emailErr);
    }
  }

  return formatted;
}

export async function listOrders(params?: { email?: string; orderId?: string }): Promise<FormattedOrder[]> {
  const emailFilter = params?.email?.trim().toLowerCase();
  const orderIdFilter = params?.orderId?.trim();

  if (orderIdFilter) {
    const matched = await prisma.order.findMany({
      where: {
        status: { in: [...PAID_ORDER_STATUSES] },
        OR: [
          { orderNumber: { equals: orderIdFilter, mode: 'insensitive' } },
          { trackingNumber: { equals: orderIdFilter, mode: 'insensitive' } },
          { id: orderIdFilter },
        ],
      },
      include: {
        items: { include: { product: { select: { images: true, category: true, slug: true } } } },
        user: true,
      },
      orderBy: { createdAt: 'desc' },
    });
    return matched.map(formatDbOrderForClient);
  }

  const where: any = {
    status: { in: [...PAID_ORDER_STATUSES] },
  };

  if (emailFilter) {
    where.OR = [
      { guestEmail: { equals: emailFilter, mode: 'insensitive' } },
      { user: { email: { equals: emailFilter, mode: 'insensitive' } } },
    ];
  }

  const rows = await prisma.order.findMany({
    where,
    include: {
      items: { include: { product: { select: { images: true, category: true, slug: true } } } },
      user: true,
    },
    orderBy: { createdAt: 'desc' },
    take: 100,
  });

  return rows.map(formatDbOrderForClient);
}

