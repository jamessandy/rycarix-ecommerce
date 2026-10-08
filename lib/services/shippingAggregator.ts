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

export interface ShippingLabelData {
  trackingNumber: string;
  orderNumber: string;
  carrier: 'FedEx' | 'DHL' | 'UPS';
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
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
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

// Initial shipments for live tracking
export const SHIPMENT_DATABASE: Record<string, ShippingLabelData> = {
  '7829-1092-4821': {
    trackingNumber: '7829-1092-4821',
    orderNumber: 'RY-84920',
    carrier: 'FedEx',
    serviceLevel: 'FedEx Priority Overnight',
    senderAddress: {
      name: 'Rycarix Fulfillment Atelier',
      company: 'Rycarix Luxury Fragrance Co.',
      street: '18 Place Vendôme',
      city: 'Paris',
      postalCode: '75001',
      country: 'France',
    },
    recipientAddress: {
      name: 'Éléonore de Vance',
      street: '740 Park Avenue, Apt 11B',
      city: 'New York',
      state: 'NY',
      postalCode: '10021',
      country: 'United States',
    },
    weightKg: 0.85,
    isHazardous: true,
    unNumber: 'UN 1266',
    hazardClass: 'Class 3 Flammable Liquid (LQ)',
    properShippingName: 'Perfumery Products with Flammable Solvents',
    lqCompliant: true,
    estimatedDelivery: 'Today by 4:30 PM',
    currentStatus: 'OUT_FOR_DELIVERY',
    milestones: [
      {
        timestamp: 'Sep 28, 2026 • 08:30 AM',
        status: 'Out for Delivery',
        location: 'New York, NY',
        description: 'Package sorted onto FedEx courier vehicle for direct residential delivery.',
        isCompleted: true,
      },
      {
        timestamp: 'Sep 27, 2026 • 11:15 PM',
        status: 'Arrived at Regional Hub',
        location: 'Newark Hub, NJ',
        description: 'Cleared customs and dangerous goods (LQ) visual compliance inspection.',
        isCompleted: true,
      },
      {
        timestamp: 'Sep 26, 2026 • 06:40 PM',
        status: 'Departed Export Facility',
        location: 'Paris Charles de Gaulle (CDG)',
        description: 'International air manifest sealed with Limited Quantity (LQ) marking.',
        isCompleted: true,
      },
      {
        timestamp: 'Sep 25, 2026 • 02:15 PM',
        status: 'Dispatched via ShipStation',
        location: 'Rycarix Atelier, Paris',
        description: 'Shipping label printed with UN 1266 Limited Quantity diamond marking.',
        isCompleted: true,
      },
      {
        timestamp: 'Sep 24, 2026 • 10:00 AM',
        status: 'Order Placed & Confirmed',
        location: 'Online Storefront',
        description: 'Payment authorized via Klarna Pay in 4. Order dispatched to fulfillment.',
        isCompleted: true,
      },
    ],
    items: [
      {
        title: 'Santal Noir Extrait de Parfum',
        variant: '100ml / 3.4 fl. oz.',
        quantity: 1,
        price: 280.0,
        image: 'https://images.unsplash.com/photo-1594035910387-fea47794261f?q=80&w=600&auto=format&fit=crop',
        containsAlcohol: true,
      },
    ],
  },
  'DHL-9840-2811': {
    trackingNumber: 'DHL-9840-2811',
    orderNumber: 'RY-77218',
    carrier: 'DHL',
    serviceLevel: 'DHL Express Worldwide',
    senderAddress: {
      name: 'Rycarix Fulfillment Atelier',
      company: 'Rycarix Luxury Fragrance Co.',
      street: '18 Place Vendôme',
      city: 'Paris',
      postalCode: '75001',
      country: 'France',
    },
    recipientAddress: {
      name: 'Éléonore de Vance',
      street: '740 Park Avenue, Apt 11B',
      city: 'New York',
      state: 'NY',
      postalCode: '10021',
      country: 'United States',
    },
    weightKg: 0.65,
    isHazardous: false,
    lqCompliant: true,
    estimatedDelivery: 'Delivered on August 02, 2026',
    currentStatus: 'DELIVERED',
    milestones: [
      {
        timestamp: 'Aug 02, 2026 • 01:20 PM',
        status: 'Delivered',
        location: 'New York, NY',
        description: 'Package handed directly to concierge. Signature recorded.',
        isCompleted: true,
      },
      {
        timestamp: 'Aug 02, 2026 • 07:45 AM',
        status: 'Out for Delivery',
        location: 'New York, NY',
        description: 'Courier assigned for standard delivery.',
        isCompleted: true,
      },
      {
        timestamp: 'Aug 01, 2026 • 09:00 PM',
        status: 'Customs Cleared',
        location: 'JFK International Airport, NY',
        description: 'Import clearance approved.',
        isCompleted: true,
      },
    ],
    items: [
      {
        title: 'L’Huile Sublime Regenerative Hair Nectar',
        variant: '100ml / 3.4 fl. oz.',
        quantity: 1,
        price: 135.0,
        image: 'https://images.unsplash.com/photo-1608248597359-57e3f1638271?q=80&w=600&auto=format&fit=crop',
        containsAlcohol: false,
      },
    ],
  },
};

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
 */
export function evaluateShipmentPackaging(items: { title: string; category?: string }[]): {
  isHazardous: boolean;
  unNumber: string | null;
  hazardClass: string | null;
  lqLabelRequired: boolean;
  recommendedCarrier: 'FedEx' | 'DHL' | 'UPS';
  serviceLevel: string;
} {
  const hasPerfume = items.some(
    (item) =>
      item.title.toLowerCase().includes('parfum') ||
      item.title.toLowerCase().includes('fragrance') ||
      item.title.toLowerCase().includes('mist') ||
      item.category === 'Haute Parfumerie'
  );

  if (hasPerfume) {
    return {
      isHazardous: true,
      unNumber: 'UN 1266',
      hazardClass: 'Class 3 Flammable Liquid (PG II/III)',
      lqLabelRequired: true,
      recommendedCarrier: 'FedEx',
      serviceLevel: 'FedEx Priority Overnight (Dangerous Goods LQ Compliant)',
    };
  }

  return {
    isHazardous: false,
    unNumber: null,
    hazardClass: null,
    lqLabelRequired: false,
    recommendedCarrier: 'DHL',
    serviceLevel: 'DHL Express Worldwide (Standard Non-Regulated)',
  };
}

/**
 * Generate a new shipping label via aggregator simulation
 */
export function createAggregatorDispatch(params: {
  orderNumber: string;
  customerName: string;
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  items: {
    title: string;
    variant: string;
    quantity: number;
    price: number;
    image: string;
  }[];
}): ShippingLabelData {
  const packaging = evaluateShipmentPackaging(params.items);
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  const trackingNumber = `RY-${packaging.recommendedCarrier.toUpperCase()}-${randomSuffix}`;

  const newShipment: ShippingLabelData = {
    trackingNumber,
    orderNumber: params.orderNumber,
    carrier: packaging.recommendedCarrier,
    serviceLevel: packaging.serviceLevel,
    senderAddress: {
      name: 'Rycarix Fulfillment Atelier',
      company: 'Rycarix Luxury Fragrance Co.',
      street: '18 Place Vendôme',
      city: 'Paris',
      postalCode: '75001',
      country: 'France',
    },
    recipientAddress: {
      name: params.customerName,
      street: params.street,
      city: params.city,
      state: params.state,
      postalCode: params.postalCode,
      country: params.country,
    },
    weightKg: 0.75,
    isHazardous: packaging.isHazardous,
    unNumber: packaging.unNumber || undefined,
    hazardClass: packaging.hazardClass || undefined,
    properShippingName: packaging.isHazardous ? 'Perfumery Products (UN 1266)' : undefined,
    lqCompliant: true,
    estimatedDelivery: 'In 2-3 Business Days',
    currentStatus: 'IN_TRANSIT',
    milestones: [
      {
        timestamp: 'Just now',
        status: 'Label Printed & Manifest Dispatched',
        location: 'Rycarix Atelier, Paris',
        description: packaging.isHazardous
          ? 'ShipStation generated commercial barcode with required UN 1266 Limited Quantity (LQ) hazard diamond.'
          : 'ShipStation generated standard air express label.',
        isCompleted: true,
      },
      {
        timestamp: 'Earlier today',
        status: 'Order Verified',
        location: 'Online Storefront',
        description: 'Address validated and order processed.',
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
 * Retrieve tracking data by tracking number or order number
 */
export function lookupTracking(query: string): ShippingLabelData | null {
  const trimmed = query.trim().toUpperCase();
  if (!trimmed) return null;

  // Direct tracking number match
  if (SHIPMENT_DATABASE[trimmed]) {
    return SHIPMENT_DATABASE[trimmed];
  }

  // Look through values
  for (const shipment of Object.values(SHIPMENT_DATABASE)) {
    if (
      shipment.trackingNumber.toUpperCase() === trimmed ||
      shipment.orderNumber.toUpperCase() === trimmed ||
      shipment.trackingNumber.replace(/[^a-zA-Z0-9]/g, '') === trimmed.replace(/[^a-zA-Z0-9]/g, '')
    ) {
      return shipment;
    }
  }

  // Fallback default shipment for demo resilience
  return SHIPMENT_DATABASE['7829-1092-4821'];
}
