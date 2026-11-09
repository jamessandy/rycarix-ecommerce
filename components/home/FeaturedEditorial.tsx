'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Sparkles, Heart, Compass } from 'lucide-react';

export default function FeaturedEditorial() {
  return (
    <section id="about" className="py-20 sm:py-28 bg-ry-pearl text-ry-onyx font-sans overflow-hidden border-b border-ry-ash/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-24 sm:space-y-32">
        
        {/* =========================================================================
            SECTION 1: Beauty, Style & Elegance. All in One Place. (IMG_1981)
            ========================================================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-center">
          {/* Left: Image (IMG_1981) */}
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
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-60" />
            </div>
            {/* Subtle decorative floating badge */}
            <div className="absolute -bottom-4 -right-2 sm:bottom-4 sm:right-4 bg-ry-white/95 backdrop-blur-md border border-ry-ash/80 px-4 py-2.5 rounded-xl shadow-lg flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span className="text-[10px] uppercase tracking-editorial font-medium text-ry-onyx">
                Signature Atelier
              </span>
            </div>
          </div>

          {/* Right: Narrative Content */}
          <div className="lg:col-span-6 space-y-6 lg:pl-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-50 border border-amber-200/80 rounded-full text-amber-900 text-[10px] uppercase tracking-editorial font-semibold">
              <Sparkles className="w-3 h-3 text-amber-600" />
              <span>Section 01 • The Atelier</span>
            </div>

            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl text-ry-onyx leading-tight font-normal">
              Beauty, Style & Elegance. <br />
              <span className="italic text-ry-charcoal">All in One Place.</span>
            </h2>

            <p className="text-sm sm:text-base text-ry-charcoal/90 leading-relaxed font-light">
              Discover a collection of carefully selected beauty and lifestyle essentials designed to complement your individuality. From beautiful hair and signature fragrances to skincare and stylish accessories, RYCARIX brings together the little things that make you feel confident, beautiful and effortlessly elegant.
            </p>

            <div className="pt-2 flex flex-wrap gap-4 items-center">
              <Link
                href="/products"
                className="inline-flex items-center gap-2 px-7 py-3.5 bg-ry-onyx text-ry-white text-xs uppercase tracking-editorial font-medium hover:bg-neutral-800 transition-all rounded-md shadow-md active:scale-95"
              >
                <span>Explore The Collection</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <Link
                href="/category/fragrance"
                className="inline-flex items-center gap-2 px-6 py-3.5 border border-ry-ash bg-white text-ry-onyx text-xs uppercase tracking-editorial font-medium hover:bg-ry-pearl transition-all rounded-md active:scale-95"
              >
                <span>Discover Parfum</span>
              </Link>
            </div>
          </div>
        </div>

        {/* =========================================================================
            SECTION 2: Everyday Essentials. Exceptional Style. (IMG_1983)
            ========================================================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-center">
          {/* Left: Narrative Content (Alternating layout on desktop) */}
          <div className="lg:col-span-6 space-y-6 lg:order-1 order-2 lg:pr-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-50 border border-emerald-200/80 rounded-full text-emerald-900 text-[10px] uppercase tracking-editorial font-semibold">
              <Heart className="w-3 h-3 text-emerald-600" />
              <span>Section 02 • Everyday Luxury</span>
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
                <span>Shop By Department</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <Link
                href="/category/hair"
                className="inline-flex items-center gap-2 px-6 py-3.5 border border-ry-ash bg-white text-ry-onyx text-xs uppercase tracking-editorial font-medium hover:bg-ry-pearl transition-all rounded-md active:scale-95"
              >
                <span>Luxury Hair & Wigs</span>
              </Link>
            </div>
          </div>

          {/* Right: Image (IMG_1983) */}
          <div className="lg:col-span-6 lg:order-2 order-1 relative group">
            <div className="relative aspect-[4/3] sm:aspect-[16/11] rounded-2xl overflow-hidden shadow-2xl border border-ry-ash/60 bg-ry-white">
              <Image
                src="/images/about/IMG_1983.jpg"
                alt="Everyday Essentials, Exceptional Style - Curated Hair, Fragrances, Skincare, Home Essentials & Accessories"
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-60" />
            </div>
            {/* Subtle decorative floating badge */}
            <div className="absolute -bottom-4 -left-2 sm:bottom-4 sm:left-4 bg-ry-white/95 backdrop-blur-md border border-ry-ash/80 px-4 py-2.5 rounded-xl shadow-lg flex items-center gap-2">
              <Compass className="w-3.5 h-3.5 text-emerald-600" />
              <span className="text-[10px] uppercase tracking-editorial font-medium text-ry-onyx">
                Thoughtfully Curated
              </span>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
