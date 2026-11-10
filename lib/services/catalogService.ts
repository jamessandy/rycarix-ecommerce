// lib/services/catalogService.ts
import { prisma } from '@/lib/prisma';
import { CATEGORIES, PRODUCTS, mockProducts } from '@/lib/data/mockData';
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

let seedPromise: Promise<void> | null = null;

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
    subtitle: record.subtitle || undefined,
    summary: record.summary || undefined,
    description: record.description || record.summary || '',
    ingredients: record.ingredients || undefined,
    howToUse: record.howToUse || undefined,
    sourcingEthics: record.sourcingEthics || undefined,
    attributes: record.attributes || undefined,
    price: Number(record.price ?? 0),
    compareAtPrice:
      record.compareAtPrice !== null && record.compareAtPrice !== undefined
        ? Number(record.compareAtPrice)
        : undefined,
    stock: Number(record.stock ?? 0),
    category: normalizeCategorySlug(record.category),
    images: imgs,
    featured: Boolean(record.featured ?? true),
    isLive: record.isLive !== undefined ? Boolean(record.isLive) : true,
    isComingSoon: Boolean(record.isComingSoon ?? false),
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
    isComingSoon: false,
    rating: 5.0,
    reviewsCount: 0,
    sku: p.sku || `RYC-${p.id.slice(-6).toUpperCase()}`,
    createdAt: new Date().toISOString(),
  }));
}

