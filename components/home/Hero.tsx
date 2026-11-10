'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowDown, Sparkles, ArrowRight } from 'lucide-react';

interface HeroProps {
  onSelectCategory?: (category: string) => void;
}

export default function Hero({ onSelectCategory }: HeroProps) {
  const handleCategoryClick = (val: string) => {
    if (onSelectCategory) {
      onSelectCategory(val);
    }
    const target = document.getElementById('catalog');
    if (target) {
      target.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="relative min-h-[92vh] flex items-center justify-center overflow-hidden bg-ry-wine text-ry-white">
      {/* Background Media */}
      <div className="absolute inset-0 z-0">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-40 scale-105 transition-transform duration-1000 ease-out"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1547887537-6158d64c35b3?q=80&w=2000&auto=format&fit=crop')",
          }}
        />
        {/* Subtle gradient vignettes */}
        <div className="absolute inset-0 bg-gradient-to-t from-ry-wine via-ry-wine/40 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-ry-wine/80 via-transparent to-ry-wine/80" />
      </div>

      {/* Hero Content */}
      <div className="relative z-10 max-w-5xl mx-auto px-6 sm:px-8 text-center pt-24 pb-16">
        {/* Badge pill */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 border border-ry-white/20 bg-ry-white/10 backdrop-blur-md mb-6 animate-fade-in">
          <Sparkles className="w-3.5 h-3.5 text-ry-ash" />
          <span className="text-[10px] uppercase tracking-[0.3em] font-sans text-ry-ash">
            Luxury Hair, Parfum & Living
          </span>
        </div>

        {/* Headline */}
        <h1 className="font-serif text-4xl sm:text-6xl md:text-7xl font-normal leading-[1.12] tracking-tight mb-6 text-ry-white max-w-4xl mx-auto">
          Beauty, Style & Elegance. <br className="hidden sm:inline" />
          <span className="italic font-light text-ry-oatmeal">All in One Place.</span>
        </h1>

        <p className="font-sans text-xs sm:text-base text-ry-ash/90 max-w-2xl mx-auto mb-10 leading-relaxed font-light">
          Discover a collection of carefully selected beauty and lifestyle essentials designed to complement your individuality. From beautiful hair and signature fragrances to skincare and stylish accessories, RYCARIX brings together the little things that make you feel confident, beautiful and effortlessly elegant.
        </p>

        {/* Primary Call to Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 text-xs uppercase tracking-editorial font-sans mb-10">
          <a
            href="#catalog"
            className="w-full sm:w-auto px-8 py-4 bg-ry-white text-ry-burgundy font-medium hover:bg-ry-oatmeal transition-all shadow-luxury active:scale-[0.99] flex items-center justify-center gap-2"
          >
            <span>Shop All Products</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </a>

          <a
            href="#categories"
            className="w-full sm:w-auto px-8 py-4 bg-transparent border border-ry-white/40 text-ry-white hover:bg-ry-white/10 hover:border-ry-white transition-all text-center"
          >
            Shop By Category
          </a>
        </div>
      </div>

      {/* Scroll Indicator */}
      <a
        href="#catalog"
        className="absolute bottom-6 left-1/2 -translate-x-1/2 text-ry-ash/60 hover:text-ry-white transition-colors flex flex-col items-center gap-1 group"
        aria-label="Scroll to catalog"
      >
        <span className="text-[9px] uppercase tracking-editorial font-sans opacity-80">
          Shop Now
        </span>
        <ArrowDown className="w-3.5 h-3.5 group-hover:translate-y-1 transition-transform" />
      </a>
    </section>
  );
}
