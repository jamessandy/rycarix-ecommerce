// app/category/[slug]/page.tsx
import React from 'react';
import ProductCatalog from '@/components/home/ProductCatalog';

export const dynamic = 'force-dynamic';

interface CategoryPageProps {
  params: { slug: string };
}

export default function CategoryPage({ params }: CategoryPageProps) {
  const categorySlug = decodeURIComponent(params.slug || 'all').toLowerCase();

  return (
    <main className="min-h-screen bg-white pt-20">
      <ProductCatalog initialCategory={categorySlug} />
    </main>
  );
}
