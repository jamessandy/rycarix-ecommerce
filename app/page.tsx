'use client';

import React, { useState } from 'react';
import Hero from '@/components/home/Hero';
import PerksBanner from '@/components/home/PerksBanner';
import CategoryGrid from '@/components/home/CategoryGrid';
import ProductCatalog from '@/components/home/ProductCatalog';
import FeaturedEditorial from '@/components/home/FeaturedEditorial';
import Philosophy from '@/components/home/Philosophy';
import CustomerReviews from '@/components/home/CustomerReviews';
import TransparencySection from '@/components/home/TransparencySection';

export default function HomePage() {
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  const handleSelectCategory = (categoryName: string) => {
    setSelectedCategory(categoryName);
    const catalogElement = document.getElementById('catalog');
    if (catalogElement) {
      catalogElement.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <main className="min-h-screen bg-ry-pearl">
      {/* 1. E-Commerce Flagship Hero */}
      <Hero onSelectCategory={handleSelectCategory} />

      {/* 2. E-Commerce Perks & Trust Guarantees */}
      <PerksBanner />

      {/* 3. Curated Departments Grid */}
      <CategoryGrid onSelectCategory={handleSelectCategory} />

      {/* 4. Complete Interactive Product Catalog & Shop */}
      <ProductCatalog selectedCategory={selectedCategory} />

      {/* 5. Cross-Category Lifestyle Editorial Feature */}
      <FeaturedEditorial />

      {/* 6. Brand Pillars & Material Integrity */}
      <Philosophy />

      {/* 7. Verified Customer Reviews & Press Accolades */}
      <CustomerReviews />

      {/* 8. Terroir & Workshop Transparency */}
      <TransparencySection />
    </main>
  );
}
