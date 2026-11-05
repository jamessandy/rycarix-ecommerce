import React from 'react';
import { Metadata } from 'next';
import fs from 'fs';
import path from 'path';
import { PRODUCTS } from '@/lib/data/mockData';
import { ProductItem } from '@/lib/types/ecommerce';
import ProductDetailContainer from '@/components/pdp/ProductDetailContainer';

interface ProductPageProps {
  params: {
    slug: string;
  };
}

function getProductFromAllSources(slug: string): ProductItem | null {
  // 1. Check static mockData
  let found = PRODUCTS.find((p) => p.slug === slug || p.id === slug);
  if (found) return found;

  // 2. Check server cache file
  try {
    const cacheFile = path.join('/tmp', 'rycarix_catalog_products.json');
    if (fs.existsSync(cacheFile)) {
      const serverList: ProductItem[] = JSON.parse(fs.readFileSync(cacheFile, 'utf8'));
      found = serverList.find((p) => p.slug === slug || p.id === slug);
      if (found) return found;
    }
  } catch (e) {}

  return null;
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const product = getProductFromAllSources(params.slug);
  if (!product) return { title: 'Product Detail | Rycarix Parfum & Care' };

  return {
    title: `${product.title} | Rycarix Parfum & Care`,
    description: product.summary || product.subtitle,
    openGraph: {
      title: product.title,
      description: product.summary || product.subtitle,
      images: product.images && product.images[0] ? [{ url: product.images[0].url }] : [],
    },
  };
}

export default function ProductPage({ params }: ProductPageProps) {
  const product = getProductFromAllSources(params.slug);

  return <ProductDetailContainer slug={params.slug} initialProduct={product} />;
}
