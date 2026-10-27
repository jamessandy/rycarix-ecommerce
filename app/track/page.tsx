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
  Flame,
  Sparkles,
} from 'lucide-react';
import {
  lookupTracking,
  SHIPMENT_DATABASE,
  ShippingLabelData,
} from '@/lib/services/shippingAggregator';
import { PRODUCTS } from '@/lib/data/mockData';
import { useCartStore } from '@/lib/store/useCartStore';

function TrackingPortalContent() {
  const searchParams = useSearchParams();
  const initialRef = searchParams.get('ref') || searchParams.get('tracking') || '7829-1092-4821';

  const [searchQuery, setSearchQuery] = useState(initialRef);
  const [activeShipment, setActiveShipment] = useState<ShippingLabelData | null>(null);
  const [copied, setCopied] = useState(false);
  const [smsAlertsEnabled, setSmsAlertsEnabled] = useState(false);
  const [smsPhone, setSmsPhone] = useState('+1 (212) 555-0194');
  const [smsSubmitted, setSmsSubmitted] = useState(false);

  const { addItem, openCart } = useCartStore();

  useEffect(() => {
    const found = lookupTracking(initialRef);
    if (found) {
      setActiveShipment(found);
    }
  }, [initialRef]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    const result = lookupTracking(searchQuery);
    if (result) {
      setActiveShipment(result);
    } else {
      alert(`No shipment found matching "${searchQuery}". Showing demo shipment RY-84920.`);
      setActiveShipment(SHIPMENT_DATABASE['7829-1092-4821']);
    }
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
                placeholder="Enter tracking # or order # (e.g. RY-84920)"
                className="w-full pl-10 pr-4 py-3 bg-ry-white border border-ry-ash text-xs text-ry-onyx focus:outline-none focus:border-ry-onyx transition-colors placeholder-ry-stone"
              />
            </div>
            <button
              type="submit"
              className="px-6 py-3 bg-ry-onyx text-ry-white text-xs uppercase tracking-editorial font-medium hover:bg-ry-charcoal transition-colors shrink-0"
            >
              Track Package
            </button>
          </form>

          {/* Demo sample pills */}
          <div className="mt-3 flex items-center justify-center gap-2 text-[10px] text-ry-stone">
            <span>Try sample order:</span>
            <button
              type="button"
              onClick={() => {
                setSearchQuery('7829-1092-4821');
                setActiveShipment(SHIPMENT_DATABASE['7829-1092-4821']);
              }}
              className="underline hover:text-ry-onyx font-mono"
            >
              RY-84920 (Evri / Royal Mail)
            </button>
            <span>•</span>
            <button
              type="button"
              onClick={() => {
                setSearchQuery('DHL-9840-2811');
                setActiveShipment(SHIPMENT_DATABASE['DHL-9840-2811']);
              }}
              className="underline hover:text-ry-onyx font-mono"
            >
              RY-77218 (DHL Express)
            </button>
          </div>
        </div>

        {/* Active Shipment Display */}
        {activeShipment && (
          <div className="space-y-8 animate-fade-in">
            
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
                      {activeShipment.carrier} Priority
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
                  <div className="text-xs text-ry-charcoal leading-relaxed font-sans">
                    <div className="font-medium text-ry-onyx">{activeShipment.recipientAddress.name}</div>
                    <div>{activeShipment.recipientAddress.street}</div>
                    <div>
                      {activeShipment.recipientAddress.city}, {activeShipment.recipientAddress.state}{' '}
                      {activeShipment.recipientAddress.postalCode}
                    </div>
                    <div>{activeShipment.recipientAddress.country}</div>
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
                        placeholder="+1 (555) 000-0000"
                        className="w-full p-2.5 bg-ry-pearl border border-ry-ash text-xs text-ry-onyx focus:outline-none focus:border-ry-onyx"
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
