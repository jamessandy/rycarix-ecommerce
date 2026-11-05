'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Package, Sparkles } from 'lucide-react';
import { ProductItem } from '@/lib/types/ecommerce';
import { PRODUCTS } from '@/lib/data/mockData';
import ProductDetailView from './ProductDetailView';

interface ProductDetailContainerProps {
  slug: string;
  initialProduct?: ProductItem | null;
}

export default function ProductDetailContainer({ slug, initialProduct }: ProductDetailContainerProps) {
  const [product, setProduct] = useState<ProductItem | null>(initialProduct || null);
  const [isLoading, setIsLoading] = useState(!initialProduct);

  useEffect(() => {
    // If we already have the product from server, check if there's a more updated version in localStorage
    let found: ProductItem | null = initialProduct || null;

    if (typeof window !== 'undefined') {
      try {
        const raw = localStorage.getItem('rycarix_catalog_products');
        if (raw) {
          const list: ProductItem[] = JSON.parse(raw);
          const match = list.find(
            (p) =>
              p.slug === slug ||
              p.id === slug ||
              p.slug.toLowerCase() === slug.toLowerCase() ||
              p.id.toLowerCase() === slug.toLowerCase()
          );
          if (match) {
            found = match;
          }
        }
      } catch (e) {
        console.warn('Could not read product from localStorage', e);
      }
    }

    if (!found) {
      // Check static PRODUCTS as fallback
      const staticMatch = PRODUCTS.find(
        (p) =>
          p.slug === slug ||
          p.id === slug ||
          p.slug.toLowerCase() === slug.toLowerCase() ||
          p.id.toLowerCase() === slug.toLowerCase()
      );
      if (staticMatch) found = staticMatch;
    }

    // Also try fetching from /api/products?slug=...
    if (!found) {
      fetch(`/api/products?slug=${encodeURIComponent(slug)}`)
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (data?.product) {
            setProduct(data.product);
          }
          setIsLoading(false);
        })
        .catch(() => {
          setIsLoading(false);
        });
      return;
    }

    setProduct(found);
    setIsLoading(false);
  }, [slug, initialProduct]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-ry-pearl flex items-center justify-center pt-28 font-sans">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-full border-2 border-ry-onyx border-t-transparent animate-spin" />
          <span className="text-xs uppercase tracking-editorial text-ry-stone">
            Loading Formulation...
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
            Rycarix Boutique
          </span>
          <h1 className="font-serif text-2xl text-ry-onyx mb-3">Formulation Not Found</h1>
          <p className="text-xs text-ry-stone mb-6 leading-relaxed">
            The formulation or edition you are searching for may have been archived or moved to private client reserves.
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

  return (
    <div className="pt-24 bg-ry-pearl min-h-screen">
      <ProductDetailView product={product} />
    </div>
  );
}
