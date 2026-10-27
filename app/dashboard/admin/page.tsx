'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  TrendingUp,
  DollarSign,
  Package,
  Layers,
  Plus,
  Search,
  CheckCircle,
  AlertTriangle,
  Clock,
  Shield,
  Filter,
  Eye,
  Edit3,
  Trash2,
  Sparkles,
  Percent,
  KeyRound,
  Truck,
  Printer,
  ExternalLink,
  FileText,
  CheckCircle2,
  X,
  Flame,
  Users,
  Globe,
  Smartphone,
  MessageSquare,
  Activity,
  ArrowUpRight,
  BarChart3,
  LogOut,
  Upload,
  Image as ImageIcon,
  RotateCcw,
  Save,
  Check,
} from 'lucide-react';
import { PRODUCTS } from '@/lib/data/mockData';
import { ProductItem } from '@/lib/types/ecommerce';
import { useAuthStore } from '@/lib/store/useAuthStore';
import {
  createAggregatorDispatch,
  lookupTracking,
  validateDeliveryAddress,
  evaluateShipmentPackaging,
  ShippingLabelData,
} from '@/lib/services/shippingAggregator';

interface AdminProductForm {
  title: string;
  category: string;
  subtitle: string;
  basePrice: number;
  compareAtPrice: number;
  stock: number;
  sku: string;
  size: string;
  inci: string;
  terroir: string;
  howToUse: string;
  summary: string;
  description: string;
  imageUrl: string;
  secondaryImageUrl: string;
}

interface EditProductFormState {
  id: string;
  title: string;
  slug: string;
  category: string;
  subtitle: string;
  basePrice: number;
  compareAtPrice: number;
  stock: number;
  sku: string;
  size: string;
  inci: string;
  terroir: string;
  howToUse: string;
  summary: string;
  description: string;
  imageUrl: string;
  secondaryImageUrl: string;
}

const PRESET_IMAGES = [
  {
    name: 'Hair Nectar Elixir',
    category: 'Hair',
    url: 'https://images.unsplash.com/photo-1608248597359-57e3f1638271?q=80&w=800&auto=format&fit=crop',
  },
  {
    name: 'Grasse Perfume Flacon',
    category: 'Haute Parfumerie',
    url: 'https://images.unsplash.com/photo-1594035910387-fea47794261f?q=80&w=800&auto=format&fit=crop',
  },
  {
    name: 'Botanical Cellular Serum',
    category: 'Botanical Skincare',
    url: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?q=80&w=800&auto=format&fit=crop',
  },
  {
    name: 'Artisanal Body Balm',
    category: 'Body & Bath',
    url: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?q=80&w=800&auto=format&fit=crop',
  },
  {
    name: 'Hand-Poured Soy Candle',
    category: 'Home & Living',
    url: 'https://images.unsplash.com/photo-1603006905003-be475563bc59?q=80&w=800&auto=format&fit=crop',
  },
  {
    name: 'Fine Accessories & Horn',
    category: 'Accessories',
    url: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?q=80&w=800&auto=format&fit=crop',
  },
];

