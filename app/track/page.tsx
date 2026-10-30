'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  Search,
  Package,
  Truck,
  CheckCircle2,
  Clock,
  MapPin,
  ShieldCheck,
  Bell,
  Copy,
  Check,
  AlertCircle,
  ExternalLink,
  ArrowRight,
  ArrowLeft,
  Flame,
  Sparkles,
} from 'lucide-react';
import {
  lookupTracking,
  buildShipmentFromOrder,
  SHIPMENT_DATABASE,
  ShippingLabelData,
} from '@/lib/services/shippingAggregator';
import { PRODUCTS } from '@/lib/data/mockData';
import { useCartStore } from '@/lib/store/useCartStore';
import { useAuthStore } from '@/lib/store/useAuthStore';

function TrackingPortalContent() {
  const searchParams = useSearchParams();
  const initialRef = searchParams.get('ref') || searchParams.get('tracking') || '';

  const { user } = useAuthStore();
  const [searchQuery, setSearchQuery] = useState(initialRef);
  const [activeShipment, setActiveShipment] = useState<ShippingLabelData | null>(null);
  const [copied, setCopied] = useState(false);
  const [smsAlertsEnabled, setSmsAlertsEnabled] = useState(false);
  const [smsPhone, setSmsPhone] = useState('');
  const [smsSubmitted, setSmsSubmitted] = useState(false);
  const [availableOrders, setAvailableOrders] = useState<any[]>([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(true);
  const [searchNotFound, setSearchNotFound] = useState(false);

  // Sync phone number from activeShipment if available
  useEffect(() => {
    if (activeShipment) {
      const ph = activeShipment.recipientAddress?.phone || activeShipment.customerPhone;
      if (ph) {
        setSmsPhone(ph);
      }
    }
  }, [activeShipment]);

  const { addItem, openCart } = useCartStore();

  useEffect(() => {
    let localList: any[] = [];
    try {
      const raw = localStorage.getItem('rycarix_orders');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) localList = parsed;
      }
    } catch (e) {}

    const loadOrdersAndResolve = async () => {
      setIsLoadingOrders(true);
      let allOrders = [...localList];

      try {
        const query = user?.role === 'ADMIN' ? '' : user?.email ? `?email=${encodeURIComponent(user.email)}` : '';
        const res = await fetch(`/api/orders${query}`);
        if (res.ok) {
          const data = await res.json();
          if (data.orders && Array.isArray(data.orders)) {
            const combined = [...data.orders];
            for (let i = 0; i < combined.length; i++) {
              const c = combined[i];
              const match = localList.find(
                (l) => l.id === c.id || (c.stripeSessionId && c.stripeSessionId === l.stripeSessionId)
              );
              if (match) {
                if (!c.phone && match.phone) {
                  c.phone = match.phone;
                  if (c.address) c.address.phone = match.phone;
                }
                if (
                  match.fulfillment &&
                  match.fulfillment.toLowerCase().includes('dispatched') &&
                  (!c.fulfillment || !c.fulfillment.toLowerCase().includes('dispatched'))
                ) {
                  c.fulfillment = match.fulfillment;
                  c.carrier = match.carrier || c.carrier;
                  c.trackingNumber = match.trackingNumber || c.trackingNumber;
                  c.currentStatus = match.currentStatus || 'IN_TRANSIT';
                  c.estimatedDelivery = match.estimatedDelivery || c.estimatedDelivery;
                }
              }
            }
            for (const l of localList) {
              if (!combined.some((c) => c.id === l.id || (c.stripeSessionId && c.stripeSessionId === l.stripeSessionId))) {
                combined.push(l);
              }
            }
            allOrders = combined;
          }
        }
      } catch (e) {
        console.warn('Could not fetch orders in tracking portal', e);
      }

      setAvailableOrders(allOrders);
      setIsLoadingOrders(false);

      // If initialRef exists in URL, attempt to resolve it
      if (initialRef) {
        const target = initialRef.trim().toUpperCase();
        const matched = allOrders.find(
          (o: any) =>
            o.id?.toUpperCase() === target ||
            o.orderNumber?.toUpperCase() === target ||
            o.trackingNumber?.toUpperCase() === target ||
            (o.trackingNumber &&
              o.trackingNumber.replace(/[^a-zA-Z0-9]/g, '') === target.replace(/[^a-zA-Z0-9]/g, ''))
        );
        if (matched) {
          setActiveShipment(buildShipmentFromOrder(matched));
          setSearchNotFound(false);
          return;
        }

        const local = lookupTracking(target);
        if (local) {
          setActiveShipment(local);
          setSearchNotFound(false);
          return;
        }

        setSearchNotFound(true);
      } else {
        setActiveShipment(null);
        setSearchNotFound(false);
      }
    };

    loadOrdersAndResolve();
  }, [initialRef, user?.email, user?.role]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    const query = searchQuery.trim().toUpperCase();
    if (!query) {
      setActiveShipment(null);
      setSearchNotFound(false);
      return;
    }

    // 1. Check in loaded orders
    const matched = availableOrders.find(
      (o: any) =>
        o.id?.toUpperCase() === query ||
        o.orderNumber?.toUpperCase() === query ||
        o.trackingNumber?.toUpperCase() === query ||
        (o.trackingNumber &&
          o.trackingNumber.replace(/[^a-zA-Z0-9]/g, '') === query.replace(/[^a-zA-Z0-9]/g, ''))
    );
    if (matched) {
      setActiveShipment(buildShipmentFromOrder(matched));
      setSearchNotFound(false);
      return;
    }

    // 2. Check local lookup
    const local = lookupTracking(query);
    if (local) {
      setActiveShipment(local);
      setSearchNotFound(false);
      return;
    }

    // 3. Fallback direct API check
    try {
      const res = await fetch('/api/orders');
      if (res.ok) {
        const data = await res.json();
        if (data.orders && Array.isArray(data.orders)) {
          const apiMatch = data.orders.find(
            (o: any) =>
              o.id?.toUpperCase() === query ||
              o.orderNumber?.toUpperCase() === query ||
              o.trackingNumber?.toUpperCase() === query ||
              (o.trackingNumber &&
                o.trackingNumber.replace(/[^a-zA-Z0-9]/g, '') === query.replace(/[^a-zA-Z0-9]/g, ''))
          );
          if (apiMatch) {
            setActiveShipment(buildShipmentFromOrder(apiMatch));
            setSearchNotFound(false);
            return;
          }
        }
      }
    } catch (e) {}

    setActiveShipment(null);
    setSearchNotFound(true);
  };

  const handleCopyTracking = (num: string) => {
    navigator.clipboard.writeText(num);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const recommendedItems = PRODUCTS.slice(0, 3);

  return (
    <div className="min-h-screen bg-ry-pearl text-ry-onyx pt-28 pb-24 font-sans">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Portal Header */}
        <div className="text-center max-w-2xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-ry-white border border-ry-ash/70 text-[10px] uppercase tracking-editorial font-medium mb-3">
            <Truck className="w-3.5 h-3.5 text-ry-onyx" />
            <span>Rycarix Branded Courier Tracking</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-5xl font-normal text-ry-onyx tracking-tight">
            Track Your Delivery
          </h1>
          <p className="text-xs text-ry-stone mt-3 leading-relaxed">
            Real-time milestone tracking for your Rycarix order. Complete transparency from our Paris packaging atelier to your door.
          </p>

          {/* Quick Search Form */}
          <form onSubmit={handleSearch} className="mt-6 flex flex-col sm:flex-row gap-2 max-w-md mx-auto">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-ry-stone absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Enter tracking # or order # (e.g. RY-96130)"
                className="w-full pl-10 pr-4 py-3 bg-ry-white border border-ry-ash text-xs text-ry-onyx focus:outline-none focus:border-ry-onyx transition-colors placeholder-ry-stone font-mono"
              />
            </div>
            <button
              type="submit"
              className="px-6 py-3 bg-ry-onyx text-ry-white text-xs uppercase tracking-editorial font-medium hover:bg-ry-charcoal transition-colors shrink-0"
            >
              Track Package
            </button>
          </form>
        </div>

        {/* Active Shipment Display */}
        {activeShipment ? (
          <div className="space-y-8 animate-fade-in">
            {/* Back to All Orders Button */}
            <div className="flex items-center justify-between pb-2">
              <button
                type="button"
                onClick={() => {
                  setActiveShipment(null);
                  setSearchQuery('');
                  setSearchNotFound(false);
                }}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-ry-white border border-ry-ash text-xs uppercase tracking-editorial font-medium hover:bg-ry-pearl transition-colors text-ry-onyx shadow-xs"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>← View All Orders & Deliveries</span>
              </button>

              <span className="text-[11px] font-mono text-ry-stone">
                Tracking Waybill: <strong className="text-ry-onyx">{activeShipment.trackingNumber || activeShipment.orderNumber}</strong>
              </span>
            </div>
            
            {/* Primary Status Card */}
            <div className="bg-ry-white border border-ry-ash/80 shadow-md p-6 sm:p-10">
              <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-ry-ash/50 gap-4">
                <div>
                  <span className="text-[10px] uppercase tracking-editorial text-ry-stone block mb-1">
                    Current Status
                  </span>
                  <div className="flex items-center gap-3">
                    <h2 className="font-serif text-2xl sm:text-3xl text-ry-onyx">
                      {activeShipment.currentStatus === 'OUT_FOR_DELIVERY' && 'Out for Delivery'}
                      {activeShipment.currentStatus === 'IN_TRANSIT' && 'In Transit'}
                      {activeShipment.currentStatus === 'DELIVERED' && 'Delivered to Recipient'}
                      {activeShipment.currentStatus === 'DISPATCH_PENDING' && 'Preparing Shipment'}
                    </h2>
                    <span className="px-2.5 py-0.5 bg-ry-onyx text-ry-white text-[9px] uppercase tracking-editorial font-medium">
                      {activeShipment.serviceLevel || `${activeShipment.carrier} Priority`}
                    </span>
                  </div>
                </div>

                <div className="text-left md:text-right">
                  <span className="text-[10px] uppercase tracking-editorial text-ry-stone block mb-1">
                    Estimated Delivery
                  </span>
                  <div className="font-serif text-xl sm:text-2xl text-ry-onyx">
                    {activeShipment.estimatedDelivery}
                  </div>
                </div>
              </div>

              {/* Monochromatic Visual Progress Stepper */}
              <div className="py-8">
                <div className="grid grid-cols-4 gap-2 relative text-center text-xs">
                  {/* Step 1: Order Confirmed */}
                  <div className="flex flex-col items-center">
                    <div className="w-8 h-8 rounded-full bg-ry-onyx text-ry-white flex items-center justify-center mb-2 z-10">
                      <Check className="w-4 h-4" />
                    </div>
                    <span className="font-medium text-ry-onyx text-[11px]">Order Placed</span>
                    <span className="text-[10px] text-ry-stone">Klarna Approved</span>
                  </div>

                  {/* Step 2: Packaging & Hazmat Check */}
                  <div className="flex flex-col items-center">
                    <div className="w-8 h-8 rounded-full bg-ry-onyx text-ry-white flex items-center justify-center mb-2 z-10">
                      <Check className="w-4 h-4" />
                    </div>
                    <span className="font-medium text-ry-onyx text-[11px]">Packed & Labeled</span>
                    <span className="text-[10px] text-ry-stone">
                      {activeShipment.isHazardous ? 'LQ Diamond Applied' : 'Ready for Dispatch'}
                    </span>
                  </div>

                  {/* Step 3: In Transit */}
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center mb-2 z-10 ${
                        activeShipment.currentStatus === 'IN_TRANSIT' ||
                        activeShipment.currentStatus === 'OUT_FOR_DELIVERY' ||
                        activeShipment.currentStatus === 'DELIVERED'
                          ? 'bg-ry-onyx text-ry-white'
                          : 'bg-ry-pearl text-ry-stone border border-ry-ash'
                      }`}
                    >
                      {activeShipment.currentStatus === 'DELIVERED' ||
                      activeShipment.currentStatus === 'OUT_FOR_DELIVERY' ? (
                        <Check className="w-4 h-4" />
                      ) : (
                        <Truck className="w-4 h-4 animate-pulse" />
                      )}
                    </div>
                    <span className="font-medium text-ry-onyx text-[11px]">In Transit</span>
                    <span className="text-[10px] text-ry-stone">Export Cleared</span>
                  </div>

                  {/* Step 4: Out for Delivery / Delivered */}
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center mb-2 z-10 ${
                        activeShipment.currentStatus === 'DELIVERED'
                          ? 'bg-emerald-700 text-white'
                          : activeShipment.currentStatus === 'OUT_FOR_DELIVERY'
                          ? 'bg-ry-onyx text-ry-white ring-4 ring-ry-ash/40'
                          : 'bg-ry-pearl text-ry-stone border border-ry-ash'
                      }`}
                    >
                      {activeShipment.currentStatus === 'DELIVERED' ? (
                        <CheckCircle2 className="w-4 h-4" />
                      ) : (
                        <MapPin className="w-4 h-4" />
                      )}
                    </div>
                    <span className="font-medium text-ry-onyx text-[11px]">
                      {activeShipment.currentStatus === 'DELIVERED' ? 'Delivered' : 'Out for Delivery'}
                    </span>
                    <span className="text-[10px] text-ry-stone">Final Destination</span>
                  </div>
                </div>
              </div>

              {/* Limited Quantity (LQ) Dangerous Goods Compliance Banner */}
              {activeShipment.isHazardous && (
                <div className="p-4 bg-ry-pearl border border-ry-ash/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    {/* Official Limited Quantity (LQ) Diamond Icon */}
                    <div className="w-10 h-10 border-2 border-black rotate-45 flex flex-col justify-between overflow-hidden bg-white shrink-0 p-0.5">
                      <div className="w-full h-2.5 bg-black" />
                      <div className="text-center font-bold text-[6px] text-black">LQ</div>
                      <div className="w-full h-2.5 bg-black" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-ry-onyx">
                          UN 1266 Limited Quantity (LQ) Compliant
                        </span>
                        <span className="text-[9px] bg-ry-white px-1.5 py-0.5 border border-ry-ash font-mono text-ry-stone">
                          ADR / IATA Spec
                        </span>
                      </div>
                      <p className="text-[11px] text-ry-stone leading-relaxed">
                        Contains perfume formulation with flammable solvent solution. Packed under certified Limited Quantity (LQ) protocols with temperature-regulated air courier routing.
                      </p>
                    </div>
                  </div>

                  <div className="text-xs font-mono text-ry-charcoal shrink-0">
                    Carrier Protocol: <strong>{activeShipment.carrier} Hazmat Verified</strong>
                  </div>
                </div>
              )}

              {/* Details strip */}
              <div className="mt-6 pt-4 border-t border-ry-ash/40 flex flex-wrap items-center justify-between gap-4 text-xs">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] uppercase tracking-editorial text-ry-stone">
                    Tracking Number:
                  </span>
                  <span className="font-mono font-medium text-ry-onyx">{activeShipment.trackingNumber}</span>
                  <button
                    onClick={() => handleCopyTracking(activeShipment.trackingNumber)}
                    className="p-1 text-ry-stone hover:text-ry-onyx transition-colors"
                    title="Copy tracking number"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[10px] uppercase tracking-editorial text-ry-stone">
                    Order Reference:
                  </span>
                  <span className="font-mono font-medium text-ry-onyx">{activeShipment.orderNumber}</span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[10px] uppercase tracking-editorial text-ry-stone">
                    Weight:
                  </span>
                  <span className="font-mono text-ry-charcoal">{activeShipment.weightKg} kg</span>
                </div>
              </div>
            </div>

            {/* Two-Column Tracking Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              
              {/* Left Column: Live Milestone Timeline */}
              <div className="lg:col-span-7 bg-ry-white border border-ry-ash/70 p-6 sm:p-8">
                <h3 className="font-serif text-lg text-ry-onyx mb-6 flex items-center justify-between">
                  <span>Shipment History</span>
                  <span className="text-xs font-sans font-normal text-ry-stone">
                    Live updates via {activeShipment.carrier}
                  </span>
                </h3>

                <div className="space-y-6 relative before:absolute before:inset-y-0 before:left-3.5 before:w-0.5 before:bg-ry-ash">
                  {activeShipment.milestones.map((step, idx) => (
                    <div key={idx} className="relative flex items-start gap-4">
                      <div
                        className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 z-10 ${
                          idx === 0
                            ? 'bg-ry-onyx text-ry-white ring-4 ring-ry-pearl'
                            : 'bg-ry-white text-ry-stone border border-ry-ash'
                        }`}
                      >
                        {idx === 0 ? (
                          <Truck className="w-3.5 h-3.5" />
                        ) : (
                          <div className="w-2 h-2 rounded-full bg-ry-ash" />
                        )}
                      </div>

                      <div className="flex-1">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs mb-1">
                          <strong className="text-ry-onyx font-medium">{step.status}</strong>
                          <span className="text-[10px] text-ry-stone">{step.timestamp}</span>
                        </div>
                        <div className="text-[11px] text-ry-stone mb-1 font-mono">
                          {step.location}
                        </div>
                        <p className="text-xs text-ry-charcoal leading-relaxed font-sans">
                          {step.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right Column: Address, Order Contents & SMS ping */}
              <div className="lg:col-span-5 space-y-6">
                
                {/* Destination & Delivery Address Card */}
                <div className="bg-ry-white border border-ry-ash/70 p-6">
                  <h4 className="font-serif text-base text-ry-onyx mb-3 flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-ry-stone" />
                    <span>Delivery Address</span>
                  </h4>
                  <div className="text-xs text-ry-charcoal leading-relaxed font-sans space-y-1">
                    <div className="font-semibold text-ry-onyx text-sm">{activeShipment.recipientAddress.name}</div>
                    {(activeShipment.recipientAddress.email || activeShipment.customerEmail) && (
                      <div className="text-ry-stone text-[11px]">
                        {activeShipment.recipientAddress.email || activeShipment.customerEmail}
                      </div>
                    )}
                    {(activeShipment.recipientAddress.phone || activeShipment.customerPhone) && (
                      <div className="text-ry-stone text-[11px] font-mono">
                        {activeShipment.recipientAddress.phone || activeShipment.customerPhone}
                      </div>
                    )}
                    <div className="pt-2 border-t border-ry-ash/40 mt-1.5 space-y-0.5 text-ry-charcoal">
                      <div>{activeShipment.recipientAddress.street}</div>
                      <div>
                        {activeShipment.recipientAddress.city}, {activeShipment.recipientAddress.state}{' '}
                        {activeShipment.recipientAddress.postalCode}
                      </div>
                      <div>{activeShipment.recipientAddress.country}</div>
                    </div>
                  </div>
                </div>

                {/* Items in this Shipment */}
                <div className="bg-ry-white border border-ry-ash/70 p-6">
                  <h4 className="font-serif text-base text-ry-onyx mb-3 flex items-center gap-2">
                    <Package className="w-4 h-4 text-ry-stone" />
                    <span>Package Contents</span>
                  </h4>
                  <div className="divide-y divide-ry-ash/40">
                    {activeShipment.items.map((item, idx) => (
                      <div key={idx} className="py-3 first:pt-0 last:pb-0 flex items-center gap-3">
                        <div className="relative w-12 h-14 bg-ry-oatmeal overflow-hidden border border-ry-ash shrink-0">
                          <Image src={item.image} alt={item.title} fill className="object-cover" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h5 className="font-serif text-xs text-ry-onyx truncate">{item.title}</h5>
                          <span className="text-[10px] text-ry-stone block">{item.variant}</span>
                          <span className="text-[10px] font-mono text-ry-charcoal">
                            Qty: {item.quantity} • ${item.price.toFixed(2)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* SMS Delivery Notifications Box */}
                <div className="bg-ry-white border border-ry-ash/70 p-6">
                  <div className="flex items-center gap-2 mb-2">
                    <Bell className="w-4 h-4 text-ry-onyx" />
                    <h4 className="font-serif text-base text-ry-onyx">Delivery Alerts</h4>
                  </div>
                  <p className="text-xs text-ry-stone mb-4 leading-relaxed">
                    Get an instant SMS text alert when the courier is within 10 minutes of your address.
                  </p>

                  {smsSubmitted ? (
                    <div className="p-3 bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>SMS courier notifications activated for {smsPhone}.</span>
                    </div>
                  ) : (
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        setSmsSubmitted(true);
                      }}
                      className="space-y-3"
                    >
                      <input
                        type="tel"
                        value={smsPhone}
                        onChange={(e) => setSmsPhone(e.target.value)}
                        placeholder="+44 7946 0991"
                        className="w-full p-2.5 bg-ry-pearl border border-ry-ash text-xs text-ry-onyx focus:outline-none focus:border-ry-onyx font-mono"
                        required
                      />
                      <button
                        type="submit"
                        className="w-full py-2.5 bg-ry-onyx text-ry-white text-[10px] uppercase tracking-editorial font-medium hover:bg-ry-charcoal transition-colors"
                      >
                        Enable SMS Courier Alerts
                      </button>
                    </form>
                  )}
                </div>

              </div>

            </div>

            {/* "While You Wait" - Branded Post-Purchase Product Discovery */}
            <div className="mt-16 pt-12 border-t border-ry-ash/60">
              <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
                <div>
                  <span className="text-[10px] uppercase tracking-[0.3em] text-ry-stone block mb-1">
                    While You Wait For Your Delivery
                  </span>
                  <h3 className="font-serif text-2xl text-ry-onyx">
                    Complete Your Fragrance & Care Routine
                  </h3>
                </div>
                <Link
                  href="/#catalog"
                  className="text-xs uppercase tracking-editorial font-medium underline hover:text-ry-stone"
                >
                  View Full Catalog &rarr;
                </Link>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                {recommendedItems.map((prod) => (
                  <div
                    key={prod.id}
                    className="bg-ry-white border border-ry-ash/70 p-4 flex flex-col justify-between group hover:shadow-md transition-shadow"
                  >
                    <div>
                      <div className="relative aspect-[4/5] bg-ry-oatmeal overflow-hidden mb-3">
                        <Image
                          src={prod.images[0]?.url || ''}
                          alt={prod.title}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      </div>
                      <span className="text-[9px] uppercase tracking-editorial text-ry-stone block">
                        {prod.category}
                      </span>
                      <h4 className="font-serif text-sm text-ry-onyx mt-1 group-hover:underline">
                        {prod.title}
                      </h4>
                      <p className="text-xs text-ry-stone mt-1 line-clamp-1">{prod.subtitle}</p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-ry-ash/40 flex items-center justify-between">
                      <span className="font-serif text-sm font-medium text-ry-onyx">
                        ${prod.basePrice.toFixed(2)}
                      </span>
                      <button
                        onClick={() => {
                          const v = prod.variants[0];
                          addItem({
                            id: `${prod.id}-${v.id}`,
                            productId: prod.id,
                            variantId: v.id,
                            title: prod.title,
                            variantTitle: v.title,
                            sku: v.sku,
                            price: v.price,
                            quantity: 1,
                            image: prod.images[0]?.url || '',
                          });
                          openCart();
                        }}
                        className="px-3 py-1.5 bg-ry-onyx text-ry-white text-[10px] uppercase tracking-editorial hover:bg-ry-charcoal transition-colors"
                      >
                        Add to Cart
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        ) : (
          <div className="space-y-8 animate-fade-in">
            {/* Search not found warning */}
            {searchNotFound && (
              <div className="p-4 bg-amber-50 border border-amber-300 text-xs text-amber-900 flex items-center gap-2.5">
                <AlertCircle className="w-4 h-4 text-amber-700 shrink-0" />
                <span>
                  No tracking information found matching &ldquo;{searchQuery}&rdquo;. Please verify the order reference or waybill number, or select from your active orders below.
                </span>
              </div>
            )}

            {/* Orders List Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-ry-ash/70 pb-4">
              <div>
                <h2 className="font-serif text-xl sm:text-2xl text-ry-onyx">Your Orders & Deliveries</h2>
                <p className="text-xs text-ry-stone mt-0.5">
                  Select any order below to view real-time courier checkpoints, GPS transit milestones, and estimated delivery.
                </p>
              </div>

              <div className="text-xs text-ry-stone">
                {availableOrders.length} {availableOrders.length === 1 ? 'Order' : 'Orders'} on record
              </div>
            </div>

            {/* Orders Cards List */}
            {isLoadingOrders ? (
              <div className="p-12 text-center text-ry-stone bg-ry-white border border-ry-ash/60">
                <div className="w-8 h-8 rounded-full border-2 border-ry-onyx border-t-transparent animate-spin mx-auto mb-3" />
                <span className="text-xs uppercase tracking-editorial">Retrieving delivery records...</span>
              </div>
            ) : availableOrders.length > 0 ? (
              <div className="grid grid-cols-1 gap-4">
                {availableOrders.map((ord: any) => {
                  const isDispatched = (ord.fulfillment || '').toLowerCase().includes('dispatched');
                  const trackingNum = ord.trackingNumber || (isDispatched ? 'Waybill Assigned' : '');
                  const orderAddress = ord.address
                    ? `${ord.address.street ? `${ord.address.street}, ` : ''}${ord.address.city || ''}, ${ord.address.country || ''}`
                    : 'Delivery address on file';

                  return (
                    <div
                      key={ord.id}
                      className="bg-ry-white border border-ry-ash/80 p-5 sm:p-6 hover:border-ry-onyx/60 transition-all shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-5 group"
                    >
                      <div className="space-y-2 flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2.5">
                          <span className="font-mono font-bold text-sm text-ry-onyx">{ord.id}</span>
                          <span className="text-ry-stone text-xs">•</span>
                          <span className="text-xs text-ry-stone">{ord.date || 'Recent order'}</span>
                          <span className="text-ry-stone text-xs">•</span>
                          <span className="font-serif font-medium text-xs text-ry-onyx">£{Number(ord.total || 0).toFixed(2)}</span>
                          <span
                            className={`px-2 py-0.5 text-[9px] uppercase tracking-editorial font-bold ${
                              isDispatched
                                ? 'bg-ry-onyx text-ry-white'
                                : 'bg-amber-100 text-amber-900 border border-amber-300'
                            }`}
                          >
                            {ord.fulfillment || 'Order Confirmed'}
                          </span>
                        </div>

                        <div className="text-xs text-ry-onyx font-medium truncate">
                          {ord.items || 'Atelier Selection'}
                        </div>

                        <div className="text-[11px] text-ry-stone flex flex-wrap items-center gap-x-4 gap-y-1">
                          <div>
                            Recipient: <strong className="text-ry-onyx font-normal">{ord.customer}</strong>
                          </div>
                          <div>Destination: {orderAddress}</div>
                          <div>
                            Courier: <strong className="text-ry-onyx font-normal">{ord.carrier || 'Priority Courier'}</strong>
                          </div>
                          {trackingNum && (
                            <div className="font-mono text-ry-onyx">
                              Tracking #: {trackingNum}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="shrink-0 flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            const shipment = buildShipmentFromOrder(ord);
                            setActiveShipment(shipment);
                            setSearchQuery(ord.trackingNumber || ord.id);
                            setSearchNotFound(false);
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                          }}
                          className="w-full sm:w-auto px-4 py-2.5 bg-ry-onyx hover:bg-ry-charcoal text-ry-white text-xs uppercase tracking-editorial font-medium transition-colors flex items-center justify-center gap-2 shadow-xs cursor-pointer"
                        >
                          <Truck className="w-3.5 h-3.5" />
                          <span>Track Delivery &rarr;</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="bg-ry-white border border-ry-ash/70 p-12 text-center shadow-xs">
                <Package className="w-10 h-10 text-ry-stone/50 mx-auto mb-3 stroke-[1.4]" />
                <h3 className="font-serif text-lg text-ry-onyx mb-1">No Orders on Record</h3>
                <p className="text-xs text-ry-stone max-w-sm mx-auto mb-6">
                  Enter your order reference (e.g. RY-96130) or carrier waybill in the search box above to track any live delivery.
                </p>
                <div className="flex flex-wrap justify-center gap-3">
                  <Link
                    href="/products"
                    className="px-5 py-2.5 bg-ry-onyx text-ry-white text-xs uppercase tracking-editorial font-medium hover:bg-ry-charcoal transition-colors"
                  >
                    Explore Sanctuary Formulations
                  </Link>
                  <Link
                    href="/login"
                    className="px-5 py-2.5 bg-ry-white border border-ry-ash text-ry-onyx text-xs uppercase tracking-editorial font-medium hover:bg-ry-pearl transition-colors"
                  >
                    Sign In to My Account
                  </Link>
                </div>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}

export default function TrackingPortalPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-ry-pearl pt-32 text-center text-xs text-ry-stone">
          Connecting to Branded Tracking Network...
        </div>
      }
    >
      <TrackingPortalContent />
    </Suspense>
  );
}
