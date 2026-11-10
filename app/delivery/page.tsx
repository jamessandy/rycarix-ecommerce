'use client';

import React from 'react';
import Link from 'next/link';
import { Truck, CheckCircle2, Store, Clock, Globe2, Package, ShieldCheck, ArrowLeft } from 'lucide-react';

export default function DeliveryPage() {
  return (
    <div className="min-h-screen bg-ry-pearl pt-28 pb-20 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-3xl mx-auto">
        {/* Back Link */}
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs text-ry-stone hover:text-ry-charcoal transition-colors mb-8"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Boutique
        </Link>

        {/* Page Title */}
        <h1 className="font-serif text-3xl sm:text-4xl text-ry-onyx mb-3">
          Delivery &amp; Collection Information
        </h1>
        <p className="text-sm text-ry-stone mb-10 max-w-xl leading-relaxed">
          All orders are prepared with white-glove care and dispatched securely via Royal Mail with door-to-door tracking.
        </p>

        {/* United Kingdom Delivery Methods */}
        <section className="mb-12">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Truck className="w-5 h-5 text-ry-burgundy" />
              <h2 className="font-serif text-xl text-ry-onyx">United Kingdom Delivery Methods</h2>
            </div>
            <span className="text-[10px] uppercase tracking-editorial px-2.5 py-1 bg-neutral-100 text-neutral-800 border border-neutral-200 font-medium">
              Royal Mail Tracked
            </span>
          </div>

          <div className="space-y-3.5">
            {/* 1. Standard UK Delivery */}
            <div className="p-5 bg-white border border-ry-ash/80 rounded-xl shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-start gap-3.5">
                <div className="p-2.5 bg-neutral-50 rounded-lg text-neutral-800 shrink-0">
                  <Truck className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium text-sm text-neutral-900">Standard UK Delivery</h3>
                  </div>
                  <p className="text-xs text-neutral-500 mt-0.5">
                    Estimated delivery: <span className="text-neutral-800 font-medium">2–3 working days</span>
                  </p>
                </div>
              </div>
              <div className="text-left sm:text-right font-serif text-base font-semibold text-neutral-900 shrink-0 pl-11 sm:pl-0">
                £3.50
              </div>
            </div>

            {/* 2. Free UK Delivery */}
            <div className="p-5 bg-white border border-emerald-200/90 rounded-xl shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-2 h-full bg-emerald-500" />
              <div className="flex items-start gap-3.5">
                <div className="p-2.5 bg-emerald-50 text-emerald-700 rounded-lg shrink-0">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium text-sm text-neutral-900">Free UK Delivery</h3>
                    <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] uppercase font-bold tracking-wider rounded">
                      FREE
                    </span>
                  </div>
                  <p className="text-xs text-neutral-500 mt-0.5">
                    Automatically available on orders <span className="text-neutral-800 font-medium">over £100</span>
                  </p>
                </div>
              </div>
              <div className="text-left sm:text-right font-semibold text-sm text-emerald-700 uppercase tracking-wider shrink-0 pl-11 sm:pl-0">
                FREE
              </div>
            </div>

            {/* 3. Collection / Pickup */}
            <div className="p-5 bg-white border border-ry-ash/80 rounded-xl shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-start gap-3.5">
                <div className="p-2.5 bg-neutral-50 rounded-lg text-neutral-800 shrink-0">
                  <Store className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium text-sm text-neutral-900">Collection / Pickup</h3>
                    <span className="px-2 py-0.5 bg-neutral-100 text-neutral-700 text-[10px] uppercase font-bold tracking-wider rounded">
                      FREE
                    </span>
                  </div>
                  <p className="text-xs text-neutral-500 mt-0.5">
                    Arrange collection after ordering
                  </p>
                </div>
              </div>
              <div className="text-left sm:text-right font-semibold text-sm text-neutral-900 uppercase tracking-wider shrink-0 pl-11 sm:pl-0">
                FREE
              </div>
            </div>
          </div>
        </section>

        {/* International Delivery */}
        <section className="mb-12">
          <div className="flex items-center gap-2 mb-4">
            <Globe2 className="w-5 h-5 text-ry-burgundy" />
            <h2 className="font-serif text-xl text-ry-onyx">International Delivery</h2>
          </div>

          <div className="bg-white border border-ry-ash/70 rounded-xl overflow-hidden shadow-xs divide-y divide-ry-ash/50">
            {/* Table Header */}
            <div className="grid grid-cols-3 bg-neutral-900 text-white text-xs uppercase tracking-editorial px-5 py-3.5">
              <span>Destination</span>
              <span className="text-center">Rate</span>
              <span className="text-right">Estimated delivery</span>
            </div>

            {/* Europe */}
            <div className="grid grid-cols-3 items-center px-5 py-4">
              <span className="text-sm font-medium text-neutral-900">Europe</span>
              <span className="text-sm font-mono font-semibold text-neutral-900 text-center">£9.95</span>
              <span className="text-sm text-neutral-600 text-right">3–5 working days</span>
            </div>

            {/* USA & Canada */}
            <div className="grid grid-cols-3 items-center px-5 py-4 bg-neutral-50/50">
              <span className="text-sm font-medium text-neutral-900">USA &amp; Canada</span>
              <span className="text-sm font-mono font-semibold text-neutral-900 text-center">£14.95</span>
              <span className="text-sm text-neutral-600 text-right">5–7 working days</span>
            </div>

            {/* Rest of the World */}
            <div className="grid grid-cols-3 items-center px-5 py-4">
              <span className="text-sm font-medium text-neutral-900">Rest of the World</span>
              <span className="text-sm font-mono font-semibold text-neutral-900 text-center">£18.95</span>
              <span className="text-sm text-neutral-600 text-right">5–7 working days or longer</span>
            </div>
          </div>
        </section>

        {/* Dispatch & Packaging Commitments */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 border-t border-ry-ash/60">
          <div className="p-4 bg-white border border-ry-ash/60 rounded-lg">
            <Clock className="w-4 h-4 text-neutral-800 mb-1.5" />
            <h4 className="text-xs font-semibold text-neutral-900">Fast 1–2 Day Dispatch</h4>
            <p className="text-[11px] text-neutral-500 mt-0.5">Orders placed before 2PM are processed same-day.</p>
          </div>
          <div className="p-4 bg-white border border-ry-ash/60 rounded-lg">
            <Package className="w-4 h-4 text-neutral-800 mb-1.5" />
            <h4 className="text-xs font-semibold text-neutral-900">Compliant Packaging</h4>
            <p className="text-[11px] text-neutral-500 mt-0.5">UN 1266 LQ safety packaging for fine parfums.</p>
          </div>
          <div className="p-4 bg-white border border-ry-ash/60 rounded-lg">
            <ShieldCheck className="w-4 h-4 text-neutral-800 mb-1.5" />
            <h4 className="text-xs font-semibold text-neutral-900">Insured Transit</h4>
            <p className="text-[11px] text-neutral-500 mt-0.5">Full transit coverage on all parcels.</p>
          </div>
        </div>

      </div>
    </div>
  );
}
