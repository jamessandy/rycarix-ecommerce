// app/api/products/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { catalogService } from '@/lib/services/catalogService';
import { normalizeCategorySlug } from '@/lib/utils/categoryUtils';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';
export const revalidate = 0;

function invalidateStorefrontCaches(categorySlug?: string) {
  try {
    revalidatePath('/', 'layout');
    revalidatePath('/products', 'page');
    revalidatePath('/dashboard/admin', 'page');
    if (categorySlug) {
      revalidatePath(`/category/${normalizeCategorySlug(categorySlug)}`, 'page');
    }
    revalidatePath('/category/[slug]', 'page');
  } catch (err) {
    console.warn('Cache invalidation note:', err);
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category') || undefined;
    const slug = searchParams.get('slug') || undefined;
    const search = searchParams.get('q') || searchParams.get('search') || undefined;
    const includeDrafts = searchParams.get('includeDrafts') === 'true';

    if (slug) {
      const product = await catalogService.getProductBySlug(slug);
      if (!product) {
        return NextResponse.json({ error: 'Product not found' }, { status: 404 });
      }
      return NextResponse.json(
        { product },
        {
          status: 200,
          headers: { 'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0' },
        }
      );
    }

    const allLiveProducts = await catalogService.getAllProducts({
      includeDrafts,
      searchQuery: search,
    });

    const categoryCounts = allLiveProducts.reduce((acc: Record<string, number>, p) => {
      const cat = normalizeCategorySlug(p.category);
      acc[cat] = (acc[cat] || 0) + 1;
      return acc;
    }, {});

    const filteredProducts =
      category && category.toLowerCase() !== 'all'
        ? allLiveProducts.filter((p) => normalizeCategorySlug(p.category) === normalizeCategorySlug(category))
        : allLiveProducts;

    return NextResponse.json(
      {
        products: filteredProducts,
        totalCount: allLiveProducts.length,
        filteredCount: filteredProducts.length,
        categoryCounts,
      },
      {
        status: 200,
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
          Pragma: 'no-cache',
          Expires: '0',
        },
      }
    );
  } catch (error: any) {
    console.error('Database GET /api/products error:', error);
    return NextResponse.json(
      {
        error: 'Database connection error while loading catalog. Verify DATABASE_URL is configured.',
        details: error?.message,
      },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const name = body.name || body.title;
    const rawPrice = body.price !== undefined && body.price !== '' ? body.price : body.basePrice;

    if (!name || rawPrice === undefined || rawPrice === '') {
      return NextResponse.json(
        { error: 'Product title and valid price are required.' },
        { status: 400 }
      );
    }

    const price = parseFloat(String(rawPrice));
    const stock = parseInt(String(body.stock ?? body.quantity ?? 1), 10);

    if (isNaN(price) || price <= 0) {
      return NextResponse.json({ error: 'Price must be greater than £0.00' }, { status: 400 });
    }

    const normalizedCategory = normalizeCategorySlug(body.category || 'perfume');

    const created = await catalogService.createProduct({
      name: String(name).trim(),
      description: body.description || body.summary || '',
      price,
      compareAtPrice: body.compareAtPrice ? parseFloat(String(body.compareAtPrice)) : undefined,
      stock: isNaN(stock) ? 1 : stock,
      category: normalizedCategory,
      images:
        Array.isArray(body.images) && body.images.length > 0
          ? body.images
          : body.image
          ? [body.image]
          : body.imageUrl
          ? [body.imageUrl]
          : [],
      featured: Boolean(body.featured ?? true),
      isLive: body.isLive !== undefined ? Boolean(body.isLive) : true,
      sku: body.sku,
    });

    invalidateStorefrontCaches(normalizedCategory);

    return NextResponse.json({ product: created, success: true }, { status: 201 });
  } catch (error: any) {
    console.error('Database POST /api/products error:', error);
    return NextResponse.json(
      {
        error: `Failed to save product to PostgreSQL database: ${error?.message || 'Unknown DB error'}`,
      },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    if (!body.id) {
      return NextResponse.json({ error: 'Product ID is required' }, { status: 400 });
    }

    const updated = await catalogService.updateProduct(body.id, {
      name: body.name,
      price: body.price !== undefined ? parseFloat(String(body.price)) : undefined,
      stock: body.stock !== undefined ? parseInt(String(body.stock), 10) : undefined,
      category: body.category,
      isLive: body.isLive,
      featured: body.featured,
    });

    invalidateStorefrontCaches(updated.category);
    return NextResponse.json({ product: updated, success: true }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Failed to update product in database' },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ error: 'Product ID is required' }, { status: 400 });
    }

    await catalogService.deleteProduct(id);
    invalidateStorefrontCaches();

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Failed to delete product from database' },
      { status: 500 }
    );
  }
}
