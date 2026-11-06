// app/api/products/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { catalogService } from '@/lib/services/catalogService';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category') || undefined;
    const slug = searchParams.get('slug') || undefined;

    if (slug) {
      const product = await catalogService.getProductBySlug(slug);
      if (!product) {
        return NextResponse.json({ error: 'Product not found' }, { status: 404 });
      }
      return NextResponse.json({ product }, { status: 200 });
    }

    const products = await catalogService.getAllProducts(category);

    // Compute accurate real-time category counts and total inventory value
    const categoryCounts = products.reduce((acc: Record<string, number>, item) => {
      const cat = (item.category || 'uncategorized').toLowerCase();
      acc[cat] = (acc[cat] || 0) + 1;
      return acc;
    }, {});

    return NextResponse.json(
      {
        products,
        totalCount: products.length,
        categoryCounts,
      },
      {
        status: 200,
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        },
      }
    );
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Failed to fetch catalog' },
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
        { error: 'Product name and valid price are required.' },
        { status: 400 }
      );
    }

    const price = parseFloat(String(rawPrice));
    const stock = parseInt(String(body.stock ?? body.quantity ?? 10), 10);

    if (isNaN(price) || price < 0) {
      return NextResponse.json({ error: 'Invalid product price.' }, { status: 400 });
    }

    const created = await catalogService.createProduct({
      name: String(name),
      description: body.description || body.summary || '',
      price,
      compareAtPrice: body.compareAtPrice ? parseFloat(String(body.compareAtPrice)) : undefined,
      stock: isNaN(stock) ? 10 : stock,
      category: (body.category || 'perfume').toLowerCase(),
      images: Array.isArray(body.images) && body.images.length > 0
        ? body.images.map((img: any) => (typeof img === 'string' ? img : img.url)).filter(Boolean)
        : body.image
        ? [body.image]
        : body.imageUrl
        ? [body.imageUrl]
        : [],
      featured: Boolean(body.featured ?? true),
      sku: body.sku,
    });

    return NextResponse.json({ product: created, success: true }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Failed to create product' },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ error: 'Product ID required' }, { status: 400 });
    }
    await catalogService.deleteProduct(id);
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Failed to delete product' },
      { status: 500 }
    );
  }
}
