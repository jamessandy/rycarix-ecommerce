// lib/services/catalogService.ts
import { prisma } from '@/lib/prisma';
import { mockProducts } from '@/lib/data/mockData';
import { Product } from '@/lib/types/ecommerce';
import {
  normalizeCategorySlug,
  getCategoryLabel,
  getCategoryDisplayLabel,
  matchProductCategory,
  CANONICAL_CATEGORIES,
} from '@/lib/utils/categoryUtils';

export {
  normalizeCategorySlug,
  getCategoryLabel,
  getCategoryDisplayLabel,
  matchProductCategory,
  CANONICAL_CATEGORIES,
};

function mapDbRecordToProduct(record: any): Product {
  const imgs =
    Array.isArray(record.images) && record.images.length > 0
      ? record.images
      : ['/images/media_1791069473262.jpg'];

  const prodName = record.name || record.title || 'Product';

  return {
    id: record.id,
    name: prodName,
    title: prodName,
    slug: record.slug,
    description: record.description || record.summary || '',
    price: Number(record.price ?? 0),
    compareAtPrice:
      record.compareAtPrice !== null && record.compareAtPrice !== undefined
        ? Number(record.compareAtPrice)
        : undefined,
    stock: Number(record.stock ?? 15),
    category: normalizeCategorySlug(record.category),
    images: imgs,
    featured: Boolean(record.featured ?? true),
    isLive: record.isLive !== undefined ? Boolean(record.isLive) : true,
    rating: Number(record.rating ?? 5.0),
    reviewsCount: Number(record.reviewsCount ?? 0),
    sku: record.sku || `RYC-${String(record.id).slice(-6).toUpperCase()}`,
    createdAt: record.createdAt ? new Date(record.createdAt).toISOString() : new Date().toISOString(),
  } as Product;
}

function getFallbackMockProducts(): Product[] {
  return mockProducts.map((p) => ({
    id: p.id,
    name: p.name,
    title: p.name,
    slug: p.slug,
    description: p.description || '',
    price: Number(p.price),
    compareAtPrice: p.compareAtPrice ? Number(p.compareAtPrice) : undefined,
    stock: Number((p as any).stock ?? 15),
    category: normalizeCategorySlug(p.category),
    images: Array.isArray(p.images) && p.images.length > 0 ? p.images : ['/images/media_1791069473262.jpg'],
    featured: Boolean(p.featured ?? true),
    isLive: true,
    rating: 5.0,
    reviewsCount: 0,
    sku: p.sku || `RYC-${p.id.slice(-6).toUpperCase()}`,
    createdAt: new Date().toISOString(),
  }));
}

