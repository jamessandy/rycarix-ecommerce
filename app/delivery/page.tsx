'use client';

import React from 'react';
import Link from 'next/link';
import { Truck, Clock, Globe2, Package, ShieldCheck, ArrowLeft } from 'lucide-react';

export default function DeliveryPage() {
  return (
    <div className="min-h-screen bg-ry-pearl pt-28 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        {/* Back Link */}
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs text-ry-stone hover:text-ry-charcoal transition-colors mb-8"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Shop
        </Link>

        {/* Page Title */}
        <h1 className="font-serif text-3xl sm:text-4xl text-ry-onyx mb-3">
          Delivery Information
        </h1>
        <p className="text-sm text-ry-stone mb-12 max-w-xl">
          We use Royal Mail for all UK deliveries. All orders are carefully packed and dispatched within 1–2 working days.
        </p>

        {/* UK Delivery */}
        <section className="mb-12">
          <div className="flex items-center gap-2 mb-5">
            <Truck className="w-5 h-5 text-ry-burgundy" />
            <h2 className="font-serif text-xl text-ry-onyx">UK Delivery</h2>
          </div>

          <div className="bg-ry-white border border-ry-ash/60 overflow-hidden">
            {/* Table Header */}
            <div className="grid grid-cols-3 bg-ry-onyx text-ry-white text-xs uppercase tracking-editorial px-5 py-3">
              <span>Delivery option</span>
              <span className="text-center">Price</span>
              <span className="text-right">Estimated delivery</span>
            </div>

            {/* Standard Delivery */}
            <div className="grid grid-cols-3 items-center px-5 py-4 border-b border-ry-ash/40">
              <div>
                <span className="text-sm font-medium text-ry-onyx block">Standard Delivery</span>
              </div>
              <span className="text-sm text-ry-charcoal text-center font-mono">£3.50</span>
              <span className="text-sm text-ry-stone text-right">2–3 working days</span>
            </div>

            {/* Tracked 48 */}
            <div className="grid grid-cols-3 items-center px-5 py-4 border-b border-ry-ash/40 bg-ry-pearl/30">
              <div>
                <span className="text-sm font-medium text-ry-onyx block">Tracked 48</span>
              </div>
              <span className="text-sm text-ry-charcoal text-center font-mono">£4.50</span>
              <span className="text-sm text-ry-stone text-right">2–3 working days</span>
            </div>

            {/* Tracked 24 */}
            <div className="grid grid-cols-3 items-center px-5 py-4">
              <div>
                <span className="text-sm font-medium text-ry-onyx block">Tracked 24</span>
              </div>
              <span className="text-sm text-ry-charcoal text-center font-mono">£5.00</span>
              <span className="text-sm text-ry-stone text-right">1–2 working days</span>
            </div>
          </div>
        </section>

        {/* International Delivery */}
        <section className="mb-12">
          <div className="flex items-center gap-2 mb-5">
            <Globe2 className="w-5 h-5 text-ry-burgundy" />
            <h2 className="font-serif text-xl text-ry-onyx">International Delivery</h2>
          </div>

          <div className="bg-ry-white border border-ry-ash/60 overflow-hidden">
            {/* Table Header */}
            <div className="grid grid-cols-2 bg-ry-onyx text-ry-white text-xs uppercase tracking-editorial px-5 py-3">
              <span>Destination</span>
              <span className="text-right">Estimated delivery</span>
            </div>

            {/* Europe */}
            <div className="grid grid-cols-2 items-center px-5 py-4 border-b border-ry-ash/40">
              <span className="text-sm font-medium text-ry-onyx">Europe</span>
              <span className="text-sm text-ry-stone text-right">3–5 working days</span>
            </div>

            {/* USA & Canada */}
            <div className="grid grid-cols-2 items-center px-5 py-4 border-b border-ry-ash/40 bg-ry-pearl/30">
              <span className="text-sm font-medium text-ry-onyx">USA & Canada</span>
              <span className="text-sm text-ry-stone text-right">5–7 working days</span>
            </div>

            {/* Rest of the World */}
            <div className="grid grid-cols-2 items-center px-5 py-4">
              <span className="text-sm font-medium text-ry-onyx">Rest of the World</span>
              <span className="text-sm text-ry-stone text-right">5–7 working days or longer</span>
            </div>
          </div>

          <p className="text-xs text-ry-stone mt-3">
            International shipping rates are calculated at checkout based on destination and parcel weight.
          </p>
        </section>

        {/* Additional Info */}
        <section className="space-y-6">
          <div className="flex items-start gap-3 p-4 bg-ry-white border border-ry-ash/60">
            <Package className="w-5 h-5 text-ry-burgundy shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm font-medium text-ry-onyx mb-1">Careful Packaging</h3>
              <p className="text-xs text-ry-stone leading-relaxed">
                Every order is securely packaged to ensure your items arrive in perfect condition. Fragrance orders comply with Royal Mail postal regulations.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-4 bg-ry-white border border-ry-ash/60">
            <Clock className="w-5 h-5 text-ry-burgundy shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm font-medium text-ry-onyx mb-1">Dispatch Times</h3>
              <p className="text-xs text-ry-stone leading-relaxed">
                Orders placed before 2pm (Monday–Friday) are dispatched the same day. Orders placed after 2pm or on weekends are dispatched on the next working day.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-4 bg-ry-white border border-ry-ash/60">
            <ShieldCheck className="w-5 h-5 text-ry-burgundy shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm font-medium text-ry-onyx mb-1">Order Tracking</h3>
              <p className="text-xs text-ry-stone leading-relaxed">
                Once your order is dispatched, you will receive an email with your tracking number and a link to track your parcel via Royal Mail.
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