export const catalogService = {
  /**
   * One-time seeding sentinel keyed on Category count so deleted/hidden products NEVER respawn.
   * Uses createMany({ skipDuplicates: true }) on missing Product slugs FIRST and writes Category
   * sentinel rows LAST so live Admin items & stock (e.g. Dirham Gold) remain untouched and
   * interrupted boots never leave an incomplete baseline seed.
   */
  async ensureSeeded(): Promise<void> {
    if (seedPromise) return seedPromise;

    seedPromise = (async () => {
      const categoryCount = await prisma.category.count();
      if (categoryCount > 0) {
        return;
      }

      if (Array.isArray(mockProducts) && mockProducts.length > 0) {
        const existingRows = await prisma.product.findMany({
          select: { slug: true },
        });
        const existingSlugs = new Set(existingRows.map((r) => r.slug));

        const missingRows = mockProducts
          .map((item) => {
            const slug =
              item.slug ||
              item.name
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/(^-|-$)/g, '');

            if (existingSlugs.has(slug)) {
              return null;
            }

            const validImgs =
              Array.isArray(item.images) && item.images.length > 0
                ? item.images
                : ['/images/media_1791069473262.jpg'];

            const richDef = PRODUCTS.find((p) => p.slug === slug || p.id === item.id);

            return {
              id: item.id || `prod_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
              name: item.name,
              title: item.name,
              slug,
              subtitle: richDef?.subtitle || null,
              summary: richDef?.summary || null,
              description: item.description || '',
              ingredients: richDef?.ingredients || null,
              howToUse: richDef?.howToUse || null,
              sourcingEthics: richDef?.sourcingEthics || null,
              ...(richDef?.attributes ? { attributes: richDef.attributes as any } : {}),
              price: Number(item.price),
              compareAtPrice: item.compareAtPrice ? Number(item.compareAtPrice) : null,
              stock: Number(item.stock ?? 15),
              category: normalizeCategorySlug(item.category),
              images: validImgs,
              featured: Boolean(item.featured ?? true),
              isLive: true,
              isComingSoon: false,
              status: 'ACTIVE' as const,
              sku: item.sku || `RYC-${Math.random().toString(36).substring(2, 7).toUpperCase()}`,
            };
          })
          .filter((row): row is NonNullable<typeof row> => row !== null);

        if (missingRows.length > 0) {
          await prisma.product.createMany({
            data: missingRows,
            skipDuplicates: true,
          });
        }
      }

      for (let idx = 0; idx < CANONICAL_CATEGORIES.length; idx++) {
        const c = CANONICAL_CATEGORIES[idx];
        const metaCat = CATEGORIES.find((mc) => normalizeCategorySlug(mc.slug) === c.slug);
        await prisma.category.upsert({
          where: { slug: c.slug },
          update: {},
          create: {
            name: metaCat?.name || c.label,
            slug: c.slug,
            description: metaCat?.description || '',
            image: metaCat?.image || null,
            displayOrder: idx,
            isActive: true,
          },
        });
      }
    })().catch((err) => {
      seedPromise = null;
      console.warn('Catalog seeding check note:', err);
    });

    return seedPromise;
  },

  async getAllProducts(options?: {
    category?: string;
    includeDrafts?: boolean;
    searchQuery?: string;
  }): Promise<Product[]> {
    let mapped: Product[] = [];

    try {
      await this.ensureSeeded();

      const whereClause: any = {
        status: { not: 'ARCHIVED' },
      };
      if (!options?.includeDrafts) {
        whereClause.isLive = true;
      }

      const dbRecords = await prisma.product.findMany({
        where: whereClause,
        orderBy: { createdAt: 'desc' },
      });

      mapped = dbRecords.map(mapDbRecordToProduct);
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

  async getProductBySlug(
    slug: string,
    options?: { includeDrafts?: boolean }
  ): Promise<Product | null> {
    try {
      await this.ensureSeeded();
      const whereClause: any = {
        OR: [{ slug }, { id: slug }],
        status: { not: 'ARCHIVED' },
      };
      if (!options?.includeDrafts) {
        whereClause.isLive = true;
      }

      const record = await prisma.product.findFirst({
        where: whereClause,
      });
      return record ? mapDbRecordToProduct(record) : null;
    } catch (err) {
      console.warn('Database findFirst fallback to mock products:', err);
      const fallback = getFallbackMockProducts().find((p) => p.slug === slug || p.id === slug);
      return fallback || null;
    }
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
    isComingSoon?: boolean;
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
        : ['/images/perfumes/princess-reef.jpg'];

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
      isComingSoon: Boolean(input.isComingSoon ?? false),
      status: 'ACTIVE' as const,
      sku: input.sku?.trim() || `RYC-${Math.random().toString(36).substring(2, 7).toUpperCase()}`,
    };

    const created = await prisma.product.create({
      data: newProdData,
    });
    return mapDbRecordToProduct(created);
  },

  async updateProduct(
    id: string,
    updates: Partial<{
      name: string;
      price: number;
      compareAtPrice: number | null;
      stock: number;
      category: string;
      description: string;
      images: string[];
      sku: string;
      isLive: boolean;
      isComingSoon: boolean;
      featured: boolean;
    }>
  ): Promise<Product> {
    const dataToUpdate: any = {};
    if (updates.name !== undefined) {
      dataToUpdate.name = updates.name.trim();
      dataToUpdate.title = updates.name.trim();
    }
    if (updates.price !== undefined) dataToUpdate.price = Number(updates.price);
    if (updates.compareAtPrice !== undefined) {
      dataToUpdate.compareAtPrice = updates.compareAtPrice !== null ? Number(updates.compareAtPrice) : null;
    }
    if (updates.stock !== undefined) dataToUpdate.stock = Math.max(0, Math.floor(Number(updates.stock)));
    if (updates.category !== undefined) dataToUpdate.category = normalizeCategorySlug(updates.category);
    if (updates.description !== undefined) dataToUpdate.description = updates.description.trim();
    if (updates.images !== undefined && Array.isArray(updates.images)) {
      dataToUpdate.images = updates.images.filter(Boolean);
    }
    if (updates.sku !== undefined) dataToUpdate.sku = updates.sku.trim();
    if (updates.isLive !== undefined) dataToUpdate.isLive = Boolean(updates.isLive);
    if (updates.isComingSoon !== undefined) dataToUpdate.isComingSoon = Boolean(updates.isComingSoon);
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
    } catch (err: any) {
      // Preserve order history integrity when referenced by OrderItem (onDelete: Restrict)
      if (err?.code === 'P2003') {
        await prisma.product.update({
          where: { id },
          data: { status: 'ARCHIVED', isLive: false },
        });
        return;
      }
      throw err;
    }
  },
};
