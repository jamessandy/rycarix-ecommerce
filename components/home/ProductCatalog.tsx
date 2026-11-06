// components/home/ProductCatalog.tsx
'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Product } from '@/lib/types/ecommerce';
import { useCartStore } from '@/lib/store/useCartStore';
import { useWishlistStore } from '@/lib/store/useWishlistStore';
import { matchProductCategory, getCategoryDisplayLabel } from '@/lib/services/catalogService';

interface ProductCatalogProps {
  initialCategory?: string;
  selectedCategory?: string;
}

export default function ProductCatalog({ initialCategory = 'all', selectedCategory }: ProductCatalogProps) {
  const startCat = (selectedCategory || initialCategory || 'all').toLowerCase();
  const [products, setProducts] = useState<Product[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>(startCat);
  const [loading, setLoading] = useState<boolean>(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const addItem = useCartStore((state) => state.addItem);
  const { toggleItem, isInWishlist } = useWishlistStore();

  // Sync active category when prop changes (e.g. from Hero or CategoryGrid clicks)
  useEffect(() => {
    if (selectedCategory) {
      setActiveCategory(selectedCategory.toLowerCase());
    } else if (initialCategory) {
      setActiveCategory(initialCategory.toLowerCase());
    }
  }, [selectedCategory, initialCategory]);

  useEffect(() => {
    let mounted = true;
    async function loadProducts() {
      setLoading(true);
      try {
        const res = await fetch('/api/products', { cache: 'no-store' });
        const data = await res.json();
        if (mounted && Array.isArray(data.products)) {
          setProducts(data.products);
        }
      } catch (err) {
        console.error('Failed to load catalog:', err);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    loadProducts();
    return () => {
      mounted = false;
    };
  }, []);

  const categoryPills = [
    { label: 'All Products', value: 'all' },
    { label: 'Parfum', value: 'parfum' },
    { label: 'Hair', value: 'hair' },
    { label: 'Skincare', value: 'skincare' },
    { label: 'Body & Bath', value: 'body-bath' },
    { label: 'Home & Candles', value: 'home-living' },
    { label: 'Accessories', value: 'accessories' },
  ];

  const getCategoryCount = (catValue: string) => {
    if (catValue === 'all' || catValue === 'all products') return products.length;
    return products.filter((p) => matchProductCategory(p.category, catValue)).length;
  };

  const filteredProducts =
    activeCategory === 'all' || activeCategory === 'all products'
      ? products
      : products.filter((p) => matchProductCategory(p.category, activeCategory));

  const handleCardShare = async (e: React.MouseEvent, product: Product) => {
    e.preventDefault();
    e.stopPropagation();
    const url = `${window.location.origin}/products/${product.slug}`;
    try {
      if (typeof navigator !== 'undefined' && navigator.share) {
        await navigator.share({
          title: product.name,
          text: `${product.name} - £${Number(product.price).toFixed(2)}`,
          url,
        });
      } else if (typeof navigator !== 'undefined' && navigator.clipboard) {
        await navigator.clipboard.writeText(url);
        setCopiedId(product.id);
        setTimeout(() => setCopiedId(null), 2000);
      }
    } catch {
      try {
        if (typeof navigator !== 'undefined' && navigator.clipboard) {
          await navigator.clipboard.writeText(url);
          setCopiedId(product.id);
          setTimeout(() => setCopiedId(null), 2000);
        }
      } catch {}
    }
  };

  return (
    <section id="catalog" className="max-w-7xl mx-auto px-4 sm:px-8 py-12 font-sans">
      {/* Header & Dynamic Count */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
        <div>
          <span className="text-[10px] uppercase tracking-[0.3em] text-neutral-500 font-semibold block mb-1">
            Curated Collection
          </span>
          <h2 className="text-3xl font-serif font-bold text-neutral-900 capitalize">
            {activeCategory === 'all' ? 'Complete Collection' : `${getCategoryDisplayLabel(activeCategory)} Collection`}
          </h2>
          <p className="text-sm text-neutral-600 mt-1">
            Showing {filteredProducts.length} {filteredProducts.length === 1 ? 'product' : 'products'} available
          </p>
        </div>

        {/* Category Filter Pills with Real-Time Dynamic Counts */}
        <div className="flex flex-wrap gap-2">
          {categoryPills.map((cat) => {
            const count = getCategoryCount(cat.value);
            const isActive =
              activeCategory === cat.value ||
              (cat.value === 'all' && (activeCategory === 'all' || activeCategory === 'all products')) ||
              matchProductCategory(activeCategory, cat.value);

            return (
              <button
                key={cat.value}
                type="button"
                onClick={() => setActiveCategory(cat.value)}
                className={`px-4 py-2 rounded-full text-xs font-semibold uppercase tracking-wider transition cursor-pointer ${
                  isActive
                    ? 'bg-neutral-900 text-white shadow-sm'
                    : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                }`}
              >
                {cat.label} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="h-96 rounded-xl bg-neutral-100 animate-pulse" />
          ))}
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="text-center py-16 bg-neutral-50 rounded-xl border border-neutral-200">
          <p className="text-base font-medium text-neutral-700">No products found in this category.</p>
          <button
            onClick={() => setActiveCategory('all')}
            className="mt-4 px-4 py-2 bg-neutral-900 text-white text-xs font-semibold uppercase tracking-wider rounded-md hover:bg-neutral-800 transition cursor-pointer"
          >
            View All Products
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredProducts.map((product) => {
            const wishlisted = isInWishlist(product.id);
            const stockCount = Number(product.stock ?? 0);

            return (
              <div
                key={product.id}
                className="group bg-white rounded-xl border border-neutral-200 overflow-hidden flex flex-col justify-between shadow-sm hover:shadow-md transition"
              >
                <div>
                  {/* Action Bar ABOVE the Product Image */}
                  <div className="flex items-center justify-between px-3 py-2 bg-neutral-50 border-b border-neutral-100">
                    <button
                      type="button"
                      onClick={(e) => handleCardShare(e, product)}
                      className="inline-flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wider text-neutral-600 hover:text-neutral-900 cursor-pointer"
                      title="Share Product"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                      </svg>
                      {copiedId === product.id ? 'Link Copied' : 'Share'}
                    </button>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        toggleItem(product);
                      }}
                      className={`inline-flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wider cursor-pointer ${
                        wishlisted ? 'text-rose-600' : 'text-neutral-600 hover:text-neutral-900'
                      }`}
                      title="Save to Wishlist"
                    >
                      <svg
                        className="w-3.5 h-3.5"
                        fill={wishlisted ? 'currentColor' : 'none'}
                        stroke="currentColor"
                        strokeWidth={2}
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                      </svg>
                      {wishlisted ? 'Saved' : 'Wishlist'}
                    </button>
                  </div>

                  {/* Product Image & Link */}
                  <Link href={`/products/${product.slug}`} className="block relative aspect-[4/5] bg-neutral-100 overflow-hidden">
                    <img
                      src={product.images?.[0] || '/images/media_1791069473262.jpg'}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                    />
                  </Link>

                  <div className="p-4">
                    <div className="flex items-center justify-between text-xs text-neutral-500 mb-1">
                      <span className="uppercase tracking-wider">{getCategoryDisplayLabel(product.category)}</span>
                      <span>{stockCount > 0 ? `${stockCount} available` : 'Out of stock'}</span>
                    </div>
                    <Link href={`/products/${product.slug}`}>
                      <h3 className="font-serif font-semibold text-base text-neutral-900 line-clamp-1 hover:underline">
                        {product.name}
                      </h3>
                    </Link>
                    <p className="text-lg font-bold text-neutral-900 mt-1">
                      £{Number(product.price).toFixed(2)}
                    </p>
                  </div>
                </div>

                <div className="px-4 pb-4">
                  <button
                    type="button"
                    disabled={stockCount <= 0}
                    onClick={() => addItem(product, 1)}
                    className="w-full py-2.5 bg-neutral-900 text-white text-xs font-semibold uppercase tracking-wider rounded-md hover:bg-neutral-800 transition disabled:opacity-40 cursor-pointer"
                  >
                    {stockCount > 0 ? 'Add to Bag' : 'Out of Stock'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