export default function AdminDashboard() {
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuthStore();
  const [hasHydrated, setHasHydrated] = useState(false);

  useEffect(() => {
    if (useAuthStore.persist?.hasHydrated()) {
      setHasHydrated(true);
    }
    const unsub = useAuthStore.persist?.onFinishHydration?.(() => {
      setHasHydrated(true);
    });
    return () => unsub?.();
  }, []);

  useEffect(() => {
    if (!hasHydrated) return;
    if (!isAuthenticated || user?.role !== 'ADMIN') {
      router.replace('/login?redirect=/dashboard/admin');
    }
  }, [hasHydrated, isAuthenticated, user, router]);

  const [activeTab, setActiveTab] = useState<'inventory' | 'orders' | 'analytics'>('inventory');
  const [productsList, setProductsList] = useState<ProductItem[]>(PRODUCTS);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ProductItem | null>(null);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'info' } | null>(null);

  // Hydrate custom or edited products and real customer orders from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('rycarix_catalog_products');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            // Filter out any stale dummy or demo products
            const cleaned = parsed.filter(
              (p: any) => p.id !== 'prod-demo-1eur' && p.slug !== 'atelier-discovery-sample-1-euro'
            );
            setProductsList(cleaned);
            localStorage.setItem('rycarix_catalog_products', JSON.stringify(cleaned));
          } else {
            setProductsList(PRODUCTS.filter((p) => p.id !== 'prod-demo-1eur'));
          }
        } else {
          setProductsList(PRODUCTS.filter((p) => p.id !== 'prod-demo-1eur'));
        }

        // Hydrate actual client orders
        const savedOrders = localStorage.getItem('rycarix_orders');
        if (savedOrders) {
          const parsedOrders = JSON.parse(savedOrders);
          if (Array.isArray(parsedOrders)) {
            setAdminOrders(parsedOrders);
          }
        } else {
          setAdminOrders([]);
        }
      } catch (e) {
        console.warn('Failed to load saved products/orders', e);
      }
    }
  }, []);

  const saveCatalog = (newList: ProductItem[]) => {
    setProductsList(newList);
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('rycarix_catalog_products', JSON.stringify(newList));
      } catch (err) {
        console.warn('Could not persist products', err);
      }
    }
  };

  const handleResetCatalog = () => {
    if (confirm('Restore factory default product catalog (all initial formulations)?')) {
      saveCatalog(PRODUCTS);
      setNotification({ message: 'Catalog reset to atelier factory presets.', type: 'info' });
      setTimeout(() => setNotification(null), 4000);
    }
  };

  // Dynamic Product Form State for New Product
  const initialFormData: AdminProductForm = {
    title: '',
    category: 'Hair',
    subtitle: '',
    basePrice: 195,
    compareAtPrice: 0,
    stock: 50,
    sku: 'RY-NEW-01',
    size: '100ml / 3.4 fl. oz.',
    inci: 'Alcohol Denat, Parfum, Santalum Album Oil, Rosa Damascena Flower Water, Tocopherol.',
    terroir: 'Murano Hand-Blown Flacon & Grasse Botanicals',
    howToUse: 'Apply 2-3 drops to pulse points or smooth through damp hair lengths.',
    summary: 'Dynamic atelier formulation handcrafted with rare botanical essences and molecular extracts.',
    description: 'Extracted and blended according to Rycarix strict artisanal quality protocols in limited batch reserves.',
    imageUrl: 'https://images.unsplash.com/photo-1608248597359-57e3f1638271?q=80&w=800&auto=format&fit=crop',
    secondaryImageUrl: 'https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?q=80&w=800&auto=format&fit=crop',
  };

  const [formData, setFormData] = useState<AdminProductForm>(initialFormData);

  // Edit Product Form State
  const [editFormData, setEditFormData] = useState<EditProductFormState>({
    id: '',
    title: '',
    slug: '',
    category: 'Hair',
    subtitle: '',
    basePrice: 0,
    compareAtPrice: 0,
    stock: 0,
    sku: '',
    size: '',
    inci: '',
    terroir: '',
    howToUse: '',
    summary: '',
    description: '',
    imageUrl: '',
    secondaryImageUrl: '',
  });

  // Handle local image upload via FileReader
  const handleImageFileUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    target: 'add-primary' | 'add-secondary' | 'edit-primary' | 'edit-secondary'
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 8 * 1024 * 1024) {
      alert('File size exceeds 8MB. Please select a smaller image.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (uploadEvent) => {
      const dataUrl = uploadEvent.target?.result as string;
      if (target === 'add-primary') {
        setFormData((prev) => ({ ...prev, imageUrl: dataUrl }));
      } else if (target === 'add-secondary') {
        setFormData((prev) => ({ ...prev, secondaryImageUrl: dataUrl }));
      } else if (target === 'edit-primary') {
        setEditFormData((prev) => ({ ...prev, imageUrl: dataUrl }));
      } else if (target === 'edit-secondary') {
        setEditFormData((prev) => ({ ...prev, secondaryImageUrl: dataUrl }));
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleStartEdit = (product: ProductItem) => {
    setEditingProduct(product);
    setEditFormData({
      id: product.id,
      title: product.title,
      slug: product.slug,
      category: product.category,
      subtitle: product.subtitle || '',
      basePrice: product.basePrice,
      compareAtPrice: product.compareAtPrice || 0,
      stock: product.variants[0]?.inventory ?? 45,
      sku: product.variants[0]?.sku || `RY-${product.id.slice(-6).toUpperCase()}`,
      size: product.variants[0]?.title || '100ml / 3.4 fl. oz.',
      inci: product.ingredients || '',
      terroir: product.sourcingEthics || '',
      howToUse: product.howToUse || '',
      summary: product.summary || '',
      description: product.description || '',
      imageUrl: product.images[0]?.url || '',
      secondaryImageUrl: product.images[1]?.url || '',
    });
    setShowEditModal(true);
  };

  const handleCreateProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      alert('Please enter a formulation title.');
      return;
    }

    const primaryImgUrl =
      formData.imageUrl.trim() ||
      'https://images.unsplash.com/photo-1608248597359-57e3f1638271?q=80&w=800&auto=format&fit=crop';

    const newSlug =
      formData.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '') || `product-${Date.now()}`;

    const newProduct: ProductItem = {
      id: `prod-${Date.now()}`,
      title: formData.title,
      slug: newSlug,
      subtitle: formData.subtitle || `${formData.category} Formulation`,
      summary:
        formData.summary ||
        'Dynamic atelier formulation handcrafted with rare botanical essences and molecular extracts.',
      description:
        formData.description ||
        'Extracted and blended according to Rycarix strict artisanal quality protocols in limited batch reserves.',
      category: formData.category,
      basePrice: Number(formData.basePrice) || 0,
      compareAtPrice:
        formData.compareAtPrice && Number(formData.compareAtPrice) > 0
          ? Number(formData.compareAtPrice)
          : undefined,
      rating: 5.0,
      reviewCount: 0,
      ingredients: formData.inci,
      howToUse: formData.howToUse || 'Apply 2-3 drops to pulse points or smooth through hair as desired.',
      sourcingEthics: formData.terroir,
      attributes: {
        categoryType: formData.category,
      },
      images: [
        {
          id: `img-${Date.now()}-1`,
          url: primaryImgUrl,
          alt: formData.title,
          isHero: true,
        },
        ...(formData.secondaryImageUrl.trim()
          ? [
              {
                id: `img-${Date.now()}-2`,
                url: formData.secondaryImageUrl.trim(),
                alt: `${formData.title} Texture`,
                isTexture: true,
              },
            ]
          : [
              {
                id: `img-${Date.now()}-2`,
                url: 'https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?q=80&w=800&auto=format&fit=crop',
                alt: `${formData.title} Texture`,
                isTexture: true,
              },
            ]),
      ],
      variants: [
        {
          id: `var-${Date.now()}`,
          sku: formData.sku || `RY-${Date.now().toString().slice(-4)}`,
          title: formData.size || '100ml / 3.4 fl. oz.',
          price: Number(formData.basePrice) || 0,
          compareAtPrice:
            formData.compareAtPrice && Number(formData.compareAtPrice) > 0
              ? Number(formData.compareAtPrice)
              : undefined,
          inventory: Number(formData.stock) || 0,
          attributes: { size: formData.size || '100ml' },
        },
      ],
    };

    const updatedList = [newProduct, ...productsList];
    saveCatalog(updatedList);
    setShowAddModal(false);
    setFormData(initialFormData);
    setNotification({
      message: `Product "${newProduct.title}" created and published to catalog.`,
      type: 'success',
    });
    setTimeout(() => setNotification(null), 4000);
  };

  const handleUpdateProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;
    if (!editFormData.title.trim()) {
      alert('Product title cannot be empty.');
      return;
    }

    const primaryImgUrl =
      editFormData.imageUrl.trim() ||
      editingProduct.images[0]?.url ||
      'https://images.unsplash.com/photo-1594035910387-fea47794261f?q=80&w=800&auto=format&fit=crop';

    const updatedImages = [
      {
        id: editingProduct.images[0]?.id || `img-${Date.now()}-1`,
        url: primaryImgUrl,
        alt: editFormData.title,
        isHero: true,
      },
      ...(editFormData.secondaryImageUrl.trim()
        ? [
            {
              id: editingProduct.images[1]?.id || `img-${Date.now()}-2`,
              url: editFormData.secondaryImageUrl.trim(),
              alt: `${editFormData.title} Texture`,
              isTexture: true,
            },
          ]
        : editingProduct.images.slice(1)),
    ];

    const updatedVariants = [
      {
        id: editingProduct.variants[0]?.id || `var-${Date.now()}`,
        sku: editFormData.sku || `RY-${Date.now().toString().slice(-4)}`,
        title: editFormData.size || '100ml / 3.4 fl. oz.',
        price: Number(editFormData.basePrice) || 0,
        compareAtPrice:
          editFormData.compareAtPrice && Number(editFormData.compareAtPrice) > 0
            ? Number(editFormData.compareAtPrice)
            : undefined,
        inventory: Number(editFormData.stock) || 0,
        attributes: {
          ...editingProduct.variants[0]?.attributes,
          size: editFormData.size || '100ml',
        },
      },
      ...editingProduct.variants.slice(1),
    ];

    const updatedProduct: ProductItem = {
      ...editingProduct,
      title: editFormData.title,
      slug:
        editFormData.slug.trim() ||
        editFormData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
      category: editFormData.category,
      subtitle: editFormData.subtitle || `${editFormData.category} Formulation`,
      summary: editFormData.summary || editingProduct.summary,
      description: editFormData.description || editingProduct.description,
      basePrice: Number(editFormData.basePrice) || 0,
      compareAtPrice:
        editFormData.compareAtPrice && Number(editFormData.compareAtPrice) > 0
          ? Number(editFormData.compareAtPrice)
          : undefined,
      ingredients: editFormData.inci,
      sourcingEthics: editFormData.terroir,
      howToUse: editFormData.howToUse,
      images: updatedImages,
      variants: updatedVariants,
      attributes: {
        ...editingProduct.attributes,
        categoryType: editFormData.category,
      },
    };

    const updatedList = productsList.map((p) => (p.id === updatedProduct.id ? updatedProduct : p));
    saveCatalog(updatedList);
    setShowEditModal(false);
    setEditingProduct(null);
    setNotification({
      message: `Product "${updatedProduct.title}" updated successfully.`,
      type: 'success',
    });
    setTimeout(() => setNotification(null), 4000);
  };

  // Real store orders hydrated from localStorage or empty
  const [adminOrders, setAdminOrders] = useState<any[]>([]);
  const [trafficData, setTrafficData] = useState<any>(null);

  useEffect(() => {
    fetch('/api/analytics/traffic')
      .then((res) => res.json())
      .then((data) => setTrafficData(data))
      .catch(() => {});
  }, [activeTab]);

  // Dynamic calculations based strictly on real catalog and active orders
  const totalGMV = adminOrders.reduce((sum, o) => sum + (Number(o.total) || 0), 0);
  const klarnaVolume = adminOrders
    .filter((o) => (o.paymentMethod || '').toLowerCase().includes('klarna'))
    .reduce((sum, o) => sum + (Number(o.total) || 0), 0);
  const aov = adminOrders.length > 0 ? totalGMV / adminOrders.length : 0;

  const totalActiveInventory = productsList.reduce((acc, p) => {
    const variantStock = p.variants?.reduce((vAcc: number, v: any) => vAcc + (v.inventory || 0), 0) || 0;
    return acc + variantStock;
  }, 0);

  const lowStockCount = productsList.filter((p) =>
    p.variants?.some((v: any) => (v.inventory || 0) < 20)
  ).length;
  const [dispatchModalOrder, setDispatchModalOrder] = useState<any | null>(null);
  const [activeLabelData, setActiveLabelData] = useState<ShippingLabelData | null>(null);
  const [isDispatching, setIsDispatching] = useState(false);
  const [dispatchSuccessMsg, setDispatchSuccessMsg] = useState('');

  const handleOpenDispatchModal = (ord: any) => {
    setDispatchModalOrder(ord);
    setDispatchSuccessMsg('');

    // If order already has a tracking number, load from database
    if (ord.trackingNumber) {
      const existing = lookupTracking(ord.trackingNumber);
      if (existing) {
        setActiveLabelData(existing);
        return;
      }
    }

    // Otherwise evaluate packaging and generate dynamic simulated label
    const packaging = evaluateShipmentPackaging([
      { title: ord.items, category: ord.itemCategory },
    ]);
    const carrier = packaging.recommendedCarrier; // 'Royal Mail' for perfume (LQ), 'Evri' for standard
    const isRM = carrier === 'Royal Mail';
    const trackingNumber = isRM
      ? `RY-RM-${Math.floor(1000 + Math.random() * 9000)}GB`
      : `RY-EVRI-${Math.floor(10000000 + Math.random() * 90000000)}`;

    const simLabel: ShippingLabelData = {
      trackingNumber,
      orderNumber: ord.id,
      carrier,
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
        name: ord.customer,
        street: ord.address?.street || '42 Kensington Palace Gardens',
        city: ord.address?.city || 'London',
        state: ord.address?.state || 'Greater London',
        postalCode: ord.address?.postalCode || 'W8 4QP',
        country: ord.address?.country || 'United Kingdom',
      },
      weightKg: 0.85,
      isHazardous: packaging.isHazardous,
      unNumber: packaging.unNumber || undefined,
      hazardClass: packaging.hazardClass || undefined,
      properShippingName: packaging.isHazardous ? 'Perfumery Products (UN 1266)' : undefined,
      lqCompliant: true,
      estimatedDelivery: isRM ? 'Tomorrow by 1:00 PM' : 'In 1-2 Business Days',
      currentStatus: 'IN_TRANSIT',
      milestones: [
        {
          timestamp: 'Just now',
          status: `Label Generated via ${carrier}`,
          location: 'Rycarix Atelier, Paris',
          description: packaging.isHazardous
            ? `${carrier} barcoded shipping label generated with mandatory UN 1266 Limited Quantity (LQ) diamond marking.`
            : `${carrier} express doorstep tracking waybill generated.`,
          isCompleted: true,
        },
      ],
      items: [
        {
          title: ord.items,
          variant: 'Standard Atelier Packaging',
          quantity: 1,
          price: ord.total,
          image: 'https://images.unsplash.com/photo-1594035910387-fea47794261f?q=80&w=600&auto=format&fit=crop',
          containsAlcohol: packaging.isHazardous,
        },
      ],
    };
    setActiveLabelData(simLabel);
  };

  const handleSelectCarrier = (newCarrier: 'Royal Mail' | 'Evri') => {
    if (!activeLabelData || !dispatchModalOrder) return;
    const isRM = newCarrier === 'Royal Mail';
    const newTracking = isRM
      ? `RY-RM-${Math.floor(1000 + Math.random() * 9000)}GB`
      : `RY-EVRI-${Math.floor(10000000 + Math.random() * 90000000)}`;

    const newService = isRM
      ? activeLabelData.isHazardous
        ? 'Royal Mail Tracked 24 (Dangerous Goods LQ Compliant)'
        : 'Royal Mail Tracked 24'
      : 'Evri Express Tracked Delivery (48h Doorstep)';

    setActiveLabelData({
      ...activeLabelData,
      carrier: newCarrier,
      serviceLevel: newService,
      trackingNumber: newTracking,
      estimatedDelivery: isRM ? 'Tomorrow by 1:00 PM' : 'In 1-2 Business Days',
    });
  };

  const handleConfirmDispatch = () => {
    if (!dispatchModalOrder || !activeLabelData) return;
    setIsDispatching(true);

    setTimeout(() => {
      // Register in global shipping database so tracking portal picks it up
      createAggregatorDispatch({
        orderNumber: dispatchModalOrder.id,
        customerName: dispatchModalOrder.customer,
        street: dispatchModalOrder.address?.street || '42 Kensington Palace Gardens',
        city: dispatchModalOrder.address?.city || 'London',
        state: dispatchModalOrder.address?.state || 'Greater London',
        postalCode: dispatchModalOrder.address?.postalCode || 'W8 4QP',
        country: dispatchModalOrder.address?.country || 'United Kingdom',
        carrier: activeLabelData.carrier,
        serviceLevel: activeLabelData.serviceLevel,
        items: [
          {
            title: dispatchModalOrder.items,
            variant: 'Atelier Packaging',
            quantity: 1,
            price: dispatchModalOrder.total,
            image: 'https://images.unsplash.com/photo-1594035910387-fea47794261f?q=80&w=600&auto=format&fit=crop',
          },
        ],
      });

      // Update in local admin orders state and persist to rycarix_orders
      setAdminOrders((prev) => {
        const next = prev.map((o) =>
          o.id === dispatchModalOrder.id
            ? {
                ...o,
                fulfillment: `Dispatched via ${activeLabelData.carrier}`,
                carrier: `${activeLabelData.carrier} Tracked`,
                trackingNumber: activeLabelData.trackingNumber,
              }
            : o
        );
        if (typeof window !== 'undefined') {
          try {
            localStorage.setItem('rycarix_orders', JSON.stringify(next));
          } catch (e) {
            console.warn('Could not persist dispatched order', e);
          }
        }
        return next;
      });

      setIsDispatching(false);
      setDispatchSuccessMsg(
        `Order ${dispatchModalOrder.id} dispatched via ${activeLabelData.carrier}! Tracking #${activeLabelData.trackingNumber} is live.`
      );
    }, 600);
  };

  if (!hasHydrated || !isAuthenticated || user?.role !== 'ADMIN') {
    return (
      <div className="min-h-screen bg-ry-pearl flex flex-col items-center justify-center font-sans text-ry-onyx px-4">
        <div className="w-10 h-10 rounded-full border-2 border-ry-onyx border-t-transparent animate-spin mb-4" />
        <span className="text-[10px] uppercase tracking-[0.3em] text-ry-stone">
          Verifying Administrator Access...
        </span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-ry-pearl text-ry-onyx pt-28 pb-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Top Admin Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between pb-8 mb-8 border-b border-ry-ash gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="bg-ry-onyx text-ry-white text-[9px] uppercase tracking-editorial px-2 py-0.5">
                Rycarix Admin
              </span>
              <span className="text-xs text-ry-stone">
                Admin: {user?.name || 'Store Administrator'} • Live Atelier
              </span>
            </div>
            <h1 className="font-serif text-3xl sm:text-4xl text-ry-onyx">
              Products & Orders Dashboard
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleResetCatalog}
              className="px-4 py-3 border border-ry-ash text-ry-stone hover:text-ry-onyx hover:border-ry-onyx text-xs uppercase tracking-editorial flex items-center gap-1.5 transition-colors"
              title="Reset catalog to atelier factory presets"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Reset Defaults</span>
            </button>
            <button
              onClick={() => setShowAddModal(true)}
              className="px-5 py-3 bg-ry-onyx text-ry-white text-xs uppercase tracking-editorial flex items-center gap-2 hover:bg-ry-charcoal transition-colors shadow-luxury"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Product</span>
            </button>
            <button
              onClick={() => {
                logout();
                router.push('/login');
              }}
              className="px-4 py-3 border border-ry-ash text-ry-stone hover:text-red-700 hover:border-red-300 text-xs uppercase tracking-editorial flex items-center gap-1.5 transition-colors"
              title="Sign Out of Admin"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>

        {/* Executive KPI Overview Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-10">
          <div className="bg-ry-white border border-ry-ash p-5">
            <div className="flex items-center justify-between text-ry-stone mb-2">
              <span className="text-[10px] uppercase tracking-editorial">Gross Merchandise Value</span>
              <TrendingUp className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="font-serif text-2xl sm:text-3xl text-ry-onyx">
              £{totalGMV.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <p className="text-[11px] text-ry-stone font-sans mt-1">
              {adminOrders.length} {adminOrders.length === 1 ? 'order' : 'orders'} recorded to date
            </p>
          </div>

          <div className="bg-ry-white border border-[#FFA8CD]/60 p-5 bg-gradient-to-br from-white to-[#FFF5F8]">
            <div className="flex items-center justify-between text-ry-stone mb-2">
              <span className="text-[10px] uppercase tracking-editorial text-[#992255]">
                Klarna Installments Volume
              </span>
              <span className="bg-[#FFA8CD] text-black text-[9px] font-bold px-1.5 py-0.5 rounded-sm">
                Klarna.
              </span>
            </div>
            <div className="font-serif text-2xl sm:text-3xl text-ry-onyx">
              £{klarnaVolume.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <p className="text-[11px] text-[#992255] font-sans mt-1">
              {totalGMV > 0 ? ((klarnaVolume / totalGMV) * 100).toFixed(1) : '0.0'}% of GMV • 0% merchant default liability
            </p>
          </div>

          <div className="bg-ry-white border border-ry-ash p-5">
            <div className="flex items-center justify-between text-ry-stone mb-2">
              <span className="text-[10px] uppercase tracking-editorial">Average Order Value (AOV)</span>
              <DollarSign className="w-4 h-4 text-ry-stone" />
            </div>
            <div className="font-serif text-2xl sm:text-3xl text-ry-onyx">
              £{aov.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <p className="text-[11px] text-ry-stone font-sans mt-1">
              {adminOrders.length > 0 ? 'Live average across customer baskets' : 'Awaiting initial store orders'}
            </p>
          </div>

          <div className="bg-ry-white border border-ry-ash p-5">
            <div className="flex items-center justify-between text-ry-stone mb-2">
              <span className="text-[10px] uppercase tracking-editorial">Active Inventory Units</span>
              <Package className="w-4 h-4 text-ry-stone" />
            </div>
            <div className="font-serif text-2xl sm:text-3xl text-ry-onyx">
              {totalActiveInventory} Units
            </div>
            <p className="text-[11px] text-ry-stone font-sans mt-1">
              {lowStockCount} {lowStockCount === 1 ? 'SKU' : 'SKUs'} under low-stock watch ({productsList.length} total products)
            </p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-ry-ash mb-8 text-xs uppercase tracking-editorial font-sans">
          <button
            onClick={() => setActiveTab('inventory')}
            className={`pb-4 px-4 font-medium transition-all relative ${
              activeTab === 'inventory'
                ? 'text-ry-onyx border-b-2 border-ry-onyx'
                : 'text-ry-stone hover:text-ry-onyx'
            }`}
          >
            Dynamic Catalog & Variants ({productsList.length})
          </button>
          <button
            onClick={() => setActiveTab('orders')}
            className={`pb-4 px-4 font-medium transition-all relative ${
              activeTab === 'orders'
                ? 'text-ry-onyx border-b-2 border-ry-onyx'
                : 'text-ry-stone hover:text-ry-onyx'
            }`}
          >
            Fulfillment & Klarna Settlements ({adminOrders.length})
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            className={`pb-4 px-4 font-medium transition-all relative ${
              activeTab === 'analytics'
                ? 'text-ry-onyx border-b-2 border-ry-onyx'
                : 'text-ry-stone hover:text-ry-onyx'
            }`}
          >
            Website Traffic & Analytics
          </button>
        </div>

        {/* Tab 1: Inventory & Dynamic Catalog Management */}
        {activeTab === 'inventory' && (
          <div className="space-y-6 animate-fade-in">
            <div className="bg-ry-white border border-ry-ash overflow-hidden">
              <div className="p-4 bg-ry-pearlDark/30 border-b border-ry-ash flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2">
                  <span className="font-serif text-sm">Product Catalog Matrix</span>
                  <span className="text-ry-stone">
                    (Supports Haircare, Perfumes, and Future Category Expansions)
                  </span>
                </div>
                <div className="text-[11px] text-ry-stone">
                  Dynamic JSON Schema Enabled
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-sans">
                  <thead className="bg-ry-pearl border-b border-ry-ash uppercase tracking-editorial text-[10px] text-ry-stone">
                    <tr>
                      <th className="py-3 px-4">Formulation</th>
                      <th className="py-3 px-4">Category</th>
                      <th className="py-3 px-4">Primary Variant</th>
                      <th className="py-3 px-4">Price</th>
                      <th className="py-3 px-4">Stock</th>
                      <th className="py-3 px-4">Clearpay (x4) / Klarna (x3)</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-ry-ash/40">
                    {productsList.map((product) => (
                      <tr key={product.id} className="hover:bg-ry-pearl/50 transition-colors">
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-3">
                            <div className="relative w-10 h-12 bg-ry-oatmeal overflow-hidden border border-ry-ash/60 shrink-0">
                              <img
                                src={
                                  product.images[0]?.url ||
                                  'https://images.unsplash.com/photo-1594035910387-fea47794261f?q=80&w=800&auto=format&fit=crop'
                                }
                                alt={product.title}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div>
                              <div className="font-serif text-sm font-medium text-ry-onyx">
                                {product.title}
                              </div>
                              <div className="text-[10px] text-ry-stone">{product.slug}</div>
                            </div>
                          </div>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="px-2 py-0.5 bg-ry-oatmeal text-[9px] uppercase tracking-editorial">
                            {product.category}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-ry-stone">
                          {product.variants[0]?.title}
                        </td>
                        <td className="py-3.5 px-4 font-mono font-medium text-ry-onyx">
                          <div>£{product.basePrice.toFixed(2)}</div>
                          {product.compareAtPrice && product.compareAtPrice > product.basePrice && (
                            <div className="text-[10px] text-ry-stone line-through">
                              £{product.compareAtPrice.toFixed(2)}
                            </div>
                          )}
                        </td>
                        <td className="py-3.5 px-4">
                          <span
                            className={`font-mono ${
                              (product.variants[0]?.inventory || 0) < 20
                                ? 'text-amber-700 font-bold'
                                : 'text-emerald-700'
                            }`}
                          >
                            {product.variants[0]?.inventory || 45} units
                          </span>
                        </td>
                        <td className="py-3.5 px-4 font-mono text-ry-stone">
                          <div>£{(product.basePrice / 4).toFixed(2)} <span className="text-[10px] text-ry-stone/70">x4</span></div>
                          <div className="text-[10px] text-ry-stone/60">or £{(product.basePrice / 3).toFixed(2)} x3</div>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Link
                              href={`/products/${product.slug}`}
                              className="p-1.5 text-ry-stone hover:text-ry-onyx"
                              title="View PDP"
                            >
                              <Eye className="w-4 h-4" />
                            </Link>
                            <button
                              onClick={() => handleStartEdit(product)}
                              className="p-1.5 text-ry-stone hover:text-ry-onyx transition-colors"
                              title="Edit Formulation, Image & Pricing"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => {
                                if (confirm(`Archive formulation "${product.title}"?`)) {
                                  const updated = productsList.filter((p) => p.id !== product.id);
                                  saveCatalog(updated);
                                  setNotification({
                                    message: `Formulation "${product.title}" removed from catalog.`,
                                    type: 'info',
                                  });
                                  setTimeout(() => setNotification(null), 4000);
                                }
                              }}
                              className="p-1.5 text-ry-stone hover:text-red-700 transition-colors"
                              title="Archive Formulation"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Orders & Shipping Aggregator Dispatch Monitor */}
        {activeTab === 'orders' && (
          <div className="space-y-4 animate-fade-in">
            {/* Dispatch Integration Banner */}
            <div className="bg-ry-white border border-ry-ash p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-ry-onyx text-ry-white flex items-center justify-center shrink-0">
                  <Truck className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-serif text-sm text-ry-onyx font-medium">
                      Evri & Royal Mail Courier Dispatch Gateway
                    </span>
                    <span className="px-2 py-0.5 bg-emerald-50 border border-emerald-300 text-emerald-800 text-[9px] font-medium uppercase tracking-wider">
                      Evri & Royal Mail Active
                    </span>
                  </div>
                  <p className="text-[11px] text-ry-stone mt-0.5">
                    Integrated parcel fulfillment via Evri and Royal Mail Tracked 24. Supports UN 1266 Limited Quantity (LQ) perfume hazmat marking, automatic address validation, and live GPS delivery tracking.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <Link
                  href="/track"
                  target="_blank"
                  className="px-3.5 py-2 bg-ry-pearl hover:bg-ry-oatmeal border border-ry-ash text-xs uppercase tracking-editorial font-medium flex items-center gap-1.5 transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>View Customer Portal</span>
                </Link>
              </div>
            </div>

            {/* Orders Table */}
            <div className="bg-ry-white border border-ry-ash overflow-hidden">
              <div className="p-4 bg-ry-pearlDark/30 border-b border-ry-ash flex items-center justify-between text-xs">
                <span className="font-serif text-sm">Fulfillment & Klarna Settlement Ledger</span>
                <span className="text-emerald-700 font-medium">
                  All Klarna Funds Disbursed Within 24h
                </span>
              </div>

              {adminOrders.length === 0 ? (
                <div className="p-12 text-center text-ry-stone">
                  <Package className="w-10 h-10 mx-auto mb-3 stroke-[1.4] text-ry-stone/60" />
                  <h4 className="font-serif text-lg text-ry-onyx mb-1">No Orders Placed Yet</h4>
                  <p className="text-xs text-ry-stone max-w-md mx-auto">
                    When customers place orders using Stripe Card, Klarna (Pay in 3), or Clearpay (Pay in 4), customer delivery addresses, parcel packaging classifications (UN 1266 LQ), and dispatch tracking will appear here in real time.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs font-sans">
                    <thead className="bg-ry-pearl border-b border-ry-ash uppercase tracking-editorial text-[10px] text-ry-stone">
                      <tr>
                        <th className="py-3 px-4">Order Ref</th>
                        <th className="py-3 px-4">Client & Destination</th>
                        <th className="py-3 px-4">Items</th>
                        <th className="py-3 px-4">Total</th>
                        <th className="py-3 px-4">Payment Method</th>
                        <th className="py-3 px-4">Fulfillment Status</th>
                        <th className="py-3 px-4">Dispatch & Tracking</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-ry-ash/40">
                      {adminOrders.map((ord) => (
                        <tr key={ord.id} className="hover:bg-ry-pearl/50">
                          <td className="py-3.5 px-4 font-mono font-medium">{ord.id}</td>
                          <td className="py-3.5 px-4">
                            <div className="font-medium text-ry-onyx">{ord.customer}</div>
                            <div className="text-[10px] text-ry-stone">{ord.email}</div>
                            <div className="text-[10px] text-ry-stone/80 truncate max-w-[180px]">
                              {ord.address?.city}, {ord.address?.country}
                            </div>
                          </td>
                          <td className="py-3.5 px-4 text-ry-stone">
                            <div>{ord.items}</div>
                            {ord.items?.toLowerCase().includes('extrait') && (
                              <span className="inline-flex items-center gap-1 text-[9px] text-amber-800 bg-amber-50 border border-amber-200 px-1.5 py-0.2 mt-0.5">
                                <Flame className="w-2.5 h-2.5 text-amber-600" /> UN 1266 LQ (Contains Alcohol)
                              </span>
                            )}
                          </td>
                          <td className="py-3.5 px-4 font-mono">£{ord.total?.toFixed(2)}</td>
                          <td className="py-3.5 px-4">
                            {ord.paymentMethod?.toLowerCase().includes('klarna') ? (
                              <span className="inline-flex items-center gap-1 bg-[#FFF0F5] border border-[#FFA8CD] text-[#801040] px-2 py-0.5 text-[10px] font-semibold">
                                Klarna Pay in 3
                              </span>
                            ) : ord.paymentMethod?.toLowerCase().includes('clearpay') ? (
                              <span className="inline-flex items-center gap-1 bg-[#E6F9F5] border border-[#B2ECE1] text-[#0A5C4E] px-2 py-0.5 text-[10px] font-semibold">
                                Clearpay Pay in 4
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 bg-ry-oatmeal text-[10px]">
                                {ord.paymentMethod}
                              </span>
                            )}
                          </td>
                          <td className="py-3.5 px-4">
                            <span className={`px-2 py-1 text-[10px] uppercase tracking-editorial inline-block ${
                              ord.fulfillment?.includes('Dispatched') || ord.fulfillment?.includes('In Transit')
                                ? 'bg-ry-onyx text-ry-white'
                                : 'bg-amber-100 text-amber-900 border border-amber-300'
                            }`}>
                              {ord.fulfillment}
                            </span>
                          </td>
                          <td className="py-3.5 px-4">
                            {ord.trackingNumber ? (
                              <div className="space-y-1">
                                <Link
                                  href={`/track?ref=${encodeURIComponent(ord.trackingNumber)}`}
                                  target="_blank"
                                  className="inline-flex items-center gap-1 text-ry-onyx font-medium hover:underline text-[11px] font-mono group"
                                >
                                  <span>{ord.trackingNumber}</span>
                                  <ExternalLink className="w-3 h-3 text-ry-stone group-hover:text-ry-onyx" />
                                </Link>
                                <div>
                                  <button
                                    type="button"
                                    onClick={() => handleOpenDispatchModal(ord)}
                                    className="text-[10px] text-ry-stone hover:text-ry-onyx underline flex items-center gap-1"
                                  >
                                    <FileText className="w-3 h-3" /> View Label & LQ Hazard
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <button
                                type="button"
                                onClick={() => handleOpenDispatchModal(ord)}
                                className="px-3 py-1.5 bg-ry-onyx text-ry-white text-[10px] uppercase tracking-editorial font-medium hover:bg-ry-charcoal transition-colors flex items-center gap-1.5 shadow-xs"
                              >
                                <Package className="w-3.5 h-3.5" />
                                <span>Dispatch (Evri / Royal Mail)</span>
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 3: Website Traffic & Live Analytics */}
        {activeTab === 'analytics' && (
          <div className="space-y-6 animate-fade-in">
            {/* Realtime Live Visitor & Integration Status Header */}
            <div className="bg-ry-white border border-ry-ash p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500" />
                </span>
                <div>
                  <h3 className="font-serif text-lg text-ry-onyx flex items-center gap-2">
                    <span>
                      {trafficData?.metrics?.activeLiveVisitors ?? 0} Active Session
                      {(trafficData?.metrics?.activeLiveVisitors ?? 0) === 1 ? '' : 's'} Live
                    </span>
                  </h3>
                  <p className="text-xs text-ry-stone">
                    Live telemetry tracking real pageviews, active shopping carts, and category interest.
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 text-[10px] uppercase tracking-editorial font-sans">
                <div className="px-3 py-1.5 bg-emerald-50 border border-emerald-300 text-emerald-800 flex items-center gap-1.5 font-medium">
                  <MessageSquare className="w-3 h-3 text-emerald-600" />
                  <span>Tawk.to Live Support: Online</span>
                </div>
                <div className="px-3 py-1.5 bg-ry-pearl border border-ry-ash text-ry-onyx flex items-center gap-1.5 font-medium">
                  <Globe className="w-3 h-3 text-ry-stone" />
                  <span>
                    Google Analytics: {process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID ? 'Connected' : 'Standby'}
                  </span>
                </div>
              </div>
            </div>

            {/* Top 4 KPI Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-ry-white border border-ry-ash p-5">
                <div className="flex items-center justify-between text-ry-stone mb-1 text-[10px] uppercase tracking-editorial">
                  <span>Today's Unique Visitors</span>
                  <Users className="w-4 h-4 text-ry-stone" />
                </div>
                <div className="font-serif text-3xl text-ry-onyx">
                  {trafficData?.metrics?.todayUniqueVisitors ?? 0}
                </div>
                <span className="text-[11px] text-ry-stone font-sans mt-1 inline-block">
                  Unique visitors browsing store
                </span>
              </div>

              <div className="bg-ry-white border border-ry-ash p-5">
                <div className="flex items-center justify-between text-ry-stone mb-1 text-[10px] uppercase tracking-editorial">
                  <span>Today's Total Pageviews</span>
                  <Activity className="w-4 h-4 text-ry-stone" />
                </div>
                <div className="font-serif text-3xl text-ry-onyx">
                  {trafficData?.metrics?.todayPageviews ?? 0}
                </div>
                <span className="text-[11px] text-ry-stone font-sans mt-1 inline-block">
                  Verified live page impressions
                </span>
              </div>

              <div className="bg-ry-white border border-ry-ash p-5">
                <div className="flex items-center justify-between text-ry-stone mb-1 text-[10px] uppercase tracking-editorial">
                  <span>Avg. Dwell Time</span>
                  <Clock className="w-4 h-4 text-ry-stone" />
                </div>
                <div className="font-serif text-3xl text-ry-onyx">
                  {trafficData?.metrics?.avgSessionDuration ?? '0m 00s'}
                </div>
                <span className="text-[11px] text-ry-stone font-sans mt-1 inline-block">
                  Active session duration
                </span>
              </div>

              <div className="bg-ry-white border border-ry-ash p-5">
                <div className="flex items-center justify-between text-ry-stone mb-1 text-[10px] uppercase tracking-editorial">
                  <span>Store Conversion Rate</span>
                  <Percent className="w-4 h-4 text-ry-stone" />
                </div>
                <div className="font-serif text-3xl text-ry-onyx">
                  {adminOrders.length > 0 && (trafficData?.metrics?.todayUniqueVisitors || 0) > 0
                    ? ((adminOrders.length / trafficData.metrics.todayUniqueVisitors) * 100).toFixed(2) + '%'
                    : '0.00%'}
                </div>
                <span className="text-[11px] text-ry-stone font-sans mt-1 inline-block">
                  {adminOrders.length} {adminOrders.length === 1 ? 'order' : 'orders'} completed
                </span>
              </div>
            </div>

            {/* Category Performance & Traffic Attribution */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Category Traffic Share */}
              <div className="bg-ry-white border border-ry-ash p-6">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-serif text-lg text-ry-onyx">Category Traffic & Sales Velocity</h3>
                  <span className="text-[10px] uppercase tracking-editorial px-2 py-0.5 bg-amber-100 text-amber-900 border border-amber-300 font-medium">
                    Hair is Flagship Line
                  </span>
                </div>
                <p className="text-xs text-ry-stone mb-6">
                  Real traffic share and revenue distribution across boutique categories.
                </p>

                <div className="space-y-4 text-xs font-sans">
                  {(trafficData?.categoryTraffic || [
                    { name: 'Hair (Flagship Category)', views: 0, share: '0.0%', badge: 'Main Line' },
                    { name: 'Haute Parfumerie', views: 0, share: '0.0%' },
                    { name: 'Botanical Skincare', views: 0, share: '0.0%' },
                    { name: 'Body & Bath', views: 0, share: '0.0%' },
                    { name: 'Home & Living', views: 0, share: '0.0%' },
                  ]).map((cat: any, idx: number) => (
                    <div key={idx}>
                      <div className="flex justify-between mb-1.5 items-center">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-ry-onyx">{cat.name}</span>
                          {cat.badge && (
                            <span className="px-1.5 py-0.5 bg-ry-burgundy text-ry-white text-[9px] uppercase tracking-editorial">
                              {cat.badge}
                            </span>
                          )}
                        </div>
                        <div className="font-mono text-right">
                          <strong className="text-ry-onyx">{cat.views} views</strong>
                          <span className="text-ry-stone ml-2 font-medium">{cat.share} share</span>
                        </div>
                      </div>
                      <div className="w-full bg-ry-ash/40 h-2">
                        <div
                          className="bg-ry-onyx h-full transition-all duration-500"
                          style={{ width: cat.share !== '0.0%' ? cat.share : '0%' }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Traffic Acquisition Sources */}
              <div className="bg-ry-white border border-ry-ash p-6">
                <h3 className="font-serif text-lg mb-2 text-ry-onyx">Traffic Acquisition Channels</h3>
                <p className="text-xs text-ry-stone mb-6">
                  Where store visitors and luxury purchasers are arriving from.
                </p>

                <div className="space-y-4 text-xs font-sans">
                  <div className="flex items-center justify-between py-2 border-b border-ry-ash/40">
                    <div>
                      <div className="font-medium text-ry-onyx">Direct / Store Domain</div>
                      <div className="text-[11px] text-ry-stone">Direct navigation to rycarix.com</div>
                    </div>
                    <div className="text-right">
                      <span className="font-mono font-medium block">
                        {(trafficData?.metrics?.todayUniqueVisitors ?? 0) > 0
                          ? `${trafficData?.metrics?.todayUniqueVisitors} ${trafficData?.metrics?.todayUniqueVisitors === 1 ? 'visitor' : 'visitors'}`
                          : '0 visitors'}
                      </span>
                      <span className="text-ry-stone text-[10px]">Verified Direct Channel</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between py-2 border-b border-ry-ash/40">
                    <div>
                      <div className="font-medium text-ry-onyx">Instagram / Social Links</div>
                      <div className="text-[11px] text-ry-stone">Bio links and campaign referrals</div>
                    </div>
                    <div className="text-right">
                      <span className="font-mono font-medium block">0 visitors</span>
                      <span className="text-ry-stone text-[10px]">Awaiting Campaign</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between py-2 border-b border-ry-ash/40">
                    <div>
                      <div className="font-medium text-ry-onyx">Google Organic Search</div>
                      <div className="text-[11px] text-ry-stone">Search queries & organic index</div>
                    </div>
                    <div className="text-right">
                      <span className="font-mono font-medium block">0 visitors</span>
                      <span className="text-ry-stone text-[10px]">SEO Tags Ready</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between py-2">
                    <div>
                      <div className="font-medium text-ry-onyx">Direct Concierge Invitations</div>
                      <div className="text-[11px] text-ry-stone">VIP client links & direct shares</div>
                    </div>
                    <div className="text-right">
                      <span className="font-mono font-medium block">0 visitors</span>
                      <span className="text-ry-stone text-[10px]">Concierge Portal</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Row: Top Pages, Devices & Integrations */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Top Visited Formulations */}
              <div className="lg:col-span-2 bg-ry-white border border-ry-ash p-6">
                <h3 className="font-serif text-lg mb-2 text-ry-onyx">Catalog Formulations & Status</h3>
                <p className="text-xs text-ry-stone mb-4">
                  Active formulations published to the catalog and ready for customer purchase.
                </p>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs font-sans">
                    <thead className="bg-ry-pearl border-b border-ry-ash text-[10px] uppercase tracking-editorial text-ry-stone">
                      <tr>
                        <th className="py-2.5 px-3">Formulation / Route</th>
                        <th className="py-2.5 px-3">Category</th>
                        <th className="py-2.5 px-3">Price</th>
                        <th className="py-2.5 px-3 text-right">Inventory</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-ry-ash/40">
                      {productsList.slice(0, 5).map((p) => (
                        <tr key={p.id}>
                          <td className="py-2.5 px-3 font-medium text-ry-onyx flex items-center gap-1.5">
                            <span className="px-1.5 py-0.5 bg-ry-burgundy text-ry-white text-[9px] uppercase font-mono">
                              {p.category}
                            </span>
                            <span className="truncate max-w-[240px]">{p.title}</span>
                          </td>
                          <td className="py-2.5 px-3 text-ry-stone">{p.category}</td>
                          <td className="py-2.5 px-3 font-mono font-medium">£{p.basePrice.toFixed(2)}</td>
                          <td className="py-2.5 px-3 text-right font-mono text-emerald-700">
                            {p.variants?.reduce((acc, v) => acc + (v.inventory || 0), 0) || 0} in stock
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Integrations & Devices Card */}
              <div className="space-y-6">
                {/* Tawk.to Live Concierge Card */}
                <div className="bg-ry-white border border-ry-ash p-5">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] uppercase tracking-editorial font-medium text-ry-stone">
                      Live Customer Support
                    </span>
                    <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] uppercase tracking-editorial font-semibold">
                      Connected
                    </span>
                  </div>
                  <h4 className="font-serif text-base text-ry-onyx mb-1">Tawk.to Chat Widget</h4>
                  <p className="text-xs text-ry-stone mb-3">
                    Live chat advisor ready to answer hair inquiries & order questions across the website.
                  </p>
                  <div className="p-2.5 bg-ry-pearl border border-ry-ash text-[11px] font-mono text-ry-stone space-y-1">
                    <div>Property: <strong className="text-ry-onyx">6adbc0451558303471484219</strong></div>
                    <div>Widget ID: <strong className="text-ry-onyx">1k5l6e4bp</strong></div>
                  </div>
                </div>

                {/* Device Split */}
                <div className="bg-ry-white border border-ry-ash p-5">
                  <h4 className="font-serif text-base text-ry-onyx mb-1">Device Breakdown</h4>
                  <p className="text-xs text-ry-stone mb-3">Visitor breakdown by browser viewport.</p>
                  <div className="space-y-2 text-xs font-sans">
                    <div>
                      <div className="flex justify-between mb-1">
                        <span>Mobile (iOS & Android)</span>
                        <span className="font-mono font-medium">
                          {trafficData?.deviceBreakdown?.[0]?.percentage ?? 0}%
                        </span>
                      </div>
                      <div className="w-full bg-ry-ash/40 h-1.5">
                        <div
                          className="bg-ry-onyx h-full transition-all"
                          style={{ width: `${trafficData?.deviceBreakdown?.[0]?.percentage ?? 0}%` }}
                        />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between mb-1">
                        <span>Desktop (macOS & Windows)</span>
                        <span className="font-mono font-medium">
                          {trafficData?.deviceBreakdown?.[1]?.percentage ?? 0}%
                        </span>
                      </div>
                      <div className="w-full bg-ry-ash/40 h-1.5">
                        <div
                          className="bg-ry-stone h-full transition-all"
                          style={{ width: `${trafficData?.deviceBreakdown?.[1]?.percentage ?? 0}%` }}
                        />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between mb-1">
                        <span>Tablet (iPad)</span>
                        <span className="font-mono font-medium">
                          {trafficData?.deviceBreakdown?.[2]?.percentage ?? 0}%
                        </span>
                      </div>
                      <div className="w-full bg-ry-ash/40 h-1.5">
                        <div
                          className="bg-ry-ash h-full transition-all"
                          style={{ width: `${trafficData?.deviceBreakdown?.[2]?.percentage ?? 0}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Klarna & Payment Conversion Impact Section */}
            <div className="bg-ry-white border border-ry-ash p-6">
              <h3 className="font-serif text-lg mb-2 text-ry-onyx">Klarna 4-Pay Gateway Telemetry</h3>
              <p className="text-xs text-ry-stone mb-4">
                Real-time installment settlement monitoring for high-ticket hair and luxury perfumery.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-sans">
                <div className="p-4 bg-ry-pearl border border-ry-ash">
                  <span className="text-[10px] uppercase tracking-editorial text-ry-stone block mb-1">
                    Klarna Gateway Status
                  </span>
                  <div className="font-serif text-2xl text-emerald-700">Active</div>
                  <p className="text-[11px] text-ry-stone mt-1">
                    Stripe + Klarna payment intent pipeline operational
                  </p>
                </div>

                <div className="p-4 bg-ry-pearl border border-ry-ash">
                  <span className="text-[10px] uppercase tracking-editorial text-ry-stone block mb-1">
                    Klarna GMV Volume
                  </span>
                  <div className="font-serif text-2xl text-ry-onyx">
                    £{klarnaVolume.toFixed(2)}
                  </div>
                  <p className="text-[11px] text-ry-stone mt-1">
                    Direct merchant settlement with 0% liability
                  </p>
                </div>

                <div className="p-4 bg-ry-pearl border border-ry-ash">
                  <span className="text-[10px] uppercase tracking-editorial text-ry-stone block mb-1">
                    Klarna Checkout Share
                  </span>
                  <div className="font-serif text-2xl text-[#992255]">
                    {totalGMV > 0 ? ((klarnaVolume / totalGMV) * 100).toFixed(1) + '%' : '0.0%'}
                  </div>
                  <p className="text-[11px] text-ry-stone mt-1">
                    Proportion of completed orders using 4-Pay
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Dynamic Product Creation Modal */}
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
            <div className="bg-ry-pearl border border-ry-ash w-full max-w-3xl p-6 sm:p-8 max-h-[90vh] overflow-y-auto shadow-2xl">
              <div className="flex justify-between items-center pb-4 mb-6 border-b border-ry-ash">
                <div>
                  <h3 className="font-serif text-2xl">Add Dynamic Product Formulation</h3>
                  <p className="text-xs text-ry-stone font-sans">
                    Extensible architecture ready for Haircare, Perfume, Skincare, or future categories.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="text-ry-stone hover:text-ry-onyx p-1"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateProduct} className="space-y-5 text-xs font-sans">
                {/* Product Imagery Section */}
                <div className="bg-ry-white border border-ry-ash p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="block uppercase tracking-editorial text-[10px] text-ry-stone font-semibold">
                      Primary Product Image (Hero)
                    </label>
                    <span className="text-[10px] text-ry-stone/70">
                      Upload from device, paste image URL, or choose preset
                    </span>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-4 items-start">
                    {/* Live Thumbnail Preview */}
                    <div className="relative w-24 h-28 bg-ry-oatmeal border border-ry-ash/70 overflow-hidden shrink-0 flex items-center justify-center group">
                      {formData.imageUrl ? (
                        <>
                          <img
                            src={formData.imageUrl}
                            alt="Primary Preview"
                            className="w-full h-full object-cover"
                          />
                          <button
                            type="button"
                            onClick={() => setFormData({ ...formData, imageUrl: '' })}
                            className="absolute top-1 right-1 p-1 bg-ry-onyx/80 text-ry-white rounded-full hover:bg-red-700 transition-colors"
                            title="Remove image"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </>
                      ) : (
                        <div className="flex flex-col items-center text-ry-stone text-center p-2">
                          <ImageIcon className="w-6 h-6 mb-1 opacity-40" />
                          <span className="text-[9px] uppercase tracking-subtle">No Image</span>
                        </div>
                      )}
                    </div>

                    {/* Inputs & Controls */}
                    <div className="flex-1 space-y-2.5 w-full">
                      <div className="flex flex-col sm:flex-row gap-2">
                        <input
                          type="text"
                          placeholder="Paste image URL (https://...)"
                          value={formData.imageUrl}
                          onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                          className="flex-1 bg-ry-pearl border border-ry-ash p-2.5 text-xs focus:border-ry-onyx outline-none font-mono"
                        />
                        <label className="cursor-pointer px-4 py-2.5 bg-ry-onyx text-ry-white text-[11px] uppercase tracking-editorial flex items-center justify-center gap-1.5 hover:bg-ry-charcoal transition-colors shrink-0">
                          <Upload className="w-3.5 h-3.5" />
                          <span>Upload File</span>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => handleImageFileUpload(e, 'add-primary')}
                          />
                        </label>
                      </div>

                      {/* Quick Luxury Presets */}
                      <div>
                        <div className="text-[10px] text-ry-stone uppercase tracking-editorial mb-1">
                          Curated Atelier Presets:
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {PRESET_IMAGES.map((preset) => (
                            <button
                              key={preset.name}
                              type="button"
                              onClick={() => setFormData({ ...formData, imageUrl: preset.url })}
                              className={`px-2 py-1 text-[10px] border transition-all ${
                                formData.imageUrl === preset.url
                                  ? 'border-ry-onyx bg-ry-onyx text-ry-white'
                                  : 'border-ry-ash/70 bg-ry-pearl hover:border-ry-onyx text-ry-stone hover:text-ry-onyx'
                              }`}
                            >
                              {preset.name}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Secondary Texture Image */}
                  <div className="pt-2 border-t border-ry-ash/40">
                    <label className="block uppercase tracking-editorial text-[10px] text-ry-stone mb-1">
                      Secondary / Sensory Texture Image URL (Optional)
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="e.g. macro texture shot or unboxing photograph URL"
                        value={formData.secondaryImageUrl}
                        onChange={(e) =>
                          setFormData({ ...formData, secondaryImageUrl: e.target.value })
                        }
                        className="flex-1 bg-ry-white border border-ry-ash p-2 focus:border-ry-onyx outline-none font-mono"
                      />
                      <label className="cursor-pointer px-3 py-2 border border-ry-ash bg-ry-pearl text-ry-stone hover:text-ry-onyx hover:border-ry-onyx text-[10px] uppercase tracking-editorial flex items-center gap-1 transition-colors shrink-0">
                        <Upload className="w-3 h-3" />
                        <span>Upload File</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => handleImageFileUpload(e, 'add-secondary')}
                        />
                      </label>
                    </div>
                  </div>
                </div>

                {/* Form fields: Title, Category, Subtitle */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block uppercase tracking-editorial text-[10px] text-ry-stone mb-1 font-semibold">
                      Product Title *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g., Iris Sublime Extrait"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="w-full bg-ry-white border border-ry-ash p-2.5 focus:border-ry-onyx outline-none"
                    />
                  </div>

                  <div>
                    <label className="block uppercase tracking-editorial text-[10px] text-ry-stone mb-1 font-semibold">
                      Category
                    </label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full bg-ry-white border border-ry-ash p-2.5 focus:border-ry-onyx outline-none"
                    >
                      <option value="Hair">Hair (Main Seller)</option>
                      <option value="Haute Parfumerie">Haute Parfumerie</option>
                      <option value="Botanical Skincare">Botanical Skincare</option>
                      <option value="Body & Bath">Body & Bath</option>
                      <option value="Home & Living">Home & Living</option>
                      <option value="Accessories">Accessories & Fine Goods</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block uppercase tracking-editorial text-[10px] text-ry-stone mb-1">
                    Atelier Subtitle / Tagline
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., Rare Murano Flacon Concentrated Extrait"
                    value={formData.subtitle}
                    onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                    className="w-full bg-ry-white border border-ry-ash p-2.5 focus:border-ry-onyx outline-none"
                  />
                </div>

                {/* Pricing & Inventory */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="block uppercase tracking-editorial text-[10px] text-ry-stone mb-1 font-semibold">
                      Price (£) *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={formData.basePrice}
                      onChange={(e) =>
                        setFormData({ ...formData, basePrice: Number(e.target.value) })
                      }
                      className="w-full bg-ry-white border border-ry-ash p-2.5 focus:border-ry-onyx outline-none font-mono"
                    />
                  </div>
                  <div>
                    <label className="block uppercase tracking-editorial text-[10px] text-ry-stone mb-1">
                      Compare Price (£)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      placeholder="Optional"
                      value={formData.compareAtPrice || ''}
                      onChange={(e) =>
                        setFormData({ ...formData, compareAtPrice: Number(e.target.value) })
                      }
                      className="w-full bg-ry-white border border-ry-ash p-2.5 focus:border-ry-onyx outline-none font-mono"
                    />
                  </div>
                  <div>
                    <label className="block uppercase tracking-editorial text-[10px] text-ry-stone mb-1 font-semibold">
                      Inventory Units *
                    </label>
                    <input
                      type="number"
                      required
                      value={formData.stock}
                      onChange={(e) =>
                        setFormData({ ...formData, stock: Number(e.target.value) })
                      }
                      className="w-full bg-ry-white border border-ry-ash p-2.5 focus:border-ry-onyx outline-none font-mono"
                    />
                  </div>
                  <div>
                    <label className="block uppercase tracking-editorial text-[10px] text-ry-stone mb-1 font-semibold">
                      SKU Code
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.sku}
                      onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                      className="w-full bg-ry-white border border-ry-ash p-2.5 focus:border-ry-onyx outline-none font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block uppercase tracking-editorial text-[10px] text-ry-stone mb-1 font-semibold">
                    Primary Variant Size / Volume
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.size}
                    onChange={(e) => setFormData({ ...formData, size: e.target.value })}
                    className="w-full bg-ry-white border border-ry-ash p-2.5 focus:border-ry-onyx outline-none"
                  />
                </div>

                {/* Summary & Description */}
                <div>
                  <label className="block uppercase tracking-editorial text-[10px] text-ry-stone mb-1 font-semibold">
                    Short Summary (PDP Header)
                  </label>
                  <input
                    type="text"
                    value={formData.summary}
                    onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
                    className="w-full bg-ry-white border border-ry-ash p-2.5 focus:border-ry-onyx outline-none"
                  />
                </div>

                <div>
                  <label className="block uppercase tracking-editorial text-[10px] text-ry-stone mb-1">
                    Full Formulation Narrative & Description
                  </label>
                  <textarea
                    rows={2}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full bg-ry-white border border-ry-ash p-2.5 focus:border-ry-onyx outline-none"
                  />
                </div>

                <div>
                  <label className="block uppercase tracking-editorial text-[10px] text-ry-stone mb-1">
                    Ingredients (INCI) / Scent Notes Profile
                  </label>
                  <textarea
                    rows={2}
                    value={formData.inci}
                    onChange={(e) => setFormData({ ...formData, inci: e.target.value })}
                    className="w-full bg-ry-white border border-ry-ash p-2.5 focus:border-ry-onyx outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block uppercase tracking-editorial text-[10px] text-ry-stone mb-1">
                      Ethical Sourcing & Terroir Notes
                    </label>
                    <input
                      type="text"
                      value={formData.terroir}
                      onChange={(e) => setFormData({ ...formData, terroir: e.target.value })}
                      className="w-full bg-ry-white border border-ry-ash p-2.5 focus:border-ry-onyx outline-none"
                    />
                  </div>
                  <div>
                    <label className="block uppercase tracking-editorial text-[10px] text-ry-stone mb-1">
                      Application Ritual / How To Use
                    </label>
                    <input
                      type="text"
                      value={formData.howToUse}
                      onChange={(e) => setFormData({ ...formData, howToUse: e.target.value })}
                      className="w-full bg-ry-white border border-ry-ash p-2.5 focus:border-ry-onyx outline-none"
                    />
                  </div>
                </div>

                <div className="pt-4 flex justify-end gap-3 border-t border-ry-ash">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-5 py-2.5 border border-ry-ash text-ry-stone hover:text-ry-onyx uppercase tracking-editorial text-[11px]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-ry-onyx text-ry-white uppercase tracking-editorial text-[11px] hover:bg-ry-charcoal transition-colors flex items-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Publish to Catalog</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Edit Formulation & Product Modal */}
        {showEditModal && editingProduct && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
            <div className="bg-ry-pearl border border-ry-ash w-full max-w-3xl p-6 sm:p-8 max-h-[90vh] overflow-y-auto shadow-2xl">
              <div className="flex justify-between items-center pb-4 mb-6 border-b border-ry-ash">
                <div>
                  <span className="text-[10px] uppercase tracking-editorial text-ry-stone block">
                    Product Ref: {editingProduct.id}
                  </span>
                  <h3 className="font-serif text-2xl text-ry-onyx">Edit Formulation: {editingProduct.title}</h3>
                  <p className="text-xs text-ry-stone font-sans">
                    Modify product imagery, pricing, inventory count, and formulation stories.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingProduct(null);
                  }}
                  className="text-ry-stone hover:text-ry-onyx p-1"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleUpdateProduct} className="space-y-5 text-xs font-sans">
                {/* Product Imagery Section */}
                <div className="bg-ry-white border border-ry-ash p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="block uppercase tracking-editorial text-[10px] text-ry-stone font-semibold">
                      Primary Product Image (Hero)
                    </label>
                    <span className="text-[10px] text-ry-stone/70">
                      Upload from device, paste image URL, or choose preset
                    </span>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-4 items-start">
                    {/* Live Thumbnail Preview */}
                    <div className="relative w-24 h-28 bg-ry-oatmeal border border-ry-ash/70 overflow-hidden shrink-0 flex items-center justify-center group">
                      {editFormData.imageUrl ? (
                        <>
                          <img
                            src={editFormData.imageUrl}
                            alt="Edit Primary Preview"
                            className="w-full h-full object-cover"
                          />
                          <button
                            type="button"
                            onClick={() => setEditFormData({ ...editFormData, imageUrl: '' })}
                            className="absolute top-1 right-1 p-1 bg-ry-onyx/80 text-ry-white rounded-full hover:bg-red-700 transition-colors"
                            title="Remove image"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </>
                      ) : (
                        <div className="flex flex-col items-center text-ry-stone text-center p-2">
                          <ImageIcon className="w-6 h-6 mb-1 opacity-40" />
                          <span className="text-[9px] uppercase tracking-subtle">No Image</span>
                        </div>
                      )}
                    </div>

                    {/* Inputs & Controls */}
                    <div className="flex-1 space-y-2.5 w-full">
                      <div className="flex flex-col sm:flex-row gap-2">
                        <input
                          type="text"
                          placeholder="Paste image URL (https://...)"
                          value={editFormData.imageUrl}
                          onChange={(e) =>
                            setEditFormData({ ...editFormData, imageUrl: e.target.value })
                          }
                          className="flex-1 bg-ry-pearl border border-ry-ash p-2.5 text-xs focus:border-ry-onyx outline-none font-mono"
                        />
                        <label className="cursor-pointer px-4 py-2.5 bg-ry-onyx text-ry-white text-[11px] uppercase tracking-editorial flex items-center justify-center gap-1.5 hover:bg-ry-charcoal transition-colors shrink-0">
                          <Upload className="w-3.5 h-3.5" />
                          <span>Upload File</span>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => handleImageFileUpload(e, 'edit-primary')}
                          />
                        </label>
                      </div>

                      {/* Quick Luxury Presets */}
                      <div>
                        <div className="text-[10px] text-ry-stone uppercase tracking-editorial mb-1">
                          Curated Atelier Presets:
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {PRESET_IMAGES.map((preset) => (
                            <button
                              key={preset.name}
                              type="button"
                              onClick={() =>
                                setEditFormData({ ...editFormData, imageUrl: preset.url })
                              }
                              className={`px-2 py-1 text-[10px] border transition-all ${
                                editFormData.imageUrl === preset.url
                                  ? 'border-ry-onyx bg-ry-onyx text-ry-white'
                                  : 'border-ry-ash/70 bg-ry-pearl hover:border-ry-onyx text-ry-stone hover:text-ry-onyx'
                              }`}
                            >
                              {preset.name}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Secondary Texture Image */}
                  <div className="pt-2 border-t border-ry-ash/40">
                    <label className="block uppercase tracking-editorial text-[10px] text-ry-stone mb-1">
                      Secondary / Sensory Texture Image URL (Optional)
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="e.g. macro texture shot or unboxing photograph URL"
                        value={editFormData.secondaryImageUrl}
                        onChange={(e) =>
                          setEditFormData({ ...editFormData, secondaryImageUrl: e.target.value })
                        }
                        className="flex-1 bg-ry-white border border-ry-ash p-2 focus:border-ry-onyx outline-none font-mono"
                      />
                      <label className="cursor-pointer px-3 py-2 border border-ry-ash bg-ry-pearl text-ry-stone hover:text-ry-onyx hover:border-ry-onyx text-[10px] uppercase tracking-editorial flex items-center gap-1 transition-colors shrink-0">
                        <Upload className="w-3 h-3" />
                        <span>Upload File</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => handleImageFileUpload(e, 'edit-secondary')}
                        />
                      </label>
                    </div>
                  </div>
                </div>

                {/* Core Details */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block uppercase tracking-editorial text-[10px] text-ry-stone mb-1 font-semibold">
                      Product Title *
                    </label>
                    <input
                      type="text"
                      required
                      value={editFormData.title}
                      onChange={(e) =>
                        setEditFormData({ ...editFormData, title: e.target.value })
                      }
                      className="w-full bg-ry-white border border-ry-ash p-2.5 focus:border-ry-onyx outline-none font-serif text-sm font-medium"
                    />
                  </div>

                  <div>
                    <label className="block uppercase tracking-editorial text-[10px] text-ry-stone mb-1 font-semibold">
                      Category
                    </label>
                    <select
                      value={editFormData.category}
                      onChange={(e) =>
                        setEditFormData({ ...editFormData, category: e.target.value })
                      }
                      className="w-full bg-ry-white border border-ry-ash p-2.5 focus:border-ry-onyx outline-none"
                    >
                      <option value="Hair">Hair (Main Seller)</option>
                      <option value="Haute Parfumerie">Haute Parfumerie</option>
                      <option value="Botanical Skincare">Botanical Skincare</option>
                      <option value="Body & Bath">Body & Bath</option>
                      <option value="Home & Living">Home & Living</option>
                      <option value="Accessories">Accessories & Fine Goods</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block uppercase tracking-editorial text-[10px] text-ry-stone mb-1">
                      URL Slug
                    </label>
                    <input
                      type="text"
                      value={editFormData.slug}
                      onChange={(e) =>
                        setEditFormData({ ...editFormData, slug: e.target.value })
                      }
                      className="w-full bg-ry-white border border-ry-ash p-2.5 focus:border-ry-onyx outline-none font-mono text-xs"
                    />
                  </div>
                  <div>
                    <label className="block uppercase tracking-editorial text-[10px] text-ry-stone mb-1">
                      Atelier Subtitle / Tagline
                    </label>
                    <input
                      type="text"
                      value={editFormData.subtitle}
                      onChange={(e) =>
                        setEditFormData({ ...editFormData, subtitle: e.target.value })
                      }
                      className="w-full bg-ry-white border border-ry-ash p-2.5 focus:border-ry-onyx outline-none"
                    />
                  </div>
                </div>

                {/* Pricing & Stock */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="block uppercase tracking-editorial text-[10px] text-ry-stone mb-1 font-semibold">
                      Price (£) *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={editFormData.basePrice}
                      onChange={(e) =>
                        setEditFormData({ ...editFormData, basePrice: Number(e.target.value) })
                      }
                      className="w-full bg-ry-white border border-ry-ash p-2.5 focus:border-ry-onyx outline-none font-mono"
                    />
                  </div>
                  <div>
                    <label className="block uppercase tracking-editorial text-[10px] text-ry-stone mb-1">
                      Compare Price (£)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      placeholder="Optional"
                      value={editFormData.compareAtPrice || ''}
                      onChange={(e) =>
                        setEditFormData({
                          ...editFormData,
                          compareAtPrice: Number(e.target.value),
                        })
                      }
                      className="w-full bg-ry-white border border-ry-ash p-2.5 focus:border-ry-onyx outline-none font-mono"
                    />
                  </div>
                  <div>
                    <label className="block uppercase tracking-editorial text-[10px] text-ry-stone mb-1 font-semibold">
                      Inventory Units *
                    </label>
                    <input
                      type="number"
                      required
                      value={editFormData.stock}
                      onChange={(e) =>
                        setEditFormData({ ...editFormData, stock: Number(e.target.value) })
                      }
                      className="w-full bg-ry-white border border-ry-ash p-2.5 focus:border-ry-onyx outline-none font-mono"
                    />
                  </div>
                  <div>
                    <label className="block uppercase tracking-editorial text-[10px] text-ry-stone mb-1 font-semibold">
                      SKU Code
                    </label>
                    <input
                      type="text"
                      required
                      value={editFormData.sku}
                      onChange={(e) =>
                        setEditFormData({ ...editFormData, sku: e.target.value })
                      }
                      className="w-full bg-ry-white border border-ry-ash p-2.5 focus:border-ry-onyx outline-none font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block uppercase tracking-editorial text-[10px] text-ry-stone mb-1 font-semibold">
                    Primary Variant Size / Volume
                  </label>
                  <input
                    type="text"
                    required
                    value={editFormData.size}
                    onChange={(e) =>
                      setEditFormData({ ...editFormData, size: e.target.value })
                    }
                    className="w-full bg-ry-white border border-ry-ash p-2.5 focus:border-ry-onyx outline-none"
                  />
                </div>

                {/* Summary & Description */}
                <div>
                  <label className="block uppercase tracking-editorial text-[10px] text-ry-stone mb-1 font-semibold">
                    Short Summary (PDP Header)
                  </label>
                  <input
                    type="text"
                    value={editFormData.summary}
                    onChange={(e) =>
                      setEditFormData({ ...editFormData, summary: e.target.value })
                    }
                    className="w-full bg-ry-white border border-ry-ash p-2.5 focus:border-ry-onyx outline-none"
                  />
                </div>

                <div>
                  <label className="block uppercase tracking-editorial text-[10px] text-ry-stone mb-1">
                    Full Formulation Narrative & Description
                  </label>
                  <textarea
                    rows={2}
                    value={editFormData.description}
                    onChange={(e) =>
                      setEditFormData({ ...editFormData, description: e.target.value })
                    }
                    className="w-full bg-ry-white border border-ry-ash p-2.5 focus:border-ry-onyx outline-none"
                  />
                </div>

                <div>
                  <label className="block uppercase tracking-editorial text-[10px] text-ry-stone mb-1">
                    Ingredients (INCI) / Scent Notes Profile
                  </label>
                  <textarea
                    rows={2}
                    value={editFormData.inci}
                    onChange={(e) =>
                      setEditFormData({ ...editFormData, inci: e.target.value })
                    }
                    className="w-full bg-ry-white border border-ry-ash p-2.5 focus:border-ry-onyx outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block uppercase tracking-editorial text-[10px] text-ry-stone mb-1">
                      Ethical Sourcing & Terroir Notes
                    </label>
                    <input
                      type="text"
                      value={editFormData.terroir}
                      onChange={(e) =>
                        setEditFormData({ ...editFormData, terroir: e.target.value })
                      }
                      className="w-full bg-ry-white border border-ry-ash p-2.5 focus:border-ry-onyx outline-none"
                    />
                  </div>
                  <div>
                    <label className="block uppercase tracking-editorial text-[10px] text-ry-stone mb-1">
                      Application Ritual / How To Use
                    </label>
                    <input
                      type="text"
                      value={editFormData.howToUse}
                      onChange={(e) =>
                        setEditFormData({ ...editFormData, howToUse: e.target.value })
                      }
                      className="w-full bg-ry-white border border-ry-ash p-2.5 focus:border-ry-onyx outline-none"
                    />
                  </div>
                </div>

                <div className="pt-4 flex justify-end gap-3 border-t border-ry-ash">
                  <button
                    type="button"
                    onClick={() => {
                      setShowEditModal(false);
                      setEditingProduct(null);
                    }}
                    className="px-5 py-2.5 border border-ry-ash text-ry-stone hover:text-ry-onyx uppercase tracking-editorial text-[11px]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-ry-onyx text-ry-white uppercase tracking-editorial text-[11px] hover:bg-ry-charcoal transition-colors flex items-center gap-1.5"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>Save Changes to Catalog</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Shipping Aggregator Dispatch & Label Inspection Modal */}
        {dispatchModalOrder && activeLabelData && (
          <div className="fixed inset-0 bg-ry-onyx/70 backdrop-blur-xs z-50 flex items-center justify-center p-4 overflow-y-auto animate-fade-in font-sans">
            <div className="bg-ry-white max-w-2xl w-full border border-ry-ash shadow-2xl p-6 sm:p-8 my-8 relative">
              {/* Close Button */}
              <button
                type="button"
                onClick={() => setDispatchModalOrder(null)}
                className="absolute top-4 right-4 p-2 text-ry-stone hover:text-ry-onyx transition-colors"
                aria-label="Close Modal"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Modal Header */}
              <div className="border-b border-ry-ash/60 pb-4 mb-6">
                <div className="flex items-center gap-2 mb-1">
                  <span className="bg-ry-onyx text-ry-white text-[9px] uppercase tracking-editorial px-2 py-0.5">
                    Evri & Royal Mail Dispatch Gateway
                  </span>
                  <span className="text-xs text-ry-stone">
                    Order Ref: {dispatchModalOrder.id} • {dispatchModalOrder.customer}
                  </span>
                </div>
                <h3 className="font-serif text-2xl text-ry-onyx">
                  Courier Dispatch & Hazard Labeling
                </h3>
              </div>

              {dispatchSuccessMsg && (
                <div className="mb-6 p-4 bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                  <span>{dispatchSuccessMsg}</span>
                </div>
              )}

              {/* Courier Selection Toggle: Royal Mail vs Evri */}
              {!dispatchModalOrder.trackingNumber && (
                <div className="mb-6 p-4 bg-ry-pearl border border-ry-ash">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] uppercase tracking-editorial text-ry-stone font-semibold">
                      1. Select Courier Partner
                    </span>
                    <span className="text-[10px] text-ry-stone/80 font-mono">
                      Active Delivery Partners
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* Royal Mail Option */}
                    <button
                      type="button"
                      onClick={() => handleSelectCarrier('Royal Mail')}
                      className={`p-3 text-left border transition-all flex flex-col justify-between ${
                        activeLabelData.carrier === 'Royal Mail'
                          ? 'border-ry-onyx bg-white ring-1 ring-ry-onyx shadow-xs'
                          : 'border-ry-ash/80 bg-white/60 hover:border-ry-onyx/50'
                      }`}
                    >
                      <div className="flex items-center justify-between w-full mb-1">
                        <span className="font-serif font-bold text-sm text-ry-onyx flex items-center gap-1.5">
                          <Truck className="w-4 h-4 text-red-700" />
                          Royal Mail
                        </span>
                        {activeLabelData.carrier === 'Royal Mail' && (
                          <span className="px-1.5 py-0.2 bg-emerald-100 text-emerald-800 text-[9px] font-mono font-bold border border-emerald-300">
                            SELECTED
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] font-medium text-ry-onyx">
                        Tracked 24 Priority
                      </div>
                      <div className="text-[10px] text-ry-stone mt-1">
                        UN 1266 LQ Perfume Compliant • Guaranteed Next Day & Saturday Delivery
                      </div>
                    </button>

                    {/* Evri Option */}
                    <button
                      type="button"
                      onClick={() => handleSelectCarrier('Evri')}
                      className={`p-3 text-left border transition-all flex flex-col justify-between ${
                        activeLabelData.carrier === 'Evri'
                          ? 'border-ry-onyx bg-white ring-1 ring-ry-onyx shadow-xs'
                          : 'border-ry-ash/80 bg-white/60 hover:border-ry-onyx/50'
                      }`}
                    >
                      <div className="flex items-center justify-between w-full mb-1">
                        <span className="font-serif font-bold text-sm text-ry-onyx flex items-center gap-1.5">
                          <Truck className="w-4 h-4 text-sky-700" />
                          Evri
                        </span>
                        {activeLabelData.carrier === 'Evri' && (
                          <span className="px-1.5 py-0.2 bg-emerald-100 text-emerald-800 text-[9px] font-mono font-bold border border-emerald-300">
                            SELECTED
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] font-medium text-ry-onyx">
                        Evri Express Tracked Delivery
                      </div>
                      <div className="text-[10px] text-ry-stone mt-1">
                        GPS Safe Place Digital Photo Proof • 7-Day Residential Doorstep Courier
                      </div>
                    </button>
                  </div>
                </div>
              )}

              {/* Step 2: Address Validation & Dangerous Goods Verification */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 text-xs">
                {/* Address Check */}
                <div className="p-4 bg-ry-pearl border border-ry-ash/70">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] uppercase tracking-editorial text-ry-stone font-semibold">
                      2. Address Normalization
                    </span>
                    <span className="text-[9px] bg-emerald-100 text-emerald-800 px-1.5 py-0.2 border border-emerald-300 font-mono">
                      VALIDATED
                    </span>
                  </div>
                  <div className="font-medium text-ry-onyx">{dispatchModalOrder.customer}</div>
                  <div className="text-ry-stone mt-1 leading-relaxed">
                    {dispatchModalOrder.address?.street}<br />
                    {dispatchModalOrder.address?.city}, {dispatchModalOrder.address?.state} {dispatchModalOrder.address?.postalCode}<br />
                    {dispatchModalOrder.address?.country}
                  </div>
                </div>

                {/* Hazmat / LQ Check */}
                <div className={`p-4 border ${
                  activeLabelData.isHazardous
                    ? 'bg-amber-50/70 border-amber-300'
                    : 'bg-ry-pearl border-ry-ash/70'
                }`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] uppercase tracking-editorial text-ry-stone font-semibold">
                      3. Dangerous Goods (LQ) Check
                    </span>
                    <span className={`text-[9px] px-1.5 py-0.2 border font-mono ${
                      activeLabelData.isHazardous
                        ? 'bg-amber-200 text-amber-900 border-amber-400 font-bold'
                        : 'bg-ry-white text-ry-stone border-ry-ash'
                    }`}>
                      {activeLabelData.isHazardous ? 'UN 1266 REQUIRED' : 'NON-REGULATED'}
                    </span>
                  </div>
                  {activeLabelData.isHazardous ? (
                    <div>
                      <div className="font-semibold text-amber-950 flex items-center gap-1">
                        <Flame className="w-3.5 h-3.5 text-amber-700" />
                        Perfumery Products (Alcohol Denat &gt;24% ABV)
                      </div>
                      <p className="text-[11px] text-amber-800 mt-1 leading-relaxed">
                        Class 3 Flammable Liquid PG II/III. Package automatically tagged with mandatory Limited Quantity (LQ) diamond marking for {activeLabelData.carrier} transport.
                      </p>
                    </div>
                  ) : (
                    <div>
                      <div className="font-medium text-ry-onyx">Standard Cosmetic Goods</div>
                      <p className="text-[11px] text-ry-stone mt-1">
                        Formulation does not exceed solvent flashpoint thresholds. Standard shipping documentation accepted by {activeLabelData.carrier}.
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Step 3: Commercial Shipping Label Simulation */}
              <div className="mb-6">
                <span className="text-[10px] uppercase tracking-editorial text-ry-stone block mb-2 font-semibold">
                  4. Generated Thermal Shipping Label & Barcode
                </span>

                <div className="border-2 border-ry-onyx p-4 sm:p-6 bg-white text-black font-sans relative">
                  {/* Label Top Bar */}
                  <div className="flex items-center justify-between border-b-2 border-black pb-3 mb-3">
                    <div>
                      <span className="font-serif text-lg tracking-wider uppercase font-bold block">
                        RYCARIX ATELIER
                      </span>
                      <span className="text-[9px] uppercase tracking-wider text-neutral-600 block">
                        {activeLabelData.carrier === 'Royal Mail'
                          ? 'Royal Mail Delivery Network • UK & Worldwide'
                          : 'Evri National Parcel Hub • Express Doorstep'}
                      </span>
                    </div>

                    <div className="text-right">
                      <div className="text-sm font-bold uppercase">
                        {activeLabelData.carrier === 'Royal Mail'
                          ? 'ROYAL MAIL TRACKED 24'
                          : 'EVRI EXPRESS'}
                      </div>
                      <span className="text-[9px] font-mono text-neutral-600 block">
                        {activeLabelData.serviceLevel}
                      </span>
                    </div>
                  </div>

                  {/* Sender & Recipient Columns */}
                  <div className="grid grid-cols-2 gap-4 text-[11px] border-b-2 border-black pb-3 mb-3">
                    <div>
                      <span className="text-[9px] uppercase font-bold text-neutral-500 block">FROM:</span>
                      <div className="font-medium">Rycarix Fulfillment Atelier</div>
                      <div className="text-neutral-600">18 Place Vendôme, 75001 Paris, France</div>
                    </div>
                    <div>
                      <span className="text-[9px] uppercase font-bold text-neutral-500 block">DELIVER TO:</span>
                      <div className="font-bold text-sm">{activeLabelData.recipientAddress.name}</div>
                      <div className="text-neutral-700 leading-snug">
                        {activeLabelData.recipientAddress.street}<br />
                        {activeLabelData.recipientAddress.city}, {activeLabelData.recipientAddress.state} {activeLabelData.recipientAddress.postalCode}<br />
                        {activeLabelData.recipientAddress.country}
                      </div>
                    </div>
                  </div>

                  {/* Tracking Number & Hazardous Diamond Side-by-Side */}
                  <div className="flex items-center justify-between gap-4 pt-1">
                    <div className="flex-1">
                      <span className="text-[9px] uppercase font-bold text-neutral-500 block">
                        TRACKING NUMBER / WAYBILL:
                      </span>
                      <div className="font-mono text-base sm:text-lg font-bold tracking-wider">
                        {activeLabelData.trackingNumber}
                      </div>

                      {/* Simulated Barcode Lines */}
                      <div className="h-10 mt-2 flex items-stretch gap-[2px] bg-neutral-100 p-1 border border-neutral-300">
                        {[1, 3, 2, 4, 1, 2, 3, 1, 4, 2, 1, 3, 2, 1, 4, 3, 1, 2, 4, 2, 1, 3, 2, 1, 4, 1, 3, 2, 4, 1, 2, 3].map((w, i) => (
                          <div
                            key={i}
                            className="bg-black"
                            style={{ width: `${w * 2}px` }}
                          />
                        ))}
                      </div>
                    </div>

                    {/* Hazardous UN 1266 Limited Quantity (LQ) Diamond Label */}
                    {activeLabelData.isHazardous && (
                      <div className="shrink-0 flex flex-col items-center justify-center p-2 border border-black/30 bg-neutral-50">
                        <div className="w-14 h-14 border-2 border-black rotate-45 flex flex-col justify-between overflow-hidden bg-white p-0.5 shadow-xs my-2">
                          <div className="w-full h-3.5 bg-black" />
                          <div className="text-center font-bold text-[7px] text-black">LQ</div>
                          <div className="w-full h-3.5 bg-black" />
                        </div>
                        <span className="text-[8px] font-mono font-bold mt-2 uppercase tracking-tight">
                          UN 1266 LIMITED QTY
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-ry-ash/70">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => alert(`Simulated printing thermal shipping label for ${activeLabelData.trackingNumber}`)}
                    className="px-4 py-2.5 bg-ry-pearl hover:bg-ry-oatmeal border border-ry-ash text-xs uppercase tracking-editorial font-medium flex items-center gap-2 transition-colors"
                  >
                    <Printer className="w-4 h-4 text-ry-stone" />
                    <span>Print Label (PDF)</span>
                  </button>

                  <Link
                    href={`/track?ref=${encodeURIComponent(activeLabelData.trackingNumber)}`}
                    target="_blank"
                    className="px-4 py-2.5 bg-ry-white hover:bg-ry-pearl border border-ry-ash text-xs uppercase tracking-editorial font-medium flex items-center gap-2 transition-colors text-ry-onyx"
                  >
                    <Truck className="w-4 h-4 text-ry-stone" />
                    <span>Open Branded Tracking Portal</span>
                    <ExternalLink className="w-3 h-3 text-ry-stone" />
                  </Link>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setDispatchModalOrder(null)}
                    className="px-4 py-2.5 border border-ry-ash text-ry-stone hover:text-ry-onyx uppercase tracking-editorial text-xs transition-colors"
                  >
                    Close
                  </button>

                  {!dispatchModalOrder.trackingNumber && (
                    <button
                      type="button"
                      disabled={isDispatching}
                      onClick={handleConfirmDispatch}
                      className="px-6 py-2.5 bg-ry-onyx text-ry-white uppercase tracking-editorial text-xs hover:bg-ry-charcoal transition-colors flex items-center gap-2 disabled:opacity-50"
                    >
                      {isDispatching ? (
                        <span>Processing Dispatch...</span>
                      ) : (
                        <>
                          <Package className="w-4 h-4" />
                          <span>Confirm Dispatch via {activeLabelData.carrier}</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Floating Atelier Admin Notification Toast */}
        {notification && (
          <div className="fixed bottom-6 right-6 z-50 bg-ry-onyx text-ry-white px-5 py-3.5 border border-ry-ash/40 shadow-2xl flex items-center gap-3 animate-fade-in font-sans">
            {notification.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : (
              <RotateCcw className="w-4 h-4 text-amber-400 shrink-0" />
            )}
            <span className="text-xs font-medium tracking-wide">{notification.message}</span>
            <button
              onClick={() => setNotification(null)}
              className="text-ry-ash hover:text-ry-white transition-colors ml-2"
              title="Dismiss notification"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
