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

  // Load persisted orders from live Stripe API and localStorage
  const [userOrders, setUserOrders] = useState<any[]>([]);
  const [adminOrdersView, setAdminOrdersView] = useState<'all' | 'personal'>('all');
  const defaultAddr = user?.addresses?.find((a) => a.isDefault) || user?.addresses?.[0];

  const personalOrders = userOrders.filter(
    (o) => (o.email || '').toLowerCase() === (user?.email || '').toLowerCase()
  );
  const displayedOrders =
    user?.role === 'ADMIN' ? (adminOrdersView === 'personal' ? personalOrders : userOrders) : userOrders;

  useEffect(() => {
    let localList: any[] = [];
    try {
      const raw = localStorage.getItem('rycarix_orders');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) localList = parsed;
      }
    } catch (err) {
      console.warn('Could not load saved orders', err);
    }

    const fetchLiveOrders = async () => {
      try {
        const query = user?.role === 'ADMIN' ? '' : user?.email ? `?email=${encodeURIComponent(user.email)}` : '';
        const res = await fetch(`/api/orders${query}`);
        if (res.ok) {
          const data = await res.json();
          if (data.orders && Array.isArray(data.orders) && data.orders.length > 0) {
            const combined = [...data.orders];
            for (let i = 0; i < combined.length; i++) {
              const c = combined[i];
              const match = localList.find((l) => l.id === c.id || (c.stripeSessionId && c.stripeSessionId === l.stripeSessionId));
              if (match) {
                if (!c.phone && match.phone) {
                  c.phone = match.phone;
                  if (c.address) c.address.phone = match.phone;
                }
                // NEVER REVERT DISPATCH STATUS
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
              if (!c.phone && user?.phone && c.email?.toLowerCase() === user?.email?.toLowerCase()) {
                c.phone = user.phone;
                if (c.address) c.address.phone = user.phone;
              }
            }
            for (const l of localList) {
              if (!combined.some((c) => c.id === l.id || (c.stripeSessionId && c.stripeSessionId === l.stripeSessionId))) {
                combined.push(l);
              }
            }
            setUserOrders(combined);
            try {
              localStorage.setItem('rycarix_orders', JSON.stringify(combined));
            } catch (e) {}
            return;
          }
        }
      } catch (e) {
        console.warn('Could not fetch orders from API', e);
      }

      if (localList.length > 0) {
        setUserOrders(localList);
        return;
      }

      // If no saved orders but checkout was just completed, create and persist a record
      if (showCheckoutSuccess) {
        const fallbackOrder = {
          id: searchParams.get('orderId') || 'RY-84920',
          orderNumber: searchParams.get('orderId') || 'RY-84920',
          date: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
          status: 'CONFIRMED',
          fulfillment: 'Ready for Dispatch',
          carrier: 'Royal Mail Tracked 24 & Evri Express',
          trackingNumber: '7829-1092-4821',
          total: 135.0,
          paymentMethod:
            paymentMethodParam === 'klarna'
              ? 'Klarna Pay in 3'
              : paymentMethodParam === 'clearpay'
              ? 'Clearpay Pay in 4'
              : 'Stripe Card (1-Click)',
          address: defaultAddr
            ? {
                street: defaultAddr.street,
                city: defaultAddr.city,
                state: defaultAddr.state,
                postalCode: defaultAddr.postalCode,
                country: defaultAddr.country,
              }
            : {
                street: '18 Grosvenor Gardens',
                city: 'London',
                state: 'Greater London',
                postalCode: 'SW1W 0DH',
                country: 'United Kingdom',
              },
          itemsList: [
            {
              title: 'Order Item',
              variantTitle: 'Standard',
              quantity: 1,
              price: 135.0,
              image: 'https://images.unsplash.com/photo-1608248597359-57e3f1638271?q=80&w=600&auto=format&fit=crop',
            },
          ],
        };
        setUserOrders([fallbackOrder]);
        try {
          localStorage.setItem('rycarix_orders', JSON.stringify([fallbackOrder]));
        } catch (e) {}
      }
    };

    fetchLiveOrders();
  }, [showCheckoutSuccess, paymentMethodParam, defaultAddr, searchParams, user]);

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
            Orders & Tracking ({displayedOrders.length})
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
          <div className="space-y-6 animate-fade-in">
            {/* Administrator Mode Switcher Bar */}
            {user?.role === 'ADMIN' && (
              <div className="p-4 bg-ry-pearl border border-ry-ash/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs shadow-xs">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-2 py-0.5 bg-ry-onyx text-ry-white text-[9px] uppercase tracking-editorial font-bold">
                      Admin Access
                    </span>
                    <span className="font-medium text-ry-onyx">Store Orders & Personal Orders</span>
                  </div>
                  <p className="text-[11px] text-ry-stone">
                    Signed in as Store Administrator ({user.email}). Toggle between all store orders and your personal purchases.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => setAdminOrdersView('all')}
                    className={`px-3 py-1.5 text-[10px] uppercase tracking-editorial font-medium border transition-colors ${
                      adminOrdersView === 'all'
                        ? 'bg-ry-onyx text-ry-white border-ry-onyx shadow-xs'
                        : 'bg-white text-ry-onyx border-ry-ash hover:bg-ry-pearl'
                    }`}
                  >
                    All Store Orders ({userOrders.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setAdminOrdersView('personal')}
                    className={`px-3 py-1.5 text-[10px] uppercase tracking-editorial font-medium border transition-colors ${
                      adminOrdersView === 'personal'
                        ? 'bg-ry-onyx text-ry-white border-ry-onyx shadow-xs'
                        : 'bg-white text-ry-onyx border-ry-ash hover:bg-ry-pearl'
                    }`}
                  >
                    My Personal Orders ({personalOrders.length})
                  </button>
                  <Link
                    href="/dashboard/admin"
                    className="px-3.5 py-1.5 bg-ry-burgundy text-ry-white text-[10px] uppercase tracking-editorial font-semibold hover:bg-ry-burgundyLight transition-colors flex items-center gap-1.5 shadow-xs"
                  >
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Fulfillment Ledger &rarr;</span>
                  </Link>
                </div>
              </div>
            )}

            {displayedOrders.length === 0 ? (
              <div className="bg-ry-white border border-ry-ash/70 p-12 text-center shadow-sm">
                <Package className="w-8 h-8 text-ry-stone/60 mx-auto mb-3 stroke-[1.4]" />
                <h3 className="font-serif text-xl text-ry-onyx mb-2">No Active Orders</h3>
                <p className="text-xs text-ry-stone max-w-sm mx-auto mb-6">
                  {user?.role === 'ADMIN' && adminOrdersView === 'personal'
                    ? 'You have not placed any personal orders as Store Administrator. Switch to "All Store Orders" above to inspect incoming orders.'
                    : 'You have not placed any orders yet. Discover our restorative botanical hair elixirs, haute perfumes, and candles.'}
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
              displayedOrders.map((order: any, orderIdx: number) => {
                const orderItems = order.itemsList || order.items || [];
                const orderAddress = order.address
                  ? `${order.address.street}, ${order.address.city} ${order.address.postalCode}, ${order.address.country}`
                  : order.deliveryAddress || 'Address on file';
                const orderNumber = order.orderNumber || order.id || `RY-${orderIdx + 1}`;
                const orderDate = order.date || 'Recently';
                const orderStatus = order.status || order.fulfillment || 'CONFIRMED';
                const orderTotal = typeof order.total === 'number' ? order.total : 0;
                const orderCarrier = order.carrier || 'Royal Mail Tracked 24 & Evri Express';
                const orderTracking = order.trackingNumber || '';
                const orderPayment = order.paymentMethod || 'Card';

                return (
                  <div key={order.id || orderIdx} className="bg-ry-white border border-ry-ash/70 overflow-hidden shadow-sm">
                    {/* Order Top Bar */}
                    <div className="p-6 bg-ry-pearl/50 border-b border-ry-ash/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
                      <div className="flex flex-wrap items-center gap-4 sm:gap-6">
                        <div>
                          <span className="text-[10px] uppercase tracking-editorial text-ry-stone block">Order Date</span>
                          <span className="font-medium text-ry-onyx">{orderDate}</span>
                        </div>
                        <div>
                          <span className="text-[10px] uppercase tracking-editorial text-ry-stone block">Order Number</span>
                          <span className="font-mono font-medium text-ry-onyx">{orderNumber}</span>
                        </div>
                        <div>
                          <span className="text-[10px] uppercase tracking-editorial text-ry-stone block">Total Amount</span>
                          <span className="font-serif font-medium text-ry-onyx">£{orderTotal.toFixed(2)}</span>
                        </div>
                        <div>
                          <span className="text-[10px] uppercase tracking-editorial text-ry-stone block">Payment</span>
                          <span className="font-medium text-ry-onyx">{orderPayment}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="px-3 py-1 bg-ry-burgundy text-ry-white text-[10px] uppercase tracking-editorial font-medium">
                          {orderStatus}
                        </span>
                      </div>
                    </div>

                    {/* Order Items */}
                    <div className="p-6 divide-y divide-ry-ash/40">
                      {orderItems.map((item: any, idx: number) => (
                        <div key={idx} className="flex gap-4 py-3 first:pt-0 last:pb-0">
                          <div className="relative w-16 h-20 bg-ry-oatmeal overflow-hidden border border-ry-ash/50 shrink-0">
                            {item.image ? (
                              <Image src={item.image} alt={item.title || 'Product'} fill sizes="64px" className="object-cover" />
                            ) : (
                              <div className="w-full h-full bg-ry-pearl" />
                            )}
                          </div>
                          <div className="flex-1">
                            <h4 className="font-serif text-base text-ry-onyx">{item.title}</h4>
                            <p className="text-xs text-ry-stone">{item.variantTitle}</p>
                            <div className="text-xs font-mono text-ry-charcoal mt-1">
                              Qty: {item.quantity} • £{(typeof item.price === 'number' ? item.price : 0).toFixed(2)}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Installment Payment Notice (simple message, no timeline) */}
                    {(orderPayment.toLowerCase().includes('klarna') || orderPayment.toLowerCase().includes('clearpay')) && (
                      <div className="px-6 py-4 bg-ry-pearl/40 border-t border-ry-ash/60 flex items-center gap-3">
                        <div className="flex items-center gap-2">
                          {orderPayment.toLowerCase().includes('klarna') && (
                            <span className="bg-[#FFA8CD] text-black font-bold text-xs px-2 py-0.5 rounded-sm">Klarna.</span>
                          )}
                          {orderPayment.toLowerCase().includes('clearpay') && (
                            <span className="bg-[#B2ECE1] text-black font-bold text-xs px-2 py-0.5 rounded-sm">clearpay✦</span>
                          )}
                        </div>
                        <p className="text-xs text-ry-stone">
                          You are paying installmentally with{' '}
                          <strong className="text-ry-onyx">
                            {orderPayment.toLowerCase().includes('klarna') ? 'Klarna (Pay in 3)' : 'Clearpay (Pay in 4)'}
                          </strong>
                          . 0% interest, no hidden fees.
                        </p>
                      </div>
                    )}

                    {/* Shipping & Courier Dispatch Footer */}
                    <div className="p-4 bg-ry-oatmeal/60 border-t border-ry-ash/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                      <div>
                        <div className="flex items-center gap-2 text-ry-charcoal">
                          <Truck className="w-4 h-4 text-ry-onyx" />
                          <span>Carrier: <strong>{orderCarrier}</strong></span>
                        </div>
                        <div className="text-[11px] text-ry-stone mt-1 space-y-0.5">
                          <div>
                            Recipient: <strong className="text-ry-onyx">{order.customer || order.address?.name || user.name}</strong>
                            {(order.email || order.address?.email) && (
                              <span className="ml-1.5 text-ry-stone">({order.email || order.address?.email})</span>
                            )}
                            {(order.phone || order.address?.phone) && (
                              <span className="ml-1.5 text-ry-stone font-mono">• {order.phone || order.address?.phone}</span>
                            )}
                          </div>
                          <div>Delivering to: {orderAddress}</div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <Link
                          href={`/track?ref=${encodeURIComponent(orderTracking || orderNumber)}`}
                          className="px-4 py-2 bg-ry-onyx text-ry-white text-xs uppercase tracking-editorial font-medium hover:bg-ry-charcoal transition-colors flex items-center gap-1.5"
                        >
                          <Truck className="w-3.5 h-3.5" />
                          <span>Track Delivery</span>
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })
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
