'use client';

import React, { useState, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { notFound, useParams } from 'next/navigation';
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
  ArrowRight,
  ShieldCheck,
  Truck,
  RotateCcw,
  ChevronRight,
  Gift,
  CreditCard,
} from 'lucide-react';
import { PRODUCTS, CATEGORIES, CategoryItem } from '@/lib/data/mockData';
import { useCartStore } from '@/lib/store/useCartStore';
import { ProductItem } from '@/lib/types/ecommerce';

// Map common URLs to standard categories
function resolveCategoryData(rawSlug: string): { category: CategoryItem; filterKey: string; ritualTitle: string; ritualText: string } | null {
  const s = rawSlug.toLowerCase().trim();
  
  let targetSlug = s;
  if (s === 'candles' || s === 'candle' || s === 'bougie' || s === 'home') targetSlug = 'home-living';
  else if (s === 'perfume' || s === 'parfum' || s === 'fragrances') targetSlug = 'fragrance';
  else if (s === 'haircare' || s === 'hair-care') targetSlug = 'hair';
  else if (s === 'skin' || s === 'skin-care') targetSlug = 'skincare';
  else if (s === 'body' || s === 'bath') targetSlug = 'body-bath';
  else if (s === 'accessory') targetSlug = 'accessories';

  const cat = CATEGORIES.find((c) => c.slug === targetSlug);
  if (!cat) return null;

  const rituals: Record<string, { ritualTitle: string; ritualText: string }> = {
    hair: {
      ritualTitle: 'The Regenerative Hair Ritual',
      ritualText:
        'Warm 2 to 3 drops of L’Huile Sublime between palms to activate cold-pressed botanical lipids. Smooth through damp lengths to seal cuticle porosity before thermal styling or overnight repair.',
    },
    fragrance: {
      ritualTitle: 'The Haute Parfumerie Extraction & Aging',
      ritualText:
        'Aged in charred French oak casks for eighteen months, our extraits possess a 32% oil concentration. Mist pulse points from 15cm distance; allow amber warmth to unfold over a 24-hour olfactory journey.',
    },
    skincare: {
      ritualTitle: 'Biomimetic Cellular Infusion',
      ritualText:
        'Formulated with micro-fractionated botanical actives that mirror the skin’s natural lipid bilayer. Press into clean skin morning and evening for restorative barrier defense and dewy luminosity.',
    },
    'body-bath': {
      ritualTitle: 'Sensory Mineral & Botanical Bath Ritual',
      ritualText:
        'Infuse bath water with botanical salts and velvety oils. Gently buff skin in circular motions to polish away dead cells while wrapping the body in restorative Roman chamomile nectar.',
    },
    'home-living': {
      ritualTitle: 'Feu de Cèdre Artisanal Candle & Atmospheric Care',
      ritualText:
        'On first lighting, burn your hand-poured ceramic bougie for at least three consecutive hours until an even melt pool reaches the container edge. Trim wick to 5mm before every lighting for a clean, soot-free 65-hour aroma.',
    },
    accessories: {
      ritualTitle: 'Artisanal Craftsmanship & Leather Preservation',
      ritualText:
        'Hand-stitched in Tuscan workshops using vegetable-tanned Italian leather and solid brass hardware. Condition seasonally with natural beeswax to cultivate an enduring, personalized patina.',
    },
  };

  const ritual = rituals[targetSlug] || {
    ritualTitle: 'Artisanal Formulation Philosophy',
    ritualText: 'Crafted in small batches with uncompromising material purity and unhurried French techniques.',
  };

  return {
    category: cat,
    filterKey: cat.name,
    ritualTitle: ritual.ritualTitle,
    ritualText: ritual.ritualText,
  };
}

