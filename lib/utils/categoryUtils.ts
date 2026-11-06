// lib/utils/categoryUtils.ts

/**
 * Standard luxury department names and aliases for backwards-compatibility
 */
export const CATEGORY_DEFINITIONS = [
  {
    key: 'Hair',
    label: 'Hair',
    slug: 'hair',
    aliases: ['hair', 'haircare', 'hair care', 'scalp', 'shampoo', 'conditioner', 'hair oil', 'oil'],
  },
  {
    key: 'Parfum',
    label: 'Parfum',
    slug: 'fragrance',
    aliases: ['parfum', 'haute parfumerie', 'perfume', 'fragrance', 'extrait', 'flacon', 'cologne', 'scent'],
  },
  {
    key: 'Skincare',
    label: 'Skincare',
    slug: 'skincare',
    aliases: ['skincare', 'botanical skincare', 'skin', 'serum', 'balm', 'face', 'cellular'],
  },
  {
    key: 'Body & Bath',
    label: 'Body & Bath',
    slug: 'body-bath',
    aliases: ['body & bath', 'body', 'bath', 'polish', 'wash', 'body-bath'],
  },
  {
    key: 'Home & Candles',
    label: 'Home & Candles',
    slug: 'home-living',
    aliases: ['home & candles', 'home & living', 'candles', 'candle', 'bougie', 'home', 'living', 'room mist', 'home-living'],
  },
  {
    key: 'Accessories',
    label: 'Accessories',
    slug: 'accessories',
    aliases: ['accessories', 'accessories & fine goods', 'accessory', 'fine goods', 'leather', 'silk mask'],
  },
];

export function matchProductCategory(productCategory: string | undefined, targetCategory: string): boolean {
  if (!targetCategory || targetCategory === 'ALL' || targetCategory === 'all' || targetCategory === 'all products') return true;
  if (!productCategory) return false;

  const prodCatNorm = productCategory.toLowerCase().trim();
  const targetNorm = targetCategory.toLowerCase().trim();

  if (prodCatNorm === targetNorm) return true;

  const def = CATEGORY_DEFINITIONS.find(
    (d) =>
      d.key.toLowerCase() === targetNorm ||
      d.label.toLowerCase() === targetNorm ||
      d.slug.toLowerCase() === targetNorm ||
      d.aliases.some((a) => a === targetNorm)
  );

  if (def) {
    if (def.aliases.some((alias) => prodCatNorm === alias || prodCatNorm.includes(alias) || alias.includes(prodCatNorm))) {
      return true;
    }
  }

  const prodDef = CATEGORY_DEFINITIONS.find(
    (d) =>
      d.key.toLowerCase() === prodCatNorm ||
      d.label.toLowerCase() === prodCatNorm ||
      d.slug.toLowerCase() === prodCatNorm ||
      d.aliases.some((a) => a === prodCatNorm)
  );

  if (prodDef && def && prodDef.key === def.key) {
    return true;
  }

  return prodCatNorm.includes(targetNorm) || targetNorm.includes(prodCatNorm);
}

export function getCategoryDisplayLabel(category: string): string {
  if (!category) return 'Product';
  const norm = category.toLowerCase().trim();

  const def = CATEGORY_DEFINITIONS.find(
    (d) =>
      d.key.toLowerCase() === norm ||
      d.label.toLowerCase() === norm ||
      d.slug.toLowerCase() === norm ||
      d.aliases.some((a) => norm === a || norm.includes(a))
  );

  return def ? def.label : category;
}

