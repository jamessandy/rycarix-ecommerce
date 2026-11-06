// app/products/[slug]/page.tsx
import React from 'react';
import { Metadata } from 'next';
import { PRODUCTS } from '@/lib/data/mockData';
import { catalogService } from '@/lib/services/catalogService';
import ProductDetailContainer from '@/components/pdp/ProductDetailContainer';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface ProductPageProps {
  params: {
    slug: string;
  };
}

async function getProductFromAllSources(slug: string): Promise<any | null> {
  try {
    const fromCatalog = await catalogService.getProductBySlug(slug);
    if (fromCatalog) return fromCatalog;
  } catch (e) {}

  const found = PRODUCTS.find((p) => p.slug === slug || p.id === slug);
  if (found) return found;

  return null;
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const product = await getProductFromAllSources(params.slug);
  if (!product) return { title: 'Product Detail | Rycarix Parfum & Care' };

  const name = product.name || product.title;
  const desc = product.description || product.summary || product.subtitle || '';
  const imgUrl = Array.isArray(product.images) && product.images[0]
    ? typeof product.images[0] === 'string'
      ? product.images[0]
      : product.images[0]?.url
    : '';

  return {
    title: `${name} | Rycarix Parfum & Care`,
    description: desc,
    openGraph: {
      title: name,
      description: desc,
      images: imgUrl ? [{ url: imgUrl }] : [],
    },
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const product = await getProductFromAllSources(params.slug);

  return <ProductDetailContainer slug={params.slug} initialProduct={product} />;
}
