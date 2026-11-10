'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import {
  ShoppingBag,
  User,
  Search,
  Menu,
  X,
  Shield,
  ArrowRight,
  LogOut,
  ChevronDown,
  Truck,
  Heart,
  ChevronLeft,
  ChevronRight,
  Trash2,
} from 'lucide-react';
import { useCartStore } from '@/lib/store/useCartStore';
import { useWishlistStore } from '@/lib/store/useWishlistStore';
import { useAuthStore } from '@/lib/store/useAuthStore';
import { PRODUCTS } from '@/lib/data/mockData';

export default function Header() {
  const [hasMounted, setHasMounted] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [wishlistDrawerOpen, setWishlistDrawerOpen] = useState(false);

  const searchInputRef = useRef<HTMLInputElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const router = useRouter();
  const [liveProducts, setLiveProducts] = useState<any[]>(PRODUCTS);

  const { toggleCart, getTotalCount, addItem: addCartItem, openCart } = useCartStore();
  const totalCartCount = getTotalCount();

  const { items: wishlistItems, removeItem: removeWishlistItem, clearWishlist } = useWishlistStore();
  const wishlistCount = wishlistItems.length;

  const { user, isAuthenticated, logout } = useAuthStore();

  useEffect(() => {
    setHasMounted(true);

    const syncLiveCatalog = () => {
      try {
        if (typeof window !== 'undefined') {
          const cached = localStorage.getItem('rycarix_catalog_products');
          if (cached) {
            const parsed = JSON.parse(cached);
            if (Array.isArray(parsed) && parsed.length > 0) {
              setLiveProducts(parsed);
            }
          }
        }
      } catch (e) {}

      fetch('/api/products', { cache: 'no-store' })
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (data?.products && Array.isArray(data.products) && data.products.length > 0) {
            setLiveProducts(data.products);
          }
        })
        .catch(() => {});
    };

    syncLiveCatalog();

    window.addEventListener('rycarix-catalog-updated', syncLiveCatalog);
    window.addEventListener('storage', syncLiveCatalog);
    return () => {
      window.removeEventListener('rycarix-catalog-updated', syncLiveCatalog);
      window.removeEventListener('storage', syncLiveCatalog);
    };
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (searchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [searchOpen]);

  // Sub-Navigation links matching reference screenshot placement
  const subNavLinks = [
    { name: 'SALE 🤩', href: '/products?sale=true', isSale: true },
    { name: 'Fragrance', href: '/category/fragrance', hasChevron: true },
    { name: 'Hair', href: '/category/hair', hasChevron: true },
    { name: 'Home & Body', href: '/category/candles', hasChevron: true },
    { name: 'Discover', href: '/products', hasChevron: true },
    { name: 'Skincare', href: '/category/skincare', hasChevron: false },
    { name: 'Accessories', href: '/category/accessories', hasChevron: false },
    { name: 'About us', href: '/about', hasChevron: false },
    { name: 'Contact us', href: '/delivery', hasChevron: false },
  ];

  const handleSearchSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const query = searchQuery.trim();
    if (!query) return;
    setSearchOpen(false);
    router.push(`/products?search=${encodeURIComponent(query)}`);
  };

  const q = searchQuery.toLowerCase().trim();
  const searchResults = q
    ? liveProducts
        .filter((p: any) => {
          const name = (p.name || p.title || '').toLowerCase();
          const cat = (p.category || '').toLowerCase();
          const desc = (p.description || p.summary || p.subtitle || '').toLowerCase();
          const sku = (p.sku || '').toLowerCase();
          return name.includes(q) || cat.includes(q) || desc.includes(q) || sku.includes(q);
        })
        .slice(0, 6)
    : [];

  return (
    <>
      <header className="sticky top-0 left-0 right-0 z-40 font-sans shadow-xs transition-colors duration-200">
        {/* =========================================================================
            TOP ANNOUNCEMENT BAR (Maintaining Previous Palette: Wine / Burgundy)
            ========================================================================= */}
        <div className="bg-ry-wine text-ry-white text-[11px] sm:text-xs py-2 px-4 border-b border-ry-burgundy flex items-center justify-center tracking-widest uppercase font-medium">
          <div className="flex items-center gap-4 sm:gap-6">
            <ChevronLeft className="w-3.5 h-3.5 opacity-60 cursor-pointer hover:opacity-100 transition-opacity" />
            <Link
              href="/delivery"
              className="hover:text-ry-oatmeal transition-colors text-center font-light"
            >
              FREE UK DELIVERY ON ALL ORDERS OVER £50
            </Link>
            <ChevronRight className="w-3.5 h-3.5 opacity-60 cursor-pointer hover:opacity-100 transition-opacity" />
          </div>
        </div>

        {/* =========================================================================
            MAIN HEADER BAR (Previous Color: bg-ry-pearl / Light Cream Off-White)
            Placement matching screenshot: Left Search | Center Rycarix | Right Icons
            ========================================================================= */}
        <div className="bg-ry-pearl/95 backdrop-blur-md text-ry-onyx px-4 sm:px-8 py-3.5 sm:py-4 border-b border-ry-ash/40">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            
            {/* Left: Search Trigger (matching screenshot placement) */}
            <div className="flex items-center gap-3 sm:gap-4 flex-1">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-1 text-ry-onyx hover:text-ry-burgundy transition-colors focus:outline-none"
                aria-label="Toggle Navigation"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>

              <button
                onClick={() => setSearchOpen(!searchOpen)}
                className="p-1 text-ry-onyx hover:text-ry-burgundy transition-colors focus:outline-none flex items-center gap-2 group"
                aria-label="Search"
                title="Search Products"
              >
                <Search className="w-4 h-4 sm:w-4.5 sm:h-4.5 stroke-[1.6] group-hover:scale-105 transition-transform" />
                <span className="hidden sm:inline text-[11px] uppercase tracking-editorial text-ry-stone group-hover:text-ry-onyx font-medium">
                  Search
                </span>
              </button>
            </div>

            {/* Center: Brand Wordmark "Rycarix" */}
            <div className="flex-none text-center">
              <Link href="/" className="inline-block group focus:outline-none">
                <h1 className="font-serif text-2xl sm:text-3xl lg:text-4xl tracking-[0.24em] font-normal uppercase text-ry-onyx group-hover:opacity-80 transition-opacity">
                  Rycarix
                </h1>
                <span className="hidden sm:block text-[8px] uppercase tracking-[0.45em] text-ry-stone font-sans -mt-1 opacity-90">
                  Luxury Fragrance &amp; Care
                </span>
              </Link>
            </div>

            {/* Right: Account, Wishlist, Shopping Bag Icons (matching screenshot placement) */}
            <div className="flex items-center justify-end gap-3 sm:gap-5 flex-1">
              
              {/* User / Account Icon */}
              {isAuthenticated && user ? (
                <div className="relative" ref={userMenuRef}>
                  <button
                    onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                    className="p-1.5 text-ry-onyx hover:text-ry-burgundy transition-colors focus:outline-none flex items-center gap-1.5"
                    title="Account"
                    aria-expanded={userDropdownOpen}
                  >
                    <User className="w-4 h-4 sm:w-5 sm:h-5 stroke-[1.6]" />
                    <span className="hidden xl:inline text-xs font-sans text-ry-onyx max-w-[80px] truncate">
                      {user.name.split(' ')[0]}
                    </span>
                  </button>

                  {/* Dropdown Menu */}
                  {userDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-64 bg-ry-white border border-ry-ash shadow-xl py-3 z-50 text-ry-onyx text-xs font-sans rounded-xs">
                      <div className="px-4 pb-3 border-b border-ry-ash/40">
                        <div className="font-serif font-medium text-ry-onyx truncate">{user.name}</div>
                        <div className="text-[10px] text-ry-stone truncate">{user.email}</div>
                      </div>

                      <div className="py-2 border-b border-ry-ash/40 space-y-0.5">
                        <Link
                          href="/dashboard/user"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center justify-between px-4 py-2 hover:bg-ry-pearl text-ry-charcoal hover:text-ry-onyx transition-colors"
                        >
                          <span>My Orders &amp; Profile</span>
                          <ArrowRight className="w-3 h-3 text-ry-stone" />
                        </Link>
                        <Link
                          href="/track"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center justify-between px-4 py-2 hover:bg-ry-pearl text-ry-charcoal hover:text-ry-onyx transition-colors"
                        >
                          <span className="flex items-center gap-1.5">
                            <Truck className="w-3.5 h-3.5 text-ry-stone" />
                            Track Delivery
                          </span>
                          <ArrowRight className="w-3 h-3 text-ry-stone" />
                        </Link>
                        {user.role === 'ADMIN' && (
                          <Link
                            href="/dashboard/admin"
                            onClick={() => setUserDropdownOpen(false)}
                            className="flex items-center justify-between px-4 py-2 hover:bg-ry-pearl text-ry-burgundy font-medium transition-colors"
                          >
                            <span className="flex items-center gap-1.5">
                              <Shield className="w-3.5 h-3.5" />
                              Admin Dashboard
                            </span>
                            <ArrowRight className="w-3 h-3" />
                          </Link>
                        )}
                      </div>

                      <div className="pt-2 px-4">
                        <button
                          type="button"
                          onClick={() => {
                            logout();
                            setUserDropdownOpen(false);
                          }}
                          className="w-full flex items-center justify-between text-xs text-rose-700 hover:text-rose-900 py-1"
                        >
                          <span>Sign Out</span>
                          <LogOut className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  href="/login"
                  className="p-1.5 text-ry-onyx hover:text-ry-burgundy transition-colors focus:outline-none"
                  title="Sign In / Register"
                >
                  <User className="w-4 h-4 sm:w-5 sm:h-5 stroke-[1.6]" />
                </Link>
              )}

              {/* Wishlist Heart Icon with Count Badge */}
              <button
                type="button"
                onClick={() => setWishlistDrawerOpen(true)}
                className="relative p-1.5 text-ry-onyx hover:text-ry-burgundy transition-colors focus:outline-none"
                aria-label="Wishlist"
                title="Saved Wishlist"
              >
                <Heart className="w-4 h-4 sm:w-5 sm:h-5 stroke-[1.6]" />
                {hasMounted && wishlistCount > 0 && (
                  <span className="absolute top-0 right-0 w-4 h-4 rounded-full bg-rose-600 text-white text-[9px] font-bold flex items-center justify-center shadow-xs">
                    {wishlistCount}
                  </span>
                )}
              </button>

              {/* Shopping Bag Icon with Cart Count Badge */}
              <button
                type="button"
                onClick={toggleCart}
                className="relative p-1.5 text-ry-onyx hover:text-ry-burgundy transition-colors focus:outline-none"
                aria-label="Shopping Cart"
                title="View Cart"
              >
                <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5 stroke-[1.6]" />
                {hasMounted && totalCartCount > 0 && (
                  <span className="absolute top-0 right-0 w-4 h-4 rounded-full bg-ry-burgundy text-white text-[9px] font-bold flex items-center justify-center shadow-xs">
                    {totalCartCount}
                  </span>
                )}
              </button>

            </div>
          </div>
        </div>

        {/* =========================================================================
            SUB-NAVIGATION BAR (Previous Color: bg-ry-pearl / Light Cream)
            Centered row of links matching screenshot placement
            ========================================================================= */}
        <nav className="hidden lg:block bg-ry-pearl/90 backdrop-blur-sm border-b border-ry-ash/40 py-2.5 px-4 text-center">
          <div className="max-w-7xl mx-auto flex items-center justify-center gap-6 xl:gap-8 flex-wrap">
            {subNavLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className={`text-[11px] uppercase tracking-[0.16em] font-medium transition-colors flex items-center gap-1 ${
                  link.isSale
                    ? 'text-ry-burgundy font-bold hover:text-ry-onyx'
                    : 'text-ry-onyx hover:text-ry-burgundy'
                }`}
              >
                <span>{link.name}</span>
                {link.hasChevron && <ChevronDown className="w-3 h-3 opacity-50" />}
              </Link>
            ))}
          </div>
        </nav>

        {/* =========================================================================
            SEARCH OVERLAY
            ========================================================================= */}
        {searchOpen && (
          <div className="bg-ry-white border-b border-ry-ash text-ry-onyx shadow-xl animate-fade-in">
            <div className="max-w-4xl mx-auto px-4 py-5 sm:py-6">
              <form onSubmit={handleSearchSubmit} className="relative flex items-center">
                <Search className="w-5 h-5 text-ry-stone absolute left-3.5 pointer-events-none" />
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Search parfum, hair, skincare, candles, notes..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-11 pr-24 py-3 bg-ry-pearl border border-ry-ash/80 rounded-md text-sm text-ry-onyx placeholder-ry-stone focus:outline-none focus:border-ry-onyx transition-colors font-sans"
                />
                <div className="absolute right-3 flex items-center gap-2">
                  {searchQuery && (
                    <button
                      type="submit"
                      className="px-3 py-1 bg-ry-onyx text-white text-xs uppercase tracking-wider font-semibold rounded hover:bg-ry-charcoal transition-colors"
                    >
                      Search
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      setSearchOpen(false);
                      setSearchQuery('');
                    }}
                    className="text-ry-stone hover:text-ry-onyx p-1"
                    aria-label="Close Search"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </form>

              {/* Live Search Quick Results */}
              {searchResults.length > 0 && (
                <div className="mt-4 pt-4 border-t border-ry-ash/60 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {searchResults.map((product: any) => (
                    <Link
                      key={product.id || product.slug}
                      href={`/products/${product.slug}`}
                      onClick={() => {
                        setSearchOpen(false);
                        setSearchQuery('');
                      }}
                      className="flex items-center gap-3 p-2 rounded-lg hover:bg-ry-pearl transition-colors group"
                    >
                      <div className="relative w-12 h-12 bg-ry-pearl rounded overflow-hidden shrink-0 border border-ry-ash/50">
                        {product.images?.[0] ? (
                          <Image
                            src={typeof product.images[0] === 'string' ? product.images[0] : product.images[0]?.url}
                            alt={product.name || product.title}
                            fill
                            className="object-cover"
                          />
                        ) : null}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-xs font-serif text-ry-onyx truncate group-hover:text-ry-burgundy transition-colors">
                          {product.name || product.title}
                        </div>
                        <div className="text-[11px] text-ry-charcoal font-mono">
                          £{Number(product.price || product.basePrice).toFixed(2)}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </header>

      {/* =========================================================================
          WISHLIST SLIDE-OVER DRAWER (Light Luxury Styling)
          ========================================================================= */}
      {wishlistDrawerOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden font-sans animate-fade-in">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
            onClick={() => setWishlistDrawerOpen(false)}
          />
          <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
            <div className="w-screen max-w-md bg-ry-white text-ry-onyx shadow-2xl border-l border-ry-ash flex flex-col">
              
              {/* Header */}
              <div className="p-5 border-b border-ry-ash/60 flex items-center justify-between bg-ry-pearl/50">
                <div className="flex items-center gap-2">
                  <Heart className="w-5 h-5 text-rose-600 fill-rose-600" />
                  <h3 className="font-serif text-lg text-ry-onyx">Your Saved Wishlist</h3>
                  <span className="text-xs text-ry-stone">({wishlistCount})</span>
                </div>
                <button
                  type="button"
                  onClick={() => setWishlistDrawerOpen(false)}
                  className="p-1 text-ry-stone hover:text-ry-onyx transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Items List */}
              <div className="flex-1 overflow-y-auto p-5 space-y-4">
                {wishlistItems.length === 0 ? (
                  <div className="py-16 text-center space-y-4">
                    <Heart className="w-12 h-12 mx-auto text-ry-stone/40 stroke-1" />
                    <h4 className="font-serif text-lg text-ry-onyx">Your wishlist is empty</h4>
                    <p className="text-xs text-ry-stone max-w-xs mx-auto leading-relaxed">
                      Save your favorite perfumes, luxury hairpieces, and skincare to review them anytime.
                    </p>
                    <Link
                      href="/products"
                      onClick={() => setWishlistDrawerOpen(false)}
                      className="inline-block mt-2 px-6 py-2.5 bg-ry-onyx text-white text-xs uppercase tracking-wider font-semibold rounded hover:bg-ry-charcoal transition-colors"
                    >
                      Explore Products
                    </Link>
                  </div>
                ) : (
                  wishlistItems.map((item) => (
                    <div
                      key={item.id}
                      className="p-3 bg-ry-pearl/40 border border-ry-ash/70 rounded-lg flex gap-3.5 items-center group"
                    >
                      <div className="relative w-16 h-16 rounded overflow-hidden bg-ry-pearl shrink-0 border border-ry-ash/50">
                        {item.images?.[0] ? (
                          <Image
                            src={typeof item.images[0] === 'string' ? item.images[0] : (item.images[0] as any)?.url}
                            alt={item.name || item.title || 'Product'}
                            fill
                            className="object-cover"
                          />
                        ) : null}
                      </div>

                      <div className="flex-1 min-w-0">
                        <Link
                          href={`/products/${item.slug}`}
                          onClick={() => setWishlistDrawerOpen(false)}
                          className="font-serif text-sm text-ry-onyx hover:text-ry-burgundy truncate block transition-colors"
                        >
                          {item.name || item.title}
                        </Link>
                        <div className="text-xs text-ry-charcoal font-mono mt-0.5">
                          £{Number(item.price).toFixed(2)}
                        </div>

                        <div className="mt-2 flex items-center gap-3">
                          <button
                            type="button"
                            onClick={() => {
                              addCartItem({
                                id: `${item.id}-default`,
                                productId: item.id,
                                variantId: 'default',
                                title: item.name || item.title || '',
                                variantTitle: 'Standard Edition',
                                sku: item.sku || `RYC-${item.id.slice(-6)}`,
                                price: item.price,
                                quantity: 1,
                                image: typeof item.images?.[0] === 'string' ? item.images[0] : (item.images?.[0] as any)?.url || '',
                              });
                              setWishlistDrawerOpen(false);
                              openCart();
                            }}
                            className="text-[10px] uppercase font-semibold text-ry-burgundy hover:underline underline-offset-2"
                          >
                            Add to Bag
                          </button>

                          <button
                            type="button"
                            onClick={() => removeWishlistItem(item.id)}
                            className="text-[10px] text-ry-stone hover:text-rose-600 flex items-center gap-1"
                          >
                            <Trash2 className="w-3 h-3" />
                            <span>Remove</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {wishlistItems.length > 0 && (
                <div className="p-4 border-t border-ry-ash/60 bg-ry-pearl/30 flex justify-between items-center text-xs">
                  <button
                    type="button"
                    onClick={clearWishlist}
                    className="text-ry-stone hover:text-ry-onyx"
                  >
                    Clear All
                  </button>
                  <Link
                    href="/products"
                    onClick={() => setWishlistDrawerOpen(false)}
                    className="text-ry-burgundy font-medium hover:underline"
                  >
                    Continue Browsing &rarr;
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MOBILE NAVIGATION DRAWER (Previous Color: bg-ry-pearl)
          ========================================================================= */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden font-sans animate-fade-in">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-xs"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="fixed inset-y-0 left-0 w-4/5 max-w-sm bg-ry-pearl text-ry-onyx shadow-2xl p-6 flex flex-col justify-between border-r border-ry-ash overflow-y-auto">
            <div>
              <div className="flex items-center justify-between pb-6 border-b border-ry-ash/60">
                <span className="font-serif text-2xl tracking-[0.2em] text-ry-onyx uppercase">
                  Rycarix
                </span>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1 text-ry-onyx hover:text-ry-burgundy"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="py-6 space-y-4">
                {subNavLinks.map((link) => (
                  <Link
                    key={link.name}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`block text-sm uppercase tracking-wider py-1.5 transition-colors ${
                      link.isSale ? 'text-ry-burgundy font-bold' : 'text-ry-onyx hover:text-ry-burgundy'
                    }`}
                  >
                    {link.name}
                  </Link>
                ))}
              </div>
            </div>

            <div className="pt-6 border-t border-ry-ash/60 space-y-3 text-xs">
              <Link
                href="/delivery"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 text-ry-stone hover:text-ry-onyx"
              >
                <Truck className="w-4 h-4 text-ry-burgundy" />
                <span>UK Delivery (£3.50 / Free over £50)</span>
              </Link>
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 text-ry-stone hover:text-ry-onyx"
              >
                <User className="w-4 h-4 text-ry-burgundy" />
                <span>My Account &amp; Orders</span>
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
