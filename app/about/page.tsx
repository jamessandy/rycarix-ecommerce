import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Metadata } from 'next';
import { Sparkles, Heart, Compass, ArrowRight, ShieldCheck, Truck, RefreshCw } from 'lucide-react';

export const metadata: Metadata = {
  title: 'About Us | RYCARIX Luxury Fragrance, Hair & Lifestyle',
  description:
    'Discover beauty, style, and elegance all in one place. Explore carefully selected hair, signature fragrances, skincare, and everyday luxury essentials at RYCARIX.',
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-ry-pearl text-ry-onyx font-sans">
      {/* Editorial Page Header */}
      <section className="bg-neutral-950 text-white pt-32 pb-20 px-4 sm:px-6 lg:px-8 border-b border-neutral-900 text-center">
        <div className="max-w-4xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-neutral-900 border border-amber-500/30 text-[10px] uppercase tracking-editorial text-amber-300">
            <Sparkles className="w-3.5 h-3.5" />
            <span>The Rycarix Story & Philosophy</span>
          </div>
          <h1 className="font-serif text-4xl sm:text-6xl font-normal tracking-tight text-white">
            Beauty, Style &amp; Elegance
          </h1>
          <p className="text-sm sm:text-base text-neutral-400 max-w-xl mx-auto font-light leading-relaxed">
            Curated essentials designed to elevate your everyday ritual with confidence and effortless poise.
          </p>
        </div>
      </section>

      {/* Main Narrative Sections */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28 space-y-24 sm:space-y-32">
        
        {/* SECTION 1: Beauty, Style & Elegance. All in One Place. (IMG_1981) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-center">
          <div className="lg:col-span-6 relative group">
            <div className="relative aspect-[4/3] sm:aspect-[16/11] rounded-2xl overflow-hidden shadow-2xl border border-ry-ash/60 bg-ry-white">
              <Image
                src="/images/about/IMG_1981.jpg"
                alt="Beauty, Style & Elegance - Rycarix Collection with Luxury Hair, Signature Fragrances and Home Essentials"
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                priority
              />
            </div>
            <div className="absolute -bottom-4 -right-2 sm:bottom-4 sm:right-4 bg-white/95 backdrop-blur-md border border-ry-ash/80 px-4 py-2 rounded-xl shadow-lg flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span className="text-[10px] uppercase tracking-editorial font-medium text-neutral-900">
                Section 1 • Atelier
              </span>
            </div>
          </div>

          <div className="lg:col-span-6 space-y-6 lg:pl-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-50 border border-amber-200/80 rounded-full text-amber-900 text-[10px] uppercase tracking-editorial font-semibold">
              <Sparkles className="w-3 h-3 text-amber-600" />
              <span>Section 01</span>
            </div>

            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl text-ry-onyx leading-tight font-normal">
              Beauty, Style &amp; Elegance. <br />
              <span className="italic text-ry-charcoal">All in One Place.</span>
            </h2>

            <p className="text-sm sm:text-base text-ry-charcoal/90 leading-relaxed font-light">
              Discover a collection of carefully selected beauty and lifestyle essentials designed to complement your individuality. From beautiful hair and signature fragrances to skincare and stylish accessories, RYCARIX brings together the little things that make you feel confident, beautiful and effortlessly elegant.
            </p>

            <div className="pt-2 flex flex-wrap gap-4 items-center">
              <Link
                href="/products"
                className="inline-flex items-center gap-2 px-7 py-3.5 bg-neutral-900 text-white text-xs uppercase tracking-editorial font-medium hover:bg-neutral-800 transition-all rounded-md shadow-md active:scale-95"
              >
                <span>Shop All Products</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <Link
                href="/category/fragrance"
                className="inline-flex items-center gap-2 px-6 py-3.5 border border-neutral-300 bg-white text-neutral-900 text-xs uppercase tracking-editorial font-medium hover:bg-neutral-50 transition-all rounded-md active:scale-95"
              >
                <span>Explore Fragrance</span>
              </Link>
            </div>
          </div>
        </div>

        {/* SECTION 2: Everyday Essentials. Exceptional Style. (IMG_1983) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-center">
          <div className="lg:col-span-6 space-y-6 lg:order-1 order-2 lg:pr-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-50 border border-emerald-200/80 rounded-full text-emerald-900 text-[10px] uppercase tracking-editorial font-semibold">
              <Heart className="w-3 h-3 text-emerald-600" />
              <span>Section 02</span>
            </div>

            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl text-ry-onyx leading-tight font-normal">
              Everyday Essentials. <br />
              <span className="italic text-ry-charcoal">Exceptional Style.</span>
            </h2>

            <p className="text-sm sm:text-base text-ry-charcoal/90 leading-relaxed font-light">
              We believe the little details make a difference. That&apos;s why RYCARIX brings you a thoughtfully curated selection of hair, fragrances, skincare, home essentials and accessories to add a touch of beauty and elegance to your everyday life.
            </p>

            <div className="pt-2 flex flex-wrap gap-4 items-center">
              <Link
                href="/#categories"
                className="inline-flex items-center gap-2 px-7 py-3.5 bg-ry-burgundy text-white text-xs uppercase tracking-editorial font-medium hover:bg-ry-burgundyLight transition-all rounded-md shadow-md active:scale-95"
              >
                <span>View Departments</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <Link
                href="/delivery"
                className="inline-flex items-center gap-2 px-6 py-3.5 border border-neutral-300 bg-white text-neutral-900 text-xs uppercase tracking-editorial font-medium hover:bg-neutral-50 transition-all rounded-md active:scale-95"
              >
                <span>Delivery &amp; Shipping</span>
              </Link>
            </div>
          </div>

          <div className="lg:col-span-6 lg:order-2 order-1 relative group">
            <div className="relative aspect-[4/3] sm:aspect-[16/11] rounded-2xl overflow-hidden shadow-2xl border border-ry-ash/60 bg-ry-white">
              <Image
                src="/images/about/IMG_1983.jpg"
                alt="Everyday Essentials, Exceptional Style - Curated Hair, Fragrances, Skincare, Home Essentials & Accessories"
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
              />
            </div>
            <div className="absolute -bottom-4 -left-2 sm:bottom-4 sm:left-4 bg-white/95 backdrop-blur-md border border-ry-ash/80 px-4 py-2 rounded-xl shadow-lg flex items-center gap-2">
              <Compass className="w-3.5 h-3.5 text-emerald-600" />
              <span className="text-[10px] uppercase tracking-editorial font-medium text-neutral-900">
                Section 2 • Daily Luxury
              </span>
            </div>
          </div>
        </div>

        {/* Brand Commitments Bar */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-12 border-t border-ry-ash/60">
          <div className="p-6 bg-white border border-ry-ash/60 rounded-xl space-y-2">
            <Truck className="w-5 h-5 text-amber-600 mb-2" />
            <h4 className="font-serif text-base text-neutral-900">Complimentary UK Delivery</h4>
            <p className="text-xs text-neutral-600 leading-relaxed">
              Standard £3.50 UK delivery (2–3 days), or Free UK delivery on all orders over £100 with Royal Mail tracking.
            </p>
          </div>
          <div className="p-6 bg-white border border-ry-ash/60 rounded-xl space-y-2">
            <ShieldCheck className="w-5 h-5 text-amber-600 mb-2" />
            <h4 className="font-serif text-base text-neutral-900">Artisanal Sourcing &amp; Authenticity</h4>
            <p className="text-xs text-neutral-600 leading-relaxed">
              Every fragrance, hairpiece, and skincare formula is 100% authentic, cruelty-free, and ethically sourced.
            </p>
          </div>
          <div className="p-6 bg-white border border-ry-ash/60 rounded-xl space-y-2">
            <RefreshCw className="w-5 h-5 text-amber-600 mb-2" />
            <h4 className="font-serif text-base text-neutral-900">Seamless Client Concierge</h4>
            <p className="text-xs text-neutral-600 leading-relaxed">
              Live consultation support, Klarna &amp; Clearpay 0% interest installments, and 14-day client satisfaction.
            </p>
          </div>
        </div>

      </main>
    </div>
  );
}
