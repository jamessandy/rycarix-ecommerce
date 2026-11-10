'use client';

import React from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { X, Plus, Minus, Trash2, ArrowRight, ShieldCheck, Sparkles } from 'lucide-react';
import { useCartStore } from '@/lib/store/useCartStore';
import KlarnaWidget from '@/components/klarna/KlarnaWidget';

export default function CartDrawer() {
  const router = useRouter();
  const {
    isOpen,
    closeCart,
    items,
    removeItem,
    updateQuantity,
    getCartSubtotal,
    getTotalCount,
  } = useCartStore();

  const subtotal = getCartSubtotal();
  const totalCount = getTotalCount();
  const amountToFreeUK = Math.max(0, 100 - subtotal);

  if (!isOpen) return null;

  const handleCheckout = () => {
    closeCart();
    router.push('/checkout');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-ry-onyx/60 backdrop-blur-sm transition-opacity duration-300 animate-fade-in"
        onClick={closeCart}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-ry-pearl text-ry-onyx shadow-2xl flex flex-col transform transition-transform duration-300 ease-out border-l border-ry-ash animate-slide-in-right">
          
          {/* Header */}
          <div className="px-6 py-5 border-b border-ry-ash/70 flex items-center justify-between">
            <div>
              <h2 className="font-serif text-xl tracking-wide uppercase">Your Cart</h2>
              <span className="text-[10px] tracking-editorial uppercase text-ry-stone">
                {totalCount} {totalCount === 1 ? 'item' : 'items'}
              </span>
            </div>
            <button
              onClick={closeCart}
              className="p-2 text-ry-stone hover:text-ry-onyx transition-colors rounded-full hover:bg-ry-oatmeal"
              aria-label="Close Cart"
            >
              <X className="w-5 h-5 stroke-[1.5]" />
            </button>
          </div>

          {/* Items List */}
          <div className="flex-1 overflow-y-auto px-6 py-4 divide-y divide-ry-ash/40">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-16">
                <div className="w-16 h-16 rounded-full bg-ry-oatmeal flex items-center justify-center text-ry-stone mb-4">
                  <Sparkles className="w-6 h-6 stroke-1" />
                </div>
                <p className="font-serif text-lg mb-2">Your Cart is Empty</p>
                <p className="text-xs text-ry-stone max-w-xs mb-6">
                  Browse our fragrances, hair rituals, and skincare products.
                </p>
                <button
                  onClick={closeCart}
                  className="px-6 py-2.5 bg-ry-burgundy text-ry-white text-[11px] uppercase tracking-editorial hover:bg-ry-burgundyLight transition-colors"
                >
                  Start Shopping
                </button>
              </div>
            ) : (
              items.map((item) => {
                const atMaxStock = item.maxStock !== undefined && item.quantity >= item.maxStock;
                return (
                  <div key={item.id} className="py-4 flex gap-4">
                    {/* Thumbnail */}
                    <div className="relative w-20 h-24 bg-ry-oatmeal shrink-0 overflow-hidden border border-ry-ash/50">
                      <Image
                        src={item.image || '/images/perfumes/princess-reef.jpg'}
                        alt={item.title}
                        fill
                        sizes="80px"
                        unoptimized={typeof item.image === 'string' && item.image.startsWith('data:')}
                        className="object-cover"
                      />
                    </div>

                    {/* Details */}
                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex justify-between items-start">
                          <h4 className="font-serif text-sm font-medium text-ry-onyx leading-snug">
                            {item.title}
                          </h4>
                          <button
                            onClick={() => removeItem(item.id)}
                            className="text-ry-stone hover:text-red-700 transition-colors p-1"
                            aria-label="Remove item"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <p className="text-xs text-ry-stone mt-0.5">{item.variantTitle}</p>
                        {item.maxStock !== undefined && (
                          <p className="text-[10px] text-ry-stone mt-0.5">
                            {item.maxStock} in stock
                          </p>
                        )}
                      </div>

                      <div className="flex items-center justify-between mt-3">
                        {/* Quantity Controls */}
                        <div className="flex items-center border border-ry-ash bg-ry-white">
                          <button
                            onClick={() => updateQuantity(item.id, -1)}
                            className="p-1 px-2 text-ry-stone hover:text-ry-onyx transition-colors"
                            aria-label="Decrease quantity"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="px-2 text-xs font-mono font-medium min-w-[24px] text-center">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.id, 1)}
                            disabled={atMaxStock}
                            className="p-1 px-2 text-ry-stone hover:text-ry-onyx transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                            aria-label="Increase quantity"
                            title={atMaxStock ? 'Maximum available stock reached' : 'Increase quantity'}
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>

                        {/* Line Item Total */}
                        <span className="text-sm font-mono font-medium text-ry-onyx">
                          £{(item.price * item.quantity).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer & Checkout Area */}
          {items.length > 0 && (
            <div className="p-6 bg-ry-pearlDark/80 border-t border-ry-ash/70 space-y-4">
              {/* Free UK Delivery Threshold Notice */}
              <div className="p-2.5 bg-ry-white border border-ry-ash/70 text-[11px] text-center text-ry-charcoal">
                {amountToFreeUK <= 0 ? (
                  <span className="text-emerald-700 font-medium">
                    ✓ Unlocked FREE UK Delivery (Orders over £100)
                  </span>
                ) : (
                  <span>
                    Add <strong className="font-mono text-ry-onyx">£{amountToFreeUK.toFixed(2)}</strong> more for{' '}
                    <strong>FREE UK Delivery</strong> (Standard £3.50)
                  </span>
                )}
              </div>

              {/* Subtotal */}
              <div className="space-y-1.5 text-sm">
                <div className="flex justify-between text-ry-stone">
                  <span>Subtotal</span>
                  <span className="font-mono text-ry-onyx font-medium">
                    £{subtotal.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-xs text-ry-stone">
                  <span>UK Standard / International Delivery</span>
                  <span>{amountToFreeUK <= 0 ? 'FREE (£0.00)' : 'From £3.50 at checkout'}</span>
                </div>
              </div>

              {/* Klarna Installment Info */}
              <div className="bg-ry-white p-3 border border-ry-ash/80 rounded-none">
                <KlarnaWidget price={subtotal} compact={false} />
              </div>

              {/* Checkout Button */}
              <button
                onClick={handleCheckout}
                className="w-full py-4 bg-ry-burgundy text-ry-white text-xs uppercase tracking-editorial font-medium flex items-center justify-center gap-2 hover:bg-ry-burgundyLight active:scale-[0.99] transition-all group shadow-luxury"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>

              {/* Guarantee Badges */}
              <div className="pt-2 flex items-center justify-center gap-4 text-[10px] text-ry-stone uppercase tracking-subtle">
                <span className="flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-ry-charcoal" />
                  Secure Checkout
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
