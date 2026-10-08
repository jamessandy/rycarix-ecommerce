'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { CATEGORIES } from '@/lib/data/mockData';

interface CategoryGridProps {
  onSelectCategory?: (categoryName: string) => void;
}

export default function CategoryGrid({ onSelectCategory }: CategoryGridProps) {
  return (
    <section id="categories" className="py-20 sm:py-28 bg-ry-pearl text-ry-onyx font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Heading */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 sm:mb-16 gap-6">
          <div className="max-w-2xl">
            <span className="text-[11px] uppercase tracking-[0.3em] text-ry-stone block mb-3">
              Categories
            </span>
            <h2 className="font-serif text-3xl sm:text-5xl font-normal text-ry-onyx leading-tight">
              Shop by <span className="italic">Category</span>
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-ry-stone max-w-md font-sans">
            Explore our curated selection of fine fragrances, restorative hair care, clean skincare, and scented home goods.
          </p>
        </div>

        {/* 6 Category Tiles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {CATEGORIES.map((category) => (
            <div
              key={category.id}
              onClick={() => {
                if (onSelectCategory) {
                  onSelectCategory(category.name);
                } else {
                  const catalogEl = document.getElementById('catalog');
                  if (catalogEl) catalogEl.scrollIntoView({ behavior: 'smooth' });
                }
              }}
              className="group cursor-pointer relative overflow-hidden bg-ry-oatmeal border border-ry-ash/60 transition-all duration-500 hover:shadow-luxury hover:border-ry-onyx/40 flex flex-col justify-between"
            >
              {/* Category Image with Zoom Effect */}
              <div className="relative aspect-[4/3] w-full overflow-hidden bg-ry-onyx">
                <Image
                  src={category.image}
                  alt={category.name}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  className="object-cover transition-transform duration-700 ease-out group-hover:scale-105 opacity-90 group-hover:opacity-100"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-ry-onyx/80 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />

                {category.featuredTag && (
                  <div className="absolute top-4 left-4 bg-ry-white/95 backdrop-blur-sm px-2.5 py-1 text-[9px] uppercase tracking-editorial text-ry-onyx font-medium">
                    {category.featuredTag}
                  </div>
                )}

                <div className="absolute bottom-4 right-4 w-9 h-9 rounded-full bg-ry-white/90 backdrop-blur-sm flex items-center justify-center text-ry-onyx opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300">
                  <ArrowUpRight className="w-4 h-4" />
                </div>
              </div>

              {/* Category Content */}
              <div className="p-6 bg-ry-white flex-1 flex flex-col justify-between border-t border-ry-ash/40">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-serif text-xl sm:text-2xl text-ry-onyx group-hover:underline">
                      {category.name}
                    </h3>
                    <span className="text-[10px] text-ry-stone uppercase tracking-editorial">
                      {category.productCount} {category.productCount === 1 ? 'Product' : 'Products'}
                    </span>
                  </div>
                  <p className="text-xs text-ry-stone leading-relaxed font-sans line-clamp-2">
                    {category.description}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-ry-ash/30 flex items-center justify-between text-[10px] uppercase tracking-editorial text-ry-onyx font-medium">
                  <span>Shop Now</span>
                  <span className="group-hover:translate-x-1 transition-transform">→</span>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
