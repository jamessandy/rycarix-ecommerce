// lib/services/catalogService.ts
import { prisma } from '@/lib/prisma';
import { mockProducts, PRODUCTS } from '@/lib/data/mockData';
import { Product, ProductItem } from '@/lib/types/ecommerce';

// In-memory / global runtime store fallback
declare global {
  var __rycarixProducts: Product[] | undefined;
  var __rycarixSeeded: boolean | undefined;
}

function getRuntimeProducts(): Product[] {
  if (!global.__rycarixProducts) {
    global.__rycarixProducts = [...mockProducts];
  }
  return global.__rycarixProducts;
}

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

/**
 * Automatically seed initial catalog to Neon Postgres if database is empty
 */
async function autoSeedDatabaseIfEmpty() {
  if (global.__rycarixSeeded) return;
  global.__rycarixSeeded = true;

  try {
    const count = await prisma.product.count();
    if (count === 0 && mockProducts.length > 0) {
      for (const p of mockProducts) {
        await prisma.product.create({
          data: {
            id: p.id,
            title: p.name,
            slug: p.slug,
            description: p.description,
            basePrice: p.price,
            compareAtPrice: p.compareAtPrice,
            isFeatured: p.featured ?? true,
            attributes: {
              category: p.category,
              images: p.images,
              stock: p.stock,
              sku: p.sku,
              rating: p.rating,
              reviewsCount: p.reviewsCount,
            },
          },
        });
      }
    }
  } catch (e) {
    console.warn('Could not auto-seed database:', e);
  }
}

export const catalogService = {
  async getAllProducts(categoryFilter?: string): Promise<Product[]> {
    let products: Product[] = [];

    try {
      await autoSeedDatabaseIfEmpty();

      const dbProducts = await prisma.product.findMany({
        orderBy: { createdAt: 'desc' },
      });

      if (dbProducts && dbProducts.length > 0) {
        const mappedDb: Product[] = dbProducts.map((p: any) => {
          const attrs = (p.attributes as any) || {};
          const cat = attrs.category || 'parfum';
          const imgs =
            Array.isArray(attrs.images) && attrs.images.length > 0
              ? attrs.images
              : ['/images/media_1791069473262.jpg'];

          return {
            id: p.id,
            name: p.title || p.name || 'Product',
            title: p.title || p.name,
            slug: p.slug,
            description: p.description || '',
            price: Number(p.basePrice ?? p.price ?? 0),
            compareAtPrice: p.compareAtPrice ? Number(p.compareAtPrice) : undefined,
            stock: Number(attrs.stock ?? 15),
            category: cat.toLowerCase(),
            images: imgs,
            featured: Boolean(p.isFeatured ?? p.featured ?? true),
            rating: Number(attrs.rating ?? 5.0),
            reviewsCount: Number(attrs.reviewsCount ?? 0),
            sku: attrs.sku || `RYC-${p.id.slice(0, 6).toUpperCase()}`,
            createdAt: p.createdAt ? new Date(p.createdAt).toISOString() : new Date().toISOString(),
          };
        });

        // Merge with any in-memory additions
        const runtime = getRuntimeProducts();
        const combined = [...mappedDb, ...runtime];
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
    } catch (err) {
      products = getRuntimeProducts();
    }

    if (categoryFilter && categoryFilter !== 'all' && categoryFilter !== 'ALL' && categoryFilter !== 'all products') {
      return products.filter((p) => matchProductCategory(p.category, categoryFilter));
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
      title: cleanName,
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

    // Save to runtime store so it immediately reflects in current process
    const current = getRuntimeProducts();
    global.__rycarixProducts = [newProduct, ...current];

    // Persist permanently to Neon Postgres database
    try {
      const saved = await prisma.product.create({
        data: {
          id: newProduct.id,
          title: newProduct.name,
          slug: newProduct.slug,
          description: newProduct.description,
          basePrice: newProduct.price,
          compareAtPrice: newProduct.compareAtPrice,
          isFeatured: newProduct.featured,
          attributes: {
            category: newProduct.category,
            images: newProduct.images,
            stock: newProduct.stock,
            sku: newProduct.sku,
            rating: 5.0,
            reviewsCount: 0,
          },
        },
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