export const catalogService = {
  /**
   * Ensures baseline catalog products exist in PostgreSQL so every device sees the exact same baseline + admin additions
   */
  async ensureSeeded(): Promise<void> {
    try {
      const count = await prisma.product.count();
      if (count === 0 && Array.isArray(mockProducts) && mockProducts.length > 0) {
        for (const item of mockProducts) {
          const slug =
            item.slug ||
            item.name
              .toLowerCase()
              .replace(/[^a-z0-9]+/g, '-')
              .replace(/(^-|-$)/g, '');

          const validImgs =
            Array.isArray(item.images) && item.images.length > 0
              ? item.images
              : ['/images/media_1791069473262.jpg'];

          await prisma.product.upsert({
            where: { slug },
            update: {
              name: item.name,
              title: item.name,
              price: Number(item.price),
              stock: Number(item.stock ?? 15),
              category: normalizeCategorySlug(item.category),
              images: validImgs,
              isLive: true,
            },
            create: {
              id: item.id || `prod_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
              name: item.name,
              title: item.name,
              slug,
              description: item.description || '',
              price: Number(item.price),
              compareAtPrice: item.compareAtPrice ? Number(item.compareAtPrice) : null,
              stock: Number(item.stock ?? 15),
              category: normalizeCategorySlug(item.category),
              images: validImgs,
              featured: Boolean(item.featured ?? true),
              isLive: true,
              sku: item.sku || `RYC-${Math.random().toString(36).substring(2, 7).toUpperCase()}`,
            },
          });
        }
      }
    } catch (err) {
      console.warn('Catalog seeding check note:', err);
    }
  },

  async getAllProducts(options?: {
    category?: string;
    includeDrafts?: boolean;
    searchQuery?: string;
  }): Promise<Product[]> {
    let mapped: Product[] = [];

    try {
      await this.ensureSeeded();

      const whereClause: any = {};
      if (!options?.includeDrafts) {
        whereClause.isLive = true;
      }

      const dbRecords = await prisma.product.findMany({
        where: whereClause,
        orderBy: { createdAt: 'desc' },
      });

      if (dbRecords && dbRecords.length > 0) {
        mapped = dbRecords.map(mapDbRecordToProduct);
      } else {
        mapped = getFallbackMockProducts();
      }
    } catch (err) {
      console.warn('Database fetch fallback to mock products:', err);
      mapped = getFallbackMockProducts();
    }

    if (options?.category && options.category.toLowerCase() !== 'all') {
      const targetCategory = normalizeCategorySlug(options.category);
      mapped = mapped.filter((p) => normalizeCategorySlug(p.category) === targetCategory);
    }

    if (options?.searchQuery && options.searchQuery.trim()) {
      const q = options.searchQuery.toLowerCase().trim();
      mapped = mapped.filter((p) => {
        const name = (p.name || '').toLowerCase();
        const desc = (p.description || '').toLowerCase();
        const cat = (p.category || '').toLowerCase();
        const sku = (p.sku || '').toLowerCase();
        return name.includes(q) || desc.includes(q) || cat.includes(q) || sku.includes(q);
      });
    }

    return mapped;
  },

  async getProductBySlug(slug: string): Promise<Product | null> {
    try {
      await this.ensureSeeded();
      const record = await prisma.product.findFirst({
        where: {
          OR: [{ slug }, { id: slug }],
        },
      });
      if (record) return mapDbRecordToProduct(record);
    } catch (err) {
      console.warn('Database findFirst fallback to mock products:', err);
    }

    const fallback = getFallbackMockProducts().find((p) => p.slug === slug || p.id === slug);
    return fallback || null;
  },

  async createProduct(input: {
    name: string;
    description?: string;
    price: number;
    compareAtPrice?: number;
    stock: number;
    category: string;
    images: string[];
    featured?: boolean;
    isLive?: boolean;
    sku?: string;
  }): Promise<Product> {
    const cleanName = input.name.trim();
    const baseSlug = cleanName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
    const uniqueSlug = `${baseSlug}-${Date.now().toString().slice(-5)}`;
    const normalizedCategory = normalizeCategorySlug(input.category);

    const validImages =
      Array.isArray(input.images) && input.images.length > 0
        ? input.images.filter(Boolean)
        : ['/images/media_1791069473262.jpg'];

    const newProdData = {
      id: `prod_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      name: cleanName,
      title: cleanName,
      slug: uniqueSlug,
      description: input.description?.trim() || '',
      price: Number(input.price),
      compareAtPrice: input.compareAtPrice ? Number(input.compareAtPrice) : null,
      stock: Math.max(0, Math.floor(Number(input.stock ?? 0))),
      category: normalizedCategory,
      images: validImages,
      featured: Boolean(input.featured ?? true),
      isLive: input.isLive !== undefined ? Boolean(input.isLive) : true,
      sku: input.sku?.trim() || `RYC-${Math.random().toString(36).substring(2, 7).toUpperCase()}`,
    };

    try {
      const created = await prisma.product.create({
        data: newProdData,
      });
      return mapDbRecordToProduct(created);
    } catch (err) {
      console.warn('Database write fallback:', err);
      return mapDbRecordToProduct(newProdData);
    }
  },

  async updateProduct(
    id: string,
    updates: Partial<{
      name: string;
      price: number;
      stock: number;
      category: string;
      isLive: boolean;
      featured: boolean;
    }>
  ): Promise<Product> {
    const dataToUpdate: any = {};
    if (updates.name !== undefined) {
      dataToUpdate.name = updates.name.trim();
      dataToUpdate.title = updates.name.trim();
    }
    if (updates.price !== undefined) dataToUpdate.price = Number(updates.price);
    if (updates.stock !== undefined) dataToUpdate.stock = Math.max(0, Math.floor(Number(updates.stock)));
    if (updates.category !== undefined) dataToUpdate.category = normalizeCategorySlug(updates.category);
    if (updates.isLive !== undefined) dataToUpdate.isLive = Boolean(updates.isLive);
    if (updates.featured !== undefined) dataToUpdate.featured = Boolean(updates.featured);

    const updated = await prisma.product.update({
      where: { id },
      data: dataToUpdate,
    });

    return mapDbRecordToProduct(updated);
  },

  async deleteProduct(id: string): Promise<void> {
    try {
      await prisma.product.delete({
        where: { id },
      });
    } catch (err) {
      console.warn('Database delete note:', err);
    }
  },
};
