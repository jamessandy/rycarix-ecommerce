import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { PRODUCTS } from '@/lib/data/mockData';
import { ProductItem } from '@/lib/types/ecommerce';

const CATALOG_CACHE_FILE = path.join('/tmp', 'rycarix_catalog_products.json');

function loadServerCatalog(): ProductItem[] {
  try {
    if (fs.existsSync(CATALOG_CACHE_FILE)) {
      const data = JSON.parse(fs.readFileSync(CATALOG_CACHE_FILE, 'utf8'));
      if (Array.isArray(data) && data.length > 0) {
        return data;
      }
    }
  } catch (e) {
    console.warn('Could not read server catalog cache', e);
  }
  return PRODUCTS;
}

function saveServerCatalog(products: ProductItem[]) {
  try {
    fs.writeFileSync(CATALOG_CACHE_FILE, JSON.stringify(products, null, 2), 'utf8');
  } catch (e) {
    console.warn('Could not write server catalog cache', e);
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const slug = searchParams.get('slug');
    const category = searchParams.get('category');

    let list = loadServerCatalog();

    if (slug) {
      const item = list.find((p) => p.slug === slug || p.id === slug);
      if (item) {
        return NextResponse.json({ product: item });
      }
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    if (category && category !== 'ALL') {
      const catNorm = category.toLowerCase();
      list = list.filter((p) => (p.category || '').toLowerCase().includes(catNorm));
    }

    return NextResponse.json({
      products: list,
      count: list.length,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { products, product } = body;

    let currentList = loadServerCatalog();

    if (Array.isArray(products)) {
      currentList = products;
      saveServerCatalog(currentList);
      return NextResponse.json({
        success: true,
        message: `Catalog updated with ${currentList.length} items`,
        count: currentList.length,
      });
    }

    if (product && product.id) {
      const index = currentList.findIndex((p) => p.id === product.id);
      if (index >= 0) {
        currentList[index] = product;
      } else {
        currentList = [product, ...currentList];
      }
      saveServerCatalog(currentList);
      return NextResponse.json({
        success: true,
        message: `Product "${product.title}" saved`,
        product,
      });
    }

    return NextResponse.json({ error: 'Invalid payload: provide products array or product object' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Catalog update failed' }, { status: 500 });
  }
}

