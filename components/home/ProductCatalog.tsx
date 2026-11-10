// components/home/ProductCatalog.tsx
'use client';

import React, { Suspense, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Search, X } from 'lucide-react';
import { Product } from '@/lib/types/ecommerce';
import { useCartStore } from '@/lib/store/useCartStore';
import { useWishlistStore } from '@/lib/store/useWishlistStore';
import {
  CANONICAL_CATEGORIES,
  normalizeCategorySlug,
  getCategoryDisplayLabel,
} from '@/lib/utils/categoryUtils';

interface ProductCatalogProps {
  initialCategory?: string;
  selectedCategory?: string;
}

function UrlParamsWatcher({
  onParamsChange,
}: {
  onParamsChange: (params: { search: string | null; sale: boolean }) => void;
}) {
  const searchParams = useSearchParams();
  const paramsKey = searchParams.toString();

  useEffect(() => {
    const q = searchParams.get('search') || searchParams.get('q');
    const sale = searchParams.get('sale') === 'true';
    onParamsChange({ search: q, sale });
  }, [paramsKey, searchParams, onParamsChange]);

  return null;
}

export default function ProductCatalog({ initialCategory = 'all', selectedCategory }: ProductCatalogProps) {
  const startCat = (selectedCategory || initialCategory || 'all').toLowerCase();
  const [products, setProducts] = useState<Product[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>(startCat);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const prevUrlSaleRef = useRef<boolean>(false);
  const prevUrlSearchRef = useRef<string | null>(null);

  const addItem = useCartStore((state) => state.addItem);
  const { toggleItem, isInWishlist } = useWishlistStore();

  const handleUrlParams = React.useCallback(
    ({ search, sale }: { search: string | null; sale: boolean }) => {
      if (sale) {
        setActiveCategory('sale');
      } else if (prevUrlSaleRef.current) {
        setActiveCategory((selectedCategory || initialCategory || 'all').toLowerCase());
      }
      prevUrlSaleRef.current = sale;

      if (search !== null) {
        setSearchQuery(search);
      } else if (prevUrlSearchRef.current !== null) {
        setSearchQuery('');
      }
      prevUrlSearchRef.current = search;
    },
    [selectedCategory, initialCategory]
  );

  // Sync active category when prop changes (e.g. from Hero or CategoryGrid clicks)
  useEffect(() => {
    if (prevUrlSaleRef.current) return;
    if (selectedCategory) {
      setActiveCategory(selectedCategory.toLowerCase());
    } else if (initialCategory) {
      setActiveCategory(initialCategory.toLowerCase());
    }
  }, [selectedCategory, initialCategory]);

  useEffect(() => {
    let mounted = true;

    async function loadProducts() {
      try {
        const res = await fetch('/api/products?includeDrafts=false', { cache: 'no-store' });
        const data = await res.json();
        if (mounted && Array.isArray(data.products)) {
          setProducts(data.products);
        }
      } catch (err) {
        console.error('Failed to load live catalog:', err);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    loadProducts();

    const handleCatalogUpdate = () => {
      loadProducts();
    };

    window.addEventListener('rycarix-catalog-updated', handleCatalogUpdate);
    window.addEventListener('focus', handleCatalogUpdate);
    window.addEventListener('storage', handleCatalogUpdate);

    return () => {
      mounted = false;
      window.removeEventListener('rycarix-catalog-updated', handleCatalogUpdate);
      window.removeEventListener('focus', handleCatalogUpdate);
      window.removeEventListener('storage', handleCatalogUpdate);
    };
  }, []);

  const isOnSale = (p: Product) => {
    const compare = p.compareAtPrice !== undefined && p.compareAtPrice !== null ? Number(p.compareAtPrice) : 0;
    const current = Number(p.price ?? (p as any).basePrice ?? 0);
    return compare > current;
  };

  const normalizedActive = normalizeCategorySlug(activeCategory);

  const categoryPills = [
    { label: 'All Products', value: 'all' },
    { label: 'Sale', value: 'sale' },
    ...CANONICAL_CATEGORIES.map((c) => ({ label: c.label, value: c.slug })),
  ];

  const getCategoryCount = (catSlug: string) => {
    if (catSlug === 'all') return products.length;
    if (catSlug === 'sale') return products.filter(isOnSale).length;
    const target = normalizeCategorySlug(catSlug);
    return products.filter((p) => normalizeCategorySlug(p.category) === target).length;
  };

  const filteredProducts = products.filter((p) => {
    if (p.isLive === false) return false;

    const matchesCategory =
      normalizedActive === 'all'
        ? true
        : normalizedActive === 'sale'
        ? isOnSale(p)
        : normalizeCategorySlug(p.category) === normalizedActive;

    if (!matchesCategory) return false;

    if (!searchQuery.trim()) return true;

    const q = searchQuery.toLowerCase().trim();
    const name = (p.name || p.title || '').toLowerCase();
    const category = (p.category || '').toLowerCase();
    const desc = (p.description || '').toLowerCase();
    const sku = (p.sku || '').toLowerCase();

    return name.includes(q) || category.includes(q) || desc.includes(q) || sku.includes(q);
  });

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
      <Suspense fallback={null}>
        <UrlParamsWatcher onParamsChange={handleUrlParams} />
      </Suspense>
      {/* Header & Controls */}
      <div className="flex flex-col gap-6 mb-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <span className="text-[10px] uppercase tracking-[0.3em] text-neutral-500 font-semibold block mb-1">
              {normalizedActive === 'sale' ? 'Special Offers & Reduced Editions' : 'Curated Collection'}
            </span>
            <h2 className="text-3xl font-serif font-bold text-neutral-900 capitalize">
              {normalizedActive === 'all'
                ? 'Complete Collection'
                : normalizedActive === 'sale'
                ? 'Private Archive Sale'
                : `${getCategoryDisplayLabel(activeCategory)} Collection`}
            </h2>
            <p className="text-sm text-neutral-600 mt-1">
              Showing {filteredProducts.length} {filteredProducts.length === 1 ? 'product' : 'products'}
              {searchQuery && (
                <span> matching &ldquo;<span className="font-medium text-neutral-900">{searchQuery}</span>&rdquo;</span>
              )}
            </p>
          </div>

          {/* Interactive Search Bar based on product name */}
          <div className="relative w-full sm:w-80 shrink-0">
            <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search product by name, note..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-9 py-2 bg-neutral-50 hover:bg-white focus:bg-white border border-neutral-300 rounded-lg text-xs text-neutral-900 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700 p-0.5"
                title="Clear search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Category Filter Pills with Real-Time Dynamic Counts */}
        <div className="flex flex-wrap gap-2 pt-2 border-t border-neutral-100">
          {categoryPills.map((cat) => {
            const count = getCategoryCount(cat.value);
            const isActive =
              normalizedActive === cat.value ||
              (cat.value === 'all' && normalizedActive === 'all');

            return (
              <button
                key={cat.value}
                type="button"
                onClick={() => setActiveCategory(cat.value)}
                className={`px-4 py-2 rounded-full text-xs font-semibold uppercase tracking-wider transition cursor-pointer ${
                  isActive
                    ? cat.value === 'sale'
                      ? 'bg-ry-burgundy text-white shadow-sm'
                      : 'bg-neutral-900 text-white shadow-sm'
                    : cat.value === 'sale'
                    ? 'bg-rose-50 text-ry-burgundy border border-rose-200 hover:bg-rose-100'
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
          <Search className="w-10 h-10 mx-auto text-neutral-400 mb-3" />
          <p className="text-base font-medium text-neutral-800">
            {searchQuery
              ? `No products found matching "${searchQuery}"`
              : normalizedActive === 'sale'
              ? 'No reduced editions are currently live.'
              : 'No products found in this category.'}
          </p>
          <p className="text-xs text-neutral-500 mt-1 max-w-sm mx-auto">
            {searchQuery
              ? 'Try checking for typos or searching by a different fragrance or keyword.'
              : 'Check back soon as new editions are released regularly.'}
          </p>
          <div className="mt-5 flex justify-center gap-3">
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="px-4 py-2 border border-neutral-300 bg-white text-neutral-900 text-xs font-semibold uppercase tracking-wider rounded-md hover:bg-neutral-50 transition cursor-pointer"
              >
                Clear Search
              </button>
            )}
            {activeCategory !== 'all' && (
              <button
                type="button"
                onClick={() => setActiveCategory('all')}
                className="px-4 py-2 bg-neutral-900 text-white text-xs font-semibold uppercase tracking-wider rounded-md hover:bg-neutral-800 transition cursor-pointer"
              >
                View All Categories
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredProducts.map((product) => {
            const wishlisted = isInWishlist(product.id);
            const stockCount = Number(product.stock ?? 0);
            const currentPrice = Number(product.price ?? (product as any).basePrice ?? 0);
            const comparePrice =
              product.compareAtPrice !== undefined && product.compareAtPrice !== null
                ? Number(product.compareAtPrice)
                : 0;
            const hasDiscount = comparePrice > currentPrice;
            const discountPercent = hasDiscount
              ? Math.round(((comparePrice - currentPrice) / comparePrice) * 100)
              : 0;

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
                      src={product.images?.[0] || '/images/perfumes/princess-reef.jpg'}
                      alt={product.name}
                      className={`w-full h-full object-cover transition duration-500 ${
                        stockCount <= 0 && !product.isComingSoon
                          ? 'opacity-70 grayscale-[25%]'
                          : 'group-hover:scale-105'
                      }`}
                    />
                    {product.isComingSoon && (
                      <div className="absolute top-3 left-3 bg-neutral-900/90 text-amber-300 backdrop-blur-xs text-[10px] font-semibold uppercase tracking-[0.2em] px-2.5 py-1 rounded-sm shadow-sm border border-amber-400/30">
                        Coming Soon
                      </div>
                    )}
                    {!product.isComingSoon && stockCount <= 0 && (
                      <div className="absolute top-3 left-3 bg-neutral-900/90 text-white backdrop-blur-xs text-[10px] font-semibold uppercase tracking-[0.18em] px-2.5 py-1 rounded-sm shadow-sm">
                        Out of Stock
                      </div>
                    )}
                    {!product.isComingSoon && hasDiscount && discountPercent > 0 && (
                      <div className="absolute top-3 right-3 bg-ry-burgundy text-white text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-sm shadow-sm">
                        -{discountPercent}% OFF
                      </div>
                    )}
                  </Link>

                  <div className="p-4">
                    <div className="flex items-center justify-between text-xs text-neutral-500 mb-1">
                      <span className="uppercase tracking-wider">{getCategoryDisplayLabel(product.category)}</span>
                      <span className={stockCount <= 0 ? 'text-rose-700 font-semibold' : ''}>
                        {stockCount > 0 ? `${stockCount} available` : 'Out of Stock'}
                      </span>
                    </div>
                    <Link href={`/products/${product.slug}`}>
                      <h3 className="font-serif font-semibold text-base text-neutral-900 line-clamp-1 hover:underline">
                        {product.name}
                      </h3>
                    </Link>
                    <div className="flex items-baseline gap-2 mt-1">
                      <p className={`text-lg font-bold ${hasDiscount ? 'text-ry-burgundy' : 'text-neutral-900'}`}>
                        £{currentPrice.toFixed(2)}
                      </p>
                      {hasDiscount && (
                        <span className="text-sm text-neutral-400 line-through font-mono">
                          £{comparePrice.toFixed(2)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="px-4 pb-4">
                  {product.isComingSoon ? (
                    <Link
                      href={`/products/${product.slug}`}
                      className="w-full block text-center py-2.5 bg-amber-950/90 hover:bg-amber-900 text-amber-100 text-xs font-semibold uppercase tracking-wider rounded-md transition cursor-pointer shadow-xs"
                    >
                      Coming Soon • Preview
                    </Link>
                  ) : (
                    <button
                      type="button"
                      disabled={stockCount <= 0}
                      onClick={() => addItem({ ...product, maxStock: stockCount }, 1)}
                      className="w-full py-2.5 bg-neutral-900 text-white text-xs font-semibold uppercase tracking-wider rounded-md hover:bg-neutral-800 transition disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                    >
                      {stockCount > 0 ? 'Add to Bag' : 'Out of Stock'}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
