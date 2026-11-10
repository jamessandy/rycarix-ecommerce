/**
 * Rycarix Shipping & Dispatch Aggregator Service
 * Integrates backend dispatch (ShipStation / Sendcloud / ShippyPro)
 * with LQ (Limited Quantity) Dangerous Goods compliance for alcohol-based perfumes.
 */

export interface TrackingMilestone {
  timestamp: string;
  status: string;
  location: string;
  description: string;
  isCompleted: boolean;
}

export interface RoyalMailServiceOption {
  id: string;
  service: string;
  carrierName: string;
  price: number;
  recommendation: string;
  weightLimit: string;
  deliveryTime: string;
  minDays: number;
  maxDays: number;
  badge?: string;
}

export const ROYAL_MAIL_UK_SERVICES: RoyalMailServiceOption[] = [
  {
    id: 'standard-uk',
    service: 'Standard UK Delivery',
    carrierName: 'Royal Mail Standard UK',
    price: 3.50,
    recommendation: '2–3 working days',
    weightLimit: 'Standard parcel',
    deliveryTime: 'Estimated delivery: 2–3 working days',
    minDays: 2,
    maxDays: 3,
    badge: 'Standard',
  },
  {
    id: 'free-uk',
    service: 'Free UK Delivery',
    carrierName: 'Royal Mail Free UK',
    price: 0.00,
    recommendation: 'Orders over £100',
    weightLimit: 'Standard parcel',
    deliveryTime: 'Automatically available on orders over £100',
    minDays: 2,
    maxDays: 3,
    badge: 'FREE',
  },
  {
    id: 'collection-pickup',
    service: 'Collection / Pickup',
    carrierName: 'Rycarix Atelier Collection',
    price: 0.00,
    recommendation: 'Arrange after ordering',
    weightLimit: 'Pick up in person',
    deliveryTime: 'Arrange collection after ordering',
    minDays: 1,
    maxDays: 3,
    badge: 'FREE',
  },
];

export const INTERNATIONAL_DELIVERY_OPTIONS: RoyalMailServiceOption[] = [
  {
    id: 'intl-europe',
    service: 'Europe International Delivery',
    carrierName: 'Royal Mail International Europe',
    price: 9.95,
    recommendation: '3–5 working days',
    weightLimit: 'Tracked international parcel',
    deliveryTime: 'Estimated delivery: 3–5 working days',
    minDays: 3,
    maxDays: 5,
    badge: 'Europe',
  },
  {
    id: 'intl-us-ca',
    service: 'USA & Canada Delivery',
    carrierName: 'Royal Mail International Tracked',
    price: 14.95,
    recommendation: '5–7 working days',
    weightLimit: 'Tracked international parcel',
    deliveryTime: 'Estimated delivery: 5–7 working days',
    minDays: 5,
    maxDays: 7,
    badge: 'North America',
  },
  {
    id: 'intl-row',
    service: 'Rest of the World Delivery',
    carrierName: 'Royal Mail International Priority',
    price: 18.95,
    recommendation: '5–7 working days or longer',
    weightLimit: 'Tracked international parcel',
    deliveryTime: 'Estimated delivery: 5–7 working days or longer',
    minDays: 5,
    maxDays: 10,
    badge: 'Worldwide',
  },
];

export const ALL_DELIVERY_OPTIONS: RoyalMailServiceOption[] = [
  ...ROYAL_MAIL_UK_SERVICES,
  ...INTERNATIONAL_DELIVERY_OPTIONS,
];

const UK_COUNTRY_NAMES = new Set([
  '',
  'uk',
  'gb',
  'united kingdom',
  'great britain',
  'england',
  'scotland',
  'wales',
  'northern ireland',
]);

const EUROPE_COUNTRY_NAMES = new Set([
  'europe',
  'france',
  'fr',
  'germany',
  'de',
  'ireland',
  'ie',
  'italy',
  'it',
  'spain',
  'es',
  'netherlands',
  'nl',
  'belgium',
  'be',
  'portugal',
  'pt',
  'switzerland',
  'ch',
  'austria',
  'at',
  'sweden',
  'se',
  'norway',
  'no',
  'denmark',
  'dk',
]);

const US_CA_COUNTRY_NAMES = new Set([
  'united states',
  'usa',
  'us',
  'canada',
  'ca',
]);

export function isUnitedKingdomCountry(country?: string | null): boolean {
  const normalized = (country || 'United Kingdom').trim().toLowerCase();
  return UK_COUNTRY_NAMES.has(normalized);
}

