'use client';

import React, { useState } from 'react';
import { Info, ShieldCheck, Calendar, CreditCard, X } from 'lucide-react';

interface KlarnaWidgetProps {
  price: number;
  currency?: string;
  className?: string;
  compact?: boolean;
}

export default function KlarnaWidget({
  price,
  currency = '£',
  className = '',
  compact = false,
}: KlarnaWidgetProps) {
  const [showModal, setShowModal] = useState(false);
  const installment = Math.max(1, Math.round((price / 4) * 100) / 100);

  return (
    <>
      <div
        className={`flex items-center gap-2 text-xs text-ry-charcoal font-sans transition-all ${className}`}
      >
        <span className="inline-flex items-center justify-center bg-[#FFA8CD] text-black font-semibold text-[10px] tracking-wider px-1.5 py-0.5 rounded-sm">
          Klarna.
        </span>
        <span className="text-ry-stone">
          4 interest-free payments of{' '}
          <strong className="text-ry-onyx font-medium">
            {currency}
            {installment.toFixed(2)}
          </strong>
        </span>
        <button
          type="button"
          onClick={() => setShowModal(true)}
          className="text-ry-stone hover:text-ry-onyx underline underline-offset-2 transition-colors ml-0.5 inline-flex items-center"
          aria-label="Learn more about Klarna installments"
        >
          {compact ? <Info className="w-3 h-3" /> : 'Learn more'}
        </button>
      </div>

      {/* Klarna Informational Dialog Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div
            className="relative w-full max-w-md bg-ry-pearl p-6 sm:p-8 rounded-none border border-ry-ash shadow-2xl text-ry-onyx animate-fade-up"
            role="dialog"
            aria-modal="true"
          >
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 text-ry-stone hover:text-ry-onyx p-1 transition-colors"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 mb-4">
              <span className="bg-[#FFA8CD] text-black font-bold text-sm tracking-wider px-2 py-0.5 rounded-sm">
                Klarna.
              </span>
              <span className="text-xs uppercase tracking-editorial text-ry-stone">
                Official Payment Partner
              </span>
            </div>

            <h3 className="font-serif text-2xl mb-2 text-ry-onyx">
              Shop Now. Pay in 4.
            </h3>
            <p className="text-sm text-ry-stone mb-6 font-sans">
              Split your luxury purchase of {currency}
              {price.toFixed(2)} into four equal, interest-free installments.
            </p>

            {/* Installment Steps */}
            <div className="space-y-4 mb-6 text-sm font-sans border-t border-b border-ry-ash/60 py-4">
              <div className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-full bg-ry-onyx text-ry-white flex items-center justify-center text-xs font-semibold shrink-0">
                  1
                </div>
                <div>
                  <div className="font-medium text-ry-onyx">
                    Payment 1: {currency}{installment.toFixed(2)}
                  </div>
                  <div className="text-xs text-ry-stone">Charged today at checkout</div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-full bg-ry-oatmeal text-ry-charcoal flex items-center justify-center text-xs font-semibold shrink-0">
                  2
                </div>
                <div>
                  <div className="font-medium text-ry-onyx">
                    Payment 2: {currency}{installment.toFixed(2)}
                  </div>
                  <div className="text-xs text-ry-stone">Automatically deducted in 2 weeks</div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-full bg-ry-oatmeal text-ry-charcoal flex items-center justify-center text-xs font-semibold shrink-0">
                  3
                </div>
                <div>
                  <div className="font-medium text-ry-onyx">
                    Payment 3: {currency}{installment.toFixed(2)}
                  </div>
                  <div className="text-xs text-ry-stone">Automatically deducted in 4 weeks</div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-full bg-ry-oatmeal text-ry-charcoal flex items-center justify-center text-xs font-semibold shrink-0">
                  4
                </div>
                <div>
                  <div className="font-medium text-ry-onyx">
                    Payment 4: {currency}{installment.toFixed(2)}
                  </div>
                  <div className="text-xs text-ry-stone">Final installment in 6 weeks</div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs text-ry-stone mb-6">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-ry-onyx" />
                <span>0% Interest, No Catch</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-ry-onyx" />
                <span>Automatic Reminders</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CreditCard className="w-4 h-4 text-ry-onyx" />
                <span>No Credit Score Impact</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="font-serif italic text-ry-onyx">Rycarix</span>
                <span>White-Glove Support</span>
              </div>
            </div>

            <button
              onClick={() => setShowModal(false)}
              className="w-full py-3 bg-ry-onyx text-ry-white text-xs uppercase tracking-editorial hover:bg-ry-charcoal transition-colors"
            >
              Continue Shopping
            </button>
          </div>
        </div>
      )}
    </>
  );
}
