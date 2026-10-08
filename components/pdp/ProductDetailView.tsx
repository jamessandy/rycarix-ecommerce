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
} from 'lucide-react';
import { ProductItem } from '@/lib/types/ecommerce';
import { useCartStore } from '@/lib/store/useCartStore';
import KlarnaWidget from '@/components/klarna/KlarnaWidget';

interface ProductDetailViewProps {
  product: ProductItem;
}

export default function ProductDetailView({ product }: ProductDetailViewProps) {
  const [selectedVariant, setSelectedVariant] = useState(product.variants[0]);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isAdded, setIsAdded] = useState(false);
  const [openAccordion, setOpenAccordion] = useState<string | null>('ingredients');

  const { addItem, openCart } = useCartStore();

  const activeImage = product.images[activeImageIndex] || product.images[0];
  const textureImage = product.images.find((img) => img.isTexture);

  const toggleAccordion = (id: string) => {
    setOpenAccordion(openAccordion === id ? null : id);
  };

  const handleAddToCart = () => {
    addItem({
      id: `${product.id}-${selectedVariant.id}`,
      productId: product.id,
      variantId: selectedVariant.id,
      title: product.title,
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
      {/* Breadcrumb Navigation */}
      <nav className="mb-8 text-xs font-sans uppercase tracking-editorial text-ry-stone flex items-center gap-2">
        <Link href="/" className="hover:text-ry-onyx transition-colors">
          Home
        </Link>
        <span>/</span>
        <span className="hover:text-ry-onyx transition-colors">{product.category}</span>
        <span>/</span>
        <span className="text-ry-onyx truncate max-w-xs">{product.title}</span>
      </nav>

      {/* Split-Screen PDP Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 xl:gap-16 items-start">
        
        {/* Left Column: Sticky Vertical Gallery & Macro Texture Viewport */}
        <div className="lg:col-span-7 lg:sticky lg:top-28">
          <div className="flex flex-col-reverse md:flex-row gap-4 items-start">
            
            {/* Vertical Thumbnail Strip */}
            <div className="flex md:flex-col gap-3 overflow-x-auto md:overflow-visible w-full md:w-20 shrink-0 pb-2 md:pb-0">
              {product.images.map((img, index) => (
                <button
                  key={img.id}
                  onClick={() => setActiveImageIndex(index)}
                  className={`relative w-16 h-20 md:w-20 md:h-24 bg-ry-oatmeal overflow-hidden border transition-all duration-200 shrink-0 ${
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
                className="object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105"
              />

              {/* Texture Quick-Toggle Floating Button */}
              {textureImage && (
                <button
                  onClick={() => {
                    const textureIndex = product.images.findIndex((img) => img.isTexture);
                    if (textureIndex !== -1) setActiveImageIndex(textureIndex);
                  }}
                  className="absolute bottom-4 right-4 bg-ry-white/90 backdrop-blur-md px-3.5 py-2 text-[10px] uppercase tracking-editorial text-ry-onyx border border-ry-ash flex items-center gap-1.5 shadow-sm hover:bg-ry-onyx hover:text-ry-white transition-all"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Inspect Macro Texture</span>
                </button>
              )}

              {/* Subtle formulation hallmark badge */}
              <div className="absolute top-4 left-4 bg-ry-pearl/80 backdrop-blur-sm px-2.5 py-1 text-[9px] uppercase tracking-editorial text-ry-stone border border-ry-ash/40">
                {product.attributes.badge || product.category}
              </div>
            </div>
          </div>

          {/* Sensory Guarantees */}
          <div className="hidden lg:grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-ry-ash/40 text-center text-xs text-ry-stone">
            <div>
              <p className="font-serif italic text-ry-onyx text-sm">Artisanal Origin</p>
              <p className="text-[10px] uppercase tracking-subtle mt-0.5">Master Atelier Sourced</p>
            </div>
            <div>
              <p className="font-serif italic text-ry-onyx text-sm">Sustainable Luxury</p>
              <p className="text-[10px] uppercase tracking-subtle mt-0.5">Eco-Certified & Recyclable</p>
            </div>
            <div>
              <p className="font-serif italic text-ry-onyx text-sm">Klarna Verified</p>
              <p className="text-[10px] uppercase tracking-subtle mt-0.5">Split Into 4 Payments</p>
            </div>
          </div>
        </div>

        {/* Right Column: Title, Klarna Pricing, Selection, and Accordions */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Header & Subtitle */}
          <div>
            <span className="text-[10px] uppercase tracking-[0.25em] text-ry-stone font-sans">
              {product.category}
            </span>
            <h1 className="font-serif text-3xl sm:text-4xl text-ry-onyx leading-tight mt-1 mb-2 font-normal">
              {product.title}
            </h1>
            <p className="text-xs text-ry-stone tracking-subtle uppercase font-sans">
              {product.subtitle}
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
              <span className="text-[10px] tracking-editorial uppercase px-2 py-0.5 bg-ry-oatmeal text-ry-charcoal font-sans ml-auto">
                In Stock ({selectedVariant.inventory} Remaining)
              </span>
            </div>

            {/* Klarna Widget right under price */}
            <div className="pt-1">
              <KlarnaWidget price={selectedVariant.price} />
            </div>
          </div>

          {/* Sensory Narrative Summary */}
          <p className="text-sm font-sans text-ry-charcoal leading-relaxed">
            {product.summary}
          </p>

          {/* Dynamic Category Specifications & Notes */}
          {product.attributes.olfactoryFamily ? (
            <div className="bg-ry-oatmeal/50 p-4 border border-ry-ash/60 space-y-2">
              <div className="text-[10px] uppercase tracking-editorial text-ry-stone">
                Fragrance Notes
              </div>
              <div className="text-xs space-y-1 font-sans">
                {product.attributes.topNotes && (
                  <div>
                    <strong className="text-ry-onyx">Top Notes:</strong>{' '}
                    <span className="text-ry-stone">{product.attributes.topNotes.join(', ')}</span>
                  </div>
                )}
                {product.attributes.heartNotes && (
                  <div>
                    <strong className="text-ry-onyx">Heart Notes:</strong>{' '}
                    <span className="text-ry-stone">{product.attributes.heartNotes.join(', ')}</span>
                  </div>
                )}
                {product.attributes.baseNotes && (
                  <div>
                    <strong className="text-ry-onyx">Base Notes:</strong>{' '}
                    <span className="text-ry-stone">{product.attributes.baseNotes.join(', ')}</span>
                  </div>
                )}
              </div>
            </div>
          ) : product.attributes.keyActives ? (
            <div className="bg-ry-oatmeal/50 p-4 border border-ry-ash/60 space-y-2">
              <div className="text-[10px] uppercase tracking-editorial text-ry-stone">
                Key Ingredients & Skin Types
              </div>
              <div className="text-xs font-sans text-ry-stone">
                <span className="text-ry-onyx font-medium">Key Actives:</span> {product.attributes.keyActives}
              </div>
              {product.attributes.skinType && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {product.attributes.skinType.map((type: string) => (
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
          ) : product.attributes.hairType ? (
            <div className="bg-ry-oatmeal/50 p-4 border border-ry-ash/60 space-y-2">
              <div className="text-[10px] uppercase tracking-editorial text-ry-stone">
                Product Highlights
              </div>
              <div className="flex flex-wrap gap-1.5">
                {product.attributes.hairType.map((type) => (
                  <span
                    key={type}
                    className="text-[10px] uppercase tracking-subtle px-2 py-1 bg-ry-white border border-ry-ash/70 text-ry-charcoal"
                  >
                    {type}
                  </span>
                ))}
                {product.attributes.siliconeFree && (
                  <span className="text-[10px] uppercase tracking-subtle px-2 py-1 bg-ry-white border border-ry-ash/70 text-ry-charcoal">
                    Silicone-Free
                  </span>
                )}
              </div>
            </div>
          ) : product.attributes.vesselMaterial || product.attributes.burnTime ? (
            <div className="bg-ry-oatmeal/50 p-4 border border-ry-ash/60 space-y-2">
              <div className="text-[10px] uppercase tracking-editorial text-ry-stone">
                Product Details
              </div>
              <div className="text-xs space-y-1 font-sans text-ry-stone">
                {product.attributes.burnTime && (
                  <div>
                    <strong className="text-ry-onyx">Burn Time:</strong> {product.attributes.burnTime}
                  </div>
                )}
                {product.attributes.vesselMaterial && (
                  <div>
                    <strong className="text-ry-onyx">Vessel:</strong> {product.attributes.vesselMaterial}
                  </div>
                )}
                {product.attributes.waxType && (
                  <div>
                    <strong className="text-ry-onyx">Wax:</strong> {product.attributes.waxType}
                  </div>
                )}
              </div>
            </div>
          ) : product.attributes.material ? (
            <div className="bg-ry-oatmeal/50 p-4 border border-ry-ash/60 space-y-2">
              <div className="text-[10px] uppercase tracking-editorial text-ry-stone">
                Material & Craftsmanship
              </div>
              <div className="text-xs space-y-1 font-sans text-ry-stone">
                <div>
                  <strong className="text-ry-onyx">Material:</strong> {product.attributes.material}
                </div>
                {product.attributes.origin && (
                  <div>
                    <strong className="text-ry-onyx">Origin:</strong> {product.attributes.origin}
                  </div>
                )}
                {product.attributes.hardware && (
                  <div>
                    <strong className="text-ry-onyx">Hardware:</strong> {product.attributes.hardware}
                  </div>
                )}
              </div>
            </div>
          ) : null}

          {/* Variant Selection */}
          <div className="space-y-3">
            <label className="text-[11px] uppercase tracking-editorial text-ry-stone block font-sans">
              Select Edition & Size
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {product.variants.map((variant) => (
                <button
                  key={variant.id}
                  onClick={() => setSelectedVariant(variant)}
                  className={`p-3 text-left border transition-all text-xs flex justify-between items-center ${
                    selectedVariant.id === variant.id
                      ? 'border-ry-burgundy bg-ry-white ring-1 ring-ry-burgundy shadow-sm'
                      : 'border-ry-ash/70 bg-ry-pearl hover:border-ry-burgundy'
                  }`}
                >
                  <span className="font-medium text-ry-onyx">{variant.title}</span>
                  <span className="font-mono text-ry-charcoal">£{variant.price}</span>
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
                  className="px-3 py-3 text-ry-stone hover:text-ry-onyx transition-colors text-sm"
                  aria-label="Decrease quantity"
                >
                  -
                </button>
                <span className="w-8 text-center text-xs font-mono font-medium">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="px-3 py-3 text-ry-stone hover:text-ry-onyx transition-colors text-sm"
                  aria-label="Increase quantity"
                >
                  +
                </button>
              </div>

              {/* Add to Cart Button */}
              <button
                onClick={handleAddToCart}
                disabled={isAdded}
                className="flex-1 py-3.5 px-6 bg-ry-burgundy text-ry-white text-xs uppercase tracking-editorial font-medium hover:bg-ry-burgundyLight active:scale-[0.99] transition-all flex items-center justify-center gap-2 shadow-luxury group"
              >
                {isAdded ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-400" />
                    <span>Added to Cart</span>
                  </>
                ) : (
                  <>
                    <Droplet className="w-4 h-4 group-hover:scale-110 transition-transform" />
                    <span>Add to Cart • £{(selectedVariant.price * quantity).toFixed(2)}</span>
                  </>
                )}
              </button>
            </div>

            {/* Secondary Actions */}
            <div className="flex justify-between items-center text-[11px] text-ry-stone px-1">
              <button className="flex items-center gap-1.5 hover:text-ry-onyx transition-colors">
                <Heart className="w-3.5 h-3.5" />
                <span>Save to Wishlist</span>
              </button>
              <button className="flex items-center gap-1.5 hover:text-ry-onyx transition-colors">
                <Share2 className="w-3.5 h-3.5" />
                <span>Share Product</span>
              </button>
            </div>
          </div>

          {/* Product Details Drop-Down Accordions */}
          <div className="border-t border-ry-ash/70 pt-2 divide-y divide-ry-ash/60">
            
            {/* Accordion 1: Ingredients */}
            <div className="py-4">
              <button
                onClick={() => toggleAccordion('ingredients')}
                className="w-full flex justify-between items-center text-left text-xs uppercase tracking-editorial font-medium text-ry-onyx group"
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
                  <p>{product.ingredients}</p>
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
                className="w-full flex justify-between items-center text-left text-xs uppercase tracking-editorial font-medium text-ry-onyx group"
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
                  <p>{product.howToUse}</p>
                </div>
              )}
            </div>

            {/* Accordion 3: Sourcing & Packaging */}
            <div className="py-4">
              <button
                onClick={() => toggleAccordion('sourcing')}
                className="w-full flex justify-between items-center text-left text-xs uppercase tracking-editorial font-medium text-ry-onyx group"
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
                  <p>{product.sourcingEthics}</p>
                </div>
              )}
            </div>

            {/* Accordion 4: Shipping & Klarna */}
            <div className="py-4">
              <button
                onClick={() => toggleAccordion('shipping')}
                className="w-full flex justify-between items-center text-left text-xs uppercase tracking-editorial font-medium text-ry-onyx group"
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
                    Free UK delivery via Evri and Royal Mail on orders over £150. All orders include 2 free samples. Returns accepted within 30 days.
                  </p>
                  <p>
                    Pay in 4 interest-free installments with Klarna.
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
