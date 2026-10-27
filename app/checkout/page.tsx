'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCartStore } from '@/lib/store/useCartStore';
import { useAuthStore } from '@/lib/store/useAuthStore';
import { ShieldCheck, CreditCard, Lock, ArrowRight, Loader2, Info, CheckCircle2, Truck } from 'lucide-react';
import Image from 'next/image';

export default function CheckoutPage() {
  const router = useRouter();
  const { items, getCartSubtotal, clearCart } = useCartStore();
  const { user, isAuthenticated } = useAuthStore();

  const subtotal = getCartSubtotal();
  const isDemoOrder = items.some((item) => item.price <= 1 || item.productId === 'prod-demo-1eur');
  const shipping = (subtotal >= 150 || isDemoOrder) ? 0 : 15;
  const total = subtotal + shipping;

  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'klarna' | 'clearpay'>('card');

  // Contact & Delivery State
  const defaultAddress = user?.addresses?.find((a) => a.isDefault) || user?.addresses?.[0];
  const nameParts = (user?.name || '').split(' ');
  const [firstName, setFirstName] = useState(nameParts[0] || '');
  const [lastName, setLastName] = useState(nameParts.slice(1).join(' ') || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [street, setStreet] = useState(defaultAddress?.street || '');
  const [city, setCity] = useState(defaultAddress?.city || '');
  const [state, setState] = useState(defaultAddress?.state || '');
  const [postalCode, setPostalCode] = useState(defaultAddress?.postalCode || '');
  const [country, setCountry] = useState(defaultAddress?.country || 'United Kingdom');

  useEffect(() => {
    if (user) {
      if (!firstName && user.name) {
        const parts = user.name.split(' ');
        setFirstName(parts[0] || '');
        setLastName(parts.slice(1).join(' ') || '');
      }
      if (!email && user.email) setEmail(user.email);
      if (!phone && user.phone) setPhone(user.phone);
      if (defaultAddress) {
        if (!street) setStreet(defaultAddress.street);
        if (!city) setCity(defaultAddress.city);
        if (!state) setState(defaultAddress.state);
        if (!postalCode) setPostalCode(defaultAddress.postalCode);
        if (!country) setCountry(defaultAddress.country);
      }
    }
  }, [user, defaultAddress, firstName, email, phone, street, city, state, postalCode, country]);

  const klarnaMonthly = Math.max(1, Math.round((total / 3) * 100) / 100);
  const clearpayBiweekly = Math.max(1, Math.round((total / 4) * 100) / 100);

  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerEmail: email || undefined,
          paymentMethod,
          shippingAddress: {
            name: `${firstName} ${lastName}`.trim(),
            street,
            city,
            state,
            postalCode,
            country,
            phone,
          },
          items: items.map((item) => ({
            id: item.productId,
            variantId: item.variantId,
            title: item.title,
            variantTitle: item.variantTitle,
            price: item.price,
            quantity: item.quantity,
            image: item.image,
          })),
        }),
      });

      const data = await response.json();
      if (data.url && !data.simulated) {
        window.location.href = data.url;
        return;
      }

      // Successful simulated checkout
      clearCart();
      router.push(`/dashboard/user?checkout_simulated=true&method=${paymentMethod}`);
    } catch (err: any) {
      console.error('Checkout error:', err);
      clearCart();
      router.push('/dashboard/user?checkout_simulated=true');
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-ry-pearl flex items-center justify-center pt-20 font-sans">
        <div className="text-center p-10 bg-ry-white shadow-sm border border-ry-ash max-w-md">
          <h2 className="font-serif text-2xl text-ry-onyx mb-4">Your cart is empty</h2>
          <p className="text-ry-stone text-sm mb-6">Add botanical items to your cart before proceeding to checkout.</p>
          <button
            onClick={() => router.push('/')}
            className="px-6 py-3 bg-ry-burgundy text-ry-white text-xs uppercase tracking-editorial font-medium hover:bg-ry-burgundyLight transition-colors"
          >
            Return to Boutique
          </button>
        </div>
      </div>
    );
  }

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

          <form onSubmit={handlePaymentSubmit} className="space-y-8">
            
            {/* Contact & Shipping */}
            <div className="bg-ry-white p-6 border border-ry-ash/70 shadow-sm space-y-6">
              <div className="flex items-center justify-between border-b border-ry-ash/50 pb-3">
                <h3 className="font-serif text-xl">Contact & Delivery Address</h3>
                {isAuthenticated && defaultAddress && (
                  <span className="text-[10px] text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 font-medium flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    Prefilled from sanctuary profile
                  </span>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-[10px] uppercase tracking-editorial text-ry-stone mb-1.5">First Name</label>
                  <input
                    required
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="w-full border border-ry-ash p-2.5 text-sm focus:outline-none focus:border-ry-onyx bg-ry-pearl/20"
                    placeholder="Jane"
                  />
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-[10px] uppercase tracking-editorial text-ry-stone mb-1.5">Last Name</label>
                  <input
                    required
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="w-full border border-ry-ash p-2.5 text-sm focus:outline-none focus:border-ry-onyx bg-ry-pearl/20"
                    placeholder="Doe"
                  />
                </div>

                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-[10px] uppercase tracking-editorial text-ry-stone mb-1.5">Email Address</label>
                  <input
                    required
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full border border-ry-ash p-2.5 text-sm focus:outline-none focus:border-ry-onyx bg-ry-pearl/20"
                    placeholder="jane.doe@example.com"
                  />
                </div>

                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-[10px] uppercase tracking-editorial text-ry-stone mb-1.5">
                    Phone (Courier SMS Tracking)
                  </label>
                  <input
                    required
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full border border-ry-ash p-2.5 text-sm focus:outline-none focus:border-ry-onyx bg-ry-pearl/20"
                    placeholder="+44 7700 900077"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-[10px] uppercase tracking-editorial text-ry-stone mb-1.5">Street Address</label>
                  <input
                    required
                    type="text"
                    value={street}
                    onChange={(e) => setStreet(e.target.value)}
                    className="w-full border border-ry-ash p-2.5 text-sm mb-3 focus:outline-none focus:border-ry-onyx bg-ry-pearl/20"
                    placeholder="Flat 4B, 18 Grosvenor Gardens"
                  />
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <input
                      required
                      type="text"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="border border-ry-ash p-2.5 text-sm focus:outline-none focus:border-ry-onyx bg-ry-pearl/20"
                      placeholder="City / Town"
                    />
                    <input
                      type="text"
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                      className="border border-ry-ash p-2.5 text-sm focus:outline-none focus:border-ry-onyx bg-ry-pearl/20"
                      placeholder="County / Region"
                    />
                    <input
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
                  <label className="block text-[10px] uppercase tracking-editorial text-ry-stone mb-1.5">Country / Territory</label>
                  <select
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    className="w-full border border-ry-ash p-2.5 text-sm focus:outline-none focus:border-ry-onyx bg-ry-pearl/20 text-ry-onyx"
                  >
                    <option value="United Kingdom">United Kingdom (Free over £150 via Evri & Royal Mail)</option>
                    <option value="United States">United States (FedEx International)</option>
                    <option value="France">France (DHL Express EU)</option>
                    <option value="Germany">Germany (DHL Express EU)</option>
                    <option value="Canada">Canada</option>
                    <option value="Australia">Australia</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Courier Delivery Option */}
            <div className="bg-ry-white p-6 border border-ry-ash/70 shadow-sm space-y-4">
              <h3 className="font-serif text-xl border-b border-ry-ash/50 pb-3 flex items-center gap-2">
                <Truck className="w-5 h-5 text-ry-onyx" />
                Delivery Method
              </h3>
              <div className="border border-ry-onyx bg-ry-pearl/30 p-4 flex items-center justify-between">
                <div>
                  <div className="font-medium text-sm text-ry-onyx">
                    Royal Mail Tracked 24 & Evri Express
                  </div>
                  <div className="text-xs text-ry-stone mt-0.5">
                    1-2 business days with SMS live GPS tracking milestone alerts. Includes Limited Quantity (LQ) perfume handling.
                  </div>
                </div>
                <span className="font-serif font-medium text-sm text-ry-onyx">
                  {shipping === 0 ? 'FREE' : `£${shipping.toFixed(2)}`}
                </span>
              </div>
            </div>

            {/* Payment Method Selector */}
            <div className="bg-ry-white p-6 border border-ry-ash/70 shadow-sm space-y-6">
              <h3 className="font-serif text-xl border-b border-ry-ash/50 pb-3">Payment Options</h3>
              
              <div className="space-y-3">
                {/* 1. Card */}
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
                
                {/* 2. Klarna (Pay in 3) */}
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

                {/* 3. Clearpay (Pay in 4) */}
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

              {/* Card Form */}
              {paymentMethod === 'card' && (
                <div className="pt-4 space-y-4 animate-fade-in">
                  <div className="bg-ry-pearl/50 border border-ry-ash p-3 flex items-start gap-3 mb-4">
                    <Info className="w-4 h-4 text-ry-stone shrink-0 mt-0.5" />
                    <p className="text-xs text-ry-stone leading-relaxed">
                      All live card and installment transactions are secured by Stripe 256-bit TLS encryption, 3D Secure authentication, and white-glove anti-fraud protocols.
                    </p>
                  </div>
                  
                  <div>
                    <label className="block text-[10px] uppercase tracking-editorial text-ry-stone mb-1.5 flex justify-between">
                      Card Number
                      <Lock className="w-3 h-3 text-ry-stone" />
                    </label>
                    <input type="text" className="w-full border border-ry-ash p-2.5 text-sm font-mono focus:outline-none focus:border-ry-onyx" placeholder="0000 0000 0000 0000" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] uppercase tracking-editorial text-ry-stone mb-1.5">Expiration Date</label>
                      <input type="text" className="w-full border border-ry-ash p-2.5 text-sm font-mono focus:outline-none focus:border-ry-onyx" placeholder="MM/YY" />
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase tracking-editorial text-ry-stone mb-1.5">Security Code (CVC)</label>
                      <input type="text" className="w-full border border-ry-ash p-2.5 text-sm font-mono focus:outline-none focus:border-ry-onyx" placeholder="123" />
                    </div>
                  </div>
                </div>
              )}

              {/* Klarna Info */}
              {paymentMethod === 'klarna' && (
                <div className="pt-4 animate-fade-in text-center p-6 border border-ry-ash bg-[#FFF2F7]/40">
                  <span className="bg-[#FFA8CD] text-black font-bold text-xs px-2.5 py-0.5 rounded-sm inline-block mb-2">
                    Klarna. Pay in 3
                  </span>
                  <p className="text-sm text-ry-onyx font-medium mb-1">
                    3 interest-free payments of £{klarnaMonthly.toFixed(2)}
                  </p>
                  <p className="text-xs text-ry-stone leading-relaxed max-w-sm mx-auto">
                    Payment 1 charged today, Payment 2 in 30 days, and Payment 3 in 60 days. No fees when you pay on time.
                  </p>
                </div>
              )}

              {/* Clearpay Info */}
              {paymentMethod === 'clearpay' && (
                <div className="pt-4 animate-fade-in text-center p-6 border border-ry-ash bg-[#E6F9F5]/40">
                  <span className="bg-[#B2ECE1] text-black font-bold text-xs px-2.5 py-0.5 rounded-sm inline-block mb-2">
                    clearpay✦ Pay in 4
                  </span>
                  <p className="text-sm text-ry-onyx font-medium mb-1">
                    4 interest-free payments of £{clearpayBiweekly.toFixed(2)}
                  </p>
                  <p className="text-xs text-ry-stone leading-relaxed max-w-sm mx-auto">
                    Split over 6 weeks. Payment 1 charged today, followed by 3 bi-weekly installments every 2 weeks.
                  </p>
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={isProcessing}
              className="w-full py-4 bg-ry-burgundy text-ry-white text-sm uppercase tracking-editorial font-medium flex items-center justify-center gap-2 hover:bg-ry-burgundyLight active:scale-[0.99] transition-all disabled:opacity-70 group shadow-luxury"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Authorizing Order & Dispatch...</span>
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  <span>Place Order • £{total.toFixed(2)}</span>
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
              <div className="flex justify-between text-ry-stone">
                <span>Shipping (Evri / Royal Mail)</span>
                <span className="font-mono text-ry-onyx">
                  {shipping === 0 ? 'FREE' : `£${shipping.toFixed(2)}`}
                </span>
              </div>
              <div className="flex justify-between text-ry-stone">
                <span>Complimentary Samples (x2)</span>
                <span className="text-emerald-700 font-medium">Included</span>
              </div>
              <div className="border-t border-ry-ash/60 pt-3 flex justify-between text-base font-serif text-ry-onyx font-medium">
                <span>Total</span>
                <span className="font-mono">£{total.toFixed(2)}</span>
              </div>
            </div>

            {/* Installment Summary on side */}
            <div className="mt-6 p-3 bg-ry-pearl/60 border border-ry-ash/60 text-[11px] text-ry-stone space-y-1">
              <div className="font-medium text-ry-onyx">Flexible Payment Options:</div>
              <div>• Klarna: 3 monthly installments of £{klarnaMonthly.toFixed(2)}</div>
              <div>• Clearpay: 4 bi-weekly installments of £{clearpayBiweekly.toFixed(2)}</div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
