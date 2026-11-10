'use client';

import React, { useState, useEffect, useRef, Suspense } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  Package,
  MapPin,
  Heart,
  User,
  ShieldCheck,
  CheckCircle2,
  LogOut,
  Truck,
  Plus,
  X,
  Phone,
  AlertCircle,
  Clock,
  Loader2,
} from 'lucide-react';
import { useCartStore } from '@/lib/store/useCartStore';
import { useAuthStore } from '@/lib/store/useAuthStore';
import { useWishlistStore } from '@/lib/store/useWishlistStore';

function UserDashboardContent() {
  const [activeTab, setActiveTab] = useState<'orders' | 'wishlist' | 'addresses' | 'profile'>(
    'orders'
  );
  const { addItem, openCart, clearCart } = useCartStore();
  const { user, isAuthenticated, logout, updateProfile, addAddress, refreshProfile } = useAuthStore();
  const { items: wishlistItems, removeItem: removeWishlistItem } = useWishlistStore();

  const searchParams = useSearchParams();
  const [showCheckoutSuccess, setShowCheckoutSuccess] = useState(false);
  const [confirmingOrder, setConfirmingOrder] = useState(false);
  const [confirmError, setConfirmError] = useState('');
  const [confirmedOrder, setConfirmedOrder] = useState<any>(null);
  const [liveCatalog, setLiveCatalog] = useState<any[]>([]);

  const confirmedAttemptRef = useRef<string>('');

  // Confirm order completion & load latest profile/catalog on mount
  useEffect(() => {
    refreshProfile().catch(() => {});
    fetch('/api/products?includeDrafts=false', { cache: 'no-store' })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.products && Array.isArray(data.products)) {
          setLiveCatalog(data.products);
        }
      })
      .catch(() => {});
  }, [refreshProfile]);

  useEffect(() => {
    const sessionId = searchParams.get('session_id') || '';
    const orderId = searchParams.get('orderId') || '';
    const isSimulated = searchParams.get('checkout_simulated') === 'true';
    const isSuccess = searchParams.get('status') === 'success';
    const method = searchParams.get('method') || '';

    if (sessionId || isSimulated || isSuccess) {
      setShowCheckoutSuccess(true);
      clearCart();

      const key = `${sessionId}|${orderId}|${isSimulated}`;
      if (confirmedAttemptRef.current === key) return;
      confirmedAttemptRef.current = key;

      if (sessionId || orderId) {
        setConfirmingOrder(true);
        setConfirmError('');
        fetch('/api/orders/confirm', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sessionId: sessionId || undefined,
            orderNumber: orderId || undefined,
            simulated: isSimulated,
            paymentMethod: method || undefined,
          }),
        })
          .then(async (res) => {
            const data = await res.json();
            if (!res.ok) {
              throw new Error(data.error || 'Could not confirm order details.');
            }
            if (data.order) {
              setConfirmedOrder(data.order);
            }
          })
          .catch((err) => {
            setConfirmError(err?.message || 'Unable to verify order receipt.');
          })
          .finally(() => {
            setConfirmingOrder(false);
          });
      }
    }
  }, [searchParams, clearCart]);

  // Profile Form State
  const [profileSaved, setProfileSaved] = useState(false);
  const [profileSaveError, setProfileSaveError] = useState('');
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
  });
  const lastSyncedUserKeyRef = useRef<string>('');

  useEffect(() => {
    if (user) {
      const nextKey = `${user.email}|${user.name}|${user.phone}`;
      if (lastSyncedUserKeyRef.current !== nextKey) {
        lastSyncedUserKeyRef.current = nextKey;
        setProfileForm({
          name: user.name || '',
          email: user.email || '',
          phone: user.phone || '',
        });
      }
    }
  }, [user]);

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

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileSaveError('');
    setIsSavingProfile(true);
    const res = await updateProfile({
      name: profileForm.name.trim(),
      phone: profileForm.phone.trim(),
      avatarInitial: (profileForm.name.trim() || user?.name || 'C').charAt(0).toUpperCase(),
    });
    setIsSavingProfile(false);
    if (res.success) {
      setProfileSaved(true);
      setTimeout(() => setProfileSaved(false), 3000);
    } else {
      setProfileSaveError(res.error || 'Failed to save profile details.');
    }
  };

  const handleAddAddressSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAddress.street || !newAddress.city) return;
    await addAddress(newAddress);
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

  // Load persisted orders directly from Neon PostgreSQL API
  const [userOrders, setUserOrders] = useState<any[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [adminOrdersView, setAdminOrdersView] = useState<'all' | 'personal'>('all');

  const personalOrders = userOrders.filter(
    (o) => (o.email || '').toLowerCase() === (user?.email || '').toLowerCase()
  );
  const displayedOrders =
    user?.role === 'ADMIN'
      ? adminOrdersView === 'personal'
        ? personalOrders
        : userOrders
      : userOrders;

  useEffect(() => {
    const orderIdParam = searchParams.get('orderId') || confirmedOrder?.orderNumber || '';

    const fetchLiveOrders = async () => {
      if (!user?.email && !orderIdParam) return;
      setOrdersLoading(true);
      try {
        const query =
          user?.role === 'ADMIN'
            ? ''
            : user?.email
            ? `?email=${encodeURIComponent(user.email)}`
            : `?orderId=${encodeURIComponent(orderIdParam)}`;

        const res = await fetch(`/api/orders${query}`, { cache: 'no-store' });
        if (res.ok) {
          const data = await res.json();
          const list: any[] = Array.isArray(data.orders) ? [...data.orders] : [];
          if (
            confirmedOrder &&
            !list.some(
              (o) =>
                o.orderNumber === confirmedOrder.orderNumber || o.id === confirmedOrder.id
            )
          ) {
            list.unshift(confirmedOrder);
          }
          setUserOrders(list);
          return;
        }
      } catch (e) {
        console.warn('Could not fetch orders from API', e);
      } finally {
        setOrdersLoading(false);
      }
    };

    fetchLiveOrders();
  }, [user?.email, user?.role, confirmedOrder, searchParams]);

  // If unauthenticated (e.g. guest checkout receipt view or prompt to sign in)
  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen bg-ry-pearl text-ry-onyx pt-32 pb-24 px-4 flex flex-col items-center justify-center font-sans">
        {showCheckoutSuccess && (
          <div className="max-w-2xl w-full mb-8 bg-ry-white border border-emerald-200 shadow-lg overflow-hidden animate-fade-in">
            <div className="p-5 bg-emerald-50 border-b border-emerald-200 flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <div className="text-sm">
                <strong className="font-semibold text-emerald-900 block">
                  Order Confirmed {confirmedOrder?.orderNumber ? `• ${confirmedOrder.orderNumber}` : ''}
                </strong>
                <span className="text-emerald-800/90 text-xs block mt-0.5">
                  Thank you for your purchase. Your payment succeeded and an itemized confirmation email has been sent
                  {confirmedOrder?.email ? ` to ${confirmedOrder.email}` : ''}.
                </span>
              </div>
            </div>

            {confirmingOrder && (
              <div className="p-6 text-center text-xs text-ry-stone flex items-center justify-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Loading your exact order summary...</span>
              </div>
            )}

            {confirmError && (
              <div className="p-4 m-4 bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{confirmError}</span>
              </div>
            )}

            {confirmedOrder && (
              <div className="p-6 space-y-5">
                <div className="divide-y divide-ry-ash/40">
                  {(confirmedOrder.itemsList || []).map((item: any, idx: number) => (
                    <div key={idx} className="flex gap-4 py-3 first:pt-0 last:pb-0 items-center">
                      <div className="relative w-14 h-16 bg-ry-oatmeal overflow-hidden border border-ry-ash/50 shrink-0">
                        <Image
                          src={item.image || '/images/perfumes/princess-reef.jpg'}
                          alt={item.title || 'Purchased item'}
                          fill
                          sizes="56px"
                          unoptimized={typeof item.image === 'string' && item.image.startsWith('data:')}
                          className="object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-serif text-sm text-ry-onyx truncate">{item.title}</h4>
                        <p className="text-xs text-ry-stone">{item.variantTitle}</p>
                        <div className="text-xs font-mono text-ry-charcoal mt-0.5">
                          Qty: {item.quantity} &times; £{Number(item.price || 0).toFixed(2)}
                        </div>
                      </div>
                      <div className="font-mono text-sm font-medium text-ry-onyx">
                        £{(Number(item.price || 0) * Number(item.quantity || 1)).toFixed(2)}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="pt-4 border-t border-ry-ash/50 text-xs space-y-1.5">
                  <div className="flex justify-between text-ry-stone">
                    <span>Delivery ({confirmedOrder.shippingService})</span>
                    <span className="font-mono text-ry-onyx">
                      {Number(confirmedOrder.shippingCost || 0) === 0
                        ? 'FREE'
                        : `£${Number(confirmedOrder.shippingCost).toFixed(2)}`}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm font-serif font-medium text-ry-onyx pt-1">
                    <span>Total Paid</span>
                    <span className="font-mono">£{Number(confirmedOrder.total || 0).toFixed(2)}</span>
                  </div>
                </div>

                <div className="p-3 bg-amber-50/70 border border-amber-200 text-xs text-amber-900 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-amber-700 shrink-0" />
                    <span>
                      <strong>Awaiting Dispatch:</strong> We will email your courier tracking details once the order ships.
                    </span>
                  </div>
                  <Link
                    href={`/track?ref=${encodeURIComponent(confirmedOrder.orderNumber)}`}
                    className="px-3 py-1.5 bg-ry-onyx text-white text-[10px] uppercase tracking-editorial shrink-0"
                  >
                    Order Status
                  </Link>
                </div>
              </div>
            )}
          </div>
        )}

        <div className="max-w-md w-full bg-ry-white border border-ry-ash/80 p-8 sm:p-10 text-center shadow-lg">
          <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-ry-pearl border border-ry-ash flex items-center justify-center font-serif text-xl">
            <User className="w-6 h-6 stroke-[1.4]" />
          </div>
          <span className="text-[10px] uppercase tracking-[0.3em] text-ry-stone block mb-2">
            My Account
          </span>
          <h2 className="font-serif text-2xl text-ry-onyx mb-3">
            Sign In Required
          </h2>
          <p className="text-xs text-ry-stone leading-relaxed mb-6">
            Please sign in to view your private order archive, manage your saved phone number and delivery addresses, and monitor dispatches.
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
              Register Account &amp; Delivery Address
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
          <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-fade-in shadow-sm">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <div className="text-sm">
                <strong className="font-semibold block">
                  Order Confirmed {confirmedOrder?.orderNumber ? `• ${confirmedOrder.orderNumber}` : ''}
                </strong>
                <span className="text-emerald-800/90 mt-0.5 block text-xs">
                  {confirmedOrder?.trackingNumber
                    ? `Your order has been dispatched via ${confirmedOrder.carrier} (Tracking: ${confirmedOrder.trackingNumber}).`
                    : 'Your payment succeeded and an itemized confirmation email has been sent. You will receive tracking details as soon as admin confirms dispatch.'}
                </span>
              </div>
            </div>
            {confirmedOrder?.orderNumber && (
              <Link
                href={`/track?ref=${encodeURIComponent(confirmedOrder.trackingNumber || confirmedOrder.orderNumber)}`}
                className="px-4 py-2 bg-emerald-700 text-white text-xs uppercase tracking-editorial font-medium hover:bg-emerald-800 transition-colors shrink-0 flex items-center gap-1.5 self-start sm:self-center"
              >
                <Truck className="w-3.5 h-3.5" />
                <span>{confirmedOrder.trackingNumber ? 'Track Live Delivery' : 'View Order Status'} &rarr;</span>
              </Link>
            )}
          </div>
        )}

        {confirmError && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{confirmError}</span>
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
              <div className="flex items-center gap-2 mt-1.5">
                {user.phone ? (
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-ry-onyx font-mono flex items-center gap-1.5 bg-ry-pearl px-2 py-0.5 border border-ry-ash/70 rounded-xs">
                      <Phone className="w-3 h-3 text-ry-burgundy" />
                      {user.phone}
                    </span>
                    <button
                      type="button"
                      onClick={() => setActiveTab('profile')}
                      className="text-[11px] text-ry-burgundy hover:underline font-medium cursor-pointer"
                    >
                      Edit Phone
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setActiveTab('profile')}
                    className="inline-flex items-center gap-1.5 text-[11px] text-amber-900 bg-amber-50 hover:bg-amber-100 border border-amber-300 px-2.5 py-1 rounded-xs font-medium cursor-pointer transition shadow-2xs"
                  >
                    <Plus className="w-3 h-3 text-amber-700" />
                    <span>+ Add Phone Number</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/track"
              className="px-4 py-2.5 bg-ry-pearl border border-ry-ash text-xs uppercase tracking-editorial hover:bg-ry-oatmeal transition-colors flex items-center gap-1.5"
            >
              <Truck className="w-3.5 h-3.5 text-ry-stone" />
              <span>Order &amp; Parcel Status</span>
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
            Orders &amp; Tracking ({displayedOrders.length})
          </button>
          <button
            onClick={() => setActiveTab('wishlist')}
            className={`pb-4 px-4 transition-all relative shrink-0 ${
              activeTab === 'wishlist'
                ? 'text-ry-onyx border-b-2 border-ry-onyx'
                : 'text-ry-stone hover:text-ry-onyx'
            }`}
          >
            Saved Wishlist ({wishlistItems.length})
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
            Account Profile
          </button>
        </div>

        {/* TAB 1: ORDERS & TRACKING */}
        {activeTab === 'orders' && (
          <div className="space-y-6 animate-fade-in">
            {user?.role === 'ADMIN' && (
              <div className="p-4 bg-ry-pearl border border-ry-ash/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs shadow-xs">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-2 py-0.5 bg-ry-onyx text-ry-white text-[9px] uppercase tracking-editorial font-bold">
                      Admin Access
                    </span>
                    <span className="font-medium text-ry-onyx">Store Orders &amp; Personal Orders</span>
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

            {ordersLoading && displayedOrders.length === 0 ? (
              <div className="bg-ry-white border border-ry-ash/70 p-12 text-center shadow-sm text-xs text-ry-stone">
                Loading your orders...
              </div>
            ) : displayedOrders.length === 0 ? (
              <div className="bg-ry-white border border-ry-ash/70 p-12 text-center shadow-sm">
                <Package className="w-8 h-8 text-ry-stone/60 mx-auto mb-3 stroke-[1.4]" />
                <h3 className="font-serif text-xl text-ry-onyx mb-2">No Active Orders</h3>
                <p className="text-xs text-ry-stone max-w-sm mx-auto mb-6">
                  {user?.role === 'ADMIN' && adminOrdersView === 'personal'
                    ? 'You have not placed any personal orders as Store Administrator.'
                    : 'You have not placed any orders yet. Explore our signature scents, luxury hair care, skincare, and home essentials.'}
                </p>
                <div className="flex flex-wrap justify-center gap-3">
                  <Link
                    href="/category/fragrance"
                    className="px-5 py-2.5 bg-ry-burgundy text-ry-white text-xs uppercase tracking-editorial font-medium hover:bg-ry-burgundyLight transition-colors"
                  >
                    Shop Fragrances
                  </Link>
                  <Link
                    href="/category/hair"
                    className="px-5 py-2.5 bg-ry-white border border-ry-ash text-ry-onyx text-xs uppercase tracking-editorial font-medium hover:bg-ry-pearl transition-colors"
                  >
                    Shop Hair Care
                  </Link>
                </div>
              </div>
            ) : (
              displayedOrders.map((order: any, orderIdx: number) => {
                const orderItems = Array.isArray(order.itemsList) ? order.itemsList : [];
                const orderAddress = order.address
                  ? `${order.address.street || ''}, ${order.address.city || ''} ${order.address.postalCode || ''}, ${order.address.country || ''}`
                  : 'Address on file';
                const orderNumber = order.orderNumber || order.id || `RY-${orderIdx + 1}`;
                const orderDate = order.date || 'Recently';
                const isDispatched = Boolean(
                  order.status === 'SHIPPED' ||
                    order.status === 'DELIVERED' ||
                    order.fulfillmentStatus === 'FULFILLED' ||
                    (order.trackingNumber && String(order.trackingNumber).trim().length > 0)
                );
                const statusLabel =
                  order.status === 'DELIVERED'
                    ? 'Delivered'
                    : isDispatched
                    ? 'Dispatched'
                    : 'Order Confirmed • Awaiting Dispatch';
                const orderTotal = typeof order.total === 'number' ? order.total : 0;
                const deliveryMethodLabel =
                  order.shippingService || order.shippingMethod || 'Standard UK Delivery';
                const orderTracking = isDispatched ? order.trackingNumber || '' : '';
                const orderPayment = order.paymentMethod || 'Stripe Card';

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
                        <span
                          className={`px-3 py-1 text-[10px] uppercase tracking-editorial font-medium ${
                            isDispatched
                              ? 'bg-emerald-700 text-white'
                              : 'bg-amber-100 text-amber-900 border border-amber-300'
                          }`}
                        >
                          {statusLabel}
                        </span>
                      </div>
                    </div>

                    {/* Order Items */}
                    <div className="p-6 divide-y divide-ry-ash/40">
                      {orderItems.map((item: any, idx: number) => (
                        <div key={idx} className="flex gap-4 py-3 first:pt-0 last:pb-0">
                          <div className="relative w-16 h-20 bg-ry-oatmeal overflow-hidden border border-ry-ash/50 shrink-0">
                            {item.image ? (
                              <Image
                                src={item.image}
                                alt={item.title || 'Product'}
                                fill
                                sizes="64px"
                                unoptimized={typeof item.image === 'string' && item.image.startsWith('data:')}
                                className="object-cover"
                              />
                            ) : (
                              <div className="w-full h-full bg-ry-pearl" />
                            )}
                          </div>
                          <div className="flex-1">
                            <h4 className="font-serif text-base text-ry-onyx">{item.title}</h4>
                            <p className="text-xs text-ry-stone">{item.variantTitle}</p>
                            <div className="text-xs font-mono text-ry-charcoal mt-1">
                              Qty: {item.quantity} &bull; £{(typeof item.price === 'number' ? item.price : 0).toFixed(2)}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Installment Payment Notice */}
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
                          Paid via{' '}
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
                          <span>
                            Delivery Method: <strong>{deliveryMethodLabel}</strong>
                          </span>
                        </div>
                        <div className="text-[11px] text-ry-stone mt-1 space-y-0.5">
                          <div>
                            Recipient: <strong className="text-ry-onyx">{order.customer || order.address?.name || user.name}</strong>
                            {(order.email || order.address?.email) && (
                              <span className="ml-1.5 text-ry-stone">({order.email || order.address?.email})</span>
                            )}
                            {(order.phone || order.address?.phone) && (
                              <span className="ml-1.5 text-ry-stone font-mono">&bull; {order.phone || order.address?.phone}</span>
                            )}
                          </div>
                          <div>Delivering to: {orderAddress}</div>
                          {isDispatched && orderTracking ? (
                            <div className="text-emerald-800 font-medium pt-0.5">
                              Courier: <strong>{order.carrier}</strong> &bull; Tracking #:{' '}
                              <span className="font-mono">{orderTracking}</span>
                            </div>
                          ) : (
                            <div className="text-amber-800 pt-0.5 flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              <span>Awaiting dispatch confirmation — tracking details will be emailed once shipped.</span>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {isDispatched ? (
                          <Link
                            href={`/track?ref=${encodeURIComponent(orderTracking || orderNumber)}`}
                            className="px-4 py-2 bg-ry-onyx text-ry-white text-xs uppercase tracking-editorial font-medium hover:bg-ry-charcoal transition-colors flex items-center gap-1.5"
                          >
                            <Truck className="w-3.5 h-3.5" />
                            <span>Track Delivery</span>
                          </Link>
                        ) : (
                          <Link
                            href={`/track?ref=${encodeURIComponent(orderNumber)}`}
                            className="px-4 py-2 bg-ry-white border border-ry-ash text-ry-onyx text-xs uppercase tracking-editorial font-medium hover:bg-ry-pearl transition-colors flex items-center gap-1.5"
                          >
                            <Clock className="w-3.5 h-3.5 text-amber-700" />
                            <span>View Status</span>
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* TAB: SAVED WISHLIST */}
        {activeTab === 'wishlist' && (
          <div className="space-y-6 animate-fade-in">
            <div className="flex items-center justify-between border-b border-ry-ash/60 pb-4">
              <div>
                <h3 className="font-serif text-xl">Saved Wishlist</h3>
                <p className="text-xs text-ry-stone">
                  {wishlistItems.length} {wishlistItems.length === 1 ? 'item' : 'items'} saved to your account.
                </p>
              </div>
              <Link
                href="/products"
                className="px-4 py-2 border border-ry-onyx text-xs uppercase tracking-editorial font-medium hover:bg-ry-onyx hover:text-white transition"
              >
                Continue Browsing
              </Link>
            </div>

            {wishlistItems.length === 0 ? (
              <div className="text-center py-16 bg-ry-white border border-ry-ash/70 p-8">
                <Heart className="w-10 h-10 mx-auto text-ry-stone/40 mb-3" />
                <h4 className="font-serif text-lg mb-1">Your wishlist is currently empty</h4>
                <p className="text-xs text-ry-stone max-w-sm mx-auto mb-6">
                  Save your favourite fragrances, hair care, and skincare essentials to keep track of them.
                </p>
                <Link
                  href="/products"
                  className="px-6 py-3 bg-ry-burgundy text-white text-xs uppercase tracking-editorial font-medium hover:bg-ry-burgundyLight transition"
                >
                  Explore Collection
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {wishlistItems.map((item) => {
                  const liveMatch = liveCatalog.find(
                    (p) => p.id === item.id || p.slug === item.slug
                  );
                  const currentStock = liveMatch ? Number(liveMatch.stock ?? 0) : Number(item.stock ?? 0);
                  const currentPrice = liveMatch ? Number(liveMatch.price ?? item.price) : Number(item.price);
                  const isOutOfStock = liveCatalog.length > 0 ? (!liveMatch || currentStock <= 0) : currentStock <= 0;

                  const img = Array.isArray(item.images)
                    ? typeof item.images[0] === 'string'
                      ? item.images[0]
                      : (item.images[0] as any)?.url
                    : (item as any).image || '/images/perfumes/princess-reef.jpg';

                  return (
                    <div
                      key={item.id}
                      className="bg-ry-white border border-ry-ash/70 overflow-hidden flex flex-col justify-between"
                    >
                      <div>
                        <div className="relative aspect-[4/5] bg-ry-pearl overflow-hidden">
                          <img
                            src={img}
                            alt={item.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="p-4">
                          <span className="text-[10px] uppercase tracking-wider text-ry-stone block mb-1">
                            {item.category}
                          </span>
                          <Link href={`/products/${item.slug}`}>
                            <h4 className="font-serif font-medium text-base text-ry-onyx line-clamp-1 hover:underline">
                              {item.name}
                            </h4>
                          </Link>
                          <p className="font-mono text-sm font-semibold text-ry-onyx mt-1">
                            £{currentPrice.toFixed(2)}
                          </p>
                        </div>
                      </div>

                      <div className="p-4 pt-0 space-y-2">
                        <button
                          type="button"
                          disabled={isOutOfStock}
                          onClick={() => {
                            if (isOutOfStock) return;
                            addItem({ ...item, price: currentPrice, stock: currentStock }, 1);
                            openCart();
                          }}
                          className="w-full py-2.5 bg-ry-onyx text-white text-xs uppercase tracking-editorial font-medium hover:bg-neutral-800 transition disabled:bg-ry-ash disabled:text-ry-stone disabled:cursor-not-allowed"
                        >
                          {isOutOfStock ? 'Out of Stock' : 'Move to Bag'}
                        </button>
                        <button
                          type="button"
                          onClick={() => removeWishlistItem(item.id)}
                          className="w-full py-1.5 text-xs text-red-600 hover:text-red-800 font-medium"
                        >
                          Remove from Wishlist
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: DELIVERY ADDRESSES */}
        {activeTab === 'addresses' && (
          <div className="space-y-6 animate-fade-in">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-serif text-xl">Saved Delivery Addresses</h3>
                <p className="text-xs text-ry-stone">Used automatically to prefill checkout and prepare your parcels.</p>
              </div>
              <button
                onClick={() => setIsAddingAddress(true)}
                className="px-4 py-2 bg-ry-burgundy text-ry-white text-xs uppercase tracking-editorial font-medium hover:bg-ry-burgundyLight transition-colors flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Address</span>
              </button>
            </div>

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
                  <p className="text-xs text-ry-stone mb-4">Add your shipping address to prefill checkout cleanly.</p>
                  <button
                    onClick={() => setIsAddingAddress(true)}
                    className="px-5 py-2.5 bg-ry-burgundy text-ry-white text-xs uppercase tracking-editorial hover:bg-ry-burgundyLight transition-colors"
                  >
                    Add Address Now
                  </button>
                </div>
              )}
            </div>

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
                  <p className="text-xs text-ry-stone mb-4">Saved permanently to your client profile.</p>

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
                          Postcode
                        </label>
                        <input
                          type="text"
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
                        <option value="Ireland">Ireland</option>
                        <option value="France">France</option>
                        <option value="Germany">Germany</option>
                        <option value="United States">United States</option>
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

        {/* TAB 3: ACCOUNT PROFILE */}
        {activeTab === 'profile' && (
          <div className="bg-ry-white border border-ry-ash/70 p-6 sm:p-8 max-w-2xl animate-fade-in space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="font-serif text-xl">Account Details</h3>
              {profileSaved && (
                <span className="text-xs text-emerald-700 bg-emerald-50 px-3 py-1 border border-emerald-200 animate-fade-in">
                  Saved to your account permanently
                </span>
              )}
            </div>

            {profileSaveError && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs">
                {profileSaveError}
              </div>
            )}

            <form onSubmit={handleProfileSave} className="space-y-4 text-xs font-sans">
              <div>
                <label htmlFor="profile-name" className="block text-[10px] uppercase tracking-editorial text-ry-stone mb-1">
                  Full Name
                </label>
                <input
                  id="profile-name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  value={profileForm.name}
                  onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                  className="w-full bg-ry-pearl border border-ry-ash p-3 focus:outline-none focus:border-ry-onyx"
                />
              </div>

              <div>
                <label htmlFor="profile-email" className="block text-[10px] uppercase tracking-editorial text-ry-stone mb-1">
                  Email Address
                </label>
                <input
                  id="profile-email"
                  name="email"
                  type="email"
                  value={profileForm.email}
                  readOnly
                  className="w-full bg-ry-pearl/60 border border-ry-ash p-3 text-ry-stone cursor-not-allowed"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label htmlFor="profile-phone" className="block text-[10px] uppercase tracking-editorial text-ry-stone">
                    Phone Number (Saved Across Sessions &amp; Devices)
                  </label>
                  <span className="text-[10px] text-ry-stone">
                    {profileForm.phone ? 'Configured' : 'Not yet set'}
                  </span>
                </div>
                <div className="relative">
                  <Phone className="w-3.5 h-3.5 text-ry-stone absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    id="profile-phone"
                    name="phone"
                    type="tel"
                    autoComplete="tel"
                    value={profileForm.phone}
                    onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                    placeholder="+44 7700 900077"
                    className="w-full bg-ry-pearl border border-ry-ash pl-9 pr-3 py-3 focus:outline-none focus:border-ry-onyx font-mono text-xs"
                  />
                </div>
                <p className="text-[11px] text-ry-stone mt-1">
                  Saved directly to your account database record so it remains available every time you return or check out.
                </p>
              </div>

              <button
                type="submit"
                disabled={isSavingProfile}
                className="px-6 py-3 bg-ry-burgundy text-ry-white text-xs uppercase tracking-editorial font-medium hover:bg-ry-burgundyLight transition-colors cursor-pointer disabled:opacity-60"
              >
                {isSavingProfile ? 'Saving...' : 'Save Profile & Phone Number'}
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
    <Suspense fallback={<div className="min-h-screen bg-ry-pearl pt-32 text-center text-xs text-ry-stone">Loading Account Dashboard...</div>}>
      <UserDashboardContent />
    </Suspense>
  );
}
