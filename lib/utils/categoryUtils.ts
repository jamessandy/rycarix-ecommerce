// lib/utils/categoryUtils.ts

export const CANONICAL_CATEGORIES = [
  { slug: 'perfume', label: 'Perfume & Fragrance', aliases: ['perfume', 'perfumes', 'fragrance', 'fragrances', 'scent', 'parfum'] },
  { slug: 'hair', label: 'Hair Care', aliases: ['hair', 'hairs', 'wigs', 'extensions', 'bundles', 'luxury-hair', 'hair-extensions', 'haircare'] },
  { slug: 'skincare', label: 'Skincare & Body', aliases: ['skincare', 'skin-care', 'skin', 'body', 'lotion', 'body-bath'] },
  { slug: 'home-living', label: 'Home & Candles', aliases: ['home-living', 'candles', 'candle', 'home', 'living', 'room-mist'] },
  { slug: 'accessories', label: 'Accessories', aliases: ['accessories', 'fine-goods', 'accessory', 'case'] },
  { slug: 'cosmetics', label: 'Cosmetics & Beauty', aliases: ['cosmetics', 'cosmetic', 'beauty', 'makeup', 'lip-gloss', 'lips'] },
] as const;

export type CanonicalCategorySlug = (typeof CANONICAL_CATEGORIES)[number]['slug'];

export function normalizeCategorySlug(raw?: string | null): string {
  if (!raw) return 'perfume';
  const cleaned = raw.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  if (cleaned === 'all' || cleaned === 'all-products') return 'all';

  for (const cat of CANONICAL_CATEGORIES) {
    if (cat.slug === cleaned || (cat.aliases as readonly string[]).includes(cleaned)) {
      return cat.slug;
    }
    if (cleaned.includes(cat.slug)) {
      return cat.slug;
    }
  }
  return cleaned;
}

export function getCategoryLabel(slug?: string | null): string {
  const normalized = normalizeCategorySlug(slug);
  const found = CANONICAL_CATEGORIES.find((c) => c.slug === normalized);
  return found ? found.label : normalized.charAt(0).toUpperCase() + normalized.slice(1);
}

export const getCategoryDisplayLabel = getCategoryLabel;

export function matchProductCategory(productCategory: string | undefined, targetCategory: string): boolean {
  if (!targetCategory || targetCategory === 'ALL' || targetCategory === 'all' || targetCategory === 'all products') return true;
  if (!productCategory) return false;
  const pNorm = normalizeCategorySlug(productCategory);
  const tNorm = normalizeCategorySlug(targetCategory);
  return pNorm === tNorm;
}

export const CATEGORY_DEFINITIONS = CANONICAL_CATEGORIES.map((c) => ({
  key: c.label,
  label: c.label,
  slug: c.slug,
  aliases: Array.from(c.aliases),
}));
