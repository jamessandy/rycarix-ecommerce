'use client';

import React, { useState, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  Search,
  Filter,
  ArrowUpDown,
  ShoppingBag,
  Star,
  Check,
  Eye,
  SlidersHorizontal,
  Sparkles,
} from 'lucide-react';
import { PRODUCTS } from '@/lib/data/mockData';
import { useCartStore } from '@/lib/store/useCartStore';
import { ProductItem } from '@/lib/types/ecommerce';

interface ProductCatalogProps {
  selectedCategory?: string;
}

export default function ProductCatalog({ selectedCategory: initialCategory }: ProductCatalogProps) {
  const [activeCategory, setActiveCategory] = useState<string>(initialCategory || 'ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<'featured' | 'price-asc' | 'price-desc' | 'rating'>('featured');
  const [hoveredProductId, setHoveredProductId] = useState<string | null>(null);
  const [justAddedId, setJustAddedId] = useState<string | null>(null);

  const { addItem, openCart } = useCartStore();

  const categoryOptions = [
    { label: 'All Products', value: 'ALL', count: PRODUCTS.length },
    { label: 'Perfume', value: 'Haute Parfumerie', count: PRODUCTS.filter(p => p.category === 'Haute Parfumerie').length },
    { label: 'Skincare', value: 'Botanical Skincare', count: PRODUCTS.filter(p => p.category === 'Botanical Skincare').length },
    { label: 'Hair Care', value: 'Hair Care', count: PRODUCTS.filter(p => p.category === 'Hair Care').length },
    { label: 'Body & Bath', value: 'Body & Bath', count: PRODUCTS.filter(p => p.category === 'Body & Bath').length },
    { label: 'Home & Candles', value: 'Home & Living', count: PRODUCTS.filter(p => p.category === 'Home & Living').length },
    { label: 'Accessories', value: 'Accessories', count: PRODUCTS.filter(p => p.category === 'Accessories').length },
  ];

  const filteredProducts = useMemo(() => {
    return PRODUCTS.filter((product) => {
      const matchesCategory =
        activeCategory === 'ALL' || product.category === activeCategory;
      const matchesSearch =
        searchQuery === '' ||
        product.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.subtitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    }).sort((a, b) => {
      if (sortBy === 'price-asc') return a.basePrice - b.basePrice;
      if (sortBy === 'price-desc') return b.basePrice - a.basePrice;
      if (sortBy === 'rating') return b.rating - a.rating;
      return 0; // Default featured order
    });
  }, [activeCategory, searchQuery, sortBy]);

  const handleQuickAdd = (product: ProductItem, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const defaultVariant = product.variants[0];
    const heroImage = product.images.find(img => img.isHero) || product.images[0];

    addItem({
      id: `${product.id}-${defaultVariant.id}`,
      productId: product.id,
      variantId: defaultVariant.id,
      title: product.title,
      variantTitle: defaultVariant.title,
      sku: defaultVariant.sku,
      price: defaultVariant.price,
      quantity: 1,
      image: heroImage ? heroImage.url : '',
    });

    setJustAddedId(product.id);
    setTimeout(() => {
      setJustAddedId(null);
      openCart();
    }, 450);
  };

  return (
    <section id="catalog" className="py-20 sm:py-28 bg-ry-pearl text-ry-onyx font-sans border-b border-ry-ash/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header & Category Intro */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div>
            <span className="text-[11px] uppercase tracking-[0.3em] text-ry-stone block mb-2">
              All Products
            </span>
            <h2 className="font-serif text-3xl sm:text-5xl font-normal text-ry-onyx leading-tight">
              Shop All Collections
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-ry-stone max-w-md font-sans">
            Browse our curated selection of luxury perfumes, botanical hair care, clean skincare, and scented candles.
          </p>
        </div>

        {/* Filter & Search Toolbar */}
        <div className="bg-ry-white p-4 sm:p-5 border border-ry-ash/70 shadow-sm mb-10 space-y-4">
          {/* Top Row: Category Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            {categoryOptions.map((cat) => (
              <button
                key={cat.value}
                onClick={() => setActiveCategory(cat.value)}
                className={`px-4 py-2 text-xs uppercase tracking-editorial font-medium whitespace-nowrap transition-all border ${
                  activeCategory === cat.value
                    ? 'bg-ry-burgundy text-ry-white border-ry-burgundy shadow-sm'
                    : 'bg-ry-pearl text-ry-charcoal border-ry-ash/60 hover:border-ry-burgundy'
                }`}
              >
                {cat.label}{' '}
                <span className={`text-[10px] ml-1 opacity-70`}>({cat.count})</span>
              </button>
            ))}
          </div>

          {/* Bottom Row: Search & Sort Controls */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-3 border-t border-ry-ash/40">
            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-ry-stone absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search products by title, scent, or ingredient..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-xs bg-ry-pearl border border-ry-ash/60 text-ry-onyx placeholder-ry-stone focus:outline-none focus:border-ry-onyx transition-colors"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-ry-stone hover:text-ry-onyx"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Results count & Sort Selector */}
            <div className="flex items-center justify-between sm:justify-end gap-4 text-xs text-ry-stone">
              <span>
                Showing <strong className="text-ry-onyx font-medium">{filteredProducts.length}</strong> items
              </span>

              <div className="flex items-center gap-2">
                <SlidersHorizontal className="w-3.5 h-3.5" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="bg-ry-pearl border border-ry-ash/60 px-3 py-1.5 text-xs text-ry-onyx focus:outline-none focus:border-ry-onyx cursor-pointer"
                >
                  <option value="featured">Sort: Featured</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                  <option value="rating">Highest Rated</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Empty Search State */}
        {filteredProducts.length === 0 && (
          <div className="text-center py-24 bg-ry-white border border-ry-ash/60 p-8">
            <p className="font-serif text-2xl text-ry-onyx mb-2">No creations matched your criteria</p>
            <p className="text-xs text-ry-stone mb-6">
              Try adjusting your search terms or browsing another category.
            </p>
            <button
              onClick={() => {
                setActiveCategory('ALL');
                setSearchQuery('');
              }}
              className="px-6 py-2.5 bg-ry-burgundy text-ry-white text-xs uppercase tracking-editorial"
            >
              Reset Filters
            </button>
          </div>
        )}

        {/* Product Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-8">
          {filteredProducts.map((product) => {
            const heroImage = product.images.find((img) => img.isHero) || product.images[0];
            const secondaryImage =
              product.images.find((img) => img.isTexture || !img.isHero) || heroImage;
            const isHovered = hoveredProductId === product.id;
            const isJustAdded = justAddedId === product.id;
            const klarnaInstallment = (product.basePrice / 4).toFixed(2);

            return (
              <div
                key={product.id}
                onMouseEnter={() => setHoveredProductId(product.id)}
                onMouseLeave={() => setHoveredProductId(null)}
                className="group flex flex-col justify-between bg-ry-white border border-ry-ash/70 hover:border-ry-onyx hover:shadow-luxury transition-all duration-300 relative"
              >
                {/* Product Card Top: Image Container with Hover Swap */}
                <Link
                  href={`/products/${product.slug}`}
                  className="block relative aspect-[4/5] bg-ry-oatmeal overflow-hidden"
                >
                  <Image
                    src={isHovered ? secondaryImage.url : heroImage.url}
                    alt={product.title}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                  />

                  {/* Badges */}
                  <div className="absolute top-3 left-3 flex flex-col gap-1 z-10">
                    {product.attributes.badge && (
                      <span className="px-2 py-0.5 bg-ry-burgundy text-ry-white text-[9px] uppercase tracking-editorial font-medium">
                        {product.attributes.badge}
                      </span>
                    )}
                    {product.compareAtPrice && (
                      <span className="px-2 py-0.5 bg-ry-white/95 text-ry-onyx text-[9px] uppercase tracking-editorial border border-ry-ash font-medium">
                        Special Offer
                      </span>
                    )}
                  </div>

                  {/* Category Pill Tag */}
                  <span className="absolute top-3 right-3 px-2 py-0.5 bg-ry-white/90 backdrop-blur-sm text-ry-stone text-[9px] uppercase tracking-editorial border border-ry-ash/40">
                    {product.category}
                  </span>

                  {/* Sensory Hover Prompt */}
                  {secondaryImage !== heroImage && (
                    <div className="absolute bottom-3 left-3 right-3 py-1.5 px-2 bg-ry-white/90 backdrop-blur-sm text-[9px] uppercase tracking-editorial text-ry-onyx text-center opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1">
                      <Eye className="w-3 h-3" />
                      <span>Preview Details</span>
                    </div>
                  )}
                </Link>

                {/* Product Card Body */}
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    {/* Rating & Reviews */}
                    <div className="flex items-center gap-1.5 mb-2">
                      <div className="flex items-center text-amber-500">
                        <Star className="w-3 h-3 fill-current" />
                      </div>
                      <span className="text-[11px] font-medium text-ry-onyx">
                        {product.rating.toFixed(1)}
                      </span>
                      <span className="text-[10px] text-ry-stone">
                        ({product.reviewCount})
                      </span>
                    </div>

                    {/* Title */}
                    <Link
                      href={`/products/${product.slug}`}
                      className="block group-hover:text-ry-charcoal"
                    >
                      <h3 className="font-serif text-base sm:text-lg text-ry-onyx leading-snug line-clamp-2">
                        {product.title}
                      </h3>
                    </Link>

                    {/* Subtitle */}
                    <p className="text-[11px] text-ry-stone mt-1 line-clamp-1">
                      {product.subtitle}
                    </p>
                  </div>

                  {/* Pricing & Klarna Breakdown */}
                  <div className="mt-4 pt-3 border-t border-ry-ash/50 space-y-2">
                    <div className="flex items-baseline justify-between">
                      <div className="flex items-baseline gap-2">
                        <span className="font-serif text-lg text-ry-onyx font-normal">
                          £{product.basePrice.toFixed(2)}
                        </span>
                        {product.compareAtPrice && (
                          <span className="text-xs line-through text-ry-stone">
                            £{product.compareAtPrice.toFixed(2)}
                          </span>
                        )}
                      </div>

                      <span className="text-[10px] text-ry-stone uppercase tracking-editorial">
                        {product.variants.length > 1 ? `${product.variants.length} Sizes` : 'Standard'}
                      </span>
                    </div>

                    {/* Klarna Micro-installment */}
                    <div className="flex items-center gap-1.5 text-[10px] text-ry-stone font-sans">
                      <span>4 payments of £{klarnaInstallment} with</span>
                      <span className="bg-[#FFA8CD] text-black font-semibold text-[8px] px-1 py-0.2 rounded-sm">
                        Klarna.
                      </span>
                    </div>

                    {/* Action Button: Quick Add or View Options */}
                    <div className="pt-2">
                      <button
                        onClick={(e) => handleQuickAdd(product, e)}
                        disabled={isJustAdded}
                        className={`w-full py-2.5 px-3 text-[10px] uppercase tracking-editorial font-medium flex items-center justify-center gap-1.5 transition-all ${
                          isJustAdded
                            ? 'bg-emerald-700 text-white'
                            : 'bg-ry-burgundy text-ry-white hover:bg-ry-burgundyLight active:scale-[0.99]'
                        }`}
                      >
                        {isJustAdded ? (
                          <>
                            <Check className="w-3.5 h-3.5" />
                            <span>Added to Cart</span>
                          </>
                        ) : (
                          <>
                            <ShoppingBag className="w-3.5 h-3.5" />
                            <span>Add to Cart</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                </div>
              </div>
            );
          })}
        </div>

        {/* Global Catalog Footer Notice */}
        <div className="mt-16 p-6 bg-ry-white border border-ry-ash/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs text-ry-stone">
          <div className="flex items-center gap-3">
            <Sparkles className="w-4 h-4 text-ry-onyx shrink-0" />
            <span>
              All orders include free gift packaging and two free samples.
            </span>
          </div>
          <Link
            href="/dashboard/user"
            className="text-[11px] uppercase tracking-editorial text-ry-onyx font-medium underline shrink-0"
          >
            Track Your Orders →
          </Link>
        </div>

      </div>
    </section>
  );
}
