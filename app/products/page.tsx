'use client';

import React, { Suspense } from 'react';
import ProductCatalog from '@/components/home/ProductCatalog';
import PerksBanner from '@/components/home/PerksBanner';
import Link from 'next/link';
import { ChevronRight, Sparkles, Truck, CreditCard, Gift } from 'lucide-react';
import { CATEGORIES } from '@/lib/data/mockData';

export default function ShopAllProductsPage() {
  return (
    <div className="min-h-screen bg-ry-pearl text-ry-onyx font-sans">
      {/* Editorial Header */}
      <section className="bg-ry-wine text-ry-white pt-28 pb-16 px-4 sm:px-6 lg:px-8 border-b border-ry-burgundy text-center">
        <div className="max-w-4xl mx-auto">
          {/* Breadcrumb */}
          <nav className="flex items-center justify-center gap-2 text-[10px] uppercase tracking-editorial text-ry-ash/70 mb-4">
            <Link href="/" className="hover:text-ry-white transition-colors">Home</Link>
            <ChevronRight className="w-3 h-3 text-ry-ash/50" />
            <span className="text-ry-white font-medium">Shop All Products</span>
          </nav>

          <div className="inline-flex items-center gap-2 px-3 py-1 bg-ry-white/10 border border-ry-white/20 text-[10px] uppercase tracking-editorial text-ry-ash mb-3">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Complete Luxury Collection</span>
          </div>

          <h1 className="font-serif text-3xl sm:text-5xl font-normal leading-tight text-ry-white tracking-tight mb-3">
            The Rycarix Collection
          </h1>
          <p className="text-xs sm:text-sm text-ry-ash/90 max-w-xl mx-auto leading-relaxed font-light">
            Explore restorative botanical hair elixirs, haute parfumerie, clean cellular skincare, and hand-poured artisanal candles.
          </p>

          {/* Quick Department Link Pills */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-2 pt-6 border-t border-ry-white/15">
            <span className="text-[10px] uppercase tracking-editorial text-ry-ash/60 mr-1 hidden sm:inline">
              Departments:
            </span>
            {CATEGORIES.map((cat) => (
              <Link
                key={cat.id}
                href={`/category/${cat.slug}`}
                className="px-3 py-1 bg-ry-white/10 hover:bg-ry-white/20 border border-ry-white/20 text-[10px] uppercase tracking-editorial text-ry-white transition-colors"
              >
                {cat.name}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Perks Banner */}
      <PerksBanner />

      {/* Main Interactive Product Catalog */}
      <ProductCatalog selectedCategory="ALL" />
    </div>
  );
}