export function getCheckoutShippingOptions(subtotal: number, country?: string | null): RoyalMailServiceOption[] {
  const normalized = (country || 'United Kingdom').trim().toLowerCase();
  if (isUnitedKingdomCountry(normalized)) {
    return ROYAL_MAIL_UK_SERVICES;
  }
  if (EUROPE_COUNTRY_NAMES.has(normalized)) {
    return [INTERNATIONAL_DELIVERY_OPTIONS[0], ROYAL_MAIL_UK_SERVICES[2]];
  }
  if (US_CA_COUNTRY_NAMES.has(normalized)) {
    return [INTERNATIONAL_DELIVERY_OPTIONS[1]];
  }
  return [INTERNATIONAL_DELIVERY_OPTIONS[2]];
}

export function resolveCheckoutShippingOption(
  subtotal: number,
  country?: string | null,
  selectedId?: string | null
): RoyalMailServiceOption {
  const available = getCheckoutShippingOptions(subtotal, country);
  const normalizedCountry = (country || 'United Kingdom').trim().toLowerCase();

  if (isUnitedKingdomCountry(normalizedCountry)) {
    if (selectedId === 'collection-pickup') {
      return ROYAL_MAIL_UK_SERVICES[2];
    }
    if (selectedId === 'free-uk') {
      return subtotal >= 100 ? ROYAL_MAIL_UK_SERVICES[1] : ROYAL_MAIL_UK_SERVICES[0];
    }
    if (selectedId === 'standard-uk') {
      return subtotal >= 100 ? ROYAL_MAIL_UK_SERVICES[1] : ROYAL_MAIL_UK_SERVICES[0];
    }
    return subtotal >= 100 ? ROYAL_MAIL_UK_SERVICES[1] : ROYAL_MAIL_UK_SERVICES[0];
  }

  if (selectedId) {
    const match = available.find((opt) => opt.id === selectedId);
    if (match) return match;
  }
  return available[0];
}

