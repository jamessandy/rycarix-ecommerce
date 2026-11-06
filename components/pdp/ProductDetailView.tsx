// components/pdp/ProductDetailView.tsx
'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Product } from '@/lib/types/ecommerce';
import { useCartStore } from '@/lib/store/useCartStore';
import { useWishlistStore } from '@/lib/store/useWishlistStore';
import KlarnaWidget from '@/components/klarna/KlarnaWidget';

interface ProductDetailViewProps {
  product: Product;
}

export default function ProductDetailView({ product }: ProductDetailViewProps) {
  const [selectedImage, setSelectedImage] = useState<string>(
    product.images?.[0] || '/images/media_1791069473262.jpg'
  );
  const [quantity, setQuantity] = useState<number>(1);
  const [shareFeedback, setShareFeedback] = useState<string | null>(null);
  const [wishlistFeedback, setWishlistFeedback] = useState<string | null>(null);

  const addItemToCart = useCartStore((state) => state.addItem);
  const { toggleItem, isInWishlist } = useWishlistStore();
  const wishlisted = isInWishlist(product.id);

  const availableStock = Number(product.stock ?? 10);

  const handleShare = async () => {
    const shareUrl = typeof window !== 'undefined' ? window.location.href : '';
    const shareData = {
      title: `${product.name} | Rycarix`,
      text: `Discover ${product.name} (£${Number(product.price).toFixed(2)}) on Rycarix.`,
      url: shareUrl,
    };

    try {
      if (typeof navigator !== 'undefined' && navigator.share) {
        await navigator.share(shareData);
        setShareFeedback('Shared successfully!');
      } else if (typeof navigator !== 'undefined' && navigator.clipboard) {
        await navigator.clipboard.writeText(shareUrl);
        setShareFeedback('Product link copied to clipboard!');
      }
    } catch {
      if (typeof navigator !== 'undefined' && navigator.clipboard) {
        await navigator.clipboard.writeText(shareUrl);
        setShareFeedback('Product link copied to clipboard!');
      }
    }

    setTimeout(() => setShareFeedback(null), 3000);
  };

  const handleWishlistToggle = () => {
    const added = toggleItem(product);
    setWishlistFeedback(added ? 'Added to your Wishlist' : 'Removed from your Wishlist');
    setTimeout(() => setWishlistFeedback(null), 2500);
  };

  const handleAddToCart = () => {
    addItemToCart(product, quantity);
  };

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-8 py-8 font-sans">
      {/* TOP BAR ABOVE PRODUCT: Breadcrumb + Share & Wishlist Actions */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-5 mb-6 border-b border-neutral-200">
        <nav className="flex items-center space-x-2 text-xs uppercase tracking-wider text-neutral-500">
          <Link href="/" className="hover:text-neutral-900">Home</Link>
          <span>/</span>
          <Link href={`/category/${product.category.toLowerCase()}`} className="hover:text-neutral-900 capitalize">
            {product.category}
          </Link>
          <span>/</span>
          <span className="text-neutral-900 font-semibold truncate max-w-[220px]">{product.name}</span>
        </nav>

        {/* Share Button Explicitly Placed Above the Product */}
        <div className="flex items-center gap-3">
          {shareFeedback && (
            <span className="text-xs font-medium text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
              {shareFeedback}
            </span>
          )}
          {wishlistFeedback && (
            <span className="text-xs font-medium text-neutral-800 bg-neutral-100 px-3 py-1 rounded-full border border-neutral-300">
              {wishlistFeedback}
            </span>
          )}

          <button
            type="button"
            onClick={handleShare}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-neutral-300 bg-white text-xs font-semibold uppercase tracking-wider text-neutral-800 hover:bg-neutral-900 hover:text-white transition shadow-sm cursor-pointer"
            aria-label="Share this product"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
            </svg>
            Share Product
          </button>

          <button
            type="button"
            onClick={handleWishlistToggle}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border text-xs font-semibold uppercase tracking-wider transition shadow-sm cursor-pointer ${
              wishlisted
                ? 'border-rose-600 bg-rose-600 text-white'
                : 'border-neutral-300 bg-white text-neutral-800 hover:border-neutral-900'
            }`}
            aria-label="Toggle Wishlist"
          >
            <svg
              className="w-4 h-4"
              fill={wishlisted ? 'currentColor' : 'none'}
              stroke="currentColor"
              strokeWidth={1.8}
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
              />
            </svg>
            {wishlisted ? 'Saved in Wishlist' : 'Add to Wishlist'}
          </button>
        </div>
      </div>

      {/* Main Product Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Product Gallery */}
        <div className="lg:col-span-7 space-y-4">
          <div className="aspect-[4/5] w-full rounded-xl overflow-hidden bg-neutral-100 border border-neutral-200">
            <img
              src={selectedImage}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          </div>
          {product.images && product.images.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-2">
              {product.images.map((img, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setSelectedImage(img)}
                  className={`w-20 h-20 rounded-lg overflow-hidden border-2 flex-shrink-0 cursor-pointer ${
                    selectedImage === img ? 'border-neutral-900' : 'border-transparent opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt={`${product.name} view ${i + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Details & Purchase Box */}
        <div className="lg:col-span-5 flex flex-col justify-between">
          <div className="space-y-5">
            <div>
              <span className="text-xs font-semibold uppercase tracking-widest text-neutral-500">
                {product.category}
              </span>
              <h1 className="text-3xl font-serif font-bold text-neutral-900 mt-1">{product.name}</h1>
              <p className="text-xs text-neutral-400 mt-1">SKU: {product.sku || product.id}</p>
            </div>

            <div className="flex items-baseline gap-3">
              <span className="text-2xl font-bold text-neutral-900">
                £{Number(product.price).toFixed(2)}
              </span>
              {product.compareAtPrice && Number(product.compareAtPrice) > Number(product.price) && (
                <span className="text-base text-neutral-400 line-through">
                  £{Number(product.compareAtPrice).toFixed(2)}
                </span>
              )}
              <span
                className={`ml-auto text-xs font-semibold px-2.5 py-1 rounded-full ${
                  availableStock > 0 ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'
                }`}
              >
                {availableStock > 0 ? `${availableStock} in stock` : 'Out of stock'}
              </span>
            </div>

            <KlarnaWidget price={Number(product.price)} />

            <p className="text-sm text-neutral-600 leading-relaxed whitespace-pre-line">
              {product.description}
            </p>

            {/* Quantity & Add to Bag */}
            <div className="pt-4 space-y-3">
              <div className="flex items-center gap-4">
                <div className="flex items-center border border-neutral-300 rounded-md">
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="px-3.5 py-2 text-neutral-700 hover:bg-neutral-100 cursor-pointer"
                  >
                    −
                  </button>
                  <span className="px-4 py-2 text-sm font-semibold">{quantity}</span>
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.min(Math.max(1, availableStock), q + 1))}
                    className="px-3.5 py-2 text-neutral-700 hover:bg-neutral-100 cursor-pointer"
                  >
                    +
                  </button>
                </div>

                <button
                  type="button"
                  disabled={availableStock <= 0}
                  onClick={handleAddToCart}
                  className="flex-1 py-3.5 px-6 bg-neutral-900 text-white text-sm font-semibold uppercase tracking-wider rounded-md hover:bg-neutral-800 transition disabled:opacity-40 cursor-pointer"
                >
                  {availableStock > 0 ? 'Add to Bag' : 'Sold Out'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
