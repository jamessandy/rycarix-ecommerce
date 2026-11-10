'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useCartStore } from '@/lib/store/useCartStore';
import { useAuthStore } from '@/lib/store/useAuthStore';
import {
  ShieldCheck,
  CreditCard,
  Lock,
  Loader2,
  Info,
  CheckCircle2,
  Truck,
  Store,
  AlertCircle,
  Globe,
} from 'lucide-react';
import Image from 'next/image';
import {
  getCheckoutShippingOptions,
  resolveCheckoutShippingOption,
  isUnitedKingdomCountry,
} from '@/lib/services/shippingAggregator';

export default function CheckoutPage() {
  const router = useRouter();
  const { items, getCartSubtotal, clearCart } = useCartStore();
  const { user, isAuthenticated, refreshProfile, updateProfile } = useAuthStore();

  const subtotal = getCartSubtotal();

  const [hasMounted, setHasMounted] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [checkoutError, setCheckoutError] = useState('');
  const [canceledNotice, setCanceledNotice] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'klarna' | 'clearpay'>('card');

  // Contact & Delivery State
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [country, setCountry] = useState('United Kingdom');
  const [selectedShippingId, setSelectedShippingId] = useState<string>('standard-uk');

  const hasPrefilledRef = useRef(false);

  useEffect(() => {
    setHasMounted(true);
    if (typeof window !== 'undefined') {
      const sp = new URLSearchParams(window.location.search);
      if (sp.get('canceled') === 'true') {
        setCanceledNotice(true);
      }
    }
    refreshProfile().catch(() => {});
  }, [refreshProfile]);

  useEffect(() => {
    if (user && !hasPrefilledRef.current) {
      hasPrefilledRef.current = true;
      const parts = (user.name || '').trim().split(/\s+/);
      setFirstName(parts[0] || '');
      setLastName(parts.slice(1).join(' ') || '');
      setEmail(user.email || '');
      setPhone(user.phone || '');

      const defaultAddr = user.addresses?.find((a) => a.isDefault) || user.addresses?.[0];
      if (defaultAddr) {
        setStreet(defaultAddr.street || '');
        setCity(defaultAddr.city || '');
        setState(defaultAddr.state || '');
        setPostalCode(defaultAddr.postalCode || '');
        setCountry(defaultAddr.country || 'United Kingdom');
      }
    }
  }, [user]);

  const availableShippingOptions = getCheckoutShippingOptions(subtotal, country);
  const resolvedShipping = resolveCheckoutShippingOption(subtotal, country, selectedShippingId);

  // Sync selectedShippingId cleanly when country or £100 free-UK threshold changes
  useEffect(() => {
    if (resolvedShipping.id !== selectedShippingId) {
      setSelectedShippingId(resolvedShipping.id);
    }
  }, [resolvedShipping.id, selectedShippingId]);

  const shipping = resolvedShipping.price;
  const total = Math.round((subtotal + shipping) * 100) / 100;

  const klarnaMonthly = Math.max(1, Math.round((total / 3) * 100) / 100);
  const clearpayBiweekly = Math.max(1, Math.round((total / 4) * 100) / 100);

  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCheckoutError('');
    setCanceledNotice(false);
    setIsProcessing(true);

    const customerFullName = `${firstName} ${lastName}`.trim() || 'Valued Client';
    const customerEmailAddr = email.trim();
    const customerPhoneNumber = phone.trim();

    if (!customerEmailAddr || !customerEmailAddr.includes('@')) {
      setCheckoutError('Please provide a valid email address for your order confirmation.');
      setIsProcessing(false);
      return;
    }

    // Persist phone update back to logged-in user's Postgres profile if signed in
    if (isAuthenticated && user && customerPhoneNumber && customerPhoneNumber !== user.phone) {
      updateProfile({ phone: customerPhoneNumber }).catch(() => {});
    }

    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerEmail: customerEmailAddr,
          customerName: customerFullName,
          customerPhone: customerPhoneNumber,
          paymentMethod:
            paymentMethod === 'klarna'
              ? 'Klarna Pay in 3'
              : paymentMethod === 'clearpay'
              ? 'Clearpay Pay in 4'
              : 'Stripe Card',
          shippingOptionId: resolvedShipping.id,
          shippingAddress: {
            name: customerFullName,
            email: customerEmailAddr,
            phone: customerPhoneNumber,
            street: street.trim(),
            city: city.trim(),
            state: state.trim(),
            postalCode: postalCode.trim(),
            country,
          },
          items: items.map((item) => ({
            id: item.productId,
            productId: item.productId,
            variantId: item.variantId,
            title: item.title,
            variantTitle: item.variantTitle,
            sku: item.sku,
            price: item.price,
            quantity: item.quantity,
            image: item.image,
          })),
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        setCheckoutError(data.error || 'Could not process checkout. Please review your bag.');
        setIsProcessing(false);
        return;
      }

      if (data.url && !data.simulated) {
        window.location.href = data.url;
        return;
      }

      if (data.url && data.simulated) {
        clearCart();
        router.push(data.url);
        return;
      }

      setCheckoutError('Unexpected checkout response. Please try again.');
      setIsProcessing(false);
    } catch (err: any) {
      console.error('Checkout error:', err);
      setCheckoutError(err?.message || 'Unable to connect to payment gateway. Please try again.');
      setIsProcessing(false);
    }
  };

  if (!hasMounted) {
    return (
      <div className="min-h-screen bg-ry-pearl flex items-center justify-center pt-20 font-sans">
        <div className="w-8 h-8 rounded-full border-2 border-ry-onyx border-t-transparent animate-spin" />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-ry-pearl flex items-center justify-center pt-20 font-sans">
        <div className="text-center p-10 bg-ry-white shadow-sm border border-ry-ash max-w-md">
          <h2 className="font-serif text-2xl text-ry-onyx mb-4">Your cart is empty</h2>
          <p className="text-ry-stone text-sm mb-6">Add products to your bag before proceeding to checkout.</p>
          <button
            onClick={() => router.push('/products')}
            className="px-6 py-3 bg-ry-burgundy text-ry-white text-xs uppercase tracking-editorial font-medium hover:bg-ry-burgundyLight transition-colors"
          >
            Return to Storefront
          </button>
        </div>
      </div>
    );
  }

  const isUK = isUnitedKingdomCountry(country);

  return (
    <div className="min-h-screen bg-ry-pearl pt-28 pb-24 text-ry-onyx font-sans">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-12 gap-12">
        
        {/* Left Column: Checkout Form */}
        <div className="lg:col-span-7 xl:col-span-8 space-y-10">
          <div>
            <h1 className="font-serif text-3xl mb-2">Secure Checkout</h1>
            <p className="text-ry-stone text-sm flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              256-bit TLS Encrypted Session • Authorized UK Merchant
            </p>
          </div>

          {canceledNotice && (
            <div className="p-4 bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center gap-2.5">
              <Info className="w-4 h-4 text-amber-700 shrink-0" />
              <span>Your payment session was cancelled. Your bag is preserved so you can review and complete your order whenever ready.</span>
            </div>
          )}

          {checkoutError && (
            <div className="p-4 bg-red-50 border border-red-200 text-red-800 text-xs flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              <span>{checkoutError}</span>
            </div>
          )}

          <form onSubmit={handlePaymentSubmit} className="space-y-8">
            
            {/* Contact & Shipping */}
            <div className="bg-ry-white p-6 border border-ry-ash/70 shadow-sm space-y-6">
              <div className="flex items-center justify-between border-b border-ry-ash/50 pb-3">
                <h3 className="font-serif text-xl">Contact &amp; Delivery Address</h3>
                {isAuthenticated && user && (
                  <span className="text-[10px] text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 font-medium flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    Synced with your account
                  </span>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 sm:col-span-1">
                  <label htmlFor="chk-first-name" className="block text-[10px] uppercase tracking-editorial text-ry-stone mb-1.5">
                    First Name
                  </label>
                  <input
                    id="chk-first-name"
                    name="firstName"
                    autoComplete="given-name"
                    required
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="w-full border border-ry-ash p-2.5 text-sm focus:outline-none focus:border-ry-onyx bg-ry-pearl/20"
                    placeholder="Jane"
                  />
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <label htmlFor="chk-last-name" className="block text-[10px] uppercase tracking-editorial text-ry-stone mb-1.5">
                    Last Name
                  </label>
                  <input
                    id="chk-last-name"
                    name="lastName"
                    autoComplete="family-name"
                    required
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="w-full border border-ry-ash p-2.5 text-sm focus:outline-none focus:border-ry-onyx bg-ry-pearl/20"
                    placeholder="Doe"
                  />
                </div>

                <div className="col-span-2 sm:col-span-1">
                  <label htmlFor="chk-email" className="block text-[10px] uppercase tracking-editorial text-ry-stone mb-1.5">
                    Email Address
                  </label>
                  <input
                    id="chk-email"
                    name="email"
                    autoComplete="email"
                    spellCheck={false}
                    required
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full border border-ry-ash p-2.5 text-sm focus:outline-none focus:border-ry-onyx bg-ry-pearl/20"
                    placeholder="jane.doe@example.com"
                  />
                </div>

                <div className="col-span-2 sm:col-span-1">
                  <label htmlFor="chk-phone" className="block text-[10px] uppercase tracking-editorial text-ry-stone mb-1.5">
                    Phone (Courier Updates)
                  </label>
                  <input
                    id="chk-phone"
                    name="phone"
                    autoComplete="tel"
                    required
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full border border-ry-ash p-2.5 text-sm focus:outline-none focus:border-ry-onyx bg-ry-pearl/20"
                    placeholder="+44 7700 900077"
                  />
                </div>

                <div className="col-span-2">
                  <label htmlFor="chk-street" className="block text-[10px] uppercase tracking-editorial text-ry-stone mb-1.5">
                    Street Address
                  </label>
                  <input
                    id="chk-street"
                    name="street"
                    autoComplete="street-address"
                    required
                    type="text"
                    value={street}
                    onChange={(e) => setStreet(e.target.value)}
                    className="w-full border border-ry-ash p-2.5 text-sm mb-3 focus:outline-none focus:border-ry-onyx bg-ry-pearl/20"
                    placeholder="Flat 4B, 18 Grosvenor Gardens"
                  />
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <input
                      id="chk-city"
                      name="city"
                      autoComplete="address-level2"
                      required
                      type="text"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="border border-ry-ash p-2.5 text-sm focus:outline-none focus:border-ry-onyx bg-ry-pearl/20"
                      placeholder="City / Town"
                    />
                    <input
                      id="chk-state"
                      name="state"
                      autoComplete="address-level1"
                      type="text"
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                      className="border border-ry-ash p-2.5 text-sm focus:outline-none focus:border-ry-onyx bg-ry-pearl/20"
                      placeholder="County / Region"
                    />
                    <input
                      id="chk-postal"
                      name="postalCode"
                      autoComplete="postal-code"
                      required
                      type="text"
                      value={postalCode}
                      onChange={(e) => setPostalCode(e.target.value)}
                      className="border border-ry-ash p-2.5 text-sm focus:outline-none focus:border-ry-onyx bg-ry-pearl/20"
                      placeholder="Postcode (e.g. SW1W 0DH)"
                    />
                  </div>
                </div>

                <div className="col-span-2">
                  <label htmlFor="chk-country" className="block text-[10px] uppercase tracking-editorial text-ry-stone mb-1.5">
                    Country / Delivery Region
                  </label>
                  <select
                    id="chk-country"
                    name="country"
                    autoComplete="country-name"
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    className="w-full border border-ry-ash p-2.5 text-sm focus:outline-none focus:border-ry-onyx bg-ry-pearl/20 text-ry-onyx"
                  >
                    <option value="United Kingdom">United Kingdom (£3.50 Standard / FREE over £100 / FREE Pickup)</option>
                    <option value="Ireland">Ireland — Europe (£9.95 • 3–5 working days)</option>
                    <option value="France">France — Europe (£9.95 • 3–5 working days)</option>
                    <option value="Germany">Germany — Europe (£9.95 • 3–5 working days)</option>
                    <option value="Italy">Italy — Europe (£9.95 • 3–5 working days)</option>
                    <option value="Spain">Spain — Europe (£9.95 • 3–5 working days)</option>
                    <option value="Netherlands">Netherlands — Europe (£9.95 • 3–5 working days)</option>
                    <option value="United States">United States (£14.95 • 5–7 working days)</option>
                    <option value="Canada">Canada (£14.95 • 5–7 working days)</option>
                    <option value="Australia">Australia — Rest of the World (£18.95 • 5–7+ working days)</option>
                    <option value="United Arab Emirates">United Arab Emirates — Rest of the World (£18.95 • 5–7+ working days)</option>
                    <option value="Nigeria">Nigeria — Rest of the World (£18.95 • 5–7+ working days)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Delivery Method (Synced dynamically with /delivery page schedule) */}
            <div className="bg-ry-white p-6 border border-ry-ash/70 shadow-sm space-y-4">
              <div className="border-b border-ry-ash/50 pb-3 flex items-center justify-between">
                <h3 className="font-sans font-semibold text-base text-neutral-900">
                  Delivery method
                </h3>
                <span className="text-[10px] text-neutral-600 uppercase tracking-editorial flex items-center gap-1">
                  <Globe className="w-3 h-3" />
                  {country || 'United Kingdom'}
                </span>
              </div>

              <div className="space-y-3">
                {availableShippingOptions.map((option) => {
                  const isSelected = resolvedShipping.id === option.id;
                  const isFreeOption = option.id === 'free-uk';
                  const isPickup = option.id === 'collection-pickup';
                  const isFreeEligible = subtotal >= 100;
                  const isClickable = !isUK || !isFreeOption || isFreeEligible;

                  return (
                    <label
                      key={option.id}
                      onClick={() => {
                        if (isClickable) setSelectedShippingId(option.id);
                      }}
                      className={`block border rounded-lg p-4 transition-all ${
                        !isClickable
                          ? 'opacity-60 bg-neutral-50 border-neutral-200 cursor-not-allowed'
                          : isSelected
                          ? 'border-neutral-900 bg-neutral-50/60 ring-1 ring-neutral-900 shadow-xs cursor-pointer'
                          : 'border-neutral-200 hover:border-neutral-400 bg-white cursor-pointer'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-3.5">
                          <div className="mt-0.5 shrink-0 text-neutral-700">
                            {isFreeOption ? (
                              <CheckCircle2 className={`w-4 h-4 ${isFreeEligible ? 'text-emerald-600' : 'text-neutral-400'}`} />
                            ) : isPickup ? (
                              <Store className="w-4 h-4 text-neutral-700" />
                            ) : (
                              <Truck className="w-4 h-4 text-neutral-700" />
                            )}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-sm text-neutral-900">
                                {option.service}
                              </span>
                            </div>
                            <p className="text-xs text-neutral-500 mt-1">
                              {option.deliveryTime}
                              {isUK && isFreeOption && !isFreeEligible && (
                                <span className="text-amber-700 font-medium ml-1">
                                  (add £{(100 - subtotal).toFixed(2)} more)
                                </span>
                              )}
                            </p>
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          {option.price === 0 ? (
                            <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-bold uppercase rounded">
                              FREE
                            </span>
                          ) : (
                            <span className="font-semibold text-sm text-neutral-900 font-mono">
                              £{option.price.toFixed(2)}
                            </span>
                          )}
                        </div>
                      </div>
                    </label>
                  );
                })}
              </div>

              <div className="pt-2 text-[11px] text-neutral-500 flex items-center gap-1.5 border-t border-neutral-100">
                <Info className="w-3.5 h-3.5 shrink-0 text-neutral-700" />
                <span>
                  Rates apply automatically at payment checkout. Free UK Delivery applies on orders over £100.
                </span>
              </div>

              {/* International Delivery Info */}
              <div className="pt-3 border-t border-ry-ash/40">
                <p className="text-[10px] uppercase tracking-editorial text-ry-stone mb-2">Delivery Schedule Reference</p>
                <div className="space-y-1.5 text-[11px] text-ry-stone">
                  <div className="flex justify-between">
                    <span>UK Standard (Orders under £100)</span><span className="font-mono text-ry-onyx">£3.50 • 2–3 working days</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Europe</span><span className="font-mono text-ry-onyx">£9.95 • 3–5 working days</span>
                  </div>
                  <div className="flex justify-between">
                    <span>USA &amp; Canada</span><span className="font-mono text-ry-onyx">£14.95 • 5–7 working days</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Rest of the World</span><span className="font-mono text-ry-onyx">£18.95 • 5–7 working days or longer</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Method Selector */}
            <div className="bg-ry-white p-6 border border-ry-ash/70 shadow-sm space-y-6">
              <h3 className="font-serif text-xl border-b border-ry-ash/50 pb-3">Payment Options</h3>
              
              <div className="space-y-3">
                <label className={`block border p-4 cursor-pointer transition-colors ${paymentMethod === 'card' ? 'border-ry-onyx bg-ry-pearl/30' : 'border-ry-ash hover:border-ry-stone'}`}>
                  <div className="flex items-center gap-3">
                    <input 
                      type="radio" 
                      name="payment_method" 
                      value="card" 
                      checked={paymentMethod === 'card'} 
                      onChange={() => setPaymentMethod('card')}
                      className="text-ry-onyx focus:ring-ry-onyx"
                    />
                    <CreditCard className="w-5 h-5 text-ry-onyx" />
                    <div className="flex-1">
                      <span className="font-medium text-sm">Credit or Debit Card</span>
                      <span className="block text-xs text-ry-stone">Visa, Mastercard, American Express via Stripe</span>
                    </div>
                  </div>
                </label>
                
                <label className={`block border p-4 cursor-pointer transition-colors ${paymentMethod === 'klarna' ? 'border-ry-onyx bg-[#FFF2F7]/50' : 'border-ry-ash hover:border-ry-stone'}`}>
                  <div className="flex items-center gap-3">
                    <input 
                      type="radio" 
                      name="payment_method" 
                      value="klarna" 
                      checked={paymentMethod === 'klarna'} 
                      onChange={() => setPaymentMethod('klarna')}
                      className="text-ry-onyx focus:ring-[#FFA8CD]"
                    />
                    <div className="flex-1">
                      <div className="font-medium text-sm flex items-center gap-2">
                        <span className="bg-[#FFA8CD] text-black px-2 py-0.5 rounded-sm text-xs font-bold tracking-tight">Klarna.</span>
                        <span>Pay in 3 interest-free installments</span>
                      </div>
                      <span className="block text-xs text-ry-stone mt-0.5">
                        3 monthly payments of <strong>£{klarnaMonthly.toFixed(2)}</strong>. No interest or fees when paid on time.
                      </span>
                    </div>
                  </div>
                </label>

                <label className={`block border p-4 cursor-pointer transition-colors ${paymentMethod === 'clearpay' ? 'border-ry-onyx bg-[#E6F9F5]/50' : 'border-ry-ash hover:border-ry-stone'}`}>
                  <div className="flex items-center gap-3">
                    <input 
                      type="radio" 
                      name="payment_method" 
                      value="clearpay" 
                      checked={paymentMethod === 'clearpay'} 
                      onChange={() => setPaymentMethod('clearpay')}
                      className="text-ry-onyx focus:ring-[#B2ECE1]"
                    />
                    <div className="flex-1">
                      <div className="font-medium text-sm flex items-center gap-2">
                        <span className="bg-[#B2ECE1] text-black px-2 py-0.5 rounded-sm text-xs font-bold tracking-tight">clearpay✦</span>
                        <span>Pay in 4 interest-free installments</span>
                      </div>
                      <span className="block text-xs text-ry-stone mt-0.5">
                        4 bi-weekly payments of <strong>£{clearpayBiweekly.toFixed(2)}</strong>. 0% APR.
                      </span>
                    </div>
                  </div>
                </label>
              </div>

              <div className="bg-ry-pearl/50 border border-ry-ash p-3 flex items-start gap-3">
                <Info className="w-4 h-4 text-ry-stone shrink-0 mt-0.5" />
                <p className="text-xs text-ry-stone leading-relaxed">
                  You will confirm payment securely with your exact GBP total and chosen delivery rate. Once payment succeeds, stock updates live and an itemized order confirmation email is sent automatically.
                </p>
              </div>
            </div>

            <button
              type="submit"
              disabled={isProcessing}
              className="w-full py-4 bg-ry-burgundy text-ry-white text-sm uppercase tracking-editorial font-medium flex items-center justify-center gap-2 hover:bg-ry-burgundyLight active:scale-[0.99] transition-all disabled:opacity-70 group shadow-luxury"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Preparing Secure Payment...</span>
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  <span>Continue to Payment • £{total.toFixed(2)}</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Right Column: Order Summary */}
        <div className="lg:col-span-5 xl:col-span-4">
          <div className="bg-ry-white border border-ry-ash/70 p-6 sticky top-28 shadow-sm">
            <h3 className="font-serif text-xl border-b border-ry-ash/50 pb-3 mb-6">Order Summary</h3>
            
            <div className="space-y-4 mb-6 max-h-[360px] overflow-y-auto pr-2 custom-scrollbar">
              {items.map((item) => (
                <div key={item.id} className="flex gap-4">
                  <div className="relative w-16 h-20 bg-ry-pearl shrink-0 overflow-hidden border border-ry-ash/50">
                    {item.image ? (
                      <Image 
                        src={item.image} 
                        alt={item.title} 
                        fill
                        sizes="64px"
                        unoptimized={typeof item.image === 'string' && item.image.startsWith('data:')}
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-ry-pearl" />
                    )}
                    <span className="absolute -top-2 -right-2 w-5 h-5 bg-ry-charcoal text-ry-white text-[10px] flex items-center justify-center rounded-full z-10 font-mono">
                      {item.quantity}
                    </span>
                  </div>
                  <div className="flex-1 text-sm">
                    <h4 className="font-serif font-medium text-ry-onyx line-clamp-2 leading-tight mb-1">{item.title}</h4>
                    <p className="text-xs text-ry-stone mb-1">{item.variantTitle}</p>
                    <p className="font-mono text-ry-charcoal">£{(item.price * item.quantity).toFixed(2)}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-ry-ash/60 pt-4 space-y-2 text-xs">
              <div className="flex justify-between text-ry-stone">
                <span>Subtotal</span>
                <span className="font-mono text-ry-onyx">£{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-ry-stone items-start">
                <div>
                  <span>Delivery</span>
                  <span className="block text-[11px] text-ry-charcoal font-medium">
                    {resolvedShipping.service}
                  </span>
                </div>
                <span className="font-mono text-ry-onyx">
                  {shipping === 0 ? 'FREE (£0.00)' : `£${shipping.toFixed(2)}`}
                </span>
              </div>
              <div className="border-t border-ry-ash/60 pt-3 flex justify-between text-base font-serif text-ry-onyx font-medium">
                <span>Total</span>
                <span className="font-mono">£{total.toFixed(2)}</span>
              </div>
            </div>

            <div className="mt-6 p-3 bg-ry-pearl/60 border border-ry-ash/60 text-[11px] text-ry-stone space-y-2">
              <div className="font-medium text-ry-onyx">Flexible Payment Options</div>
              <p>
                Split payments available with{' '}
                <span className="inline-flex items-center bg-[#FFA8CD] text-black font-semibold text-[9px] px-1.5 py-0.5 rounded-sm">Klarna.</span>
                {' '}and{' '}
                <span className="inline-flex items-center bg-[#B2ECE1] text-black font-semibold text-[9px] px-1.5 py-0.5 rounded-sm">clearpay✦</span>
                . Interest-free, no hidden fees.
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
