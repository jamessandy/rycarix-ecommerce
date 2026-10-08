'use client';

import React, { useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, Droplet, Sparkles } from 'lucide-react';
import { PRODUCTS } from '@/lib/data/mockData';
import { useCartStore } from '@/lib/store/useCartStore';
import KlarnaWidget from '@/components/klarna/KlarnaWidget';

export default function ProductCarousel() {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [hoveredProductId, setHoveredProductId] = useState<string | null>(null);
  const { addItem, openCart } = useCartStore();

  const handleScroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = direction === 'left' ? -380 : 380;
      scrollContainerRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  const handleQuickAdd = (product: (typeof PRODUCTS)[0]) => {
    const defaultVariant = product.variants[0];
    const heroImage = product.images.find((img) => img.isHero)?.url || product.images[0].url;

    addItem({
      id: `${product.id}-${defaultVariant.id}`,
      productId: product.id,
      variantId: defaultVariant.id,
      title: product.title,
      variantTitle: defaultVariant.title,
      sku: defaultVariant.sku,
      price: defaultVariant.price,
      quantity: 1,
      image: heroImage,
    });
    openCart();
  };

  return (
    <section id="collection" className="py-24 bg-ry-pearlDark/40 text-ry-onyx overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Carousel Header & Controls */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-12 pb-6 border-b border-ry-ash/70">
          <div>
            <span className="text-[10px] uppercase tracking-[0.3em] text-ry-stone font-sans block mb-2">
              Curated Formulations & Perfumes
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl text-ry-onyx font-normal">
              The Permanent Collection
            </h2>
            <p className="text-xs text-ry-stone font-sans mt-1">
              Hover over any creation to reveal its tactile microscopic emulsion or resin texture.
            </p>
          </div>

          <div className="flex items-center gap-3 mt-6 sm:mt-0">
            <button
              onClick={() => handleScroll('left')}
              className="w-10 h-10 border border-ry-ash bg-ry-white flex items-center justify-center hover:bg-ry-onyx hover:text-ry-white transition-colors"
              aria-label="Previous products"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleScroll('right')}
              className="w-10 h-10 border border-ry-ash bg-ry-white flex items-center justify-center hover:bg-ry-onyx hover:text-ry-white transition-colors"
              aria-label="Next products"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Drag / Snap Horizontal Container */}
        <div
          ref={scrollContainerRef}
          className="flex gap-6 overflow-x-auto pb-8 snap-x snap-mandatory scrollbar-none scroll-smooth -mx-4 px-4 sm:mx-0 sm:px-0"
        >
          {PRODUCTS.map((product) => {
            const heroImage = product.images.find((img) => img.isHero) || product.images[0];
            const textureImage = product.images.find((img) => img.isTexture) || product.images[1] || heroImage;
            const isHovered = hoveredProductId === product.id;

            return (
              <div
                key={product.id}
                className="w-[280px] sm:w-[340px] shrink-0 snap-start group flex flex-col justify-between bg-ry-white border border-ry-ash/60 p-5 transition-shadow hover:shadow-luxury"
                onMouseEnter={() => setHoveredProductId(product.id)}
                onMouseLeave={() => setHoveredProductId(null)}
              >
                {/* Image Stage with Interactive Texture Swap */}
                <Link
                  href={`/products/${product.slug}`}
                  className="relative aspect-[3/4] w-full bg-ry-oatmeal overflow-hidden block mb-4"
                >
                  {/* Primary Flacon Image */}
                  <Image
                    src={heroImage.url}
                    alt={heroImage.alt}
                    fill
                    sizes="(max-width: 640px) 280px, 340px"
                    className={`object-cover object-center transition-all duration-700 ease-out ${
                      isHovered ? 'opacity-0 scale-105' : 'opacity-100 scale-100'
                    }`}
                  />

                  {/* Macro Texture Shot Revealed on Hover */}
                  <Image
                    src={textureImage.url}
                    alt={textureImage.alt}
                    fill
                    sizes="(max-width: 640px) 280px, 340px"
                    className={`object-cover object-center transition-all duration-700 ease-out ${
                      isHovered ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
                    }`}
                  />

                  {/* Sensory Texture Hover Indicator Pill */}
                  <div
                    className={`absolute bottom-3 left-3 right-3 text-center py-1.5 px-2 bg-ry-onyx/85 backdrop-blur-sm text-[9px] uppercase tracking-editorial text-ry-white transition-all duration-300 font-sans ${
                      isHovered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
                    }`}
                  >
                    Macro Texture Revealed
                  </div>

                  {/* Category Pill */}
                  <span className="absolute top-3 left-3 px-2 py-0.5 bg-ry-pearl/90 backdrop-blur-xs text-[9px] uppercase tracking-editorial text-ry-stone border border-ry-ash/40">
                    {product.category}
                  </span>
                </Link>

                {/* Details */}
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="font-serif text-lg text-ry-onyx font-normal line-clamp-1 group-hover:underline underline-offset-4">
                      <Link href={`/products/${product.slug}`}>
                        {product.title}
                      </Link>
                    </h3>
                    <p className="text-[11px] text-ry-stone line-clamp-1 mt-0.5 font-sans">
                      {product.subtitle}
                    </p>
                  </div>

                  {/* Pricing & Klarna */}
                  <div className="mt-4 pt-3 border-t border-ry-ash/50 space-y-2">
                    <div className="flex items-baseline justify-between">
                      <span className="font-serif text-base text-ry-onyx">
                        £{product.basePrice.toFixed(2)}
                      </span>
                      <span className="text-[10px] text-ry-stone uppercase tracking-subtle">
                        {product.variants[0]?.title}
                      </span>
                    </div>

                    <KlarnaWidget price={product.basePrice} compact={true} />

                    {/* Quick Add CTA */}
                    <div className="pt-2 flex gap-2">
                      <button
                        onClick={() => handleQuickAdd(product)}
                        className="flex-1 py-2.5 bg-ry-onyx text-ry-white text-[10px] uppercase tracking-editorial hover:bg-ry-charcoal transition-colors flex items-center justify-center gap-1.5"
                      >
                        <Droplet className="w-3 h-3" />
                        <span>Quick Bag</span>
                      </button>
                      <Link
                        href={`/products/${product.slug}`}
                        className="px-3 py-2.5 border border-ry-ash text-ry-onyx text-[10px] uppercase tracking-editorial hover:bg-ry-oatmeal transition-colors flex items-center justify-center"
                      >
                        Details
                      </Link>
                    </div>
                  </div>
                </div>

              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
