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
  Truck,
  Plus,
  X,
} from 'lucide-react';
import { useCartStore } from '@/lib/store/useCartStore';
import { useAuthStore, UserAddress } from '@/lib/store/useAuthStore';

function UserDashboardContent() {
  const [activeTab, setActiveTab] = useState<'orders' | 'wishlist' | 'addresses' | 'profile'>(
    'orders'
  );
  const { addItem, openCart, clearCart } = useCartStore();
  const { user, isAuthenticated, logout, updateProfile, addAddress } = useAuthStore();
  
  const searchParams = useSearchParams();
  const [showCheckoutSuccess, setShowCheckoutSuccess] = useState(false);
  const [paymentMethodParam, setPaymentMethodParam] = useState<string>('card');

  useEffect(() => {
    if (searchParams.get('checkout_simulated') === 'true' || searchParams.get('status') === 'success') {
      setShowCheckoutSuccess(true);
      clearCart();
      const method = searchParams.get('method') || 'card';
      setPaymentMethodParam(method);
    }
  }, [searchParams, clearCart]);

  // Profile Form State
  const [profileSaved, setProfileSaved] = useState(false);
  const [profileForm, setProfileForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
  });

  // Add Address Modal / State
  const [isAddingAddress, setIsAddingAddress] = useState(false);
  const [newAddress, setNewAddress] = useState({
    type: 'Primary Delivery Address',
    street: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'United Kingdom',
    isDefault: true,
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

  const handleAddAddressSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAddress.street || !newAddress.city || !newAddress.postalCode) return;
    addAddress(newAddress);
    setIsAddingAddress(false);
    setNewAddress({
      type: 'Secondary Address',
      street: '',
      city: '',
      state: '',
      postalCode: '',
      country: 'United Kingdom',
      isDefault: false,
    });
  };

  // Build active orders (including simulated purchase if checked out)
  const defaultAddr = user?.addresses?.find((a) => a.isDefault) || user?.addresses?.[0];
  const userOrders = showCheckoutSuccess
    ? [
        {
          id: 'ord-live-01',
          orderNumber: 'RY-84920',
          date: 'Just now',
          status: 'CONFIRMED',
          fulfillmentStatus: 'PREPARING_DISPATCH',
          carrier: 'Royal Mail Tracked 24 & Evri Express',
          trackingNumber: '7829-1092-4821',
          total: 135.0,
          currency: '£',
          deliveryAddress: defaultAddr
            ? `${defaultAddr.street}, ${defaultAddr.city} ${defaultAddr.postalCode}, ${defaultAddr.country}`
            : '18 Grosvenor Gardens, London SW1W 0DH, United Kingdom',
          paymentMethod: paymentMethodParam,
          items: [
            {
              title: 'L’Huile Sublime Regenerative Hair Nectar',
              variantTitle: '100ml / 3.4 fl. oz.',
              quantity: 1,
              price: 135.0,
              image: 'https://images.unsplash.com/photo-1608248597359-57e3f1638271?q=80&w=600&auto=format&fit=crop',
            },
          ],
          klarna:
            paymentMethodParam === 'klarna'
              ? {
                  totalInstallments: 3,
                  installmentsPaid: 1,
                  schedule: [
                    { index: 1, amount: 45.0, status: 'PAID', date: 'Today' },
                    { index: 2, amount: 45.0, status: 'PENDING', date: 'In 30 days' },
                    { index: 3, amount: 45.0, status: 'SCHEDULED', date: 'In 60 days' },
                  ],
                }
              : null,
          clearpay:
            paymentMethodParam === 'clearpay'
              ? {
                  totalInstallments: 4,
                  installmentsPaid: 1,
                  schedule: [
                    { index: 1, amount: 33.75, status: 'PAID', date: 'Today' },
                    { index: 2, amount: 33.75, status: 'PENDING', date: 'In 2 weeks' },
                    { index: 3, amount: 33.75, status: 'SCHEDULED', date: 'In 4 weeks' },
                    { index: 4, amount: 33.75, status: 'SCHEDULED', date: 'In 6 weeks' },
                  ],
                }
              : null,
        },
      ]
    : [];

  // If not authenticated, render welcoming prompt
  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen bg-ry-pearl text-ry-onyx pt-36 pb-24 px-4 flex flex-col items-center justify-center font-sans">
        {showCheckoutSuccess && (
          <div className="max-w-md w-full mb-6 p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center gap-3 animate-fade-in shadow-sm">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <div className="text-sm">
              <strong className="font-semibold block">Order Successfully Placed</strong>
              <span className="text-emerald-700/80 mt-0.5 block">
                Thank you for your purchase. Please log in or create an account to view and track your delivery.
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

          <div className="space-y-3">
            <Link
              href="/login?redirect=/dashboard/user"
              className="block w-full py-3.5 bg-ry-burgundy text-ry-white text-xs uppercase tracking-editorial font-medium hover:bg-ry-burgundyLight transition-colors"
            >
              Sign In to Your Account
            </Link>
            <Link
              href="/signup?redirect=/dashboard/user"
              className="block w-full py-3.5 bg-ry-white border border-ry-ash text-ry-onyx text-xs uppercase tracking-editorial font-medium hover:bg-ry-pearl transition-colors"
            >
              Register Account & Delivery Address
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-ry-pearl text-ry-onyx pt-28 pb-24 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Checkout Success Banner */}
        {showCheckoutSuccess && (
          <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center justify-between gap-3 animate-fade-in shadow-sm">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <div className="text-sm">
                <strong className="font-semibold block">Order Successfully Placed • Manifest Generated</strong>
                <span className="text-emerald-700/80 mt-0.5 block text-xs">
                  We have authorized your order and scheduled courier pickup via Royal Mail Tracked 24 & Evri.
                </span>
              </div>
            </div>
            <Link
              href="/track?ref=7829-1092-4821"
              className="px-4 py-2 bg-emerald-700 text-white text-xs uppercase tracking-editorial font-medium hover:bg-emerald-800 transition-colors shrink-0 flex items-center gap-1.5"
            >
              <Truck className="w-3.5 h-3.5" />
              <span>Track Live Delivery &rarr;</span>
            </Link>
          </div>
        )}

        {/* Dashboard Profile Header */}
        <div className="bg-ry-white border border-ry-ash/70 p-6 sm:p-8 mb-8 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-ry-wine text-ry-white font-serif text-2xl flex items-center justify-center border border-ry-burgundy shrink-0">
              {user.avatarInitial || 'C'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-serif text-2xl text-ry-onyx">{user.name}</h1>
                <span className="px-2 py-0.5 bg-ry-pearl border border-ry-ash text-[9px] uppercase tracking-editorial text-ry-charcoal font-medium">
                  {user.tier}
                </span>
              </div>
              <p className="text-xs text-ry-stone mt-0.5">{user.email}</p>
              {user.phone && <p className="text-xs text-ry-stone">{user.phone}</p>}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/track"
              className="px-4 py-2.5 bg-ry-pearl border border-ry-ash text-xs uppercase tracking-editorial hover:bg-ry-oatmeal transition-colors flex items-center gap-1.5"
            >
              <Truck className="w-3.5 h-3.5 text-ry-stone" />
              <span>Live Parcel Tracking</span>
            </Link>
            <button
              onClick={logout}
              className="px-4 py-2.5 border border-red-200 text-red-700 text-xs uppercase tracking-editorial hover:bg-red-50 transition-colors flex items-center gap-1.5"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-ry-ash mb-8 overflow-x-auto text-xs uppercase tracking-editorial font-medium">
          <button
            onClick={() => setActiveTab('orders')}
            className={`pb-4 px-4 transition-all relative shrink-0 ${
              activeTab === 'orders'
                ? 'text-ry-onyx border-b-2 border-ry-onyx'
                : 'text-ry-stone hover:text-ry-onyx'
            }`}
          >
            Orders & Tracking ({userOrders.length})
          </button>
          <button
            onClick={() => setActiveTab('addresses')}
            className={`pb-4 px-4 transition-all relative shrink-0 ${
              activeTab === 'addresses'
                ? 'text-ry-onyx border-b-2 border-ry-onyx'
                : 'text-ry-stone hover:text-ry-onyx'
            }`}
          >
            Delivery Addresses ({user.addresses?.length || 0})
          </button>
          <button
            onClick={() => setActiveTab('profile')}
            className={`pb-4 px-4 transition-all relative shrink-0 ${
              activeTab === 'profile'
                ? 'text-ry-onyx border-b-2 border-ry-onyx'
                : 'text-ry-stone hover:text-ry-onyx'
            }`}
          >
            Sanctuary Profile
          </button>
        </div>

        {/* TAB 1: ORDERS & TRACKING */}
        {activeTab === 'orders' && (
          <div className="space-y-8 animate-fade-in">
            {userOrders.length === 0 ? (
              <div className="bg-ry-white border border-ry-ash/70 p-12 text-center shadow-sm">
                <Package className="w-8 h-8 text-ry-stone/60 mx-auto mb-3 stroke-[1.4]" />
                <h3 className="font-serif text-xl text-ry-onyx mb-2">No Active Orders</h3>
                <p className="text-xs text-ry-stone max-w-sm mx-auto mb-6">
                  You have not placed any orders yet. Discover our restorative botanical hair elixirs, haute perfumes, and candles.
                </p>
                <div className="flex flex-wrap justify-center gap-3">
                  <Link
                    href="/category/hair"
                    className="px-5 py-2.5 bg-ry-burgundy text-ry-white text-xs uppercase tracking-editorial font-medium hover:bg-ry-burgundyLight transition-colors"
                  >
                    Shop Hair Care
                  </Link>
                  <Link
                    href="/category/candles"
                    className="px-5 py-2.5 bg-ry-white border border-ry-ash text-ry-onyx text-xs uppercase tracking-editorial font-medium hover:bg-ry-pearl transition-colors"
                  >
                    Shop Candles & Living
                  </Link>
                </div>
              </div>
            ) : (
              userOrders.map((order) => (
                <div key={order.id} className="bg-ry-white border border-ry-ash/70 overflow-hidden shadow-sm">
                  {/* Order Top Bar */}
                  <div className="p-6 bg-ry-pearl/50 border-b border-ry-ash/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
                    <div className="flex flex-wrap items-center gap-4 sm:gap-6">
                      <div>
                        <span className="text-[10px] uppercase tracking-editorial text-ry-stone block">Order Date</span>
                        <span className="font-medium text-ry-onyx">{order.date}</span>
                      </div>
                      <div>
                        <span className="text-[10px] uppercase tracking-editorial text-ry-stone block">Order Number</span>
                        <span className="font-mono font-medium text-ry-onyx">{order.orderNumber}</span>
                      </div>
                      <div>
                        <span className="text-[10px] uppercase tracking-editorial text-ry-stone block">Total Amount</span>
                        <span className="font-serif font-medium text-ry-onyx">£{order.total.toFixed(2)}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="px-3 py-1 bg-ry-burgundy text-ry-white text-[10px] uppercase tracking-editorial font-medium">
                        {order.status}
                      </span>
                    </div>
                  </div>

                  {/* Order Items */}
                  <div className="p-6 divide-y divide-ry-ash/40">
                    {order.items.map((item, idx) => (
                      <div key={idx} className="flex gap-4 py-3 first:pt-0 last:pb-0">
                        <div className="relative w-16 h-20 bg-ry-oatmeal overflow-hidden border border-ry-ash/50 shrink-0">
                          <Image src={item.image} alt={item.title} fill sizes="64px" className="object-cover" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-serif text-base text-ry-onyx">{item.title}</h4>
                          <p className="text-xs text-ry-stone">{item.variantTitle}</p>
                          <div className="text-xs font-mono text-ry-charcoal mt-1">
                            Qty: {item.quantity} • £{item.price.toFixed(2)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Klarna Installment Tracking Widget (3 Payments) */}
                  {order.klarna && (
                    <div className="p-6 bg-[#FFF2F7]/30 border-t border-ry-ash/60">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-2">
                        <div className="flex items-center gap-2">
                          <span className="bg-[#FFA8CD] text-black font-bold text-xs px-2 py-0.5 rounded-sm">
                            Klarna.
                          </span>
                          <h5 className="font-serif text-sm text-ry-onyx">
                            Pay in 3 Schedule ({order.klarna.installmentsPaid} of {order.klarna.totalInstallments} Paid)
                          </h5>
                        </div>
                        <span className="text-[11px] text-ry-stone font-sans">
                          0% APR • Automated Auto-Debit
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        {order.klarna.schedule.map((step) => (
                          <div
                            key={step.index}
                            className={`p-3 border text-xs ${
                              step.status === 'PAID'
                                ? 'bg-ry-white border-emerald-300'
                                : 'bg-ry-pearl border-ry-ash/60'
                            }`}
                          >
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-[10px] uppercase tracking-editorial text-ry-stone">
                                Payment {step.index} (of 3)
                              </span>
                              {step.status === 'PAID' ? (
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                              ) : (
                                <Clock className="w-3.5 h-3.5 text-amber-600" />
                              )}
                            </div>
                            <div className="font-mono text-sm font-semibold text-ry-onyx">
                              £{step.amount.toFixed(2)}
                            </div>
                            <div className="text-[10px] text-ry-stone mt-1">
                              {step.status === 'PAID' ? 'Paid' : 'Due'} {step.date}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Clearpay Installment Tracking Widget (4 Payments) */}
                  {order.clearpay && (
                    <div className="p-6 bg-[#E6F9F5]/30 border-t border-ry-ash/60">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-2">
                        <div className="flex items-center gap-2">
                          <span className="bg-[#B2ECE1] text-black font-bold text-xs px-2 py-0.5 rounded-sm">
                            clearpay✦
                          </span>
                          <h5 className="font-serif text-sm text-ry-onyx">
                            Pay in 4 Schedule ({order.clearpay.installmentsPaid} of {order.clearpay.totalInstallments} Paid)
                          </h5>
                        </div>
                        <span className="text-[11px] text-ry-stone font-sans">
                          0% APR • Bi-weekly Schedule
                        </span>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {order.clearpay.schedule.map((step) => (
                          <div
                            key={step.index}
                            className={`p-3 border text-xs ${
                              step.status === 'PAID'
                                ? 'bg-ry-white border-emerald-300'
                                : 'bg-ry-pearl border-ry-ash/60'
                            }`}
                          >
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-[10px] uppercase tracking-editorial text-ry-stone">
                                Payment {step.index} (of 4)
                              </span>
                              {step.status === 'PAID' ? (
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                              ) : (
                                <Clock className="w-3.5 h-3.5 text-amber-600" />
                              )}
                            </div>
                            <div className="font-mono text-sm font-semibold text-ry-onyx">
                              £{step.amount.toFixed(2)}
                            </div>
                            <div className="text-[10px] text-ry-stone mt-1">
                              {step.status === 'PAID' ? 'Paid' : 'Due'} {step.date}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Shipping & Courier Dispatch Footer */}
                  <div className="p-4 bg-ry-oatmeal/60 border-t border-ry-ash/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                    <div>
                      <div className="flex items-center gap-2 text-ry-charcoal">
                        <Truck className="w-4 h-4 text-ry-onyx" />
                        <span>Carrier: <strong>{order.carrier}</strong></span>
                      </div>
                      <div className="text-[11px] text-ry-stone mt-0.5">
                        Delivering to: {order.deliveryAddress}
                      </div>
                    </div>

                    <Link
                      href={`/track?ref=${encodeURIComponent(order.trackingNumber)}`}
                      className="px-4 py-2 bg-ry-burgundy text-ry-white text-xs uppercase tracking-editorial font-medium hover:bg-ry-burgundyLight transition-colors shrink-0 flex items-center gap-1.5"
                    >
                      <span>Track Shipment #{order.trackingNumber}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* TAB 2: DELIVERY ADDRESSES */}
        {activeTab === 'addresses' && (
          <div className="space-y-6 animate-fade-in">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-serif text-xl">Saved Delivery Addresses</h3>
                <p className="text-xs text-ry-stone">Used automatically to prefill checkout and generate courier manifests.</p>
              </div>
              <button
                onClick={() => setIsAddingAddress(true)}
                className="px-4 py-2 bg-ry-burgundy text-ry-white text-xs uppercase tracking-editorial font-medium hover:bg-ry-burgundyLight transition-colors flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Address</span>
              </button>
            </div>

            {/* Address Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {user.addresses && user.addresses.length > 0 ? (
                user.addresses.map((addr) => (
                  <div key={addr.id} className="bg-ry-white border border-ry-onyx p-6 relative shadow-xs">
                    {addr.isDefault && (
                      <span className="absolute top-4 right-4 bg-ry-burgundy text-ry-white text-[9px] uppercase tracking-editorial px-2 py-0.5 font-medium">
                        Default Delivery
                      </span>
                    )}
                    <h4 className="font-serif text-lg mb-2">{addr.type || 'Delivery Address'}</h4>
                    <p className="text-xs text-ry-stone leading-relaxed font-sans">
                      <strong className="text-ry-onyx block mb-1">{user.name}</strong>
                      {addr.street} <br />
                      {addr.city}, {addr.state} {addr.postalCode} <br />
                      {addr.country} <br />
                      {user.phone && <span className="block mt-1">Phone: {user.phone}</span>}
                    </p>
                  </div>
                ))
              ) : (
                <div className="bg-ry-white border border-ry-ash p-8 text-center col-span-2">
                  <MapPin className="w-8 h-8 text-ry-stone mx-auto mb-2" />
                  <h4 className="font-serif text-lg mb-1">No Delivery Address Saved</h4>
                  <p className="text-xs text-ry-stone mb-4">Add your shipping address to enable one-click courier dispatch.</p>
                  <button
                    onClick={() => setIsAddingAddress(true)}
                    className="px-5 py-2.5 bg-ry-burgundy text-ry-white text-xs uppercase tracking-editorial hover:bg-ry-burgundyLight transition-colors"
                  >
                    Add Address Now
                  </button>
                </div>
              )}
            </div>

            {/* Modal for Adding New Address */}
            {isAddingAddress && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
                <div className="bg-ry-white p-6 sm:p-8 border border-ry-ash shadow-2xl max-w-lg w-full relative">
                  <button
                    onClick={() => setIsAddingAddress(false)}
                    className="absolute top-4 right-4 text-ry-stone hover:text-ry-onyx"
                  >
                    <X className="w-5 h-5" />
                  </button>
                  <h3 className="font-serif text-2xl mb-1">Add Delivery Address</h3>
                  <p className="text-xs text-ry-stone mb-4">Provide details for express courier dispatch.</p>

                  <form onSubmit={handleAddAddressSubmit} className="space-y-4 text-xs font-sans">
                    <div>
                      <label className="block text-[10px] uppercase tracking-editorial text-ry-stone mb-1">
                        Address Label
                      </label>
                      <input
                        type="text"
                        value={newAddress.type}
                        onChange={(e) => setNewAddress({ ...newAddress, type: e.target.value })}
                        placeholder="e.g. Primary Residence or Office"
                        className="w-full bg-ry-pearl border border-ry-ash p-2.5 text-xs focus:outline-none focus:border-ry-onyx"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] uppercase tracking-editorial text-ry-stone mb-1">
                        Street Address *
                      </label>
                      <input
                        type="text"
                        required
                        value={newAddress.street}
                        onChange={(e) => setNewAddress({ ...newAddress, street: e.target.value })}
                        placeholder="Flat 4B, 18 Grosvenor Gardens"
                        className="w-full bg-ry-pearl border border-ry-ash p-2.5 text-xs focus:outline-none focus:border-ry-onyx"
                      />
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      <div className="col-span-1">
                        <label className="block text-[10px] uppercase tracking-editorial text-ry-stone mb-1">
                          City / Town *
                        </label>
                        <input
                          type="text"
                          required
                          value={newAddress.city}
                          onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                          placeholder="London"
                          className="w-full bg-ry-pearl border border-ry-ash p-2.5 text-xs focus:outline-none focus:border-ry-onyx"
                        />
                      </div>
                      <div className="col-span-1">
                        <label className="block text-[10px] uppercase tracking-editorial text-ry-stone mb-1">
                          County / Region
                        </label>
                        <input
                          type="text"
                          value={newAddress.state}
                          onChange={(e) => setNewAddress({ ...newAddress, state: e.target.value })}
                          placeholder="London"
                          className="w-full bg-ry-pearl border border-ry-ash p-2.5 text-xs focus:outline-none focus:border-ry-onyx"
                        />
                      </div>
                      <div className="col-span-1">
                        <label className="block text-[10px] uppercase tracking-editorial text-ry-stone mb-1">
                          Postcode *
                        </label>
                        <input
                          type="text"
                          required
                          value={newAddress.postalCode}
                          onChange={(e) => setNewAddress({ ...newAddress, postalCode: e.target.value })}
                          placeholder="SW1W 0DH"
                          className="w-full bg-ry-pearl border border-ry-ash p-2.5 text-xs focus:outline-none focus:border-ry-onyx"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] uppercase tracking-editorial text-ry-stone mb-1">
                        Country *
                      </label>
                      <select
                        value={newAddress.country}
                        onChange={(e) => setNewAddress({ ...newAddress, country: e.target.value })}
                        className="w-full bg-ry-pearl border border-ry-ash p-2.5 text-xs focus:outline-none focus:border-ry-onyx"
                      >
                        <option value="United Kingdom">United Kingdom</option>
                        <option value="United States">United States</option>
                        <option value="France">France</option>
                        <option value="Germany">Germany</option>
                        <option value="Canada">Canada</option>
                        <option value="Australia">Australia</option>
                      </select>
                    </div>

                    <div className="flex items-center gap-2 pt-2">
                      <input
                        type="checkbox"
                        id="isDefault"
                        checked={newAddress.isDefault}
                        onChange={(e) => setNewAddress({ ...newAddress, isDefault: e.target.checked })}
                      />
                      <label htmlFor="isDefault" className="text-xs text-ry-stone">
                        Set as primary default delivery address
                      </label>
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t border-ry-ash/40">
                      <button
                        type="button"
                        onClick={() => setIsAddingAddress(false)}
                        className="px-4 py-2 border border-ry-ash text-xs uppercase tracking-editorial"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-6 py-2 bg-ry-burgundy text-ry-white text-xs uppercase tracking-editorial font-medium hover:bg-ry-burgundyLight transition-colors"
                      >
                        Save Address
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: SANCTUARY PROFILE */}
        {activeTab === 'profile' && (
          <div className="bg-ry-white border border-ry-ash/70 p-6 sm:p-8 max-w-2xl animate-fade-in space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="font-serif text-xl">Sanctuary Account Details</h3>
              {profileSaved && (
                <span className="text-xs text-emerald-700 bg-emerald-50 px-3 py-1 border border-emerald-200 animate-fade-in">
                  Account details updated
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
                  Phone (for Evri & Royal Mail SMS delivery alerts)
                </label>
                <input
                  type="tel"
                  value={profileForm.phone}
                  onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                  placeholder="+44 7700 900077"
                  className="w-full bg-ry-pearl border border-ry-ash p-3 focus:outline-none focus:border-ry-onyx"
                />
              </div>

              <button
                type="submit"
                className="px-6 py-3 bg-ry-burgundy text-ry-white text-xs uppercase tracking-editorial font-medium hover:bg-ry-burgundyLight transition-colors"
              >
                Save Sanctuary Profile
              </button>
            </form>
          </div>
        )}

      </div>
    </div>
  );
}

export default function UserDashboardPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-ry-pearl pt-32 text-center text-xs text-ry-stone">Loading Sanctuary Dashboard...</div>}>
      <UserDashboardContent />
    </Suspense>
  );
}
