'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  ChevronDown,
  Sparkles,
  ShieldCheck,
  Truck,
  Droplet,
  Heart,
  Share2,
  Check,
  Eye,
  Copy,
} from 'lucide-react';
import { ProductItem, Product } from '@/lib/types/ecommerce';
import { useCartStore } from '@/lib/store/useCartStore';
import { useWishlistStore } from '@/lib/store/useWishlistStore';
import KlarnaWidget from '@/components/klarna/KlarnaWidget';
import { getCategoryDisplayLabel } from '@/lib/utils/categoryUtils';

interface ProductDetailViewProps {
  product: ProductItem | Product | any;
}

export default function ProductDetailView({ product }: ProductDetailViewProps) {
  const title = product.title || product.name || 'Luxury Product';
  const price = Number(product.price ?? product.basePrice ?? 0);
  const category = product.category || 'Parfum';
  const subtitle = product.subtitle || `${getCategoryDisplayLabel(category)} Collection`;
  const summary = product.summary || product.description || '';
  const ingredients = product.ingredients || 'Artisanal botanical formula with pure natural oils and isolates.';
  const howToUse = product.howToUse || 'Apply 2 to 3 drops to pulse points or smooth through hair as desired.';
  const sourcingEthics = product.sourcingEthics || 'Responsibly sourced botanicals and cruelty-free essences.';
  const attributes = product.attributes || {};
  const isComingSoon = Boolean(product.isComingSoon);

  const variants =
    Array.isArray(product.variants) && product.variants.length > 0
      ? product.variants
      : [
          {
            id: `var-${product.id}`,
            sku: product.sku || `RYC-${String(product.id || '').slice(0, 6)}`,
            title: '100ml / 3.4 fl. oz.',
            price: price,
            compareAtPrice: product.compareAtPrice ? Number(product.compareAtPrice) : undefined,
            inventory: Number(product.stock ?? 15),
            attributes: { size: '100ml' },
          },
        ];

  const [selectedVariant, setSelectedVariant] = useState(variants[0]);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isAdded, setIsAdded] = useState(false);
  const [openAccordion, setOpenAccordion] = useState<string | null>('ingredients');
  const [shareFeedback, setShareFeedback] = useState<string | null>(null);
  const [wishlistFeedback, setWishlistFeedback] = useState<string | null>(null);

  const { addItem, openCart } = useCartStore();
  const { toggleItem, isInWishlist } = useWishlistStore();
  const wishlisted = isInWishlist(product.id);

  const rawImages =
    Array.isArray(product.images) && product.images.length > 0
      ? product.images.map((img: any, idx: number) => {
          if (typeof img === 'string') {
            return {
              id: `img-${idx}`,
              url: img,
              alt: title,
              isHero: idx === 0,
              isTexture: false,
            };
          }
          return {
            id: img.id || `img-${idx}`,
            url: img.url || '/images/media_1791069473262.jpg',
            alt: img.alt || title,
            isHero: Boolean(img.isHero ?? idx === 0),
            isTexture: Boolean(img.isTexture),
          };
        })
      : [
          {
            id: 'img-default',
            url: '/images/media_1791069473262.jpg',
            alt: title,
            isHero: true,
            isTexture: false,
          },
        ];

  const activeImage = rawImages[activeImageIndex] || rawImages[0];
  const textureImage = rawImages.find((img: any) => img.isTexture);

  const toggleAccordion = (id: string) => {
    setOpenAccordion(openAccordion === id ? null : id);
  };

  const handleShare = async (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    const shareUrl = typeof window !== 'undefined' ? window.location.href : '';
    const shareData = {
      title: `${title} | Rycarix`,
      text: `Discover ${title} (£${selectedVariant.price.toFixed(2)}) on Rycarix.`,
      url: shareUrl,
    };

    const copyFallback = (text: string) => {
      try {
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
        return true;
      } catch {
        return false;
      }
    };

    try {
      if (typeof navigator !== 'undefined' && navigator.share) {
        await navigator.share(shareData);
        setShareFeedback('Shared successfully!');
      } else if (typeof navigator !== 'undefined' && navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(shareUrl);
        setShareFeedback('Link copied to clipboard!');
      } else {
        copyFallback(shareUrl);
        setShareFeedback('Link copied to clipboard!');
      }
    } catch (err: any) {
      if (err?.name !== 'AbortError') {
        const ok = copyFallback(shareUrl);
        if (ok) {
          setShareFeedback('Link copied to clipboard!');
        } else {
          setShareFeedback('Link ready: ' + shareUrl.slice(0, 30) + '...');
        }
      }
    }

    setTimeout(() => setShareFeedback(null), 3000);
  };

  const handleWishlistToggle = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    const productForWishlist: Product = {
      id: product.id,
      name: title,
      title: title,
      slug: product.slug,
      description: summary,
      price: selectedVariant.price,
      stock: selectedVariant.inventory,
      category: category,
      images: rawImages.map((img: any) => img.url),
    };

    const added = toggleItem(productForWishlist);
    setWishlistFeedback(added ? 'Saved to Wishlist' : 'Removed from Wishlist');
    setTimeout(() => setWishlistFeedback(null), 2500);
  };

  const handleAddToCart = () => {
    addItem({
      id: `${product.id}-${selectedVariant.id}`,
      productId: product.id,
      variantId: selectedVariant.id,
      title: title,
      variantTitle: selectedVariant.title,
      sku: selectedVariant.sku,
      price: selectedVariant.price,
      quantity,
      image: activeImage.url,
    });

    setIsAdded(true);
    setTimeout(() => {
      setIsAdded(false);
      openCart();
    }, 400);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 font-sans">
      
      {/* =========================================================================
          TOP ACTION BAR (ABOVE PRODUCT): Breadcrumb Navigation + Share & Wishlist
          ========================================================================= */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 mb-8 border-b border-ry-ash/60">
        {/* Breadcrumb Navigation */}
        <nav className="text-xs uppercase tracking-editorial text-ry-stone flex items-center gap-2">
          <Link href="/" className="hover:text-ry-onyx transition-colors">
            Home
          </Link>
          <span>/</span>
          <Link href={`/category/${category.toLowerCase()}`} className="hover:text-ry-onyx transition-colors capitalize">
            {getCategoryDisplayLabel(category)}
          </Link>
          <span>/</span>
          <span className="text-ry-onyx truncate max-w-xs font-medium">{title}</span>
        </nav>

        {/* Share & Wishlist Action Group Positioned ABOVE the Product */}
        <div className="flex items-center gap-2.5">
          {shareFeedback && (
            <span className="text-[11px] font-medium text-emerald-700 bg-emerald-50 px-3 py-1 border border-emerald-200 animate-fade-in shadow-xs">
              {shareFeedback}
            </span>
          )}
          {wishlistFeedback && (
            <span className="text-[11px] font-medium text-ry-onyx bg-ry-oatmeal px-3 py-1 border border-ry-ash animate-fade-in shadow-xs">
              {wishlistFeedback}
            </span>
          )}

          {/* Share Button (Above Product) */}
          <button
            type="button"
            onClick={handleShare}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 border border-ry-ash bg-white text-[11px] uppercase tracking-editorial font-medium text-ry-onyx hover:bg-ry-onyx hover:text-white transition-all shadow-xs cursor-pointer active:scale-95"
            aria-label="Share this product"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>Share Product</span>
          </button>

          {/* Wishlist Button (Above Product) */}
          <button
            type="button"
            onClick={handleWishlistToggle}
            className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 border text-[11px] uppercase tracking-editorial font-medium transition-all shadow-xs cursor-pointer active:scale-95 ${
              wishlisted
                ? 'border-rose-600 bg-rose-600 text-white'
                : 'border-ry-ash bg-white text-ry-onyx hover:border-ry-onyx'
            }`}
            aria-label="Toggle Wishlist"
          >
            <Heart className={`w-3.5 h-3.5 ${wishlisted ? 'fill-current' : ''}`} />
            <span>{wishlisted ? 'Saved in Wishlist' : 'Save to Wishlist'}</span>
          </button>
        </div>
      </div>

      {/* =========================================================================
          Split-Screen PDP Grid
          ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 xl:gap-16 items-start">
        
        {/* Left Column: Sticky Vertical Gallery & Macro Texture Viewport */}
        <div className="lg:col-span-7 lg:sticky lg:top-28">
          <div className="flex flex-col-reverse md:flex-row gap-4 items-start">
            
            {/* Vertical Thumbnail Strip */}
            <div className="flex md:flex-col gap-3 overflow-x-auto md:overflow-visible w-full md:w-20 shrink-0 pb-2 md:pb-0">
              {rawImages.map((img: any, index: number) => (
                <button
                  key={img.id}
                  onClick={() => setActiveImageIndex(index)}
                  className={`relative w-16 h-20 md:w-20 md:h-24 bg-ry-oatmeal overflow-hidden border transition-all duration-200 shrink-0 cursor-pointer ${
                    activeImageIndex === index
                      ? 'border-ry-burgundy ring-1 ring-ry-burgundy'
                      : 'border-ry-ash/60 opacity-70 hover:opacity-100'
                  }`}
                  aria-label={`View image ${index + 1}`}
                >
                  <Image
                    src={img.url}
                    alt={img.alt}
                    fill
                    sizes="80px"
                    unoptimized={img.url?.startsWith('data:')}
                    className="object-cover object-center"
                  />
                  {img.isTexture && (
                    <span className="absolute bottom-0 inset-x-0 bg-ry-onyx/80 text-[8px] uppercase tracking-wider text-ry-white text-center py-0.5 font-sans">
                      Texture
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* Main Stage Viewport */}
            <div className="relative w-full aspect-[4/5] bg-ry-oatmeal/80 border border-ry-ash/50 overflow-hidden group">
              <Image
                src={activeImage.url}
                alt={activeImage.alt}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 60vw"
                unoptimized={activeImage.url?.startsWith('data:')}
                className="object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105"
              />

              {/* Texture Quick-Toggle Floating Button */}
              {textureImage && (
                <button
                  onClick={() => {
                    const textureIndex = rawImages.findIndex((img: any) => img.isTexture);
                    if (textureIndex !== -1) setActiveImageIndex(textureIndex);
                  }}
                  className="absolute bottom-4 right-4 bg-ry-white/90 backdrop-blur-md px-3.5 py-2 text-[10px] uppercase tracking-editorial text-ry-onyx border border-ry-ash flex items-center gap-1.5 shadow-sm hover:bg-ry-onyx hover:text-ry-white transition-all cursor-pointer"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Inspect Macro Texture</span>
                </button>
              )}

              {/* Formulation Hallmark Badge */}
              <div className="absolute top-4 left-4 bg-ry-pearl/80 backdrop-blur-sm px-2.5 py-1 text-[9px] uppercase tracking-editorial text-ry-stone border border-ry-ash/40">
                {isComingSoon ? 'Coming Soon • Preview' : attributes.badge || getCategoryDisplayLabel(category)}
              </div>
            </div>
          </div>

          {/* Sensory Guarantees */}
          <div className="hidden lg:grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-ry-ash/40 text-center text-xs text-ry-stone">
            <div>
              <p className="font-serif italic text-ry-onyx text-sm">Artisanal Origin</p>
              <p className="text-[10px] uppercase tracking-subtle mt-0.5">Responsibly Sourced</p>
            </div>
            <div>
              <p className="font-serif italic text-ry-onyx text-sm">Sustainable Luxury</p>
              <p className="text-[10px] uppercase tracking-subtle mt-0.5">Eco-Certified & Recyclable</p>
            </div>
            <div>
              <p className="font-serif italic text-ry-onyx text-sm">Klarna & Clearpay</p>
              <p className="text-[10px] uppercase tracking-subtle mt-0.5">Pay in 3 (Klarna) or 4 (Clearpay)</p>
            </div>
          </div>
        </div>

        {/* Right Column: Title, Klarna Pricing, Selection, and Accordions */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Header & Subtitle */}
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase tracking-[0.25em] text-ry-stone font-sans">
                {getCategoryDisplayLabel(category)}
              </span>
              <span className="text-[10px] font-mono text-ry-stone">
                SKU: {selectedVariant.sku}
              </span>
            </div>
            <h1 className="font-serif text-3xl sm:text-4xl text-ry-onyx leading-tight mt-1 mb-2 font-normal">
              {title}
            </h1>
            <p className="text-xs text-ry-stone tracking-subtle uppercase font-sans">
              {subtitle}
            </p>
          </div>

          {/* Pricing & Klarna On-Site Messaging */}
          <div className="py-4 border-y border-ry-ash/60 space-y-2">
            <div className="flex items-baseline gap-3">
              <span className="text-2xl font-serif text-ry-onyx font-normal">
                £{selectedVariant.price.toFixed(2)}
              </span>
              {selectedVariant.compareAtPrice && (
                <span className="text-base font-serif text-ry-stone line-through">
                  £{selectedVariant.compareAtPrice.toFixed(2)}
                </span>
              )}
              <span className={`text-[10px] tracking-editorial uppercase px-2 py-0.5 font-sans ml-auto ${
                isComingSoon ? 'bg-amber-100 text-amber-900 font-semibold' : 'bg-ry-oatmeal text-ry-charcoal'
              }`}>
                {isComingSoon
                  ? 'Releasing Soon'
                  : selectedVariant.inventory > 0
                  ? `In Stock (${selectedVariant.inventory} Remaining)`
                  : 'Out of Stock'}
              </span>
            </div>

            {/* Klarna Widget right under price */}
            <div className="pt-1">
              <KlarnaWidget price={selectedVariant.price} />
            </div>
          </div>

          {/* Sensory Narrative Summary */}
          <p className="text-sm font-sans text-ry-charcoal leading-relaxed whitespace-pre-line">
            {summary}
          </p>

          {/* Dynamic Category Specifications & Notes */}
          {attributes.olfactoryFamily ? (
            <div className="bg-ry-oatmeal/50 p-4 border border-ry-ash/60 space-y-2">
              <div className="text-[10px] uppercase tracking-editorial text-ry-stone">
                Fragrance Notes
              </div>
              <div className="text-xs space-y-1 font-sans">
                {attributes.topNotes && (
                  <div>
                    <strong className="text-ry-onyx">Top Notes:</strong>{' '}
                    <span className="text-ry-stone">{Array.isArray(attributes.topNotes) ? attributes.topNotes.join(', ') : attributes.topNotes}</span>
                  </div>
                )}
                {attributes.heartNotes && (
                  <div>
                    <strong className="text-ry-onyx">Heart Notes:</strong>{' '}
                    <span className="text-ry-stone">{Array.isArray(attributes.heartNotes) ? attributes.heartNotes.join(', ') : attributes.heartNotes}</span>
                  </div>
                )}
                {attributes.baseNotes && (
                  <div>
                    <strong className="text-ry-onyx">Base Notes:</strong>{' '}
                    <span className="text-ry-stone">{Array.isArray(attributes.baseNotes) ? attributes.baseNotes.join(', ') : attributes.baseNotes}</span>
                  </div>
                )}
              </div>
            </div>
          ) : attributes.keyActives ? (
            <div className="bg-ry-oatmeal/50 p-4 border border-ry-ash/60 space-y-2">
              <div className="text-[10px] uppercase tracking-editorial text-ry-stone">
                Key Ingredients & Skin Types
              </div>
              <div className="text-xs font-sans text-ry-stone">
                <span className="text-ry-onyx font-medium">Key Actives:</span> {attributes.keyActives}
              </div>
              {attributes.skinType && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {(Array.isArray(attributes.skinType) ? attributes.skinType : [attributes.skinType]).map((type: string) => (
                    <span
                      key={type}
                      className="text-[10px] uppercase tracking-subtle px-2 py-1 bg-ry-white border border-ry-ash/70 text-ry-charcoal"
                    >
                      {type}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ) : attributes.hairType ? (
            <div className="bg-ry-oatmeal/50 p-4 border border-ry-ash/60 space-y-2">
              <div className="text-[10px] uppercase tracking-editorial text-ry-stone">
                Product Highlights
              </div>
              <div className="flex flex-wrap gap-1.5">
                {(Array.isArray(attributes.hairType) ? attributes.hairType : [attributes.hairType]).map((type: string) => (
                  <span
                    key={type}
                    className="text-[10px] uppercase tracking-subtle px-2 py-1 bg-ry-white border border-ry-ash/70 text-ry-charcoal"
                  >
                    {type}
                  </span>
                ))}
                {attributes.siliconeFree && (
                  <span className="text-[10px] uppercase tracking-subtle px-2 py-1 bg-ry-white border border-ry-ash/70 text-ry-charcoal">
                    Silicone-Free
                  </span>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-ry-oatmeal/50 p-4 border border-ry-ash/60 space-y-2">
              <div className="text-[10px] uppercase tracking-editorial text-ry-stone">
                Product Details & Origin
              </div>
              <div className="text-xs space-y-1 font-sans text-ry-charcoal">
                <div>
                  <strong className="text-ry-onyx">Department:</strong> {getCategoryDisplayLabel(category)}
                </div>
                {sourcingEthics && (
                  <div>
                    <strong className="text-ry-onyx">Origin & Craft:</strong> {sourcingEthics}
                  </div>
                )}
                {variants[0]?.title && (
                  <div>
                    <strong className="text-ry-onyx">Edition Size:</strong> {variants[0].title}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Variant Selection */}
          <div className="space-y-3">
            <label className="text-[11px] uppercase tracking-editorial text-ry-stone block font-sans">
              Select Edition & Size
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {variants.map((variant: any) => (
                <button
                  key={variant.id}
                  onClick={() => setSelectedVariant(variant)}
                  className={`p-3 text-left border transition-all text-xs flex justify-between items-center cursor-pointer ${
                    selectedVariant.id === variant.id
                      ? 'border-ry-burgundy bg-ry-white ring-1 ring-ry-burgundy shadow-sm'
                      : 'border-ry-ash/70 bg-ry-pearl hover:border-ry-burgundy'
                  }`}
                >
                  <span className="font-medium text-ry-onyx">{variant.title}</span>
                  <span className="font-mono text-ry-charcoal">£{Number(variant.price).toFixed(2)}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Quantity & Add to Bag CTA */}
          <div className="space-y-3 pt-2">
            <div className="flex gap-3">
              {/* Stepper */}
              <div className="flex items-center border border-ry-ash bg-ry-white shrink-0">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-3 py-3 text-ry-stone hover:text-ry-onyx transition-colors text-sm cursor-pointer"
                  aria-label="Decrease quantity"
                >
                  -
                </button>
                <span className="w-8 text-center text-xs font-mono font-medium">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="px-3 py-3 text-ry-stone hover:text-ry-onyx transition-colors text-sm cursor-pointer"
                  aria-label="Increase quantity"
                >
                  +
                </button>
              </div>

              {/* Add to Cart Button */}
              {isComingSoon ? (
                <button
                  type="button"
                  disabled
                  className="flex-1 py-3.5 px-6 bg-amber-950/80 text-amber-200 text-xs uppercase tracking-editorial font-medium flex items-center justify-center gap-2 cursor-not-allowed opacity-90 border border-amber-800/40 shadow-xs"
                >
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span>Coming Soon • In Formulation</span>
                </button>
              ) : (
                <button
                  onClick={handleAddToCart}
                  disabled={isAdded || selectedVariant.inventory <= 0}
                  className="flex-1 py-3.5 px-6 bg-ry-burgundy text-ry-white text-xs uppercase tracking-editorial font-medium hover:bg-ry-burgundyLight active:scale-[0.99] transition-all flex items-center justify-center gap-2 shadow-luxury group cursor-pointer disabled:opacity-50"
                >
                  {isAdded ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-400" />
                      <span>Added to Cart</span>
                    </>
                  ) : (
                    <>
                      <Droplet className="w-4 h-4 group-hover:scale-110 transition-transform" />
                      <span>
                        {selectedVariant.inventory > 0
                          ? `Add to Cart • £${(selectedVariant.price * quantity).toFixed(2)}`
                          : 'Sold Out'}
                      </span>
                    </>
                  )}
                </button>
              )}
            </div>

            {/* Secondary Actions (Directly under Add to Cart button, fully clickable with real-time feedback!) */}
            <div className="flex justify-between items-center text-[11px] text-ry-stone px-1 pt-1 border-t border-ry-ash/40">
              <button
                type="button"
                onClick={handleWishlistToggle}
                className="flex items-center gap-1.5 hover:text-ry-onyx transition-colors cursor-pointer py-1"
                aria-label="Save to Wishlist"
              >
                <Heart className={`w-3.5 h-3.5 ${wishlisted ? 'fill-rose-600 text-rose-600' : 'text-ry-stone'}`} />
                <span className={wishlisted ? 'text-rose-600 font-medium' : ''}>
                  {wishlisted ? 'Saved in Wishlist' : 'Save to Wishlist'}
                </span>
              </button>
              <button
                type="button"
                onClick={handleShare}
                className="flex items-center gap-1.5 hover:text-ry-onyx transition-colors cursor-pointer py-1"
                aria-label="Share Product"
              >
                <Share2 className="w-3.5 h-3.5 text-ry-stone hover:text-ry-onyx" />
                <span>Share Product</span>
              </button>
            </div>

            {/* Feedback notification toast under buttons */}
            {(shareFeedback || wishlistFeedback) && (
              <div className="p-2.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs text-center font-medium animate-fade-in shadow-xs">
                {shareFeedback || wishlistFeedback}
              </div>
            )}
          </div>

          {/* Product Details Drop-Down Accordions */}
          <div className="border-t border-ry-ash/70 pt-2 divide-y divide-ry-ash/60">
            
            {/* Accordion 1: Ingredients */}
            <div className="py-4">
              <button
                onClick={() => toggleAccordion('ingredients')}
                className="w-full flex justify-between items-center text-left text-xs uppercase tracking-editorial font-medium text-ry-onyx group cursor-pointer"
              >
                <span>Ingredients</span>
                <ChevronDown
                  className={`w-4 h-4 text-ry-stone transition-transform duration-300 ${
                    openAccordion === 'ingredients' ? 'rotate-180 text-ry-onyx' : ''
                  }`}
                />
              </button>
              {openAccordion === 'ingredients' && (
                <div className="mt-3 text-xs leading-relaxed text-ry-stone font-sans animate-fade-in space-y-2">
                  <p>{ingredients}</p>
                  <p className="text-[11px] text-ry-charcoal/80 italic">
                    Formulated without parabens, phthalates, synthetic dyes, DEA, or harsh sulfates. Cruelty-free.
                  </p>
                </div>
              )}
            </div>

            {/* Accordion 2: How to Use */}
            <div className="py-4">
              <button
                onClick={() => toggleAccordion('howToUse')}
                className="w-full flex justify-between items-center text-left text-xs uppercase tracking-editorial font-medium text-ry-onyx group cursor-pointer"
              >
                <span>How to Use</span>
                <ChevronDown
                  className={`w-4 h-4 text-ry-stone transition-transform duration-300 ${
                    openAccordion === 'howToUse' ? 'rotate-180 text-ry-onyx' : ''
                  }`}
                />
              </button>
              {openAccordion === 'howToUse' && (
                <div className="mt-3 text-xs leading-relaxed text-ry-stone font-sans animate-fade-in space-y-2">
                  <p>{howToUse}</p>
                </div>
              )}
            </div>

            {/* Accordion 3: Sourcing & Packaging */}
            <div className="py-4">
              <button
                onClick={() => toggleAccordion('sourcing')}
                className="w-full flex justify-between items-center text-left text-xs uppercase tracking-editorial font-medium text-ry-onyx group cursor-pointer"
              >
                <span>Sourcing & Packaging</span>
                <ChevronDown
                  className={`w-4 h-4 text-ry-stone transition-transform duration-300 ${
                    openAccordion === 'sourcing' ? 'rotate-180 text-ry-onyx' : ''
                  }`}
                />
              </button>
              {openAccordion === 'sourcing' && (
                <div className="mt-3 text-xs leading-relaxed text-ry-stone font-sans animate-fade-in space-y-2">
                  <p>{sourcingEthics}</p>
                </div>
              )}
            </div>

            {/* Accordion 4: Shipping & Returns */}
            <div className="py-4">
              <button
                onClick={() => toggleAccordion('shipping')}
                className="w-full flex justify-between items-center text-left text-xs uppercase tracking-editorial font-medium text-ry-onyx group cursor-pointer"
              >
                <span>Shipping & Returns</span>
                <ChevronDown
                  className={`w-4 h-4 text-ry-stone transition-transform duration-300 ${
                    openAccordion === 'shipping' ? 'rotate-180 text-ry-onyx' : ''
                  }`}
                />
              </button>
              {openAccordion === 'shipping' && (
                <div className="mt-3 text-xs leading-relaxed text-ry-stone font-sans animate-fade-in space-y-2">
                  <p>
                    <strong className="text-ry-onyx">Standard UK Delivery:</strong> £3.50 (estimated 2–3 working days).
                  </p>
                  <p>
                    <strong className="text-emerald-700">Free UK Delivery:</strong> Automatically applied on all orders over £100.
                  </p>
                  <p>
                    <strong className="text-ry-onyx">Collection / Pickup:</strong> Free (arrange collection after ordering).
                  </p>
                  <p className="pt-1">
                    <Link href="/delivery" className="underline text-ry-onyx hover:text-ry-burgundy">
                      View full UK delivery methods &amp; international shipping &rarr;
                    </Link>
                  </p>
                </div>
              )}
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