export interface ShippingLabelData {
  trackingNumber: string;
  orderNumber: string;
  carrier: 'Royal Mail' | 'Evri' | 'FedEx' | 'DHL' | 'UPS';
  serviceLevel: string;
  senderAddress: {
    name: string;
    company: string;
    street: string;
    city: string;
    postalCode: string;
    country: string;
  };
  recipientAddress: {
    name: string;
    email?: string;
    phone?: string;
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  customerEmail?: string;
  customerPhone?: string;
  weightKg: number;
  // Limited Quantity Hazardous Goods declaration for Perfumes (UN 1266)
  isHazardous: boolean;
  unNumber?: string;
  hazardClass?: string;
  properShippingName?: string;
  lqCompliant: boolean;
  estimatedDelivery: string;
  currentStatus: 'ORDER_PLACED' | 'DISPATCH_PENDING' | 'IN_TRANSIT' | 'OUT_FOR_DELIVERY' | 'DELIVERED';
  milestones: TrackingMilestone[];
  items: {
    title: string;
    variant: string;
    quantity: number;
    price: number;
    image: string;
    containsAlcohol: boolean;
  }[];
}

// Real orders loaded dynamically from Neon PostgreSQL (/api/orders)
export const SHIPMENT_DATABASE: Record<string, ShippingLabelData> = {};

/**
 * Address validation simulator (in the style of ShipStation / Sendcloud address verification)
 */
export function validateDeliveryAddress(address: {
  street: string;
  city: string;
  postalCode: string;
  country: string;
}): { isValid: boolean; normalizedAddress?: string; error?: string } {
  if (!address.street || address.street.trim().length < 4) {
    return { isValid: false, error: 'Street address is too short or missing.' };
  }
  if (!address.city || address.city.trim().length < 2) {
    return { isValid: false, error: 'City is missing or invalid.' };
  }
  if (!address.postalCode || address.postalCode.trim().length < 3) {
    return { isValid: false, error: 'Postal code format is invalid.' };
  }
  return {
    isValid: true,
    normalizedAddress: `${address.street.trim()}, ${address.city.trim()}, ${address.postalCode.trim()}, ${address.country.trim()}`,
  };
}

/**
 * Carrier Selector & LQ Hazard Evaluation:
 * Perfumes with alcohol require UN 1266 Limited Quantity (LQ) diamond labeling.
 * Uses Royal Mail Tracked (LQ Compliant) for Perfumes, and Royal Mail / Evri for Hair/Body care.
 */
export function evaluateShipmentPackaging(items: { title: string; category?: string }[]): {
  isHazardous: boolean;
  unNumber: string | null;
  hazardClass: string | null;
  lqLabelRequired: boolean;
  recommendedCarrier: 'Royal Mail' | 'Evri' | 'FedEx' | 'DHL';
  serviceLevel: string;
} {
  const hasPerfume = items.some(
    (item) =>
      item.title.toLowerCase().includes('parfum') ||
      item.title.toLowerCase().includes('fragrance') ||
      item.title.toLowerCase().includes('mist') ||
      (item.category || '').toLowerCase().includes('parfum') ||
      (item.category || '').toLowerCase().includes('perfume') ||
      (item.category || '').toLowerCase().includes('fragrance')
  );

  if (hasPerfume) {
    return {
      isHazardous: true,
      unNumber: 'UN 1266',
      hazardClass: 'Class 3 Flammable Liquid (PG II/III)',
      lqLabelRequired: true,
      recommendedCarrier: 'Royal Mail',
      serviceLevel: 'Royal Mail Tracked (Dangerous Goods LQ Compliant)',
    };
  }

  return {
    isHazardous: false,
    unNumber: null,
    hazardClass: null,
    lqLabelRequired: false,
    recommendedCarrier: 'Royal Mail',
    serviceLevel: 'Royal Mail Standard UK Delivery',
  };
}

/**
 * Generate a new shipping label via aggregator dispatch with Royal Mail or Evri
 */
export function createAggregatorDispatch(params: {
  orderNumber: string;
  customerName: string;
  customerEmail?: string;
  customerPhone?: string;
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  carrier?: 'Royal Mail' | 'Evri' | 'FedEx' | 'DHL' | 'UPS';
  serviceLevel?: string;
  trackingNumber?: string;
  currentStatus?: 'ORDER_PLACED' | 'DISPATCH_PENDING' | 'IN_TRANSIT' | 'OUT_FOR_DELIVERY' | 'DELIVERED';
  items: {
    title: string;
    variant: string;
    quantity: number;
    price: number;
    image: string;
  }[];
}): ShippingLabelData {
  const packaging = evaluateShipmentPackaging(params.items);
  const chosenCarrier = params.carrier || packaging.recommendedCarrier;

  let chosenService = params.serviceLevel;
  if (!chosenService) {
    if (chosenCarrier === 'Royal Mail') {
      chosenService = packaging.isHazardous
        ? 'Royal Mail Tracked (Dangerous Goods LQ Compliant)'
        : 'Royal Mail Standard UK Delivery';
    } else if (chosenCarrier === 'Evri') {
      chosenService = 'Evri Tracked Doorstep Delivery';
    } else {
      chosenService = packaging.serviceLevel;
    }
  }

  let trackingNumber = params.trackingNumber || '';
  if (!trackingNumber) {
    if (chosenCarrier === 'Royal Mail') {
      trackingNumber = `GB${Date.now().toString().slice(-8)}RY`;
    } else if (chosenCarrier === 'Evri') {
      trackingNumber = `RY-EVRI-${Date.now().toString().slice(-8)}`;
    } else {
      trackingNumber = `RY-${chosenCarrier.toUpperCase()}-${Date.now().toString().slice(-6)}`;
    }
  }

  const status = params.currentStatus || 'IN_TRANSIT';

  const newShipment: ShippingLabelData = {
    trackingNumber,
    orderNumber: params.orderNumber,
    carrier: chosenCarrier,
    serviceLevel: chosenService,
    senderAddress: {
      name: 'Rycarix Fulfillment Center',
      company: 'Rycarix Luxury Goods Co.',
      street: 'Unit 4, Rycarix Atelier House',
      city: 'London',
      postalCode: 'W1S 2TE',
      country: 'United Kingdom',
    },
    recipientAddress: {
      name: params.customerName,
      email: params.customerEmail,
      phone: params.customerPhone,
      street: params.street,
      city: params.city,
      state: params.state,
      postalCode: params.postalCode,
      country: params.country,
    },
    customerEmail: params.customerEmail,
    customerPhone: params.customerPhone,
    weightKg: 0.75,
    isHazardous: packaging.isHazardous,
    unNumber: packaging.unNumber || undefined,
    hazardClass: packaging.hazardClass || undefined,
    properShippingName: packaging.isHazardous ? 'Perfumery Products (UN 1266)' : undefined,
    lqCompliant: true,
    estimatedDelivery: chosenCarrier === 'Royal Mail' ? '2–3 Working Days' : '2–3 Working Days',
    currentStatus: status,
    milestones: [
      {
        timestamp: 'Just now',
        status: status === 'DELIVERED'
          ? 'Delivered to Doorstep'
          : status === 'OUT_FOR_DELIVERY'
          ? 'Out for Delivery'
          : `Dispatched via ${chosenCarrier}`,
        location: status === 'DELIVERED' || status === 'OUT_FOR_DELIVERY'
          ? `${params.city} Local Depot`
          : 'Rycarix Fulfillment Center, London, UK',
        description: packaging.isHazardous
          ? `${chosenCarrier} waybill ${trackingNumber} generated with UN 1266 Limited Quantity (LQ) compliance.`
          : `${chosenCarrier} waybill ${trackingNumber} dispatched from London fulfillment center.`,
        isCompleted: true,
      },
      {
        timestamp: 'Earlier today',
        status: 'Order Verified & Packed',
        location: 'Rycarix Online Storefront',
        description: 'Customer delivery address validated and items prepared for courier pickup.',
        isCompleted: true,
      },
    ],
    items: params.items.map((i) => ({
      ...i,
      containsAlcohol: packaging.isHazardous,
    })),
  };

  SHIPMENT_DATABASE[trackingNumber] = newShipment;
  SHIPMENT_DATABASE[params.orderNumber] = newShipment;

  return newShipment;
}


/**
 * Build authentic ShippingLabelData from an Order record
 */
export function buildShipmentFromOrder(ord: any): ShippingLabelData {
  const isPerfume =
    (ord.itemCategory && String(ord.itemCategory).toLowerCase().match(/parfum|perfume|fragrance/)) ||
    (ord.items && typeof ord.items === 'string' && (ord.items.toLowerCase().includes('parfum') || ord.items.toLowerCase().includes('perfume') || ord.items.toLowerCase().includes('fragrance')));

  const rawCarrier = String(ord.carrier || '').trim();
  const carrier: 'Royal Mail' | 'Evri' | 'FedEx' | 'DHL' | 'UPS' =
    rawCarrier.toLowerCase().includes('evri')
      ? 'Evri'
      : rawCarrier.toLowerCase().includes('fedex')
      ? 'FedEx'
      : rawCarrier.toLowerCase().includes('dhl')
      ? 'DHL'
      : rawCarrier.toLowerCase().includes('ups')
      ? 'UPS'
      : 'Royal Mail';

  const isDispatched = Boolean(
    (ord.status && ['SHIPPED', 'DELIVERED', 'IN_TRANSIT', 'OUT_FOR_DELIVERY'].includes(String(ord.status).toUpperCase())) ||
      (ord.fulfillment && String(ord.fulfillment).toLowerCase().includes('dispatched')) ||
      (ord.fulfillmentStatus && String(ord.fulfillmentStatus).toUpperCase() === 'FULFILLED') ||
      (ord.trackingNumber && String(ord.trackingNumber).trim().length > 0)
  );

  const trackingNumber = isDispatched && ord.trackingNumber ? String(ord.trackingNumber).trim() : '';
  const orderNumber = ord.orderNumber || ord.id || '';
  const customerName = ord.customer || ord.address?.name || 'Valued Client';
  const customerEmail = ord.email || ord.address?.email || '';
  const customerPhone = ord.phone || ord.address?.phone || '';
  const city = ord.address?.city || 'London';
  const destination = `${city}${ord.address?.postalCode ? `, ${ord.address.postalCode}` : ''}`.trim();

  let status: ShippingLabelData['currentStatus'] = 'DISPATCH_PENDING';
  if (isDispatched) {
    const upperCurrent = String(ord.currentStatus || ord.status || '').toUpperCase();
    if (upperCurrent === 'DELIVERED') status = 'DELIVERED';
    else if (upperCurrent === 'OUT_FOR_DELIVERY') status = 'OUT_FOR_DELIVERY';
    else status = 'IN_TRANSIT';
  }

  const milestones: TrackingMilestone[] = [];
  const now = new Date();
  const dateStr = now.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

  if (status === 'DELIVERED') {
    milestones.push({
      timestamp: `${dateStr} • Delivered`,
      status: 'Delivered to Doorstep',
      location: `${destination} (Residential)`,
      description: `Package delivered by local ${carrier} courier.`,
      isCompleted: true,
    });
  }

  if (status === 'OUT_FOR_DELIVERY' || status === 'DELIVERED') {
    milestones.push({
      timestamp: `${dateStr} • Out for Delivery`,
      status: 'Out for Delivery',
      location: `${city} Delivery Office (${carrier})`,
      description: `Sorted onto local ${carrier} delivery route for residential doorstep dropoff.`,
      isCompleted: true,
    });
  }

  if (status === 'IN_TRANSIT' || status === 'OUT_FOR_DELIVERY' || status === 'DELIVERED') {
    milestones.push({
      timestamp: `${dateStr} • In Transit`,
      status: 'Dispatched & In Transit',
      location: `${city} Regional Sorting Depot`,
      description: Boolean(isPerfume)
        ? `Dispatched via ${carrier} with tracking #${trackingNumber || orderNumber}. Cleared UN 1266 Limited Quantity (LQ) packaging check.`
        : `Dispatched via ${carrier} with tracking #${trackingNumber || orderNumber}.`,
      isCompleted: true,
    });
    milestones.push({
      timestamp: `${ord.date || dateStr} • Handed to Courier`,
      status: `Collected by ${carrier}`,
      location: 'Rycarix Fulfillment Center, London, UK',
      description: `Package collected and scanned into ${carrier} logistics network.`,
      isCompleted: true,
    });
  }

  milestones.push({
    timestamp: `${ord.date || dateStr}`,
    status: 'Order Placed & Confirmed',
    location: 'Rycarix Online Storefront',
    description: isDispatched
      ? `Payment confirmed via ${ord.paymentMethod || 'Stripe'}. Packaging prepared and handed to courier.`
      : `Payment confirmed via ${ord.paymentMethod || 'Stripe'}. Order received and awaiting admin dispatch confirmation.`,
    isCompleted: true,
  });

  const itemsList = Array.isArray(ord.itemsList) && ord.itemsList.length > 0
    ? ord.itemsList.map((i: any) => ({
        title: i.title || 'Botanical Item',
        variant: i.variantTitle || 'Standard',
        quantity: i.quantity || 1,
        price: Number(i.price ?? 0),
        image: i.image || '/images/perfumes/princess-reef.jpg',
        containsAlcohol: Boolean(isPerfume),
      }))
    : [
        {
          title: typeof ord.items === 'string' && ord.items ? ord.items : 'Order Item',
          variant: 'Standard',
          quantity: 1,
          price: Number(ord.total ?? 0),
          image: '/images/perfumes/princess-reef.jpg',
          containsAlcohol: Boolean(isPerfume),
        },
      ];

  return {
    trackingNumber,
    orderNumber,
    carrier,
    serviceLevel:
      ord.shippingService ||
      ord.serviceLevel ||
      ord.shippingMethod ||
      'Standard UK Delivery',
    senderAddress: {
      name: 'Rycarix Fulfillment Center',
      company: 'Rycarix Luxury Goods Co.',
      street: 'Unit 4, Rycarix Atelier House',
      city: 'London',
      postalCode: 'W1S 2TE',
      country: 'United Kingdom',
    },
    recipientAddress: {
      name: customerName,
      email: customerEmail,
      phone: customerPhone,
      street: ord.address?.street || 'Address on file',
      city: ord.address?.city || 'London',
      state: ord.address?.state || '',
      postalCode: ord.address?.postalCode || '',
      country: ord.address?.country || 'United Kingdom',
    },
    customerEmail,
    customerPhone,
    weightKg: 0.85,
    isHazardous: Boolean(isPerfume),
    unNumber: isPerfume ? 'UN 1266' : undefined,
    hazardClass: isPerfume ? 'Class 3 Flammable Liquid (LQ)' : undefined,
    properShippingName: isPerfume ? 'Perfumery Products (UN 1266)' : undefined,
    lqCompliant: true,
    estimatedDelivery: isDispatched
      ? (ord.estimatedDelivery || ord.shippingRecommendation || '2–3 working days')
      : 'Awaiting Dispatch',
    currentStatus: status,
    milestones,
    items: itemsList,
  };
}

/**
 * Retrieve tracking data by tracking number or order number from in-memory aggregator cache
 */
export function lookupTracking(query: string): ShippingLabelData | null {
  const trimmed = query.trim().toUpperCase();
  if (!trimmed) return null;

  if (SHIPMENT_DATABASE[trimmed]) {
    return SHIPMENT_DATABASE[trimmed];
  }

  for (const shipment of Object.values(SHIPMENT_DATABASE)) {
    if (
      (shipment.trackingNumber && shipment.trackingNumber.toUpperCase() === trimmed) ||
      shipment.orderNumber.toUpperCase() === trimmed ||
      (shipment.trackingNumber &&
        shipment.trackingNumber.replace(/[^a-zA-Z0-9]/g, '') === trimmed.replace(/[^a-zA-Z0-9]/g, ''))
    ) {
      return shipment;
    }
  }

  return null;
}
