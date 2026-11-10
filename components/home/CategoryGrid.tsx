'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { CATEGORIES } from '@/lib/data/mockData';
import { normalizeCategorySlug } from '@/lib/utils/categoryUtils';

interface CategoryGridProps {
  onSelectCategory?: (categoryName: string) => void;
}

export default function CategoryGrid({ onSelectCategory }: CategoryGridProps) {
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [categoryImages, setCategoryImages] = useState<Record<string, string>>({});
  const [hasLoaded, setHasLoaded] = useState(false);

  useEffect(() => {
    let active = true;

    const loadCategoryState = () => {
      fetch('/api/products?includeDrafts=false', { cache: 'no-store' })
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (!active || !data?.products || !Array.isArray(data.products)) return;
          const countMap: Record<string, number> = {};
          const imageMap: Record<string, string> = {};

          data.products.forEach((p: any) => {
            if (p.isLive === false) return;
            const cat = normalizeCategorySlug(p.category);
            countMap[cat] = (countMap[cat] || 0) + 1;
            const firstImg = Array.isArray(p.images) ? p.images[0] : undefined;
            const imgUrl = typeof firstImg === 'string' ? firstImg : firstImg?.url;
            if (!imageMap[cat] && imgUrl) {
              imageMap[cat] = imgUrl;
            }
          });

          setCounts(countMap);
          setCategoryImages(imageMap);
          setHasLoaded(true);
        })
        .catch(() => {});
    };

    loadCategoryState();

    window.addEventListener('rycarix-catalog-updated', loadCategoryState);
    window.addEventListener('focus', loadCategoryState);
    window.addEventListener('storage', loadCategoryState);

    return () => {
      active = false;
      window.removeEventListener('rycarix-catalog-updated', loadCategoryState);
      window.removeEventListener('focus', loadCategoryState);
      window.removeEventListener('storage', loadCategoryState);
    };
  }, []);

  const getDynamicCount = (catSlug: string, fallback: number) => {
    const norm = normalizeCategorySlug(catSlug);
    if (!hasLoaded) return fallback;
    return counts[norm] ?? 0;
  };

  const getDynamicImage = (catSlug: string, fallback: string) => {
    const norm = normalizeCategorySlug(catSlug);
    return categoryImages[norm] || fallback;
  };
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
            Explore our curated selection of restorative botanical hair, fine fragrances, clean skincare, and scented home goods.
          </p>
        </div>

        {/* 6 Category Tiles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {CATEGORIES.map((category) => {
            const cardImage = getDynamicImage(category.slug, category.image);
            const liveCount = getDynamicCount(category.slug, category.productCount);
            return (
              <Link
                key={category.id}
                href={`/category/${category.slug}`}
                onClick={(e) => {
                  if (onSelectCategory && typeof window !== 'undefined' && window.location.pathname === '/') {
                    e.preventDefault();
                    onSelectCategory(category.slug);
                    const catalogElem = document.getElementById('catalog');
                    if (catalogElem) {
                      catalogElem.scrollIntoView({ behavior: 'smooth' });
                    }
                  }
                }}
                className="group cursor-pointer relative overflow-hidden bg-ry-oatmeal border border-ry-ash/60 transition-all duration-500 hover:shadow-luxury hover:border-ry-onyx/40 flex flex-col justify-between"
              >
                {/* Category Image with Zoom Effect */}
                <div className="relative aspect-[4/3] w-full overflow-hidden bg-ry-onyx">
                  <Image
                    src={cardImage}
                    alt={category.name}
                    fill
                    unoptimized={typeof cardImage === 'string' && cardImage.startsWith('data:')}
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
                      <span className="text-[10px] text-ry-stone uppercase tracking-editorial font-medium">
                        {liveCount} {liveCount === 1 ? 'Product' : 'Products'}
                      </span>
                    </div>
                    <p className="text-xs text-ry-stone leading-relaxed font-sans line-clamp-2">
                      {category.description}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-ry-ash/30 flex items-center justify-between text-[10px] uppercase tracking-editorial text-ry-onyx font-medium">
                    <span>Explore {category.name}</span>
                    <span className="group-hover:translate-x-1 transition-transform">→</span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

      </div>
    </section>
  );
}
