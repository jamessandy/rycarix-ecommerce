'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCartStore } from '@/lib/store/useCartStore';
import { ShieldCheck, CreditCard, Lock, ArrowRight, Loader2, Info } from 'lucide-react';
import Image from 'next/image';

export default function CheckoutPage() {
  const router = useRouter();
  const { items, getCartSubtotal } = useCartStore();
  const subtotal = getCartSubtotal();
  const shipping = subtotal >= 180 ? 0 : 25;
  const total = subtotal + shipping;

  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'klarna'>('card');

  const handlePaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    
    // Simulate network delay for payment processing
    setTimeout(() => {
      router.push('/dashboard/user?checkout_simulated=true');
    }, 1500);
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-ry-pearl flex items-center justify-center pt-20">
        <div className="text-center p-10 bg-ry-white shadow-sm border border-ry-ash max-w-md">
          <h2 className="font-serif text-2xl text-ry-onyx mb-4">Your cart is empty</h2>
          <p className="text-ry-stone text-sm mb-6">Add items to your cart before proceeding to checkout.</p>
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
    <div className="min-h-screen bg-ry-pearl pt-28 pb-24 text-ry-onyx">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-12 gap-12">
        
        {/* Left Column: Checkout Form */}
        <div className="lg:col-span-7 xl:col-span-8 space-y-10">
          <div>
            <h1 className="font-serif text-3xl mb-2">Secure Checkout</h1>
            <p className="text-ry-stone text-sm flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              256-bit TLS Encrypted Session
            </p>
          </div>

          <form onSubmit={handlePaymentSubmit} className="space-y-8">
            
            {/* Contact & Shipping */}
            <div className="bg-ry-white p-6 border border-ry-ash/70 shadow-sm space-y-6">
              <h3 className="font-serif text-xl border-b border-ry-ash/50 pb-3">Contact & Shipping</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-[10px] uppercase tracking-editorial text-ry-stone mb-1.5">First Name</label>
                  <input required type="text" className="w-full border border-ry-ash p-2.5 text-sm focus:outline-none focus:border-ry-onyx" placeholder="Jane" />
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-[10px] uppercase tracking-editorial text-ry-stone mb-1.5">Last Name</label>
                  <input required type="text" className="w-full border border-ry-ash p-2.5 text-sm focus:outline-none focus:border-ry-onyx" placeholder="Doe" />
                </div>
                <div className="col-span-2">
                  <label className="block text-[10px] uppercase tracking-editorial text-ry-stone mb-1.5">Email Address</label>
                  <input required type="email" className="w-full border border-ry-ash p-2.5 text-sm focus:outline-none focus:border-ry-onyx" placeholder="jane.doe@example.com" />
                </div>
                <div className="col-span-2">
                  <label className="block text-[10px] uppercase tracking-editorial text-ry-stone mb-1.5">Shipping Address</label>
                  <input required type="text" className="w-full border border-ry-ash p-2.5 text-sm mb-3 focus:outline-none focus:border-ry-onyx" placeholder="123 Luxury Ave, Suite 400" />
                  <div className="grid grid-cols-3 gap-3">
                    <input required type="text" className="col-span-1 border border-ry-ash p-2.5 text-sm focus:outline-none focus:border-ry-onyx" placeholder="City" />
                    <input required type="text" className="col-span-1 border border-ry-ash p-2.5 text-sm focus:outline-none focus:border-ry-onyx" placeholder="State/Province" />
                    <input required type="text" className="col-span-1 border border-ry-ash p-2.5 text-sm focus:outline-none focus:border-ry-onyx" placeholder="ZIP / Postal" />
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Method */}
            <div className="bg-ry-white p-6 border border-ry-ash/70 shadow-sm space-y-6">
              <h3 className="font-serif text-xl border-b border-ry-ash/50 pb-3">Payment Details</h3>
              
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
                    <span className="font-medium text-sm">Credit or Debit Card</span>
                  </div>
                </label>
                
                <label className={`block border p-4 cursor-pointer transition-colors ${paymentMethod === 'klarna' ? 'border-ry-onyx bg-[#FFF2F7]/40' : 'border-ry-ash hover:border-ry-stone'}`}>
                  <div className="flex items-center gap-3">
                    <input 
                      type="radio" 
                      name="payment_method" 
                      value="klarna" 
                      checked={paymentMethod === 'klarna'} 
                      onChange={() => setPaymentMethod('klarna')}
                      className="text-ry-onyx focus:ring-[#FFA8CD]"
                    />
                    <div className="font-medium text-sm flex items-center gap-2">
                      <span className="bg-[#FFA8CD] text-ry-onyx px-2 py-0.5 rounded-sm text-xs font-bold tracking-tight">Klarna.</span>
                      <span>Pay in 4 interest-free installments</span>
                    </div>
                  </div>
                </label>
              </div>

              {/* Simulated Card Form */}
              {paymentMethod === 'card' && (
                <div className="pt-4 space-y-4 animate-fade-in">
                  <div className="bg-ry-pearl/50 border border-ry-ash p-3 flex items-start gap-3 mb-4">
                    <Info className="w-4 h-4 text-ry-stone shrink-0 mt-0.5" />
                    <p className="text-xs text-ry-stone leading-relaxed">
                      This is a secure simulated checkout environment. You may use any mock data or click "Complete Secure Payment" to proceed. No real charges will be made.
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

              {paymentMethod === 'klarna' && (
                <div className="pt-4 animate-fade-in text-center p-6 border border-ry-ash bg-[#FFF2F7]/20">
                  <p className="text-sm text-ry-onyx mb-2">You will be redirected to Klarna to complete your purchase securely.</p>
                  <p className="text-xs text-ry-stone">4 payments of £{(total / 4).toFixed(2)}. No hidden fees.</p>
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
                  <span>Authorizing...</span>
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  <span>Complete Secure Payment • £{total.toFixed(2)}</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Right Column: Order Summary */}
        <div className="lg:col-span-5 xl:col-span-4">
          <div className="bg-ry-white border border-ry-ash/70 p-6 sticky top-28 shadow-sm">
            <h3 className="font-serif text-xl border-b border-ry-ash/50 pb-3 mb-6">Order Summary</h3>
            
            <div className="space-y-4 mb-6 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
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

            <div className="border-t border-ry-ash/50 pt-4 space-y-3 text-sm">
              <div className="flex justify-between text-ry-stone">
                <span>Subtotal</span>
                <span className="font-mono text-ry-charcoal">£{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-ry-stone">
                <span>Shipping</span>
                <span className="font-mono text-ry-charcoal">{shipping === 0 ? 'Free' : `£${shipping.toFixed(2)}`}</span>
              </div>
              <div className="flex justify-between text-ry-onyx font-medium border-t border-ry-ash/50 pt-3 mt-3">
                <span className="uppercase tracking-editorial text-xs mt-1">Total</span>
                <span className="font-mono text-lg">£{total.toFixed(2)}</span>
              </div>
            </div>
            
          </div>
        </div>

      </div>
    </div>
  );
}
