import React from 'react';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { PRODUCTS } from '@/lib/data/mockData';
import ProductDetailView from '@/components/pdp/ProductDetailView';

interface ProductPageProps {
  params: {
    slug: string;
  };
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const product = PRODUCTS.find((p) => p.slug === params.slug);
  if (!product) return { title: 'Product Not Found | Rycarix' };

  return {
    title: `${product.title} | Rycarix Haute Parfumerie & Care`,
    description: product.summary,
    openGraph: {
      title: product.title,
      description: product.summary,
      images: [{ url: product.images[0]?.url }],
    },
  };
}

export default function ProductPage({ params }: ProductPageProps) {
  const product = PRODUCTS.find((p) => p.slug === params.slug);

  if (!product) {
    notFound();
  }

  return (
    <div className="pt-24 bg-ry-pearl min-h-screen">
      <ProductDetailView product={product} />
    </div>
  );
}
