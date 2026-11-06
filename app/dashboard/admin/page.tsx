// app/dashboard/admin/page.tsx
'use client';

import React, { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { Product } from '@/lib/types/ecommerce';
import { Truck, Package, Check, Mail, ExternalLink, RefreshCw, Trash2, Plus, Image as ImageIcon } from 'lucide-react';
import { lookupTracking } from '@/lib/services/shippingAggregator';

const CATEGORIES = [
  { label: 'Parfum & Fragrance', value: 'parfum' },
  { label: 'Hair & Elixirs', value: 'hair' },
  { label: 'Skincare', value: 'skincare' },
  { label: 'Body & Bath', value: 'body-bath' },
  { label: 'Home & Candles', value: 'home-living' },
  { label: 'Accessories', value: 'accessories' },
  { label: 'Cosmetics & Beauty', value: 'cosmetics' },
];

export default function AdminDashboardPage() {
  const [activeTab, setActiveTab] = useState<'inventory' | 'orders'>('inventory');
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [compareAtPrice, setCompareAtPrice] = useState('');
  const [stock, setStock] = useState('10');
  const [category, setCategory] = useState('parfum');
  const [sku, setSku] = useState('');
  const [description, setDescription] = useState('');
  const [featured, setFeatured] = useState(true);
  const [images, setImages] = useState<string[]>([]);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [urlInput, setUrlInput] = useState('');

  // Orders state
  const [orders, setOrders] = useState<any[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [dispatchSuccessMsg, setDispatchSuccessMsg] = useState('');

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const fetchCatalog = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/products', { cache: 'no-store' });
      const data = await res.json();
      if (data.products && Array.isArray(data.products)) {
        setProducts(data.products);
      }
    } catch (err) {
      console.error('Error loading admin catalog:', err);
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
    fetchCatalog();
    fetchOrders();
  }, []);

  // Convert uploaded file(s) to persistent Base64 Data URLs so Admin sees immediate preview and storefront renders them
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploadingImage(true);
    setStatusMessage(null);

    try {
      const readPromises = Array.from(files).map(
        (file) =>
          new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(file);
          })
      );

      const base64Images = await Promise.all(readPromises);
      setImages((prev) => [...prev, ...base64Images]);
    } catch {
      setStatusMessage({ type: 'error', text: 'Failed to process selected image file.' });
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

  const removeUploadedImage = (index: number) => {
    setImages((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMessage(null);

    if (!name.trim() || !price || Number(price) <= 0) {
      setStatusMessage({ type: 'error', text: 'Please enter a valid product name and price.' });
      return;
    }

    const validImages = images.length > 0 ? images : ['https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?q=80&w=1200&auto=format&fit=crop'];

    setSubmitting(true);
    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          price: parseFloat(price),
          compareAtPrice: compareAtPrice ? parseFloat(compareAtPrice) : undefined,
          stock: parseInt(stock, 10) || 10,
          category,
          sku: sku.trim() || undefined,
          description: description.trim(),
          images: validImages,
          featured,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to add product');
      }

      // Immediately prepend new product & re-sync catalog
      setProducts((prev) => [data.product, ...prev]);
      setName('');
      setPrice('');
      setCompareAtPrice('');
      setStock('10');
      setSku('');
      setDescription('');
      setCategory('parfum');
      setImages([]);
      setStatusMessage({
        type: 'success',
        text: `"${data.product.name}" is now live in the ${data.product.category} catalog (£${Number(data.product.price).toFixed(2)} • ${data.product.stock} in stock).`,
      });
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message || 'Could not publish product.' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!confirm('Are you sure you want to remove this product from the live catalog?')) return;
    try {
      const res = await fetch(`/api/products?id=${encodeURIComponent(id)}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setProducts((prev) => prev.filter((p) => p.id !== id));
        setStatusMessage({ type: 'success', text: 'Product removed from catalog.' });
        setTimeout(() => setStatusMessage(null), 3000);
      }
    } catch (err) {
      console.error('Failed to delete product:', err);
    }
  };

  const handleConfirmDispatch = async (ord: any) => {
    const trackingNumber = ord.trackingNumber || `GB${Date.now().toString().slice(-8)}RY`;
    const trackingUrl = `https://www.royalmail.com/track-your-item#/tracking-results/${trackingNumber}`;

    // Send dispatch notification email
    try {
      await fetch('/api/email/dispatch-notification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderNumber: ord.id,
          recipientEmail: ord.email || ord.customerEmail || 'client@rycarix.com',
          customerName: ord.customer || ord.customerName || 'Valued Client',
          carrier: ord.carrier || 'Royal Mail',
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

    // Update order status locally and in state
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

  // Live metrics calculated directly from the active products list
  const totalProducts = products.length;
  const totalUnitsInStock = products.reduce((sum, p) => sum + Number(p.stock ?? 0), 0);
  const totalInventoryValue = products.reduce(
    (sum, p) => sum + Number(p.price || 0) * Number(p.stock ?? 1),
    0
  );
  const perfumeCount = products.filter(
    (p) => p.category?.toLowerCase() === 'perfume' || p.category?.toLowerCase() === 'parfum'
  ).length;

  return (
    <div className="min-h-screen bg-neutral-50 py-10 px-4 sm:px-8 max-w-7xl mx-auto font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-serif font-bold text-neutral-900">Rycarix Admin Console</h1>
          <p className="text-sm text-neutral-600 mt-1">
            Manage live catalog inventory, pricing, stock levels, and storefront media.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex rounded-md border border-neutral-300 bg-white p-1">
            <button
              onClick={() => setActiveTab('inventory')}
              className={`px-3 py-1.5 text-xs font-semibold rounded ${
                activeTab === 'inventory' ? 'bg-neutral-900 text-white' : 'text-neutral-700 hover:text-neutral-900'
              }`}
            >
              Catalog ({totalProducts})
            </button>
            <button
              onClick={() => setActiveTab('orders')}
              className={`px-3 py-1.5 text-xs font-semibold rounded flex items-center gap-1.5 ${
                activeTab === 'orders' ? 'bg-neutral-900 text-white' : 'text-neutral-700 hover:text-neutral-900'
              }`}
            >
              <Package className="w-3 h-3" />
              Orders ({orders.length})
            </button>
          </div>
          <Link
            href="/products"
            className="inline-flex items-center justify-center px-4 py-2 bg-neutral-900 text-white text-xs font-medium rounded-md hover:bg-neutral-800 transition"
          >
            Live Storefront
          </Link>
        </div>
      </div>

      {/* Real-Time KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        <div className="bg-white p-5 rounded-lg border border-neutral-200 shadow-sm">
          <p className="text-xs uppercase tracking-wider text-neutral-500 font-semibold">Total Catalog Products</p>
          <p className="text-3xl font-bold text-neutral-900 mt-2">{totalProducts}</p>
        </div>
        <div className="bg-white p-5 rounded-lg border border-neutral-200 shadow-sm">
          <p className="text-xs uppercase tracking-wider text-neutral-500 font-semibold">Total Units in Stock</p>
          <p className="text-3xl font-bold text-neutral-900 mt-2">{totalUnitsInStock}</p>
        </div>
        <div className="bg-white p-5 rounded-lg border border-neutral-200 shadow-sm">
          <p className="text-xs uppercase tracking-wider text-neutral-500 font-semibold">Total Catalog Valuation</p>
          <p className="text-3xl font-bold text-emerald-700 mt-2">
            £{totalInventoryValue.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
        </div>
        <div className="bg-white p-5 rounded-lg border border-neutral-200 shadow-sm">
          <p className="text-xs uppercase tracking-wider text-neutral-500 font-semibold">Perfume Category Count</p>
          <p className="text-3xl font-bold text-neutral-900 mt-2">{perfumeCount}</p>
        </div>
      </div>

      {dispatchSuccessMsg && (
        <div className="p-4 mb-6 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-lg text-sm font-medium flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-600" />
          <span>{dispatchSuccessMsg}</span>
        </div>
      )}

      {activeTab === 'inventory' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Add New Product Form */}
          <div className="lg:col-span-5 bg-white p-6 rounded-xl border border-neutral-200 shadow-sm h-fit">
            <h2 className="text-lg font-semibold text-neutral-900 mb-4">Add New Product to Catalog</h2>

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

            <form onSubmit={handleCreateProduct} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase text-neutral-700 mb-1">
                  Product Title *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g., Oud Royale Extrait de Parfum 100ml"
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
                    min="0"
                    required
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="85.00"
                    className="w-full px-3.5 py-2.5 border border-neutral-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase text-neutral-700 mb-1">
                    Stock Quantity *
                  </label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={stock}
                    onChange={(e) => setStock(e.target.value)}
                    placeholder="25"
                    className="w-full px-3.5 py-2.5 border border-neutral-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold uppercase text-neutral-700 mb-1">
                    Category *
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-neutral-300 rounded-md text-sm bg-white focus:outline-none focus:ring-2 focus:ring-neutral-900"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c.value} value={c.value}>
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
                    placeholder="110.00"
                    className="w-full px-3.5 py-2.5 border border-neutral-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-neutral-700 mb-1">
                  Product Description *
                </label>
                <textarea
                  rows={3}
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe fragrance notes, botanical actives, texture, and origin..."
                  className="w-full px-3.5 py-2.5 border border-neutral-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900"
                />
              </div>

              {/* Product Image Upload with Real Thumbnail Inspection */}
              <div>
                <label className="block text-xs font-semibold uppercase text-neutral-700 mb-1">
                  Product Images *
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
                  <p className="text-xs text-amber-600 mt-1.5">Processing image preview...</p>
                )}

                {/* Optional Image URL Input */}
                <div className="flex gap-2 mt-2">
                  <input
                    type="url"
                    placeholder="Or paste external image URL..."
                    value={urlInput}
                    onChange={(e) => setUrlInput(e.target.value)}
                    className="flex-1 px-3 py-1.5 border border-neutral-300 rounded-md text-xs focus:outline-none focus:ring-1 focus:ring-neutral-900"
                  />
                  <button
                    type="button"
                    onClick={handleAddUrlImage}
                    className="px-3 py-1.5 bg-neutral-100 text-neutral-800 text-xs font-medium rounded-md hover:bg-neutral-200 cursor-pointer"
                  >
                    Add URL
                  </button>
                </div>

                {images.length > 0 && (
                  <div className="mt-3">
                    <p className="text-xs font-medium text-emerald-700 mb-2">
                      {images.length} image(s) ready to publish:
                    </p>
                    <div className="grid grid-cols-4 gap-2">
                      {images.map((imgSrc, idx) => (
                        <div key={idx} className="relative group border rounded-md overflow-hidden aspect-square bg-neutral-100">
                          <img
                            src={imgSrc}
                            alt={`Upload preview ${idx + 1}`}
                            className="w-full h-full object-cover"
                          />
                          <button
                            type="button"
                            onClick={() => removeUploadedImage(idx)}
                            className="absolute top-1 right-1 bg-black/75 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center hover:bg-red-600 cursor-pointer"
                            title="Remove image"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  id="featured-toggle"
                  type="checkbox"
                  checked={featured}
                  onChange={(e) => setFeatured(e.target.checked)}
                  className="h-4 w-4 rounded border-neutral-300 text-neutral-900 focus:ring-neutral-900 cursor-pointer"
                />
                <label htmlFor="featured-toggle" className="text-sm text-neutral-700 cursor-pointer">
                  Feature on Homepage Catalog
                </label>
              </div>

              <button
                type="submit"
                disabled={submitting || uploadingImage}
                className="w-full py-3 px-4 bg-neutral-900 text-white font-semibold text-sm rounded-md hover:bg-neutral-800 transition disabled:opacity-50 cursor-pointer"
              >
                {submitting ? 'Publishing to Live Catalog...' : 'Publish Product Now'}
              </button>
            </form>
          </div>

          {/* Live Admin Inventory List */}
          <div className="lg:col-span-7 bg-white p-6 rounded-xl border border-neutral-200 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-neutral-900">
                Active Catalog ({products.length} Products)
              </h2>
              <button
                onClick={fetchCatalog}
                className="text-xs font-medium text-neutral-600 hover:text-neutral-900 underline cursor-pointer"
              >
                Refresh List
              </button>
            </div>

            {loading ? (
              <div className="py-12 text-center text-sm text-neutral-500">Loading catalog inventory...</div>
            ) : products.length === 0 ? (
              <div className="py-12 text-center text-sm text-neutral-500">No products in catalog yet.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-neutral-200 text-xs uppercase text-neutral-500">
                      <th className="py-3 px-2">Product</th>
                      <th className="py-3 px-2">Category</th>
                      <th className="py-3 px-2">Price</th>
                      <th className="py-3 px-2">Stock</th>
                      <th className="py-3 px-2 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100 text-sm">
                    {products.map((product) => (
                      <tr key={product.id} className="hover:bg-neutral-50">
                        <td className="py-3 px-2 flex items-center gap-3">
                          <img
                            src={product.images?.[0] || '/images/media_1791069473262.jpg'}
                            alt={product.name}
                            className="w-12 h-12 rounded object-cover border border-neutral-200 flex-shrink-0"
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
                        <td className="py-3 px-2 capitalize text-neutral-700">{product.category}</td>
                        <td className="py-3 px-2 font-semibold text-neutral-900">
                          £{Number(product.price).toFixed(2)}
                        </td>
                        <td className="py-3 px-2">
                          <span
                            className={`inline-flex px-2 py-0.5 text-xs font-medium rounded-full ${
                              Number(product.stock ?? 0) > 0
                                ? 'bg-emerald-50 text-emerald-700'
                                : 'bg-red-50 text-red-700'
                            }`}
                          >
                            {Number(product.stock ?? 0)} in stock
                          </span>
                        </td>
                        <td className="py-3 px-2 text-right">
                          <button
                            onClick={() => handleDeleteProduct(product.id)}
                            className="text-xs text-red-600 hover:text-red-800 font-medium cursor-pointer"
                          >
                            Remove
                          </button>
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
        /* Orders & Dispatch Tab */
        <div className="bg-white p-6 rounded-xl border border-neutral-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-neutral-900">
              Customer Orders & Dispatch ({orders.length})
            </h2>
            <button
              onClick={fetchOrders}
              className="text-xs font-medium text-neutral-600 hover:text-neutral-900 underline flex items-center gap-1 cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Refresh Orders
            </button>
          </div>

          {ordersLoading ? (
            <div className="py-12 text-center text-sm text-neutral-500">Loading orders...</div>
          ) : orders.length === 0 ? (
            <div className="py-12 text-center text-sm text-neutral-500">
              No orders placed yet. Orders will appear here upon customer checkout.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-neutral-200 text-xs uppercase text-neutral-500">
                    <th className="py-3 px-3">Order ID</th>
                    <th className="py-3 px-3">Customer</th>
                    <th className="py-3 px-3">Items</th>
                    <th className="py-3 px-3">Total</th>
                    <th className="py-3 px-3">Status</th>
                    <th className="py-3 px-3">Tracking</th>
                    <th className="py-3 px-3 text-right">Fulfillment</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100 text-sm">
                  {orders.map((ord) => {
                    const isDispatched =
                      (ord.fulfillment && ord.fulfillment.toLowerCase().includes('dispatched')) ||
                      ord.status === 'SHIPPED';

                    return (
                      <tr key={ord.id} className="hover:bg-neutral-50">
                        <td className="py-3 px-3 font-mono font-medium text-neutral-900">{ord.id}</td>
                        <td className="py-3 px-3">
                          <p className="font-medium text-neutral-900">{ord.customer || ord.customerName || 'Client'}</p>
                          <p className="text-xs text-neutral-400">{ord.email || ord.customerEmail || ''}</p>
                        </td>
                        <td className="py-3 px-3 text-xs text-neutral-600 max-w-xs truncate">
                          {typeof ord.items === 'string'
                            ? ord.items
                            : Array.isArray(ord.items)
                            ? ord.items.map((i: any) => `${i.title || i.name} x${i.quantity || 1}`).join(', ')
                            : 'Order items'}
                        </td>
                        <td className="py-3 px-3 font-semibold text-neutral-900">
                          £{Number(ord.total || 0).toFixed(2)}
                        </td>
                        <td className="py-3 px-3">
                          <span
                            className={`inline-flex px-2 py-0.5 text-xs font-medium rounded-full ${
                              isDispatched ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                            }`}
                          >
                            {isDispatched ? 'Dispatched' : 'Ready for Dispatch'}
                          </span>
                        </td>
                        <td className="py-3 px-3 font-mono text-xs">
                          {ord.trackingNumber ? (
                            <a
                              href={`https://www.royalmail.com/track-your-item#/tracking-results/${ord.trackingNumber}`}
                              target="_blank"
                              rel="noreferrer"
                              className="text-blue-600 hover:underline flex items-center gap-1"
                            >
                              <span>{ord.trackingNumber}</span>
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          ) : (
                            <span className="text-neutral-400">Pending</span>
                          )}
                        </td>
                        <td className="py-3 px-3 text-right">
                          {isDispatched ? (
                            <span className="inline-flex items-center gap-1 text-xs text-emerald-600 font-medium">
                              <Check className="w-3.5 h-3.5" /> Dispatched
                            </span>
                          ) : (
                            <button
                              onClick={() => handleConfirmDispatch(ord)}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-neutral-900 text-white text-xs font-medium rounded hover:bg-neutral-800 transition cursor-pointer"
                            >
                              <Truck className="w-3 h-3" />
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
