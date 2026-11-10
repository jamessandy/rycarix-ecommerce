'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Package } from 'lucide-react';
import { ProductItem } from '@/lib/types/ecommerce';
import ProductDetailView from './ProductDetailView';

interface ProductDetailContainerProps {
  slug: string;
  initialProduct?: ProductItem | null;
}

export default function ProductDetailContainer({ slug, initialProduct }: ProductDetailContainerProps) {
  const [product, setProduct] = useState<ProductItem | null>(initialProduct || null);
  const [isLoading, setIsLoading] = useState(!initialProduct);

  useEffect(() => {
    let active = true;

    const refreshProduct = async () => {
      try {
        const res = await fetch(`/api/products?slug=${encodeURIComponent(slug)}&includeDrafts=false`, {
          cache: 'no-store',
        });
        if (!active) return;

        if (res.ok) {
          const data = await res.json();
          setProduct(data?.product || null);
        } else if (res.status === 404) {
          setProduct(null);
        }
      } catch (e) {
        console.warn('Could not refresh product from API', e);
      } finally {
        if (active) setIsLoading(false);
      }
    };

    refreshProduct();

    window.addEventListener('rycarix-catalog-updated', refreshProduct);
    window.addEventListener('focus', refreshProduct);
    return () => {
      active = false;
      window.removeEventListener('rycarix-catalog-updated', refreshProduct);
      window.removeEventListener('focus', refreshProduct);
    };
  }, [slug]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-ry-pearl flex items-center justify-center pt-28 font-sans">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-full border-2 border-ry-onyx border-t-transparent animate-spin" />
          <span className="text-xs uppercase tracking-editorial text-ry-stone">
            Loading Product...
          </span>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-ry-pearl text-ry-onyx pt-36 pb-24 px-4 flex flex-col items-center justify-center font-sans">
        <div className="max-w-md w-full bg-ry-white border border-ry-ash/80 p-8 sm:p-10 text-center shadow-lg">
          <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-ry-pearl border border-ry-ash flex items-center justify-center text-ry-stone">
            <Package className="w-6 h-6 stroke-[1.4]" />
          </div>
          <span className="text-[10px] uppercase tracking-[0.3em] text-ry-stone block mb-2">
            Rycarix Store
          </span>
          <h1 className="font-serif text-2xl text-ry-onyx mb-3">Product Not Found</h1>
          <p className="text-xs text-ry-stone mb-6 leading-relaxed">
            The product you are searching for may have been archived or is temporarily unavailable.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/#catalog"
              className="px-6 py-3 bg-ry-burgundy text-ry-white text-xs uppercase tracking-editorial font-medium hover:bg-ry-burgundyLight transition-colors"
            >
              Explore Full Collection
            </Link>
            <Link
              href="/"
              className="px-6 py-3 bg-ry-pearl border border-ry-ash text-ry-onyx text-xs uppercase tracking-editorial font-medium hover:bg-ry-oatmeal transition-colors"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const mergedProduct = {
    ...product,
    id: product.id,
    name: (product as any).name || (product as any).title || 'Product',
    title: (product as any).title || (product as any).name || 'Product',
    slug: product.slug,
    description: (product as any).description || (product as any).summary || '',
    price: Number((product as any).price ?? (product as any).basePrice ?? 0),
    basePrice: Number((product as any).price ?? (product as any).basePrice ?? 0),
    compareAtPrice: (product as any).compareAtPrice ? Number((product as any).compareAtPrice) : undefined,
    stock: Number((product as any).stock ?? (product as any).variants?.[0]?.inventory ?? 0),
    category: (product as any).category || 'Parfum',
    images: (product as any).images || [],
    variants: (product as any).variants || [],
    attributes: (product as any).attributes || {},
    ingredients: (product as any).ingredients || '',
    howToUse: (product as any).howToUse || '',
    sourcingEthics: (product as any).sourcingEthics || '',
  };

  return (
    <div className="pt-24 bg-white min-h-screen">
      <ProductDetailView product={mergedProduct} />
    </div>
  );
}