export default function CategoryDetailPage() {
  const params = useParams();
  const slug = (params?.slug as string) || '';
  const resolved = resolveCategoryData(slug);

  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'featured' | 'price-asc' | 'price-desc' | 'rating'>('featured');
  const [hoveredProductId, setHoveredProductId] = useState<string | null>(null);
  const [justAddedId, setJustAddedId] = useState<string | null>(null);

  const { addItem, openCart } = useCartStore();

  if (!resolved) {
    return (
      <div className="min-h-screen bg-ry-pearl pt-32 pb-24 px-4 text-center font-sans">
        <div className="max-w-md mx-auto bg-ry-white p-8 border border-ry-ash shadow-sm">
          <h2 className="font-serif text-2xl text-ry-onyx mb-2">Category Not Found</h2>
          <p className="text-xs text-ry-stone mb-6">
            We could not find the category &ldquo;{slug}&rdquo;. Explore our full collection of hair, fragrances, and candles.
          </p>
          <Link
            href="/products"
            className="px-6 py-3 bg-ry-burgundy text-ry-white text-xs uppercase tracking-editorial inline-block hover:bg-ry-burgundyLight transition-colors"
          >
            Explore All Products
          </Link>
        </div>
      </div>
    );
  }

  const { category, filterKey, ritualTitle, ritualText } = resolved;

  // Filter products matching this category
  const categoryProducts = useMemo(() => {
    return PRODUCTS.filter((product) => {
      const matchCat =
        product.category === filterKey ||
        (category.slug === 'hair' && (product.category === 'Hair' || product.category === 'Hair Care')) ||
        (category.slug === 'home-living' && (product.category === 'Home & Living' || product.title.toLowerCase().includes('candle') || product.title.toLowerCase().includes('bougie'))) ||
        (category.slug === 'fragrance' && (product.category === 'Haute Parfumerie' || product.category.toLowerCase().includes('perfume'))) ||
        (category.slug === 'skincare' && product.category === 'Botanical Skincare') ||
        (category.slug === 'body-bath' && product.category === 'Body & Bath') ||
        (category.slug === 'accessories' && product.category === 'Accessories');

      const matchSearch =
        searchQuery === '' ||
        product.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.subtitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description.toLowerCase().includes(searchQuery.toLowerCase());

      return matchCat && matchSearch;
    }).sort((a, b) => {
      if (sortBy === 'price-asc') return a.basePrice - b.basePrice;
      if (sortBy === 'price-desc') return b.basePrice - a.basePrice;
      if (sortBy === 'rating') return b.rating - a.rating;
      return 0;
    });
  }, [category.slug, filterKey, searchQuery, sortBy]);

  const handleQuickAdd = (product: ProductItem, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const defaultVariant = product.variants[0];
    const heroImage = product.images.find((img) => img.isHero) || product.images[0];

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
    }, 400);
  };

  return (
    <div className="min-h-screen bg-ry-pearl text-ry-onyx font-sans">
      {/* 1. Category Hero Banner */}
      <section className="relative min-h-[46vh] sm:min-h-[52vh] flex items-center justify-center overflow-hidden bg-ry-wine text-ry-white pt-24 pb-16">
        <div className="absolute inset-0 z-0">
          <Image
            src={category.image}
            alt={category.name}
            fill
            priority
            sizes="100vw"
            className="object-cover opacity-35 scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-ry-wine via-ry-wine/70 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-ry-wine/90 via-transparent to-ry-wine/90" />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 text-center">
          {/* Breadcrumbs */}
          <nav className="flex items-center justify-center gap-2 text-[10px] uppercase tracking-editorial text-ry-ash/70 mb-4">
            <Link href="/" className="hover:text-ry-white transition-colors">Home</Link>
            <ChevronRight className="w-3 h-3 text-ry-ash/50" />
            <Link href="/#categories" className="hover:text-ry-white transition-colors">Categories</Link>
            <ChevronRight className="w-3 h-3 text-ry-ash/50" />
            <span className="text-ry-white font-medium">{category.name}</span>
          </nav>

          {category.featuredTag && (
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-ry-white/10 border border-ry-white/20 text-[9px] uppercase tracking-editorial text-ry-ash mb-3">
              <Sparkles className="w-3 h-3 text-amber-300" />
              <span>{category.featuredTag}</span>
            </div>
          )}

          <h1 className="font-serif text-3xl sm:text-5xl md:text-6xl font-normal leading-tight text-ry-white tracking-tight mb-3">
            {category.name}
          </h1>

          <p className="text-xs sm:text-sm text-ry-ash/90 max-w-xl mx-auto leading-relaxed font-light">
            {category.description}
          </p>

          {/* Sub-Banner Trust Pillars */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3 sm:gap-6 text-[10px] uppercase tracking-editorial text-ry-ash/80 pt-4 border-t border-ry-white/15">
            <span className="flex items-center gap-1.5">
              <Truck className="w-3.5 h-3.5 text-amber-200" />
              Free UK Shipping Over £150
            </span>
            <span>•</span>
            <span className="flex items-center gap-1.5">
              <CreditCard className="w-3.5 h-3.5 text-emerald-300" />
              Klarna (Pay in 3) & Clearpay (Pay in 4)
            </span>
            <span>•</span>
            <span className="flex items-center gap-1.5">
              <Gift className="w-3.5 h-3.5 text-amber-200" />
              2 Free Deluxe Samples
            </span>
          </div>
        </div>
      </section>

      {/* 2. Catalog Filter & Search Toolbar */}
      <section className="py-8 bg-ry-white border-b border-ry-ash/70 sticky top-16 z-20 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          
          <div className="flex items-center gap-3">
            <span className="text-xs uppercase tracking-editorial font-medium text-ry-onyx">
              {category.name} Department
            </span>
            <span className="text-xs text-ry-stone font-mono">
              ({categoryProducts.length} {categoryProducts.length === 1 ? 'Product' : 'Products'})
            </span>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            {/* Search Input */}
            <div className="relative min-w-[220px]">
              <Search className="w-3.5 h-3.5 text-ry-stone absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder={`Search ${category.name.toLowerCase()}...`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-ry-pearl text-xs border border-ry-ash focus:outline-none focus:border-ry-onyx text-ry-onyx placeholder-ry-stone transition-colors"
              />
            </div>

            {/* Sort Selector */}
            <div className="flex items-center gap-2">
              <ArrowUpDown className="w-3.5 h-3.5 text-ry-stone shrink-0" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-ry-pearl border border-ry-ash px-3 py-2 text-xs text-ry-onyx focus:outline-none focus:border-ry-onyx transition-colors cursor-pointer"
              >
                <option value="featured">Featured Curations</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="rating">Highest Rated</option>
              </select>
            </div>
          </div>

        </div>
      </section>

      {/* 3. Product Grid */}
      <section className="py-16 sm:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {categoryProducts.length === 0 ? (
          <div className="text-center py-20 bg-ry-white border border-ry-ash/70 p-8 max-w-lg mx-auto">
            <Sparkles className="w-8 h-8 text-ry-stone/60 mx-auto mb-3" />
            <h3 className="font-serif text-2xl text-ry-onyx mb-2">No Formulations Found</h3>
            <p className="text-xs text-ry-stone mb-6">
              No products found matching &ldquo;{searchQuery}&rdquo; in {category.name}. Try a different search term or explore other departments.
            </p>
            <button
              onClick={() => setSearchQuery('')}
              className="px-6 py-3 bg-ry-burgundy text-ry-white text-xs uppercase tracking-editorial font-medium hover:bg-ry-burgundyLight transition-colors"
            >
              Reset Search Filter
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-10">
            {categoryProducts.map((product) => {
              const defaultVariant = product.variants[0];
              const heroImage = product.images.find((img) => img.isHero) || product.images[0];
              const secondaryImage = product.images[1] || heroImage;
              const isHovered = hoveredProductId === product.id;
              const isJustAdded = justAddedId === product.id;

              const klarnaPayment = Math.max(1, Math.round((product.basePrice / 3) * 100) / 100);
              const clearpayPayment = Math.max(1, Math.round((product.basePrice / 4) * 100) / 100);

              return (
                <div
                  key={product.id}
                  className="group flex flex-col justify-between bg-ry-white border border-ry-ash/60 hover:border-ry-onyx/40 transition-all duration-300 hover:shadow-luxury"
                  onMouseEnter={() => setHoveredProductId(product.id)}
                  onMouseLeave={() => setHoveredProductId(null)}
                >
                  {/* Card Top: Image & Badges */}
                  <div>
                    <div className="relative aspect-[3/4] w-full overflow-hidden bg-ry-oatmeal">
                      <Link href={`/products/${product.slug}`} className="block w-full h-full">
                        <Image
                          src={isHovered ? secondaryImage.url : heroImage.url}
                          alt={product.title}
                          fill
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                          className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                        />
                      </Link>

                      {/* Department / Category Pill */}
                      <span className="absolute top-3 left-3 bg-ry-white/95 backdrop-blur-sm px-2 py-0.5 text-[9px] uppercase tracking-editorial text-ry-onyx font-medium">
                        {product.category}
                      </span>

                      {/* Compare at price / discount badge */}
                      {product.compareAtPrice && (
                        <span className="absolute top-3 right-3 bg-ry-burgundy text-ry-white px-2 py-0.5 text-[9px] uppercase tracking-editorial font-medium">
                          Exclusive Offer
                        </span>
                      )}

                      {/* Quick View overlay button */}
                      <Link
                        href={`/products/${product.slug}`}
                        className="absolute bottom-3 left-3 right-3 py-2.5 bg-ry-white/90 backdrop-blur-sm text-ry-onyx text-[10px] uppercase tracking-editorial font-medium flex items-center justify-center gap-1.5 opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-ry-white"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>View Product Detail</span>
                      </Link>
                    </div>

                    {/* Card Body */}
                    <div className="p-6">
                      {/* Rating */}
                      <div className="flex items-center gap-1.5 mb-2">
                        <div className="flex text-amber-500">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-3 h-3 ${i < Math.floor(product.rating) ? 'fill-current' : 'opacity-30'}`}
                            />
                          ))}
                        </div>
                        <span className="text-[10px] font-mono text-ry-stone">
                          {product.rating} ({product.reviewCount})
                        </span>
                      </div>

                      {/* Title & Subtitle */}
                      <Link href={`/products/${product.slug}`}>
                        <h3 className="font-serif text-lg text-ry-onyx group-hover:underline line-clamp-1 mb-1">
                          {product.title}
                        </h3>
                      </Link>
                      <p className="text-xs text-ry-stone line-clamp-2 leading-relaxed mb-4">
                        {product.subtitle || product.summary}
                      </p>

                      {/* Pricing */}
                      <div className="flex items-baseline gap-2 pb-3 border-b border-ry-ash/40">
                        <span className="font-serif text-xl font-medium text-ry-onyx">
                          £{product.basePrice.toFixed(2)}
                        </span>
                        {product.compareAtPrice && (
                          <span className="text-xs font-mono text-ry-stone line-through">
                            £{product.compareAtPrice.toFixed(2)}
                          </span>
                        )}
                        <span className="text-[10px] text-ry-stone ml-auto uppercase tracking-editorial">
                          {defaultVariant.title}
                        </span>
                      </div>

                      {/* Klarna & Clearpay Installments Micro-Tag */}
                      <div className="mt-3 pt-1 text-[10px] text-ry-stone flex flex-wrap items-center gap-1.5">
                        <span className="bg-[#FFA8CD] text-black font-bold px-1 py-0.2 rounded-xs text-[9px]">
                          Klarna.
                        </span>
                        <span>3 x £{klarnaPayment.toFixed(2)}</span>
                        <span>•</span>
                        <span className="bg-[#B2ECE1] text-black font-bold px-1 py-0.2 rounded-xs text-[9px]">
                          clearpay✦
                        </span>
                        <span>4 x £{clearpayPayment.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Card Bottom: Quick Add Button */}
                  <div className="p-6 pt-0">
                    <button
                      onClick={(e) => handleQuickAdd(product, e)}
                      disabled={isJustAdded}
                      className={`w-full py-3 text-xs uppercase tracking-editorial font-medium flex items-center justify-center gap-2 transition-all duration-300 ${
                        isJustAdded
                          ? 'bg-emerald-700 text-ry-white'
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
                          <span>Add to Cart • £{product.basePrice.toFixed(2)}</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* 4. Category Craftsmanship & Ritual Editorial Box */}
      <section className="bg-ry-oatmeal/60 border-t border-b border-ry-ash/70 py-16 sm:py-20 font-sans">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
          <div className="md:col-span-5 relative aspect-[4/3] overflow-hidden border border-ry-ash bg-ry-white">
            <Image
              src={category.image}
              alt={ritualTitle}
              fill
              sizes="(max-width: 768px) 100vw, 400px"
              className="object-cover"
            />
          </div>

          <div className="md:col-span-7 space-y-4">
            <span className="text-[10px] uppercase tracking-[0.3em] text-ry-stone block font-medium">
              Atelier Ritual & Application
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl text-ry-onyx">
              {ritualTitle}
            </h2>
            <p className="text-xs sm:text-sm text-ry-stone leading-relaxed font-light">
              {ritualText}
            </p>
            <div className="pt-2 flex items-center gap-4 text-xs font-medium uppercase tracking-editorial text-ry-onyx">
              <Link href="/products" className="underline hover:opacity-70 transition-opacity">
                Explore All {category.name}
              </Link>
              <span>•</span>
              <Link href="/#philosophy" className="underline hover:opacity-70 transition-opacity">
                Material Transparency
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Explore Other Categories Navigation Bar */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <span className="text-[10px] uppercase tracking-[0.3em] text-ry-stone block mb-2 font-medium">
          Continue Exploring
        </span>
        <h3 className="font-serif text-2xl text-ry-onyx mb-8">
          Other Curated Departments
        </h3>

        <div className="flex flex-wrap items-center justify-center gap-3">
          {CATEGORIES.map((c) => (
            <Link
              key={c.id}
              href={`/category/${c.slug}`}
              className={`px-4 py-2 border text-xs uppercase tracking-editorial transition-all ${
                c.slug === category.slug
                  ? 'border-ry-onyx bg-ry-onyx text-ry-white'
                  : 'border-ry-ash/70 bg-ry-white text-ry-onyx hover:border-ry-onyx hover:bg-ry-pearl'
              }`}
            >
              {c.name}
            </Link>
          ))}
          <Link
            href="/products"
            className="px-4 py-2 border border-ry-burgundy text-ry-burgundy text-xs uppercase tracking-editorial hover:bg-ry-burgundy hover:text-ry-white transition-all font-medium"
          >
            Shop All &rarr;
          </Link>
        </div>
      </section>
    </div>
  );
}
