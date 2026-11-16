"use client";

import React from "react";
import Link from "next/link";
import { useCartStore } from "@/lib/store/useCartStore";

interface ProductCardProps {
  product: {
    id: string;
    name?: string;
    title?: string;
    slug?: string;
    price: number | string;
    compareAtPrice?: number | string | null;
    stock: number;
    images: string[];
    category?: string;
    isComingSoon?: boolean;
  };
  onAddToCart?: (product: any) => void;
}

export function ProductCard({ product, onAddToCart }: ProductCardProps) {
  const { addItem, openCart } = useCartStore();
  const isOutOfStock = (product.stock ?? 0) <= 0;
  const productName = product.name || product.title || "Rycarix Product";
  const imageUrl =
    product.images?.[0] || "/images/perfumes/princess-reef.jpg";

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isOutOfStock) return;
    if (onAddToCart) {
      onAddToCart(product);
    } else {
      addItem({
        id: product.id,
        productId: product.id,
        name: productName,
        title: productName,
        price: Number(product.price),
        image: imageUrl,
        stock: product.stock,
      });
      openCart();
    }
  };

  const productUrl = product.slug ? `/products/${product.slug}` : `/products/${product.id}`;

  return (
    <div className="relative group flex flex-col justify-between bg-white border border-neutral-100 hover:border-neutral-300 transition-all p-3">
      <Link href={productUrl} className="block relative overflow-hidden">
        {isOutOfStock && (
          <span className="absolute top-3 left-3 z-10 bg-black text-white text-[10px] uppercase tracking-widest px-2.5 py-1">
            Out of Stock
          </span>
        )}
        {product.isComingSoon && !isOutOfStock && (
          <span className="absolute top-3 left-3 z-10 bg-[#3D1220] text-amber-200 text-[10px] uppercase tracking-widest px-2.5 py-1">
            Coming Soon
          </span>
        )}

        {/* Product Image & Title */}
        <div className="w-full aspect-[3/4] overflow-hidden bg-neutral-50 relative">
          <img
            src={imageUrl}
            alt={productName}
            className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 ${
              isOutOfStock ? "opacity-60 grayscale" : ""
            }`}
          />
        </div>

        <div className="mt-3">
          <p className="text-[10px] uppercase tracking-widest text-neutral-400">
            {product.category || "Atelier Collection"}
          </p>
          <h3 className="text-sm font-medium text-neutral-900 group-hover:text-amber-900 transition-colors line-clamp-1 mt-0.5">
            {productName}
          </h3>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-sm font-semibold text-neutral-900">
              £{Number(product.price).toFixed(2)}
            </span>
            {product.compareAtPrice && Number(product.compareAtPrice) > Number(product.price) && (
              <span className="text-xs text-neutral-400 line-through">
                £{Number(product.compareAtPrice).toFixed(2)}
              </span>
            )}
          </div>
        </div>
      </Link>

      <button
        disabled={isOutOfStock}
        onClick={handleAdd}
        className={`w-full mt-3 py-3 text-xs uppercase tracking-widest font-medium transition ${
          isOutOfStock
            ? "bg-neutral-200 text-neutral-500 cursor-not-allowed"
            : "bg-black text-white hover:bg-neutral-800"
        }`}
      >
        {isOutOfStock ? "Out of Stock" : `Add to Bag (${product.stock} left)`}
      </button>
    </div>
  );
}

export default ProductCard;
