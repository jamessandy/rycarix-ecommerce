export interface ProductAttributeMap {
  // Haircare attributes
  hairType?: string[];
  porosity?: string[];
  siliconeFree?: boolean;
  sulfateFree?: boolean;
  volumeMl?: number;
  ritualTime?: string;
  
  // Perfume attributes
  olfactoryFamily?: string;
  concentration?: string;
  topNotes?: string[];
  heartNotes?: string[];
  baseNotes?: string[];
  flaconOrigin?: string;

  // Generic dynamic attributes for future categories
  [key: string]: any;
}

export interface ProductVariantItem {
  id: string;
  sku: string;
  title: string;
  price: number;
  compareAtPrice?: number;
  inventory: number;
  attributes?: Record<string, string>;
}

export interface ProductImageItem {
  id: string;
  url: string;
  alt: string;
  isHero?: boolean;
  isTexture?: boolean; // For sensory hover swap
}

export interface ProductItem {
  id: string;
  title: string;
  slug: string;
  subtitle: string;
  summary: string;
  description: string;
  category: string;
  basePrice: number;
  compareAtPrice?: number;
  rating: number;
  reviewCount: number;
  
  // Accordion details
  ingredients: string;
  howToUse: string;
  sourcingEthics: string;
  
  attributes: ProductAttributeMap;
  images: ProductImageItem[];
  variants: ProductVariantItem[];
}

export interface CartItem {
  id: string; // Composite unique key: `${productId}-${variantId}`
  productId: string;
  variantId: string;
  title: string;
  variantTitle: string;
  sku: string;
  price: number;
  quantity: number;
  image: string;
}

export interface KlarnaInstallmentPlan {
  total: number;
  numberOfPayments: 4;
  installmentAmount: number;
  frequency: "Bi-weekly";
  apr: "0% APR";
}

export interface KlarnaInstallmentItem {
  installmentNumber: number;
  amount: number;
  dueDate: string;
  status: "PAID" | "PENDING" | "SCHEDULED";
}

export interface OrderRecord {
  id: string;
  orderNumber: string;
  date: string;
  status: "PAID" | "PROCESSING" | "SHIPPED" | "DELIVERED";
  fulfillmentStatus: "FULFILLED" | "IN_TRANSIT" | "PROCESSING";
  total: number;
  currency: string;
  items: {
    title: string;
    variantTitle: string;
    quantity: number;
    price: number;
    image: string;
  }[];
  payment: {
    provider: string;
    isKlarna: boolean;
    planType?: string;
    installmentCount?: number;
    installmentsPaid?: number;
    installmentSchedule?: KlarnaInstallmentItem[];
  };
  trackingNumber?: string;
  carrier?: string;
}
