'use client';

import React, { useState } from 'react';
import { Info, ShieldCheck, Calendar, CreditCard, X, CheckCircle2 } from 'lucide-react';

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
  const [activeTab, setActiveTab] = useState<'klarna' | 'clearpay'>('klarna');

  const klarnaInstallment = Math.max(1, Math.round((price / 3) * 100) / 100);
  const clearpayInstallment = Math.max(1, Math.round((price / 4) * 100) / 100);

  return (
    <>
      <div
        className={`flex flex-wrap items-center gap-2 text-xs text-ry-charcoal font-sans transition-all ${className}`}
      >
        {/* Toggleable / Clickable BNPL Badge Row */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => {
              setActiveTab('klarna');
              setShowModal(true);
            }}
            className="inline-flex items-center justify-center bg-[#FFA8CD] hover:opacity-90 text-black font-semibold text-[10px] tracking-wider px-2 py-0.5 rounded-sm transition-opacity"
            title="Klarna: 3 interest-free payments"
          >
            Klarna.
          </button>
          <span className="text-ry-stone">or</span>
          <button
            type="button"
            onClick={() => {
              setActiveTab('clearpay');
              setShowModal(true);
            }}
            className="inline-flex items-center justify-center bg-[#B2ECE1] hover:opacity-90 text-black font-semibold text-[10px] tracking-wider px-2 py-0.5 rounded-sm transition-opacity"
            title="Clearpay: 4 interest-free payments"
          >
            clearpay<span className="font-mono text-[9px] ml-0.5">✦</span>
          </button>
        </div>

        <span className="text-ry-stone text-[11px] sm:text-xs">
          Pay in <strong>3</strong> with Klarna ({currency}{klarnaInstallment.toFixed(2)}) or{' '}
          <strong>4</strong> with Clearpay ({currency}{clearpayInstallment.toFixed(2)})
        </span>

        <button
          type="button"
          onClick={() => setShowModal(true)}
          className="text-ry-stone hover:text-ry-onyx underline underline-offset-2 transition-colors ml-0.5 inline-flex items-center gap-1 text-[11px]"
          aria-label="Learn more about Klarna and Clearpay installments"
        >
          {compact ? <Info className="w-3 h-3" /> : 'Learn more'}
        </button>
      </div>

      {/* Informational Dialog Modal for Klarna & Clearpay */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div
            className="relative w-full max-w-lg bg-ry-pearl p-6 sm:p-8 rounded-none border border-ry-ash shadow-2xl text-ry-onyx animate-fade-up max-h-[90vh] overflow-y-auto"
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

            {/* Provider Switcher Tabs */}
            <div className="flex items-center gap-3 border-b border-ry-ash pb-4 mb-5">
              <button
                type="button"
                onClick={() => setActiveTab('klarna')}
                className={`flex items-center gap-2 pb-1 text-xs uppercase tracking-editorial font-medium border-b-2 transition-all ${
                  activeTab === 'klarna'
                    ? 'border-ry-onyx text-ry-onyx'
                    : 'border-transparent text-ry-stone hover:text-ry-onyx'
                }`}
              >
                <span className="bg-[#FFA8CD] text-black font-bold text-[11px] tracking-wider px-2 py-0.5 rounded-sm">
                  Klarna.
                </span>
                <span>Pay in 3</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('clearpay')}
                className={`flex items-center gap-2 pb-1 text-xs uppercase tracking-editorial font-medium border-b-2 transition-all ${
                  activeTab === 'clearpay'
                    ? 'border-ry-onyx text-ry-onyx'
                    : 'border-transparent text-ry-stone hover:text-ry-onyx'
                }`}
              >
                <span className="bg-[#B2ECE1] text-black font-bold text-[11px] tracking-wider px-2 py-0.5 rounded-sm">
                  clearpay✦
                </span>
                <span>Pay in 4</span>
              </button>
            </div>

            {/* KLARNA TAB CONTENT */}
            {activeTab === 'klarna' && (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="bg-[#FFA8CD] text-black font-bold text-sm tracking-wider px-2.5 py-0.5 rounded-sm">
                    Klarna.
                  </span>
                  <span className="text-xs uppercase tracking-editorial text-ry-stone">
                    Official UK Payment Partner
                  </span>
                </div>

                <h3 className="font-serif text-2xl mb-2 text-ry-onyx">
                  Shop Now. Pay in 3.
                </h3>
                <p className="text-xs text-ry-stone mb-6 font-sans">
                  Split your purchase of {currency}
                  {price.toFixed(2)} into <strong>3 equal, interest-free installments</strong>. No fees when paid on time.
                </p>

                {/* 3 Installment Steps */}
                <div className="space-y-3.5 mb-6 text-sm font-sans border-t border-b border-ry-ash/60 py-4">
                  <div className="flex items-start gap-3">
                    <div className="w-7 h-7 rounded-full bg-ry-onyx text-ry-white flex items-center justify-center text-xs font-semibold shrink-0">
                      1
                    </div>
                    <div>
                      <div className="font-medium text-ry-onyx">
                        Payment 1: {currency}{klarnaInstallment.toFixed(2)}
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
                        Payment 2: {currency}{klarnaInstallment.toFixed(2)}
                      </div>
                      <div className="text-xs text-ry-stone">Automatically deducted in 30 days</div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-7 h-7 rounded-full bg-ry-oatmeal text-ry-charcoal flex items-center justify-center text-xs font-semibold shrink-0">
                      3
                    </div>
                    <div>
                      <div className="font-medium text-ry-onyx">
                        Payment 3: {currency}{klarnaInstallment.toFixed(2)}
                      </div>
                      <div className="text-xs text-ry-stone">Final installment in 60 days</div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* CLEARPAY TAB CONTENT */}
            {activeTab === 'clearpay' && (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="bg-[#B2ECE1] text-black font-bold text-sm tracking-wider px-2.5 py-0.5 rounded-sm">
                    clearpay✦
                  </span>
                  <span className="text-xs uppercase tracking-editorial text-ry-stone">
                    Official UK Payment Partner
                  </span>
                </div>

                <h3 className="font-serif text-2xl mb-2 text-ry-onyx">
                  Shop Now. Pay in 4.
                </h3>
                <p className="text-xs text-ry-stone mb-6 font-sans">
                  Split your purchase of {currency}
                  {price.toFixed(2)} into <strong>4 equal, interest-free installments</strong> paid every 2 weeks.
                </p>

                {/* 4 Installment Steps */}
                <div className="space-y-3.5 mb-6 text-sm font-sans border-t border-b border-ry-ash/60 py-4">
                  <div className="flex items-start gap-3">
                    <div className="w-7 h-7 rounded-full bg-ry-onyx text-ry-white flex items-center justify-center text-xs font-semibold shrink-0">
                      1
                    </div>
                    <div>
                      <div className="font-medium text-ry-onyx">
                        Payment 1: {currency}{clearpayInstallment.toFixed(2)}
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
                        Payment 2: {currency}{clearpayInstallment.toFixed(2)}
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
                        Payment 3: {currency}{clearpayInstallment.toFixed(2)}
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
                        Payment 4: {currency}{clearpayInstallment.toFixed(2)}
                      </div>
                      <div className="text-xs text-ry-stone">Final installment in 6 weeks</div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Benefits Grid */}
            <div className="grid grid-cols-2 gap-3 text-xs text-ry-stone mb-6">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-ry-onyx shrink-0" />
                <span>0% Interest, 0 Hidden Fees</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-ry-onyx shrink-0" />
                <span>Automated Reminders</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CreditCard className="w-4 h-4 text-ry-onyx shrink-0" />
                <span>Instant Soft Credit Decision</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>White-Glove Buyer Protection</span>
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
