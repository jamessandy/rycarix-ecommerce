// lib/services/catalogService.ts
import { prisma } from '@/lib/prisma';
import { mockProducts, PRODUCTS } from '@/lib/data/mockData';
import { Product, ProductItem } from '@/lib/types/ecommerce';

// In-memory / global runtime store merged with DB & initial seed so Admin additions always reflect immediately
declare global {
  var __rycarixProducts: Product[] | undefined;
}

function getRuntimeProducts(): Product[] {
  if (!global.__rycarixProducts) {
    global.__rycarixProducts = [...mockProducts];
  }
  return global.__rycarixProducts;
}

export const catalogService = {
  async getAllProducts(categorySlug?: string): Promise<Product[]> {
    let products: Product[] = [];

    try {
      const dbProducts = await prisma.product.findMany({
        orderBy: { createdAt: 'desc' },
      });

      if (dbProducts && dbProducts.length > 0) {
        const mappedDb: Product[] = dbProducts.map((p: any) => ({
          id: p.id,
          name: p.name || p.title,
          slug: p.slug,
          description: p.description || '',
          price: Number(p.price ?? p.basePrice ?? 0),
          compareAtPrice: p.compareAtPrice ? Number(p.compareAtPrice) : undefined,
          stock: Number(p.stock ?? p.quantity ?? 10),
          category: (p.category || 'perfume').toLowerCase(),
          images: Array.isArray(p.images)
            ? p.images
            : typeof p.image === 'string' && p.image
            ? [p.image]
            : ['/images/media_1791069473262.jpg'],
          featured: Boolean(p.featured ?? p.isFeatured ?? true),
          rating: Number(p.rating ?? 5.0),
          reviewsCount: Number(p.reviewsCount ?? p.reviewCount ?? 0),
          sku: p.sku || `RYC-${p.id.slice(0, 6).toUpperCase()}`,
          createdAt: p.createdAt ? new Date(p.createdAt).toISOString() : new Date().toISOString(),
        }));

        // Merge with runtime memory + initial catalog (deduplicated by slug)
        const combined = [...mappedDb, ...getRuntimeProducts()];
        const seen = new Set<string>();
        products = combined.filter((item) => {
          const key = item.slug || item.id;
          if (seen.has(key)) return false;
          seen.add(key);
          return true;
        });
      } else {
        products = getRuntimeProducts();
      }
    } catch {
      products = getRuntimeProducts();
    }

    if (categorySlug && categorySlug !== 'all') {
      const normalized = categorySlug.toLowerCase().trim();
      return products.filter(
        (p) => p.category.toLowerCase().trim() === normalized
      );
    }

    return products;
  },

  async getProductBySlug(slug: string): Promise<Product | null> {
    const all = await this.getAllProducts();
    return all.find((p) => p.slug === slug || p.id === slug) || null;
  },

  async createProduct(input: Partial<Product> & { name: string; price: number; category: string }): Promise<Product> {
    const cleanName = input.name.trim();
    const baseSlug =
      input.slug?.trim() ||
      cleanName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
    const uniqueSlug = `${baseSlug}-${Date.now().toString().slice(-4)}`;

    const numericPrice = Number(input.price);
    const numericStock = Number(input.stock ?? 10);
    const cleanCategory = input.category.toLowerCase().trim();
    const validImages =
      Array.isArray(input.images) && input.images.length > 0
        ? input.images.filter(Boolean)
        : ['/images/media_1791069473262.jpg'];

    const newProduct: Product = {
      id: `prod_${Date.now()}`,
      name: cleanName,
      slug: uniqueSlug,
      description: input.description?.trim() || '',
      price: numericPrice,
      compareAtPrice: input.compareAtPrice ? Number(input.compareAtPrice) : undefined,
      stock: numericStock,
      category: cleanCategory,
      images: validImages,
      featured: Boolean(input.featured ?? true),
      rating: 5.0,
      reviewsCount: 0,
      sku: input.sku?.trim() || `RYC-${Math.random().toString(36).substring(2, 7).toUpperCase()}`,
      createdAt: new Date().toISOString(),
    };

    // Save to runtime store first so it immediately reflects
    const current = getRuntimeProducts();
    global.__rycarixProducts = [newProduct, ...current];

    // Persist to Prisma Postgres if connected
    try {
      const saved = await prisma.product.create({
        data: {
          title: newProduct.name,
          slug: newProduct.slug,
          description: newProduct.description,
          basePrice: newProduct.price,
          compareAtPrice: newProduct.compareAtPrice,
          isFeatured: newProduct.featured,
        } as any,
      });
      if (saved?.id) {
        newProduct.id = saved.id;
      }
    } catch (err) {
      console.warn('Database write fallback to runtime store:', err);
    }

    return newProduct;
  },

  async deleteProduct(id: string): Promise<boolean> {
    const current = getRuntimeProducts();
    global.__rycarixProducts = current.filter((p) => p.id !== id && p.slug !== id);
    try {
      await prisma.product.delete({ where: { id } });
    } catch {
      // Ignore if only in runtime store
    }
    return true;
  },
};

/**
 * Standard luxury department names and aliases for backwards-compatibility
 */
export const CATEGORY_DEFINITIONS = [
  {
    key: 'Hair',
    label: 'Hair',
    slug: 'hair',
    aliases: ['hair', 'haircare', 'hair care', 'scalp', 'shampoo', 'conditioner', 'hair elixir'],
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
    aliases: ['body & bath', 'body', 'bath', 'polish', 'wash'],
  },
  {
    key: 'Home & Candles',
    label: 'Home & Candles',
    slug: 'home-living',
    aliases: ['home & candles', 'home & living', 'candles', 'candle', 'bougie', 'home', 'living', 'room mist'],
  },
  {
    key: 'Accessories',
    label: 'Accessories',
    slug: 'accessories',
    aliases: ['accessories', 'accessories & fine goods', 'accessory', 'fine goods', 'leather', 'silk mask'],
  },
];

export function matchProductCategory(productCategory: string | undefined, targetCategory: string): boolean {
  if (!targetCategory || targetCategory === 'ALL' || targetCategory === 'all') return true;
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
    if (def.aliases.some((alias) => prodCatNorm.includes(alias) || alias.includes(prodCatNorm))) {
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
      d.aliases.some((a) => norm.includes(a))
  );

  return def ? def.label : category;
}

export function loadClientCatalog(): ProductItem[] {
  if (typeof window === 'undefined') return PRODUCTS;
  try {
    const raw = localStorage.getItem('rycarix_catalog_products');
    if (raw) {
      const parsed: ProductItem[] = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn('Could not read rycarix_catalog_products from localStorage', e);
  }
  return PRODUCTS;
}
