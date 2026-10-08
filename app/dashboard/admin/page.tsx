'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
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
} from 'lucide-react';
import { PRODUCTS } from '@/lib/data/mockData';
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
  stock: number;
  sku: string;
  size: string;
  inci: string;
  terroir: string;
}

export default function AdminDashboard() {
  const { user, loginAsDemo } = useAuthStore();
  const [activeTab, setActiveTab] = useState<'inventory' | 'orders' | 'analytics'>('inventory');
  const [productsList, setProductsList] = useState(PRODUCTS);
  const [showAddModal, setShowAddModal] = useState(false);

  // Dynamic Product Form State
  const [formData, setFormData] = useState<AdminProductForm>({
    title: '',
    category: 'Haute Perfumery',
    subtitle: '',
    basePrice: 195,
    stock: 50,
    sku: 'RY-NEW-01',
    size: '100ml / 3.4 fl. oz.',
    inci: 'Alcohol Denat, Parfum, Santalum Album Oil...',
    terroir: 'Murano Glass & Grasse Botanicals',
  });

  const handleCreateProduct = (e: React.FormEvent) => {
    e.preventDefault();
    const newProduct = {
      id: `prod-${Date.now()}`,
      title: formData.title,
      slug: formData.title.toLowerCase().replace(/[^a-z0-9]/g, '-'),
      subtitle: formData.subtitle || `${formData.category} Formulation`,
      summary: 'Dynamic atelier formulation with bespoke molecular extract.',
      description: 'Extracted and blended according to Rycarix quality protocols.',
      category: formData.category,
      basePrice: Number(formData.basePrice),
      rating: 5.0,
      reviewCount: 0,
      ingredients: formData.inci,
      howToUse: 'Apply to pulse points or hair tips as desired.',
      sourcingEthics: formData.terroir,
      attributes: {
        categoryType: formData.category,
      },
      images: [
        {
          id: `img-${Date.now()}-1`,
          url: 'https://images.unsplash.com/photo-1594035910387-fea47794261f?q=80&w=800&auto=format&fit=crop',
          alt: formData.title,
          isHero: true,
        },
        {
          id: `img-${Date.now()}-2`,
          url: 'https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?q=80&w=800&auto=format&fit=crop',
          alt: `${formData.title} Texture`,
          isTexture: true,
        },
      ],
      variants: [
        {
          id: `var-${Date.now()}`,
          sku: formData.sku,
          title: formData.size,
          price: Number(formData.basePrice),
          inventory: Number(formData.stock),
          attributes: { size: formData.size },
        },
      ],
    };

    setProductsList([newProduct as any, ...productsList]);
    setShowAddModal(false);
    alert(`Product "${formData.title}" added to catalog.`);
  };

  const INITIAL_ADMIN_ORDERS = [
    {
      id: 'RY-84920',
      customer: 'Éléonore de Vance',
      email: 'eleonore.devance@luxury-atelier.com',
      date: '2026-09-14',
      items: 'Santal Noir Extrait (100ml)',
      itemCategory: 'Haute Perfumery',
      total: 280.0,
      paymentMethod: 'Klarna Pay in 4',
      klarnaSettlement: 'Settled to Merchant Account',
      fulfillment: 'In Transit',
      carrier: 'FedEx Priority',
      trackingNumber: '7829-1092-4821',
      address: {
        street: '740 Park Avenue, Apt 11B',
        city: 'New York',
        state: 'NY',
        postalCode: '10021',
        country: 'United States',
      },
    },
    {
      id: 'RY-84919',
      customer: 'Duchess Caroline S.',
      email: 'caroline.s@monaco-yachts.mc',
      date: '2026-09-15',
      items: 'L’Huile Sublime Nectar (100ml) x 2',
      itemCategory: 'Haircare',
      total: 270.0,
      paymentMethod: 'Klarna Pay in 4',
      klarnaSettlement: 'Settled to Merchant Account',
      fulfillment: 'Dispatched',
      carrier: 'DHL Global Express',
      trackingNumber: 'DHL-9840-2811',
      address: {
        street: '12 Avenue des Papalins',
        city: 'Monaco',
        state: 'Fontvieille',
        postalCode: '98000',
        country: 'Monaco',
      },
    },
    {
      id: 'RY-84918',
      customer: 'Jonathan Sterling',
      email: 'j.sterling@mayfair.co.uk',
      date: '2026-09-16',
      items: 'Santal Noir Extrait (50ml) & Velvet Mask',
      itemCategory: 'Haute Perfumery',
      total: 245.0,
      paymentMethod: 'Stripe Card',
      klarnaSettlement: 'Direct Card Capture',
      fulfillment: 'Unfulfilled (Awaiting Courier)',
      carrier: 'Pending (ShipStation)',
      trackingNumber: '',
      address: {
        street: '45 Berkeley Square, Mayfair',
        city: 'London',
        state: 'Greater London',
        postalCode: 'W1J 5AS',
        country: 'United Kingdom',
      },
    },
  ];

  const [adminOrders, setAdminOrders] = useState(INITIAL_ADMIN_ORDERS);
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
    const simLabel: ShippingLabelData = {
      trackingNumber: `RY-${packaging.recommendedCarrier.toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`,
      orderNumber: ord.id,
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
        name: ord.customer,
        street: ord.address.street,
        city: ord.address.city,
        state: ord.address.state,
        postalCode: ord.address.postalCode,
        country: ord.address.country,
      },
      weightKg: 0.85,
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
          status: 'Label Generated via ShipStation',
          location: 'Rycarix Atelier, Paris',
          description: packaging.isHazardous
            ? 'Commercial shipping label printed with UN 1266 Limited Quantity (LQ) hazard marking.'
            : 'Standard air express label generated.',
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

  const handleConfirmDispatch = () => {
    if (!dispatchModalOrder || !activeLabelData) return;
    setIsDispatching(true);

    setTimeout(() => {
      // Register in global shipping database so tracking portal picks it up
      createAggregatorDispatch({
        orderNumber: dispatchModalOrder.id,
        customerName: dispatchModalOrder.customer,
        street: dispatchModalOrder.address.street,
        city: dispatchModalOrder.address.city,
        state: dispatchModalOrder.address.state,
        postalCode: dispatchModalOrder.address.postalCode,
        country: dispatchModalOrder.address.country,
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

      // Update in local admin orders state
      setAdminOrders((prev) =>
        prev.map((o) =>
          o.id === dispatchModalOrder.id
            ? {
                ...o,
                fulfillment: 'Dispatched via ShipStation',
                carrier: `${activeLabelData.carrier} Priority`,
                trackingNumber: activeLabelData.trackingNumber,
              }
            : o
        )
      );

      setIsDispatching(false);
      setDispatchSuccessMsg(
        `Order ${dispatchModalOrder.id} dispatched! Tracking #${activeLabelData.trackingNumber} is live.`
      );
    }, 600);
  };

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
                Admin: {user?.role === 'ADMIN' ? user.name : 'Henri Laurent'} • Dashboard v2.4
              </span>
            </div>
            <h1 className="font-serif text-3xl sm:text-4xl text-ry-onyx">
              Products & Orders Dashboard
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowAddModal(true)}
              className="px-5 py-3 bg-ry-onyx text-ry-white text-xs uppercase tracking-editorial flex items-center gap-2 hover:bg-ry-charcoal transition-colors shadow-luxury"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Product</span>
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
            <div className="font-serif text-2xl sm:text-3xl text-ry-onyx">£148,920.00</div>
            <p className="text-[11px] text-emerald-600 font-sans mt-1">+18.4% vs previous month</p>
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
            <div className="font-serif text-2xl sm:text-3xl text-ry-onyx">£63,740.00</div>
            <p className="text-[11px] text-[#992255] font-sans mt-1">
              42.8% of GMV • 0% merchant default liability
            </p>
          </div>

          <div className="bg-ry-white border border-ry-ash p-5">
            <div className="flex items-center justify-between text-ry-stone mb-2">
              <span className="text-[10px] uppercase tracking-editorial">Average Order Value (AOV)</span>
              <DollarSign className="w-4 h-4 text-ry-stone" />
            </div>
            <div className="font-serif text-2xl sm:text-3xl text-ry-onyx">£214.50</div>
            <p className="text-[11px] text-ry-stone font-sans mt-1">
              +32% higher when Klarna Pay in 4 chosen
            </p>
          </div>

          <div className="bg-ry-white border border-ry-ash p-5">
            <div className="flex items-center justify-between text-ry-stone mb-2">
              <span className="text-[10px] uppercase tracking-editorial">Active Inventory Units</span>
              <Package className="w-4 h-4 text-ry-stone" />
            </div>
            <div className="font-serif text-2xl sm:text-3xl text-ry-onyx">486 Units</div>
            <p className="text-[11px] text-ry-stone font-sans mt-1">4 SKUs under low-stock watch</p>
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
            Payment Conversion Analytics
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
                      <th className="py-3 px-4">Klarna 4-Pay</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-ry-ash/40">
                    {productsList.map((product) => (
                      <tr key={product.id} className="hover:bg-ry-pearl/50 transition-colors">
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-3">
                            <div className="relative w-10 h-12 bg-ry-oatmeal overflow-hidden border border-ry-ash/60 shrink-0">
                              <Image
                                src={product.images[0]?.url}
                                alt={product.title}
                                fill
                                sizes="40px"
                                className="object-cover"
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
                          £{product.basePrice.toFixed(2)}
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
                          £{(product.basePrice / 4).toFixed(2)}/mo
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
                              onClick={() => alert(`Editing: ${product.title}`)}
                              className="p-1.5 text-ry-stone hover:text-ry-onyx"
                              title="Edit Variant Attributes"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => {
                                if (confirm(`Archive formulation "${product.title}"?`)) {
                                  setProductsList(productsList.filter((p) => p.id !== product.id));
                                }
                              }}
                              className="p-1.5 text-ry-stone hover:text-red-700"
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
                      Shipping Aggregator & Courier Gateway
                    </span>
                    <span className="px-2 py-0.5 bg-emerald-50 border border-emerald-300 text-emerald-800 text-[9px] font-medium uppercase tracking-wider">
                      ShipStation / Sendcloud Active
                    </span>
                  </div>
                  <p className="text-[11px] text-ry-stone mt-0.5">
                    Automated address normalization, hazardous materials (UN 1266 LQ) detection, rate calculation, and customer redirection to our branded tracking portal.
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
                          {ord.items.toLowerCase().includes('extrait') && (
                            <span className="inline-flex items-center gap-1 text-[9px] text-amber-800 bg-amber-50 border border-amber-200 px-1.5 py-0.2 mt-0.5">
                              <Flame className="w-2.5 h-2.5 text-amber-600" /> UN 1266 LQ (Contains Alcohol)
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 font-mono">£{ord.total.toFixed(2)}</td>
                        <td className="py-3.5 px-4">
                          {ord.paymentMethod.includes('Klarna') ? (
                            <span className="inline-flex items-center gap-1 bg-[#FFF0F5] border border-[#FFA8CD] text-[#801040] px-2 py-0.5 text-[10px] font-semibold">
                              Klarna Pay in 4
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 bg-ry-oatmeal text-[10px]">
                              {ord.paymentMethod}
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-4">
                          <span className={`px-2 py-1 text-[10px] uppercase tracking-editorial inline-block ${
                            ord.fulfillment.includes('Dispatched') || ord.fulfillment.includes('In Transit')
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
                              <span>Dispatch via ShipStation</span>
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Analytics */}
        {activeTab === 'analytics' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in">
            <div className="bg-ry-white border border-ry-ash p-6">
              <h3 className="font-serif text-lg mb-2">Klarna Payment Conversion Impact</h3>
              <p className="text-xs text-ry-stone mb-6">
                Customer checkout behavior analysis across Rycarix price tiers.
              </p>

              <div className="space-y-4 text-xs font-sans">
                <div>
                  <div className="flex justify-between mb-1">
                    <span>Cart Abandonment Reduction with Klarna Messaging</span>
                    <strong className="text-emerald-700">-28.4%</strong>
                  </div>
                  <div className="w-full bg-ry-ash/40 h-2">
                    <div className="bg-emerald-600 h-full w-[72%]" />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between mb-1">
                    <span>AOV Uplift on Fragrance Flacons (£200+)</span>
                    <strong className="text-ry-onyx">+34.2%</strong>
                  </div>
                  <div className="w-full bg-ry-ash/40 h-2">
                    <div className="bg-ry-onyx h-full w-[65%]" />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between mb-1">
                    <span>Klarna Pay in 4 Adoption Rate</span>
                    <strong className="text-[#992255]">42.8% of all checkouts</strong>
                  </div>
                  <div className="w-full bg-ry-ash/40 h-2">
                    <div className="bg-[#FFA8CD] h-full w-[43%]" />
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-ry-white border border-ry-ash p-6 flex flex-col justify-between">
              <div>
                <h3 className="font-serif text-lg mb-2">Extensible Category Performance</h3>
                <p className="text-xs text-ry-stone mb-4">
                  Revenue contribution by taxonomy classification.
                </p>
                <div className="space-y-3 text-xs">
                  <div className="flex justify-between py-2 border-b border-ry-ash/40">
                    <span className="font-medium">Haute Parfumerie</span>
                    <span className="font-mono">£64,200.00 (43.1%)</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-ry-ash/40">
                    <span className="font-medium">Botanical Skincare</span>
                    <span className="font-mono">£38,620.00 (25.9%)</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-ry-ash/40">
                    <span className="font-medium">Hair & Scalp Rituals</span>
                    <span className="font-mono">£24,180.00 (16.2%)</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-ry-ash/40">
                    <span className="font-medium">Home & Living (Ceramics & Mists)</span>
                    <span className="font-mono">£12,940.00 (8.7%)</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-ry-ash/40">
                    <span className="font-medium">Accessories & Fine Objects</span>
                    <span className="font-mono">£8,980.00 (6.1%)</span>
                  </div>
                </div>
              </div>

              <div className="mt-6 p-3 bg-ry-pearl border border-ry-ash text-[11px] text-ry-stone">
                Taxonomy is designed to dynamically accept lifestyle, home fragrance, or travel accessories without database migrations.
              </div>
            </div>
          </div>
        )}

        {/* Dynamic Product Creation Modal */}
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
            <div className="bg-ry-pearl border border-ry-ash w-full max-w-2xl p-6 sm:p-8 max-h-[90vh] overflow-y-auto shadow-2xl">
              <div className="flex justify-between items-center pb-4 mb-6 border-b border-ry-ash">
                <div>
                  <h3 className="font-serif text-2xl">Add Dynamic Product Formulation</h3>
                  <p className="text-xs text-ry-stone font-sans">
                    Extensible architecture ready for Haircare, Perfume, or future categories.
                  </p>
                </div>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="text-ry-stone hover:text-ry-onyx"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleCreateProduct} className="space-y-4 text-xs font-sans">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block uppercase tracking-editorial text-[10px] text-ry-stone mb-1">
                      Product Title
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
                    <label className="block uppercase tracking-editorial text-[10px] text-ry-stone mb-1">
                      Category (Extensible)
                    </label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full bg-ry-white border border-ry-ash p-2.5 focus:border-ry-onyx outline-none"
                    >
                      <option value="Haute Parfumerie">Haute Parfumerie</option>
                      <option value="Botanical Skincare">Botanical Skincare</option>
                      <option value="Hair Care">Hair Care & Scalp</option>
                      <option value="Body & Bath">Body & Bath</option>
                      <option value="Home & Living">Home & Living</option>
                      <option value="Accessories">Accessories & Fine Goods</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block uppercase tracking-editorial text-[10px] text-ry-stone mb-1">
                      Base Price (£)
                    </label>
                    <input
                      type="number"
                      required
                      value={formData.basePrice}
                      onChange={(e) =>
                        setFormData({ ...formData, basePrice: Number(e.target.value) })
                      }
                      className="w-full bg-ry-white border border-ry-ash p-2.5 focus:border-ry-onyx outline-none"
                    />
                  </div>
                  <div>
                    <label className="block uppercase tracking-editorial text-[10px] text-ry-stone mb-1">
                      Initial Inventory
                    </label>
                    <input
                      type="number"
                      required
                      value={formData.stock}
                      onChange={(e) =>
                        setFormData({ ...formData, stock: Number(e.target.value) })
                      }
                      className="w-full bg-ry-white border border-ry-ash p-2.5 focus:border-ry-onyx outline-none"
                    />
                  </div>
                  <div>
                    <label className="block uppercase tracking-editorial text-[10px] text-ry-stone mb-1">
                      SKU Code
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.sku}
                      onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                      className="w-full bg-ry-white border border-ry-ash p-2.5 focus:border-ry-onyx outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block uppercase tracking-editorial text-[10px] text-ry-stone mb-1">
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

                <div>
                  <label className="block uppercase tracking-editorial text-[10px] text-ry-stone mb-1">
                    Ingredients (INCI) / Scent Notes JSON
                  </label>
                  <textarea
                    rows={2}
                    value={formData.inci}
                    onChange={(e) => setFormData({ ...formData, inci: e.target.value })}
                    className="w-full bg-ry-white border border-ry-ash p-2.5 focus:border-ry-onyx outline-none"
                  />
                </div>

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
                    className="px-6 py-2.5 bg-ry-onyx text-ry-white uppercase tracking-editorial text-[11px] hover:bg-ry-charcoal transition-colors"
                  >
                    Publish to Catalog
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
                    ShipStation / Sendcloud Integration
                  </span>
                  <span className="text-xs text-ry-stone">
                    Order Ref: {dispatchModalOrder.id} • {dispatchModalOrder.customer}
                  </span>
                </div>
                <h3 className="font-serif text-2xl text-ry-onyx">
                  Dispatch & Hazardous Goods Verification
                </h3>
              </div>

              {dispatchSuccessMsg && (
                <div className="mb-6 p-4 bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                  <span>{dispatchSuccessMsg}</span>
                </div>
              )}

              {/* Step 1: Address Validation & Dangerous Goods Verification */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 text-xs">
                {/* Address Check */}
                <div className="p-4 bg-ry-pearl border border-ry-ash/70">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] uppercase tracking-editorial text-ry-stone font-semibold">
                      1. Address Normalization
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
                      2. Dangerous Goods (LQ) Check
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
                        Class 3 Flammable Liquid PG II/III. Package automatically tagged with mandatory Limited Quantity (LQ) diamond marking for air & road transport.
                      </p>
                    </div>
                  ) : (
                    <div>
                      <div className="font-medium text-ry-onyx">Standard Cosmetic Goods</div>
                      <p className="text-[11px] text-ry-stone mt-1">
                        Formulation does not exceed solvent flashpoint thresholds. Standard shipping documentation accepted.
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Step 2: Commercial Shipping Label Simulation */}
              <div className="mb-6">
                <span className="text-[10px] uppercase tracking-editorial text-ry-stone block mb-2 font-semibold">
                  3. Generated Thermal Shipping Label & Barcode
                </span>

                <div className="border-2 border-ry-onyx p-4 sm:p-6 bg-white text-black font-sans relative">
                  {/* Label Top Bar */}
                  <div className="flex items-center justify-between border-b-2 border-black pb-3 mb-3">
                    <div>
                      <span className="font-serif text-lg tracking-wider uppercase font-bold block">
                        RYCARIX ATELIER
                      </span>
                      <span className="text-[9px] uppercase tracking-wider text-neutral-600 block">
                        ShipStation Carrier Gateway • Paris, FR
                      </span>
                    </div>

                    <div className="text-right">
                      <div className="text-sm font-bold uppercase">{activeLabelData.carrier} EXPRESS</div>
                      <span className="text-[9px] font-mono text-neutral-600">
                        {activeLabelData.serviceLevel.split('(')[0]}
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
                          <span>Confirm Courier Dispatch</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
