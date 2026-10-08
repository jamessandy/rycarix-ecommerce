'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';

export default function TransparencySection() {
  return (
    <section id="transparency" className="py-24 sm:py-32 bg-ry-pearl text-ry-onyx border-b border-ry-ash/60 overflow-hidden font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Heading */}
        <div className="max-w-3xl mb-16 sm:mb-24">
          <span className="text-[11px] uppercase tracking-[0.3em] text-ry-stone font-sans block mb-3">
            Transparency
          </span>
          <h2 className="font-serif text-3xl sm:text-5xl font-normal leading-[1.15] text-ry-onyx">
            Ingredient Transparency. <br />
            <span className="italic font-light">Ethically Sourced & Cleanly Formulated.</span>
          </h2>
        </div>

        {/* Documentary Staggered Layout */}
        <div className="space-y-24 sm:space-y-36">
          
          {/* Block 1: Sourcing */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 items-center">
            <div className="lg:col-span-7 relative">
              <div className="relative aspect-[16/10] bg-ry-oatmeal border border-ry-ash/60 overflow-hidden shadow-luxury">
                <Image
                  src="https://images.unsplash.com/photo-1509198397868-475647b2a1e5?q=80&w=1200&auto=format&fit=crop"
                  alt="Organic botanicals farm"
                  fill
                  sizes="(max-width: 1024px) 100vw, 60vw"
                  className="object-cover"
                />
              </div>
              <div className="hidden sm:block absolute -bottom-8 -right-8 w-56 bg-ry-white p-4 border border-ry-ash text-[10px] uppercase tracking-editorial text-ry-stone shadow-sm">
                Certified Ethical Sourcing • Grasse, Florence & Atlas Groves
              </div>
            </div>

            <div className="lg:col-span-5 space-y-4">
              <span className="text-[10px] uppercase tracking-editorial text-ry-stone">
                01 • Direct Sourcing
              </span>
              <h3 className="font-serif text-2xl sm:text-3xl text-ry-onyx">
                Direct Partnerships with Growers & Artisans
              </h3>
              <p className="text-xs sm:text-sm text-ry-charcoal/80 leading-relaxed font-sans">
                We work directly with growers and independent makers for our cold-pressed rosehip, wild blue tansy, Limoges ceramic vessels, and Italian leather accessories. Every ingredient is traced to source, guaranteeing purity and sustainability.
              </p>
              <div className="pt-2">
                <Link
                  href="/#catalog"
                  className="inline-block text-[11px] uppercase tracking-editorial text-ry-onyx font-medium border-b border-ry-onyx pb-0.5"
                >
                  Shop All Products →
                </Link>
              </div>
            </div>
          </div>

          {/* Block 2: Clean Formulation */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 items-center">
            <div className="lg:col-span-5 order-2 lg:order-1 space-y-4">
              <span className="text-[10px] uppercase tracking-editorial text-ry-stone">
                02 • Clean Formulations
              </span>
              <h3 className="font-serif text-2xl sm:text-3xl text-ry-onyx">
                Effective Without Compromise
              </h3>
              <p className="text-xs sm:text-sm text-ry-charcoal/80 leading-relaxed font-sans">
                Our clean formulas preserve active botanicals without synthetic fillers, parabens, or harsh sulfates. Every item arrives in recyclable packaging and climate-friendly shipping boxes.
              </p>
              <div className="pt-2">
                <span className="inline-block text-[11px] uppercase tracking-editorial text-ry-onyx font-medium border-b border-ry-onyx pb-0.5">
                  100% Cruelty-Free & Recyclable Packaging
                </span>
              </div>
            </div>

            <div className="lg:col-span-7 order-1 lg:order-2 relative">
              <div className="relative aspect-[16/10] bg-ry-oatmeal border border-ry-ash/60 overflow-hidden shadow-luxury">
                <Image
                  src="https://images.unsplash.com/photo-1526947425960-945c6e72858f?q=80&w=1200&auto=format&fit=crop"
                  alt="Precision laboratory formulation"
                  fill
                  sizes="(max-width: 1024px) 100vw, 60vw"
                  className="object-cover"
                />
              </div>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
