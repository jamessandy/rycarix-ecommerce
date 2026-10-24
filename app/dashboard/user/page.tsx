'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  Package,
  Calendar,
  CreditCard,
  MapPin,
  Heart,
  User,
  ShieldCheck,
  CheckCircle2,
  Clock,
  ArrowRight,
  ExternalLink,
  ChevronRight,
  Sparkles,
  LogOut,
  KeyRound,
} from 'lucide-react';
import { useCartStore } from '@/lib/store/useCartStore';
import { useAuthStore } from '@/lib/store/useAuthStore';

const MOCK_ORDERS: any[] = [];
const MOCK_WISHLIST: any[] = [];

function UserDashboardContent() {
  const [activeTab, setActiveTab] = useState<'orders' | 'wishlist' | 'addresses' | 'profile'>(
    'orders'
  );
  const { addItem, openCart, clearCart } = useCartStore();
  const { user, isAuthenticated, logout, loginAsDemo, updateProfile } = useAuthStore();
  
  const searchParams = useSearchParams();
  const [showCheckoutSuccess, setShowCheckoutSuccess] = useState(false);

  useEffect(() => {
    if (searchParams.get('checkout_simulated') === 'true' || searchParams.get('status') === 'success') {
      setShowCheckoutSuccess(true);
      clearCart();
    }
  }, [searchParams, clearCart]);

  const [profileSaved, setProfileSaved] = useState(false);
  const [profileForm, setProfileForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
  });

  const handleProfileSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({
      name: profileForm.name,
      email: profileForm.email,
      phone: profileForm.phone,
      avatarInitial: profileForm.name.charAt(0).toUpperCase(),
    });
    setProfileSaved(true);
    setTimeout(() => setProfileSaved(false), 3000);
  };

  // If not authenticated, render welcoming prompt
  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen bg-ry-pearl text-ry-onyx pt-36 pb-24 px-4 flex flex-col items-center justify-center font-sans">
        
        {/* Checkout Success Banner for Guests */}
        {showCheckoutSuccess && (
          <div className="max-w-md w-full mb-6 p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center gap-3 animate-fade-in shadow-sm">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <div className="text-sm">
              <strong className="font-semibold block">Order Successfully Placed</strong>
              <span className="text-emerald-700/80 mt-0.5 block">
                Thank you for your purchase. Please log in or create an account below to track your shipment.
              </span>
            </div>
          </div>
        )}

        <div className="max-w-md w-full bg-ry-white border border-ry-ash/80 p-8 sm:p-10 text-center shadow-lg">
          <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-ry-pearl border border-ry-ash flex items-center justify-center font-serif text-xl">
            <User className="w-6 h-6 stroke-[1.4]" />
          </div>
          <span className="text-[10px] uppercase tracking-[0.3em] text-ry-stone block mb-2">
            Client Sanctuary
          </span>
          <h2 className="font-serif text-2xl text-ry-onyx mb-3">
            Sign In Required
          </h2>
          <p className="text-xs text-ry-stone leading-relaxed mb-6">
            Please sign in to view your private order archive, track live courier dispatches, and access saved delivery addresses.
          </p>

          <Link
            href="/login?redirect=/dashboard/user"
            className="block w-full py-3.5 bg-ry-burgundy text-ry-white text-xs uppercase tracking-editorial font-medium hover:bg-ry-burgundyLight transition-colors"
          >
            Sign In to Your Account
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-ry-pearl text-ry-onyx pt-28 pb-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Checkout Success Banner */}
        {showCheckoutSuccess && (
          <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center gap-3 animate-fade-in shadow-sm">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <div className="text-sm">
              <strong className="font-semibold block">Order Successfully Placed</strong>
              <span className="text-emerald-700/80 mt-0.5 block">
                Thank you for your purchase. We have received your order and are preparing it for shipment.
              </span>
            </div>
            <button 
              onClick={() => setShowCheckoutSuccess(false)}
              className="ml-auto text-emerald-600 hover:text-emerald-800"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Customer Profile Header */}
        <div className="bg-ry-white border border-ry-ash/70 p-6 sm:p-10 mb-10 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 rounded-full bg-ry-oatmeal flex items-center justify-center font-serif text-2xl text-ry-onyx border border-ry-ash">
              {user.avatarInitial || 'U'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-serif text-2xl sm:text-3xl text-ry-onyx">
                  {user.name}
                </h1>
                <span className="bg-ry-burgundy text-ry-white text-[9px] uppercase tracking-editorial px-2 py-0.5">
                  {user.title}
                </span>
              </div>
              <p className="text-xs text-ry-stone mt-1 font-sans">
                {user.email} • Customer since {user.memberSince}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-xs font-sans">
            <div className="px-4 py-2.5 bg-ry-pearl border border-ry-ash text-ry-charcoal">
              <span className="text-[10px] uppercase tracking-editorial text-ry-stone block">
                Active Orders
              </span>
              <strong className="text-sm font-serif">1 In Transit</strong>
            </div>
            <div className="px-4 py-2.5 bg-[#FFF2F7] border border-[#FFA8CD]/40 text-ry-charcoal">
              <span className="text-[10px] uppercase tracking-editorial text-[#992255] block">
                Klarna Installments
              </span>
              <strong className="text-sm font-serif text-ry-onyx">2 Payments Left</strong>
            </div>
            <button
              onClick={() => logout()}
              className="p-2.5 border border-ry-ash/70 hover:bg-red-50 hover:text-red-700 hover:border-red-200 transition-colors"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Dashboard Navigation Tabs */}
        <div className="flex border-b border-ry-ash mb-8 overflow-x-auto text-xs uppercase tracking-editorial font-sans">
          <button
            onClick={() => setActiveTab('orders')}
            className={`pb-4 px-4 font-medium transition-all relative shrink-0 ${
              activeTab === 'orders'
                ? 'text-ry-onyx border-b-2 border-ry-onyx'
                : 'text-ry-stone hover:text-ry-onyx'
            }`}
          >
            Orders & Payments ({MOCK_ORDERS.length})
          </button>
          <button
            onClick={() => setActiveTab('wishlist')}
            className={`pb-4 px-4 font-medium transition-all relative shrink-0 ${
              activeTab === 'wishlist'
                ? 'text-ry-onyx border-b-2 border-ry-onyx'
                : 'text-ry-stone hover:text-ry-onyx'
            }`}
          >
            Wishlist ({MOCK_WISHLIST.length})
          </button>
          <button
            onClick={() => setActiveTab('addresses')}
            className={`pb-4 px-4 font-medium transition-all relative shrink-0 ${
              activeTab === 'addresses'
                ? 'text-ry-onyx border-b-2 border-ry-onyx'
                : 'text-ry-stone hover:text-ry-onyx'
            }`}
          >
            Shipping Addresses
          </button>
          <button
            onClick={() => setActiveTab('profile')}
            className={`pb-4 px-4 font-medium transition-all relative shrink-0 ${
              activeTab === 'profile'
                ? 'text-ry-onyx border-b-2 border-ry-onyx'
                : 'text-ry-stone hover:text-ry-onyx'
            }`}
          >
            Account Details
          </button>
        </div>

        {/* Tab 1: Orders & Klarna Tracking */}
        {activeTab === 'orders' && (
          <div className="space-y-8 animate-fade-in">
            {MOCK_ORDERS.length === 0 ? (
              <div className="bg-ry-white border border-ry-ash/70 p-12 text-center shadow-sm">
                <Package className="w-8 h-8 text-ry-stone/60 mx-auto mb-3 stroke-[1.4]" />
                <h3 className="font-serif text-xl text-ry-onyx mb-2">No Orders Placed Yet</h3>
                <p className="text-xs text-ry-stone max-w-sm mx-auto mb-6">
                  You have not placed any orders yet. Discover our bespoke hair formulations and luxury perfumery.
                </p>
                <Link
                  href="/#catalog"
                  className="inline-block px-6 py-3 bg-ry-burgundy text-ry-white text-xs uppercase tracking-editorial font-medium hover:bg-ry-burgundyLight transition-colors"
                >
                  Explore Boutique Catalog
                </Link>
              </div>
            ) : (
              MOCK_ORDERS.map((order: any) => (
              <div
                key={order.id}
                className="bg-ry-white border border-ry-ash/70 overflow-hidden shadow-sm"
              >
                {/* Order Top Bar */}
                <div className="p-6 bg-ry-pearlDark/40 border-b border-ry-ash/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs font-sans">
                  <div className="flex flex-wrap items-center gap-4 sm:gap-6">
                    <div>
                      <span className="text-[10px] uppercase tracking-editorial text-ry-stone block">
                        Order Date
                      </span>
                      <span className="font-medium text-ry-onyx">{order.date}</span>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase tracking-editorial text-ry-stone block">
                        Order #
                      </span>
                      <span className="font-mono font-medium text-ry-onyx">{order.orderNumber}</span>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase tracking-editorial text-ry-stone block">
                        Total
                      </span>
                      <span className="font-serif font-medium text-ry-onyx">
                        ${order.total.toFixed(2)}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="px-3 py-1 bg-ry-burgundy text-ry-white text-[10px] uppercase tracking-editorial">
                      {order.status}
                    </span>
                    <button className="text-[11px] underline underline-offset-4 text-ry-stone hover:text-ry-onyx">
                      Download Invoice (PDF)
                    </button>
                  </div>
                </div>

                {/* Items in Order */}
                <div className="p-6 divide-y divide-ry-ash/40">
                  {order.items?.map((item: any, idx: number) => (
                    <div key={idx} className="flex gap-4 py-3 first:pt-0 last:pb-0">
                      <div className="relative w-16 h-20 bg-ry-oatmeal overflow-hidden border border-ry-ash/50 shrink-0">
                        <Image
                          src={item.image}
                          alt={item.title}
                          fill
                          sizes="64px"
                          className="object-cover"
                        />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-serif text-base text-ry-onyx">{item.title}</h4>
                        <p className="text-xs text-ry-stone">{item.variantTitle}</p>
                        <div className="text-xs font-mono text-ry-charcoal mt-1">
                          Qty: {item.quantity} • ${item.price.toFixed(2)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Klarna Installment Tracking Widget */}
                {order.klarna && (
                  <div className="p-6 bg-ry-pearl border-t border-ry-ash/60">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-2">
                      <div className="flex items-center gap-2">
                        <span className="bg-[#FFA8CD] text-black font-bold text-xs px-2 py-0.5 rounded-sm">
                          Klarna.
                        </span>
                        <h5 className="font-serif text-sm text-ry-onyx">
                          Payment Schedule ({order.klarna.installmentsPaid} of{' '}
                          {order.klarna.totalInstallments} Paid)
                        </h5>
                      </div>
                      <span className="text-[11px] text-ry-stone font-sans">
                        0% APR • Auto-debit
                      </span>
                    </div>

                    {/* Installments Visual Timeline */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {order.klarna.schedule?.map((step: any) => (
                        <div
                          key={step.index}
                          className={`p-3 border text-xs font-sans transition-all ${
                            step.status === 'PAID'
                              ? 'bg-ry-white border-emerald-300/80 shadow-xs'
                              : step.status === 'PENDING'
                              ? 'bg-amber-50/50 border-amber-300 shadow-xs'
                              : 'bg-ry-pearlDark/30 border-ry-ash/60 opacity-60'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="text-[10px] uppercase tracking-editorial text-ry-stone">
                              Payment {step.index}
                            </span>
                            {step.status === 'PAID' ? (
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            ) : (
                              <Clock className="w-3.5 h-3.5 text-amber-600" />
                            )}
                          </div>
                          <div className="font-mono text-sm font-semibold text-ry-onyx">
                            ${step.amount.toFixed(2)}
                          </div>
                          <div className="text-[10px] text-ry-stone mt-1">
                            {step.status === 'PAID' ? 'Paid on' : 'Due on'} {step.date}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Shipping & Delivery Status */}
                <div className="p-4 bg-ry-oatmeal/60 border-t border-ry-ash/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-sans">
                  <div className="flex items-center gap-2 text-ry-charcoal">
                    <Package className="w-4 h-4 text-ry-onyx" />
                    <span>
                      Shipping: <strong>{order.carrier}</strong> — {order.fulfillmentStatus}
                    </span>
                  </div>
                  <div className="text-ry-stone font-mono flex items-center gap-2">
                    <span>Tracking:</span>
                    <Link
                      href={`/track?ref=${encodeURIComponent(order.trackingNumber)}`}
                      className="text-ry-onyx font-medium underline hover:text-black flex items-center gap-1 group"
                    >
                      <span>{order.trackingNumber}</span>
                      <span className="text-[9px] bg-ry-burgundy text-ry-white px-1.5 py-0.5 uppercase tracking-wider group-hover:bg-ry-burgundyLight transition-colors ml-1 font-sans">
                        Track Delivery &rarr;
                      </span>
                    </Link>
                  </div>
                </div>

              </div>
            )))}
          </div>
        )}

        {/* Tab 2: Wishlist */}
        {activeTab === 'wishlist' && (
          <div>
            {MOCK_WISHLIST.length === 0 ? (
              <div className="bg-ry-white border border-ry-ash/70 p-12 text-center shadow-sm">
                <Sparkles className="w-8 h-8 text-ry-stone/60 mx-auto mb-3 stroke-[1.4]" />
                <h3 className="font-serif text-xl text-ry-onyx mb-2">Your Wishlist is Empty</h3>
                <p className="text-xs text-ry-stone max-w-sm mx-auto mb-6">
                  Save your favorite botanical hair elixirs and fragrances to access them here anytime.
                </p>
                <Link
                  href="/#catalog"
                  className="inline-block px-6 py-3 bg-ry-onyx text-ry-white text-xs uppercase tracking-editorial font-medium hover:bg-ry-charcoal transition-colors"
                >
                  Discover Formulations
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 animate-fade-in">
                {MOCK_WISHLIST.map((item: any) => (
                  <div
                    key={item.id}
                    className="bg-ry-white border border-ry-ash p-4 flex flex-col justify-between"
                  >
                    <div className="relative aspect-[3/4] bg-ry-oatmeal overflow-hidden mb-3">
                      <Image
                        src={item.image}
                        alt={item.title}
                        fill
                        sizes="300px"
                        className="object-cover"
                      />
                      <span className="absolute top-2 left-2 bg-ry-white/90 text-[8px] uppercase tracking-editorial px-2 py-0.5 text-ry-stone">
                        {item.category}
                      </span>
                    </div>
                    <div>
                      <h4 className="font-serif text-base text-ry-onyx">{item.title}</h4>
                      <div className="font-serif text-sm text-ry-onyx mt-1 mb-4">
                        ${item.price.toFixed(2)}
                      </div>
                      <button
                        onClick={() => {
                          addItem({
                            id: `${item.id}-default`,
                            productId: item.id,
                            variantId: 'default',
                            title: item.title,
                            variantTitle: 'Standard Edition',
                            sku: 'RY-WL-01',
                            price: item.price,
                            quantity: 1,
                            image: item.image,
                          });
                          openCart();
                        }}
                        className="w-full py-2.5 bg-ry-burgundy text-ry-white text-[10px] uppercase tracking-editorial hover:bg-ry-burgundyLight transition-colors"
                      >
                        Add to Cart
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Shipping Addresses */}
        {activeTab === 'addresses' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in">
            {user.addresses && user.addresses.length > 0 ? (
              user.addresses.map((addr) => (
                <div key={addr.id} className="bg-ry-white border border-ry-onyx p-6 relative">
                  {addr.isDefault && (
                    <span className="absolute top-4 right-4 bg-ry-burgundy text-ry-white text-[9px] uppercase tracking-editorial px-2 py-0.5">
                      Default Address
                    </span>
                  )}
                  <h4 className="font-serif text-lg mb-2">{addr.type || 'Primary Address'}</h4>
                  <p className="text-xs text-ry-stone leading-relaxed font-sans">
                    {user.name} <br />
                    {addr.street} <br />
                    {addr.city}, {addr.state} {addr.postalCode} <br />
                    {addr.country} <br />
                    {user.phone}
                  </p>
                  <div className="mt-6 pt-4 border-t border-ry-ash/50 flex gap-4 text-xs">
                    <button className="underline text-ry-stone hover:text-ry-onyx">Edit</button>
                    <button className="underline text-ry-stone hover:text-red-700">Delete</button>
                  </div>
                </div>
              ))
            ) : (
              <div className="bg-ry-white border border-ry-ash p-6 flex flex-col justify-between">
                <div>
                  <h4 className="font-serif text-lg mb-2 text-ry-onyx">Shipping Address</h4>
                  <p className="text-xs text-ry-stone leading-relaxed font-sans italic">
                    No primary shipping address saved yet. Save an address to enable one-click courier checkout.
                  </p>
                </div>
              </div>
            )}

            <div className="bg-ry-pearl border border-dashed border-ry-ash p-6 flex flex-col items-center justify-center text-center">
              <MapPin className="w-8 h-8 text-ry-stone mb-2 stroke-1" />
              <h4 className="font-serif text-base mb-1">Add New Address</h4>
              <p className="text-xs text-ry-stone mb-4 max-w-xs">
                Add an alternate shipping address for gifts or delivery.
              </p>
              <button className="px-5 py-2 border border-ry-burgundy text-xs uppercase tracking-editorial hover:bg-ry-burgundy hover:text-ry-white transition-colors">
                Add Address
              </button>
            </div>
          </div>
        )}

        {/* Tab 4: Account Details */}
        {activeTab === 'profile' && (
          <div className="bg-ry-white border border-ry-ash/70 p-6 sm:p-8 max-w-2xl animate-fade-in space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="font-serif text-xl">Account Details</h3>
              {profileSaved && (
                <span className="text-xs text-emerald-700 bg-emerald-50 px-3 py-1 border border-emerald-200 animate-fade-in">
                  Account details updated successfully
                </span>
              )}
            </div>

            <form onSubmit={handleProfileSave} className="space-y-4 text-xs font-sans">
              <div>
                <label className="block text-[10px] uppercase tracking-editorial text-ry-stone mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  value={profileForm.name}
                  onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                  className="w-full bg-ry-pearl border border-ry-ash p-3 focus:outline-none focus:border-ry-onyx"
                />
              </div>
              <div>
                <label className="block text-[10px] uppercase tracking-editorial text-ry-stone mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  value={profileForm.email}
                  onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                  className="w-full bg-ry-pearl border border-ry-ash p-3 focus:outline-none focus:border-ry-onyx"
                />
              </div>
              <div>
                <label className="block text-[10px] uppercase tracking-editorial text-ry-stone mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={profileForm.phone}
                  onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                  className="w-full bg-ry-pearl border border-ry-ash p-3 focus:outline-none focus:border-ry-onyx"
                />
              </div>
              <button
                type="submit"
                className="py-3 px-6 bg-ry-burgundy text-ry-white text-[11px] uppercase tracking-editorial hover:bg-ry-burgundyLight transition-colors"
              >
                Save Changes
              </button>
            </form>
          </div>
        )}

      </div>
    </div>
  );
}

export default function UserDashboard() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-ry-pearl pt-32 text-center text-xs text-ry-stone">Loading...</div>}>
      <UserDashboardContent />
    </Suspense>
  );
}
