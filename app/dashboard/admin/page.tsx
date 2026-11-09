// app/dashboard/admin/page.tsx
'use client';

import React, { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { Product } from '@/lib/types/ecommerce';
import {
  CANONICAL_CATEGORIES,
  getCategoryLabel,
  normalizeCategorySlug,
} from '@/lib/utils/categoryUtils';
import {
  Truck,
  Package,
  Check,
  Mail,
  ExternalLink,
  RefreshCw,
  Trash2,
  Plus,
  Image as ImageIcon,
  Search,
  Eye,
  EyeOff,
  Pencil,
  Clock,
  X,
} from 'lucide-react';

/**
 * Compresses large phone/laptop images to <150KB so PostgreSQL & Serverless POST bodies never fail
 */
async function compressImageFile(file: File, maxWidth = 1000, quality = 0.82): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(event.target?.result as string);
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.onerror = reject;
      img.src = event.target?.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default function AdminDashboardPage() {
  const [activeTab, setActiveTab] = useState<'inventory' | 'orders'>('inventory');
  const [products, setProducts] = useState<Product[]>([]);
  const [categoryCounts, setCategoryCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [dbError, setDbError] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [productSearch, setProductSearch] = useState('');

  // Editing state
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [compareAtPrice, setCompareAtPrice] = useState('');
  const [stock, setStock] = useState('15');
  const [category, setCategory] = useState<string>('perfume');
  const [sku, setSku] = useState('');
  const [description, setDescription] = useState('');
  const [featured, setFeatured] = useState(true);
  const [isLive, setIsLive] = useState(true);
  const [isComingSoon, setIsComingSoon] = useState(false);
  const [images, setImages] = useState<string[]>([]);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [urlInput, setUrlInput] = useState('');

  // Orders state
  const [orders, setOrders] = useState<any[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [dispatchSuccessMsg, setDispatchSuccessMsg] = useState('');

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const fetchSharedDatabaseCatalog = async () => {
    setLoading(true);
    setDbError(null);
    try {
      const res = await fetch(`/api/products?includeDrafts=true&_t=${Date.now()}`, {
        cache: 'no-store',
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to load products from shared database');
      }
      const prodList = data.products || [];
      setProducts(prodList);
      setCategoryCounts(data.categoryCounts || {});

      // Keep client localStorage in sync as a quick local cache
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem('rycarix_catalog_products', JSON.stringify(prodList));
        } catch (e) {}
      }
    } catch (err: any) {
      setDbError(err.message || 'Database connection failed');
    } finally {
      setLoading(false);
    }
  };

  const fetchOrders = async () => {
    setOrdersLoading(true);
    try {
      let localOrders: any[] = [];
      if (typeof window !== 'undefined') {
        const saved = localStorage.getItem('rycarix_orders');
        if (saved) {
          try {
            localOrders = JSON.parse(saved);
          } catch (e) {}
        }
      }

      const res = await fetch('/api/orders');
      if (res.ok) {
        const data = await res.json();
        if (data.orders && Array.isArray(data.orders)) {
          const combined = [...data.orders];
          localOrders.forEach((lo) => {
            if (!combined.some((co) => co.id === lo.id)) {
              combined.push(lo);
            }
          });
          setOrders(combined);
          return;
        }
      }
      setOrders(localOrders);
    } catch (err) {
      console.warn('Failed to fetch orders:', err);
    } finally {
      setOrdersLoading(false);
    }
  };

  useEffect(() => {
    fetchSharedDatabaseCatalog();
    fetchOrders();
  }, []);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploadingImage(true);
    setStatusMessage(null);

    try {
      const compressedList = await Promise.all(
        Array.from(files).map((file) => compressImageFile(file))
      );
      setImages((prev) => [...prev, ...compressedList]);
    } catch {
      setStatusMessage({ type: 'error', text: 'Could not process image file. Please try another photo.' });
    } finally {
      setUploadingImage(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleAddUrlImage = () => {
    if (!urlInput.trim()) return;
    setImages((prev) => [...prev, urlInput.trim()]);
    setUrlInput('');
  };

  const handleStartEdit = (prod: any) => {
    setEditingProduct(prod);
    setName(prod.name || prod.title || '');
    setPrice(prod.price !== undefined ? String(prod.price) : '');
    setCompareAtPrice(prod.compareAtPrice ? String(prod.compareAtPrice) : '');
    setStock(prod.stock !== undefined ? String(prod.stock) : '15');
    setCategory(normalizeCategorySlug(prod.category));
    setSku(prod.sku || '');
    setDescription(prod.description || '');
    setFeatured(Boolean(prod.featured ?? true));
    setIsLive(prod.isLive !== false);
    setIsComingSoon(Boolean(prod.isComingSoon));
    setImages(Array.isArray(prod.images) ? prod.images : []);
    setStatusMessage(null);
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 320, behavior: 'smooth' });
    }
  };

  const handleCancelEdit = () => {
    setEditingProduct(null);
    setName('');
    setPrice('');
    setCompareAtPrice('');
    setStock('15');
    setCategory('perfume');
    setSku('');
    setDescription('');
    setFeatured(true);
    setIsLive(true);
    setIsComingSoon(false);
    setImages([]);
    setStatusMessage(null);
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMessage(null);

    if (!name.trim() || !price || Number(price) <= 0) {
      setStatusMessage({ type: 'error', text: 'Please enter a valid product title and price.' });
      return;
    }

    const validImages =
      images.length > 0
        ? images
        : ['https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?q=80&w=1200&auto=format&fit=crop'];

    setSubmitting(true);
    try {
      const payload: any = {
        name: name.trim(),
        price: parseFloat(price),
        compareAtPrice: compareAtPrice ? parseFloat(compareAtPrice) : null,
        stock: parseInt(stock, 10) || 0,
        category: normalizeCategorySlug(category),
        sku: sku.trim() || undefined,
        description: description.trim(),
        images: validImages,
        featured,
        isLive,
        isComingSoon,
      };

      let res: Response;
      if (editingProduct) {
        payload.id = editingProduct.id;
        res = await fetch('/api/products', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      } else {
        res = await fetch('/api/products', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      }

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Database rejected product save.');
      }

      await fetchSharedDatabaseCatalog();

      handleCancelEdit();

      setStatusMessage({
        type: 'success',
        text: editingProduct
          ? `Product "${data.product?.name || name}" updated successfully in the shared catalog.`
          : `"${data.product?.name || name}" is now saved to the shared PostgreSQL database and is live across all devices.`,
      });
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message });
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleLive = async (product: Product & { isLive?: boolean }) => {
    const nextLiveState = !(product.isLive ?? true);
    try {
      const res = await fetch('/api/products', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: product.id, isLive: nextLiveState }),
      });
      if (res.ok) {
        await fetchSharedDatabaseCatalog();
      }
    } catch (err) {
      console.error('Failed to toggle product live status:', err);
    }
  };

  const handleToggleComingSoon = async (product: Product & { isComingSoon?: boolean }) => {
    const nextState = !Boolean(product.isComingSoon);
    try {
      const res = await fetch('/api/products', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: product.id, isComingSoon: nextState }),
      });
      if (res.ok) {
        await fetchSharedDatabaseCatalog();
      }
    } catch (err) {
      console.error('Failed to toggle coming soon status:', err);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!confirm('Are you sure you want to permanently delete this product from the database?')) return;
    try {
      const res = await fetch(`/api/products?id=${encodeURIComponent(id)}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        await fetchSharedDatabaseCatalog();
        setStatusMessage({ type: 'success', text: 'Product deleted from shared database.' });
        setTimeout(() => setStatusMessage(null), 3000);
      }
    } catch (err) {
      console.error('Failed to delete product:', err);
    }
  };

  const handleConfirmDispatch = async (ord: any) => {
    const trackingNumber = ord.trackingNumber || `GB${Date.now().toString().slice(-8)}RY`;
    const trackingUrl = `https://www.royalmail.com/track-your-item#/tracking-results/${trackingNumber}`;

    // Send automated dispatch notification email
    try {
      await fetch('/api/email/dispatch-notification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderNumber: ord.id,
          recipientEmail: ord.email || ord.customerEmail || 'client@rycarix.com',
          customerName: ord.customer || ord.customerName || 'Valued Client',
          carrier: ord.carrier || 'Royal Mail Tracked 48',
          trackingNumber,
          trackingUrl,
          estimatedDeliveryDays: '2–3 working days',
          shippingAddress: ord.address
            ? `${ord.address.street || ''}, ${ord.address.city || ''} ${ord.address.postalCode || ''}`
            : 'United Kingdom',
        }),
      });
    } catch (e) {
      console.warn('Dispatch email notice could not be sent:', e);
    }

    const updatedOrders = orders.map((o) => {
      if (o.id === ord.id) {
        return {
          ...o,
          fulfillment: 'Dispatched',
          status: 'SHIPPED',
          trackingNumber,
        };
      }
      return o;
    });

    setOrders(updatedOrders);
    if (typeof window !== 'undefined') {
      localStorage.setItem('rycarix_orders', JSON.stringify(updatedOrders));
    }

    setDispatchSuccessMsg(`Order ${ord.id} marked as Dispatched! Tracking: ${trackingNumber}`);
    setTimeout(() => setDispatchSuccessMsg(''), 5000);
  };

  const totalUnits = products.reduce((acc, p) => acc + Number(p.stock ?? 0), 0);
  const totalValue = products.reduce((acc, p) => acc + Number(p.price || 0) * Number(p.stock ?? 0), 0);

  const displayedProducts = products.filter((product) => {
    if (!productSearch.trim()) return true;
    const q = productSearch.toLowerCase().trim();
    return (
      (product.name || '').toLowerCase().includes(q) ||
      (product.category || '').toLowerCase().includes(q) ||
      (product.sku || '').toLowerCase().includes(q)
    );
  });

  return (
    <div className="min-h-screen bg-neutral-50 py-10 px-4 sm:px-8 max-w-7xl mx-auto font-sans">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <span className="text-[10px] uppercase tracking-[0.25em] text-neutral-500 font-semibold block mb-1">
            Store Management
          </span>
          <h1 className="text-3xl font-serif font-bold text-neutral-900">Rycarix Shared Admin Console</h1>
          <p className="text-sm text-neutral-600 mt-1">
            All additions and stock updates sync directly to PostgreSQL across every admin laptop and mobile device.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={fetchSharedDatabaseCatalog}
            className="px-4 py-2.5 border border-neutral-300 bg-white text-neutral-800 text-xs font-semibold uppercase tracking-wider rounded-md hover:bg-neutral-100 transition cursor-pointer flex items-center gap-1.5"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Sync DB</span>
          </button>
          <Link
            href="/products"
            className="px-5 py-2.5 bg-neutral-900 text-white text-xs font-semibold uppercase tracking-wider rounded-md hover:bg-neutral-800 transition"
          >
            View Live Storefront
          </Link>
        </div>
      </div>

      {dbError && products.length === 0 && (
        <div className="mb-6 p-4 rounded-lg bg-red-50 border border-red-300 text-red-900 text-sm">
          <strong>Database Connection Alert:</strong> {dbError}. Verify <code>DATABASE_URL</code> is configured in your production environment variables.
        </div>
      )}

      {/* Primary Navigation Tabs */}
      <div className="flex border-b border-neutral-200 mb-8 gap-8">
        <button
          onClick={() => setActiveTab('inventory')}
          className={`pb-4 text-sm font-semibold uppercase tracking-wider border-b-2 transition-colors cursor-pointer ${
            activeTab === 'inventory'
              ? 'border-neutral-900 text-neutral-900'
              : 'border-transparent text-neutral-400 hover:text-neutral-700'
          }`}
        >
          Catalog & Inventory ({products.length})
        </button>
        <button
          onClick={() => setActiveTab('orders')}
          className={`pb-4 text-sm font-semibold uppercase tracking-wider border-b-2 transition-colors cursor-pointer flex items-center gap-2 ${
            activeTab === 'orders'
              ? 'border-neutral-900 text-neutral-900'
              : 'border-transparent text-neutral-400 hover:text-neutral-700'
          }`}
        >
          <span>Orders & Dispatch</span>
          {orders.filter((o) => o.status !== 'SHIPPED' && o.status !== 'DELIVERED').length > 0 && (
            <span className="px-2 py-0.5 text-xs bg-amber-500 text-white rounded-full">
              {orders.filter((o) => o.status !== 'SHIPPED' && o.status !== 'DELIVERED').length}
            </span>
          )}
        </button>
      </div>

      {/* Summary Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        <div className="bg-white p-4 rounded-lg border border-neutral-200 shadow-xs">
          <p className="text-[11px] uppercase tracking-wider text-neutral-500 font-semibold">Total Products</p>
          <p className="text-2xl font-bold text-neutral-900 mt-1">{products.length}</p>
        </div>
        <div className="bg-white p-4 rounded-lg border border-neutral-200 shadow-xs">
          <p className="text-[11px] uppercase tracking-wider text-neutral-500 font-semibold">Total Stock Units</p>
          <p className="text-2xl font-bold text-neutral-900 mt-1">{totalUnits}</p>
        </div>
        <div className="bg-white p-4 rounded-lg border border-neutral-200 shadow-xs">
          <p className="text-[11px] uppercase tracking-wider text-neutral-500 font-semibold">Inventory Value</p>
          <p className="text-2xl font-bold text-emerald-700 mt-1">£{totalValue.toFixed(2)}</p>
        </div>
        {CANONICAL_CATEGORIES.slice(0, 3).map((cat) => (
          <div key={cat.slug} className="bg-white p-4 rounded-lg border border-neutral-200 shadow-xs">
            <p className="text-[11px] uppercase tracking-wider text-neutral-500 font-semibold truncate">{cat.label}</p>
            <p className="text-2xl font-bold text-neutral-900 mt-1">{categoryCounts[cat.slug] || 0}</p>
          </div>
        ))}
      </div>

      {activeTab === 'inventory' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Product Upload Form */}
          <div className="lg:col-span-5 bg-white p-6 rounded-xl border border-neutral-200 shadow-xs h-fit">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-neutral-900">
                {editingProduct ? 'Edit Product' : 'Publish Product to Shared Catalog'}
              </h2>
              {editingProduct && (
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="text-xs text-neutral-500 hover:text-neutral-800 flex items-center gap-1 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                  <span>Cancel Edit</span>
                </button>
              )}
            </div>

            {statusMessage && (
              <div
                className={`p-3.5 mb-5 rounded-lg text-sm font-medium ${
                  statusMessage.type === 'success'
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                    : 'bg-red-50 text-red-800 border border-red-200'
                }`}
              >
                {statusMessage.text}
              </div>
            )}

            <form onSubmit={handleSaveProduct} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase text-neutral-700 mb-1">
                  Product Title *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g., Velvet Oud Extrait de Parfum 100ml"
                  className="w-full px-3.5 py-2.5 border border-neutral-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold uppercase text-neutral-700 mb-1">
                    Price (£ GBP) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    required
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="95.00"
                    className="w-full px-3.5 py-2.5 border border-neutral-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase text-neutral-700 mb-1">
                    Quantity in Stock *
                  </label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={stock}
                    onChange={(e) => setStock(e.target.value)}
                    placeholder="15"
                    className="w-full px-3.5 py-2.5 border border-neutral-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold uppercase text-neutral-700 mb-1">
                    Target Category *
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-neutral-300 rounded-md text-sm bg-white focus:outline-none focus:ring-2 focus:ring-neutral-900"
                  >
                    {CANONICAL_CATEGORIES.map((c) => (
                      <option key={c.slug} value={c.slug}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase text-neutral-700 mb-1">
                    Compare At Price (£)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={compareAtPrice}
                    onChange={(e) => setCompareAtPrice(e.target.value)}
                    placeholder="125.00"
                    className="w-full px-3.5 py-2.5 border border-neutral-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-neutral-700 mb-1">
                  SKU (Stock Keeping Unit)
                </label>
                <input
                  type="text"
                  value={sku}
                  onChange={(e) => setSku(e.target.value)}
                  placeholder="e.g. RYC-PARF-001 (auto-generated if blank)"
                  className="w-full px-3.5 py-2.5 border border-neutral-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-neutral-700 mb-1">
                  Description *
                </label>
                <textarea
                  rows={3}
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Full product narrative, fragrance notes, or key ingredients..."
                  className="w-full px-3.5 py-2.5 border border-neutral-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-neutral-700 mb-1">
                  Upload Product Photos *
                </label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleFileChange}
                  className="block w-full text-sm text-neutral-600 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-neutral-900 file:text-white hover:file:bg-neutral-800 cursor-pointer"
                />
                {uploadingImage && (
                  <p className="text-xs text-amber-600 mt-1.5 animate-pulse">
                    Compressing photo for fast mobile/serverless sync...
                  </p>
                )}

                <div className="flex gap-2 mt-3">
                  <input
                    type="url"
                    value={urlInput}
                    onChange={(e) => setUrlInput(e.target.value)}
                    placeholder="Or paste an image URL (https://...)"
                    className="flex-1 px-3 py-2 border border-neutral-300 rounded-md text-xs"
                  />
                  <button
                    type="button"
                    onClick={handleAddUrlImage}
                    className="px-3 py-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded-md text-xs font-medium"
                  >
                    Add URL
                  </button>
                </div>

                {images.length > 0 && (
                  <div className="grid grid-cols-4 gap-2 mt-3">
                    {images.map((src, i) => (
                      <div key={i} className="relative aspect-square rounded-md overflow-hidden border border-neutral-200">
                        <img src={src} alt={`Preview ${i + 1}`} className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => setImages((prev) => prev.filter((_, idx) => idx !== i))}
                          className="absolute top-1 right-1 bg-black/75 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center cursor-pointer"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-2.5 pt-2 border-t border-neutral-100">
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 text-sm text-neutral-800 font-medium cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isLive}
                      onChange={(e) => setIsLive(e.target.checked)}
                      className="h-4 w-4 rounded border-neutral-300 text-neutral-900"
                    />
                    Make Live for Customers
                  </label>

                  <label className="flex items-center gap-2 text-sm text-neutral-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={featured}
                      onChange={(e) => setFeatured(e.target.checked)}
                      className="h-4 w-4 rounded border-neutral-300 text-neutral-900"
                    />
                    Featured
                  </label>
                </div>

                <div className="p-3 bg-amber-50/80 border border-amber-200 rounded-lg">
                  <label className="flex items-center gap-2 text-xs text-amber-950 font-semibold cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isComingSoon}
                      onChange={(e) => setIsComingSoon(e.target.checked)}
                      className="h-4 w-4 rounded border-amber-300 text-amber-600 focus:ring-amber-500"
                    />
                    <Clock className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                    <span>Mark as "Coming Soon" Edition</span>
                  </label>
                  <p className="text-[11px] text-amber-800 mt-1 pl-5">
                    Displays luxury "Coming Soon" badge across catalog cards & disables direct cart checkout with an early access preview.
                  </p>
                </div>
              </div>

              <div className="flex gap-2 pt-1">
                {editingProduct && (
                  <button
                    type="button"
                    onClick={handleCancelEdit}
                    className="py-3 px-4 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 font-semibold text-sm rounded-md transition cursor-pointer"
                  >
                    Cancel
                  </button>
                )}
                <button
                  type="submit"
                  disabled={submitting || uploadingImage}
                  className="flex-1 py-3 px-4 bg-neutral-900 text-white font-semibold text-sm rounded-md hover:bg-neutral-800 transition disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    'Saving to PostgreSQL Database...'
                  ) : editingProduct ? (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Update Product</span>
                    </>
                  ) : (
                    'Publish Product Live'
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Shared PostgreSQL Database Inventory Table */}
          <div className="lg:col-span-7 bg-white p-6 rounded-xl border border-neutral-200 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <h2 className="text-lg font-semibold text-neutral-900">
                Shared Database Catalog ({products.length})
              </h2>

              <div className="relative w-full sm:w-64">
                <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Search by title, SKU..."
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 border border-neutral-300 rounded-md text-xs focus:outline-none focus:ring-1 focus:ring-neutral-900"
                />
              </div>
            </div>

            {loading ? (
              <div className="py-12 text-center text-sm text-neutral-500">Syncing with PostgreSQL database...</div>
            ) : displayedProducts.length === 0 ? (
              <div className="py-12 text-center text-sm text-neutral-500">
                {productSearch ? `No products matching "${productSearch}"` : 'No products in database yet.'}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-neutral-200 text-xs uppercase text-neutral-500">
                      <th className="py-3 px-2">Product</th>
                      <th className="py-3 px-2">Category</th>
                      <th className="py-3 px-2">Price</th>
                      <th className="py-3 px-2">Stock</th>
                      <th className="py-3 px-2">Status</th>
                      <th className="py-3 px-2 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100 text-sm">
                    {displayedProducts.map((product: any) => (
                      <tr key={product.id} className="hover:bg-neutral-50">
                        <td className="py-3 px-2 flex items-center gap-3">
                          <img
                            src={product.images?.[0] || '/images/media_1791069473262.jpg'}
                            alt={product.name}
                            className="w-11 h-11 rounded object-cover border border-neutral-200 shrink-0"
                          />
                          <div>
                            <Link
                              href={`/products/${product.slug}`}
                              className="font-medium text-neutral-900 hover:underline line-clamp-1"
                            >
                              {product.name}
                            </Link>
                            <p className="text-xs text-neutral-400">{product.sku}</p>
                          </div>
                        </td>
                        <td className="py-3 px-2">
                          <Link
                            href={`/category/${normalizeCategorySlug(product.category)}`}
                            className="inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium bg-neutral-100 text-neutral-800 hover:bg-neutral-200"
                          >
                            {getCategoryLabel(product.category)}
                          </Link>
                        </td>
                        <td className="py-3 px-2 font-semibold">£{Number(product.price).toFixed(2)}</td>
                        <td className="py-3 px-2">{Number(product.stock ?? 0)}</td>
                        <td className="py-3 px-2">
                          <div className="flex flex-col gap-1.5 items-start">
                            <button
                              type="button"
                              onClick={() => handleToggleLive(product)}
                              className={`px-2 py-0.5 rounded-full text-[11px] font-semibold tracking-wider cursor-pointer ${
                                product.isLive !== false
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : 'bg-neutral-200 text-neutral-600'
                              }`}
                              title="Click to toggle Live/Hidden on storefront"
                            >
                              {product.isLive !== false ? 'LIVE' : 'HIDDEN'}
                            </button>
                            <button
                              type="button"
                              onClick={() => handleToggleComingSoon(product)}
                              className={`px-2 py-0.5 rounded-full text-[10px] font-medium tracking-wide cursor-pointer transition ${
                                product.isComingSoon
                                  ? 'bg-amber-100 text-amber-900 border border-amber-300 font-semibold'
                                  : 'bg-neutral-100 text-neutral-500 hover:bg-neutral-200'
                              }`}
                              title="Toggle Coming Soon status"
                            >
                              {product.isComingSoon ? '⏳ Coming Soon' : '+ Coming Soon'}
                            </button>
                          </div>
                        </td>
                        <td className="py-3 px-2 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleStartEdit(product)}
                              className="px-2.5 py-1 text-xs text-neutral-700 bg-neutral-100 hover:bg-neutral-200 hover:text-neutral-900 rounded font-medium cursor-pointer transition flex items-center gap-1"
                              title="Edit product details"
                            >
                              <Pencil className="w-3 h-3" />
                              <span>Edit</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteProduct(product.id)}
                              className="px-2.5 py-1 text-xs text-red-600 hover:bg-red-50 hover:text-red-700 rounded font-medium cursor-pointer transition"
                              title="Delete product"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Orders & Dispatch View */
        <div className="bg-white p-6 rounded-xl border border-neutral-200 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h2 className="text-lg font-semibold text-neutral-900">Incoming Orders & Order Dispatch</h2>
              <p className="text-xs text-neutral-500 mt-0.5">
                Dispatch orders, assign tracking numbers, and send automated email notifications to customers.
              </p>
            </div>
            <button
              onClick={fetchOrders}
              className="px-3 py-1.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 text-xs font-medium rounded-md transition flex items-center gap-1.5 self-start cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Refresh Orders</span>
            </button>
          </div>

          {dispatchSuccessMsg && (
            <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-md text-xs font-medium">
              {dispatchSuccessMsg}
            </div>
          )}

          {ordersLoading ? (
            <div className="py-12 text-center text-sm text-neutral-500">Loading orders...</div>
          ) : orders.length === 0 ? (
            <div className="py-12 text-center text-sm text-neutral-500">No orders received yet.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="border-b border-neutral-200 text-xs uppercase text-neutral-500">
                    <th className="py-3 px-3">Order Ref</th>
                    <th className="py-3 px-3">Client</th>
                    <th className="py-3 px-3">Items</th>
                    <th className="py-3 px-3">Amount</th>
                    <th className="py-3 px-3">Status</th>
                    <th className="py-3 px-3 text-right">Dispatch Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {orders.map((ord: any) => {
                    const isDispatched = ord.fulfillment === 'Dispatched' || ord.status === 'SHIPPED';
                    return (
                      <tr key={ord.id} className="hover:bg-neutral-50">
                        <td className="py-3 px-3 font-mono text-xs font-medium text-neutral-900">
                          {ord.id}
                        </td>
                        <td className="py-3 px-3">
                          <p className="font-medium text-neutral-900">{ord.customer || ord.customerName || 'Valued Client'}</p>
                          <p className="text-xs text-neutral-400">{ord.email || ord.customerEmail}</p>
                        </td>
                        <td className="py-3 px-3 text-xs text-neutral-600">
                          {Array.isArray(ord.items)
                            ? ord.items.map((it: any) => `${it.title || it.name} (${it.quantity || 1})`).join(', ')
                            : `${ord.itemsCount || 1} item(s)`}
                        </td>
                        <td className="py-3 px-3 font-semibold text-neutral-900">
                          £{Number(ord.total || ord.amount || 0).toFixed(2)}
                        </td>
                        <td className="py-3 px-3">
                          <span
                            className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              isDispatched
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {isDispatched ? 'Dispatched' : 'Awaiting Dispatch'}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-right">
                          {isDispatched ? (
                            <div className="flex items-center justify-end gap-2">
                              <span className="text-xs text-neutral-500 font-mono">
                                {ord.trackingNumber || 'Dispatched'}
                              </span>
                              {ord.trackingNumber && (
                                <a
                                  href={`https://www.royalmail.com/track-your-item#/tracking-results/${ord.trackingNumber}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-xs text-neutral-700 hover:text-neutral-900 underline flex items-center gap-1"
                                >
                                  <span>Track</span>
                                  <ExternalLink className="w-3 h-3" />
                                </a>
                              )}
                            </div>
                          ) : (
                            <button
                              onClick={() => handleConfirmDispatch(ord)}
                              className="px-3 py-1.5 bg-neutral-900 text-white rounded text-xs font-medium hover:bg-neutral-800 transition cursor-pointer"
                            >
                              Confirm Dispatch
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
