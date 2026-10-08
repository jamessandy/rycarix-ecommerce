'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Sparkles } from 'lucide-react';
import { PRODUCTS } from '@/lib/data/mockData';
import { useCartStore } from '@/lib/store/useCartStore';

export default function FeaturedEditorial() {
  const { addItem, openCart } = useCartStore();

  const handleAddBundle = () => {
    // Add the 3 featured ritual items: Candle, Night Balm, and Silk Mask
    const ritualSlugs = [
      'flamme-noire-scented-candle',
      'regenerative-barrier-night-balm',
      'pure-mulberry-silk-sleep-mask',
    ];

    ritualSlugs.forEach((slug) => {
      const prod = PRODUCTS.find((p) => p.slug === slug);
      if (prod) {
        const variant = prod.variants[0];
        addItem({
          id: `${prod.id}-${variant.id}`,
          productId: prod.id,
          variantId: variant.id,
          title: prod.title,
          variantTitle: variant.title,
          sku: variant.sku,
          price: variant.price,
          quantity: 1,
          image: prod.images[0]?.url || '',
        });
      }
    });

    openCart();
  };

  return (
    <section className="py-24 sm:py-32 bg-ry-wine text-ry-white font-sans overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          {/* Left: Atmospheric Visual Collage */}
          <div className="lg:col-span-7 grid grid-cols-2 gap-4 sm:gap-6 relative">
            <div className="space-y-4 sm:space-y-6">
              <div className="relative aspect-[3/4] bg-ry-burgundyDeep overflow-hidden shadow-luxury">
                <Image
                  src="https://images.unsplash.com/photo-1603006905003-be475563bc59?q=80&w=1200&auto=format&fit=crop"
                  alt="Flamme Noire scented candle in moody evening atmosphere"
                  fill
                  sizes="(max-width: 1024px) 50vw, 35vw"
                  className="object-cover"
                />
              </div>
              <div className="relative aspect-[4/3] bg-ry-burgundyDeep overflow-hidden shadow-luxury">
                <Image
                  src="https://images.unsplash.com/photo-1556228720-195a672e8a03?q=80&w=1200&auto=format&fit=crop"
                  alt="Silky balm texture and night skincare"
                  fill
                  sizes="(max-width: 1024px) 50vw, 35vw"
                  className="object-cover"
                />
              </div>
            </div>

            <div className="space-y-4 sm:space-y-6 pt-8 sm:pt-12">
              <div className="relative aspect-[4/3] bg-ry-burgundyDeep overflow-hidden shadow-luxury">
                <Image
                  src="https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?q=80&w=1200&auto=format&fit=crop"
                  alt="Pure Mulberry Silk sleep mask"
                  fill
                  sizes="(max-width: 1024px) 50vw, 35vw"
                  className="object-cover"
                />
              </div>
              <div className="relative aspect-[3/4] bg-ry-burgundyDeep overflow-hidden shadow-luxury">
                <Image
                  src="https://images.unsplash.com/photo-1544816155-12df9643f363?q=80&w=1200&auto=format&fit=crop"
                  alt="Handcrafted Italian leather accessories"
                  fill
                  sizes="(max-width: 1024px) 50vw, 35vw"
                  className="object-cover"
                />
              </div>
            </div>
          </div>

          {/* Right: Curated Edit Narrative & Shop Set */}
          <div className="lg:col-span-5 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-ry-white/10 text-ry-ash text-[10px] uppercase tracking-editorial">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Featured Bundle</span>
            </div>

            <h2 className="font-serif text-3xl sm:text-5xl text-ry-white leading-[1.15] font-normal">
              The Evening Set: <br />
              <span className="italic font-light text-ry-oatmeal">Candle, Balm & Silk Mask</span>
            </h2>

            <p className="text-xs sm:text-sm text-ry-ash leading-relaxed font-light">
              Save 10% on our complete evening relaxation routine. Includes a hand-poured ceramic candle, barrier-restoring night balm, and pure 22-momme mulberry silk sleep mask.
            </p>

            {/* Set Items List */}
            <div className="space-y-3 pt-2 pb-4 border-y border-ry-burgundy/80 text-xs text-ry-ash">
              <div className="flex justify-between items-center">
                <span>01 • Flamme Noire Scented Candle</span>
                <span className="text-ry-white font-mono">£95</span>
              </div>
              <div className="flex justify-between items-center">
                <span>02 • Regenerative Barrier Night Balm (60ml)</span>
                <span className="text-ry-white font-mono">£125</span>
              </div>
              <div className="flex justify-between items-center">
                <span>03 • Pure Mulberry Silk Sleep Mask</span>
                <span className="text-ry-white font-mono">£68</span>
              </div>
            </div>

            {/* Price & Buy Bundle */}
            <div className="space-y-4">
              <div className="flex items-baseline justify-between">
                <div>
                  <span className="text-xs uppercase tracking-editorial text-ry-stone block">
                    Bundle Price
                  </span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-serif text-ry-white font-normal">£288.00</span>
                    <span className="text-xs text-ry-stone line-through font-mono">£320.00</span>
                    <span className="text-[10px] text-emerald-400 font-sans uppercase tracking-editorial">
                      Save 10%
                    </span>
                  </div>
                </div>

                <div className="text-right text-[10px] text-ry-stone">
                  <span>Pay in 4 installments of £72 with</span>
                  <div className="font-semibold text-black bg-[#FFA8CD] px-1 py-0.2 rounded inline-block ml-1">
                    Klarna.
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={handleAddBundle}
                  className="flex-1 py-3.5 px-6 bg-ry-white text-ry-burgundy text-xs uppercase tracking-editorial font-medium hover:bg-ry-oatmeal transition-all flex items-center justify-center gap-2 shadow-luxury active:scale-[0.99]"
                >
                  <span>Add Bundle to Cart</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>

                <Link
                  href="#catalog"
                  className="py-3.5 px-6 bg-transparent border border-ry-ash/40 text-ry-white text-xs uppercase tracking-editorial font-medium hover:bg-ry-white/10 transition-all text-center"
                >
                  View All Products
                </Link>
              </div>
            </div>

          </div>
        </div>

      </div>
    </section>
  );
}
