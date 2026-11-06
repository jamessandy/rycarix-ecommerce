// lib/services/catalogService.ts
import { prisma } from '@/lib/prisma';
import { mockProducts, PRODUCTS } from '@/lib/data/mockData';
import { Product, ProductItem } from '@/lib/types/ecommerce';
import { CATEGORY_DEFINITIONS, matchProductCategory, getCategoryDisplayLabel } from '@/lib/utils/categoryUtils';

// Re-export category utilities for server-side callers
export { CATEGORY_DEFINITIONS, matchProductCategory, getCategoryDisplayLabel };

// In-memory / global runtime store merged with DB & initial seed
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
 * Automatically seed initial catalog to Neon Postgres if database is empty
 */
async function autoSeedDatabaseIfEmpty() {
  if (global.__rycarixSeeded) return;
  global.__rycarixSeeded = true;

  try {
    const count = await prisma.product.count();
    if (count === 0 && mockProducts.length > 0) {
      for (const p of mockProducts) {
        await prisma.product.upsert({
          where: { slug: p.slug },
          update: {
            title: p.name,
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
          create: {
            id: p.id,
            title: p.name,
            slug: p.slug,
            description: p.description,
            basePrice: p.price,
            compareAtPrice: p.compareAtPrice,
            isFeatured: p.featured ?? true,
            status: 'ACTIVE',
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
  async getAllProducts(categoryFilter?: string, searchQuery?: string): Promise<Product[]> {
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

        // Merge with runtime memory store
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
      console.warn('Database fetch fallback to runtime store:', err);
      products = getRuntimeProducts();
    }

    if (categoryFilter && categoryFilter !== 'all' && categoryFilter !== 'ALL' && categoryFilter !== 'all products') {
      products = products.filter((p) => matchProductCategory(p.category, categoryFilter));
    }

    if (searchQuery && searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      products = products.filter(
        (p) =>
          (p.name && p.name.toLowerCase().includes(q)) ||
          (p.title && p.title.toLowerCase().includes(q)) ||
          (p.description && p.description.toLowerCase().includes(q)) ||
          (p.category && p.category.toLowerCase().includes(q)) ||
          (p.sku && p.sku.toLowerCase().includes(q))
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

    // Save to runtime store immediately
    const current = getRuntimeProducts();
    const updated = [newProduct, ...current.filter((p) => p.id !== newProduct.id && p.slug !== newProduct.slug)];
    global.__rycarixProducts = updated;

    // Persist permanently to Neon Postgres database
    try {
      const saved = await prisma.product.upsert({
        where: { slug: newProduct.slug },
        update: {
          title: newProduct.name,
          description: newProduct.description,
          basePrice: newProduct.price,
          compareAtPrice: newProduct.compareAtPrice,
          isFeatured: newProduct.featured,
          status: 'ACTIVE',
          attributes: {
            category: newProduct.category,
            images: newProduct.images,
            stock: newProduct.stock,
            sku: newProduct.sku,
            rating: 5.0,
            reviewsCount: 0,
          },
        },
        create: {
          id: newProduct.id,
          title: newProduct.name,
          slug: newProduct.slug,
          description: newProduct.description,
          basePrice: newProduct.price,
          compareAtPrice: newProduct.compareAtPrice,
          isFeatured: newProduct.featured,
          status: 'ACTIVE',
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
    const updated = current.filter((p) => p.id !== id && p.slug !== id);
    global.__rycarixProducts = updated;

    try {
      await prisma.product.delete({ where: { id } });
    } catch {
      // Ignore if only in runtime store
    }
    return true;
  },
};
