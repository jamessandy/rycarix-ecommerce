'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
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
  KeyRound,
  Truck,
} from 'lucide-react';
import { useCartStore } from '@/lib/store/useCartStore';
import { useAuthStore } from '@/lib/store/useAuthStore';
import { PRODUCTS } from '@/lib/data/mockData';

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const searchInputRef = useRef<HTMLInputElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  const { toggleCart, getTotalCount } = useCartStore();
  const totalCount = getTotalCount();

  const { user, isAuthenticated, logout, loginAsDemo } = useAuthStore();

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 24) {
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

  const navLinks = [
    { name: 'Shop All', href: '/#catalog' },
    { name: 'Perfume', href: '/#catalog' },
    { name: 'Skincare', href: '/#catalog' },
    { name: 'Hair Care', href: '/#catalog' },
    { name: 'Home & Candles', href: '/#catalog' },
    { name: 'Accessories', href: '/#catalog' },
    { name: 'About Us', href: '/#philosophy' },
  ];

  const searchResults = searchQuery.trim()
    ? PRODUCTS.filter(
        (p) =>
          p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.summary.toLowerCase().includes(searchQuery.toLowerCase())
      ).slice(0, 4)
    : [];

  const isLightHero = pathname === '/';

  return (
    <>
      {/* Top Announcement Bar */}
      <div className="bg-ry-burgundy text-ry-ash py-2 px-4 text-center text-[10px] uppercase tracking-editorial font-sans border-b border-ry-burgundyDeep/80 flex items-center justify-center gap-3">
        <span>Free UK Shipping via Evri & Royal Mail (Over £150)</span>
        <span className="hidden sm:inline opacity-40">•</span>
        <span className="hidden sm:inline">
          Pay in 4 with <strong className="text-ry-white">Klarna</strong> (0% APR)
        </span>
        <span className="hidden md:inline opacity-40">•</span>
        <span className="hidden md:inline">2 Free Samples with Every Order</span>
      </div>

      <header
        className={`sticky top-0 left-0 right-0 z-40 transition-all duration-300 ${
          isScrolled
            ? 'bg-ry-pearl/95 backdrop-blur-md border-b border-ry-ash/40 shadow-sm py-3.5 text-ry-onyx'
            : isLightHero
            ? 'bg-ry-pearl/90 backdrop-blur-sm border-b border-ry-ash/30 py-4 text-ry-onyx'
            : 'bg-ry-pearl/90 backdrop-blur-sm border-b border-ry-ash/30 py-4 text-ry-onyx'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          {/* Left: Desktop Multi-Category Navigation */}
          <nav className="hidden lg:flex items-center space-x-6">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className="text-[11px] uppercase tracking-editorial font-sans font-medium transition-opacity duration-200 hover:opacity-60 relative group"
              >
                {link.name}
                <span className="absolute left-0 -bottom-1 w-0 h-[1px] bg-current transition-all duration-300 group-hover:w-full" />
              </Link>
            ))}
          </nav>

          {/* Left: Mobile Hamburger Toggle */}
          <div className="lg:hidden flex items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-1 hover:opacity-70 transition-opacity"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

          {/* Center: Brand Wordmark */}
          <div className="flex-1 lg:flex-none text-center">
            <Link href="/" className="inline-block group focus:outline-none">
              <h1 className="font-serif text-2xl sm:text-3xl tracking-[0.28em] font-normal uppercase transition-transform duration-300 group-hover:scale-[1.01] text-ry-onyx">
                Rycarix
              </h1>
              <span className="hidden sm:block text-[8px] uppercase tracking-[0.45em] text-ry-stone font-sans -mt-1 opacity-90">
                Luxury Fragrance & Care
              </span>
            </Link>
          </div>

          {/* Right: Actions (Search, Account, Admin, Cart) */}
          <div className="flex items-center space-x-4 sm:space-x-5">
            {/* Search Trigger */}
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              className="p-1 text-ry-stone hover:text-ry-onyx transition-colors focus:outline-none"
              aria-label="Search Products"
              title="Search Products"
            >
              <Search className="w-4 h-4 stroke-[1.6]" />
            </button>

            {/* Authenticated Client Menu or Sign In Link */}
            {isAuthenticated && user ? (
              <div className="relative hidden sm:block" ref={userMenuRef}>
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-1.5 py-1 text-[11px] uppercase tracking-editorial font-sans hover:opacity-75 transition-opacity text-ry-onyx focus:outline-none"
                  aria-expanded={userDropdownOpen}
                >
                  <div className="w-6 h-6 rounded-full bg-ry-burgundy text-ry-white text-[10px] font-serif flex items-center justify-center border border-ry-burgundyLight/40">
                    {user.avatarInitial || 'U'}
                  </div>
                  <span className="hidden xl:inline max-w-[110px] truncate">{user.name.split(' ')[0]}</span>
                  <ChevronDown className="w-3 h-3 text-ry-stone" />
                </button>

                {/* Dropdown Menu */}
                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-ry-white border border-ry-ash/70 shadow-xl py-3 z-50 animate-fade-in font-sans">
                    <div className="px-4 pb-3 border-b border-ry-ash/40">
                      <div className="text-xs font-serif font-medium text-ry-onyx truncate">
                        {user.name}
                      </div>
                      <div className="text-[10px] text-ry-stone truncate">{user.email}</div>
                      <span className="inline-block mt-1 px-1.5 py-0.5 bg-ry-pearl text-[9px] uppercase tracking-editorial font-medium text-ry-charcoal border border-ry-ash/40">
                        {user.title}
                      </span>
                    </div>

                    <div className="py-2 border-b border-ry-ash/40 text-xs">
                      <Link
                        href="/dashboard/user"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center justify-between px-4 py-2 hover:bg-ry-pearl transition-colors text-ry-charcoal hover:text-ry-onyx"
                      >
                        <span>My Account & Orders</span>
                        <ArrowRight className="w-3 h-3 text-ry-stone" />
                      </Link>

                      <Link
                        href="/track"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center justify-between px-4 py-2 hover:bg-ry-pearl transition-colors text-ry-charcoal hover:text-ry-onyx"
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
                          className="flex items-center justify-between px-4 py-2 hover:bg-ry-pearl transition-colors text-ry-charcoal hover:text-ry-onyx"
                        >
                          <span className="flex items-center gap-1.5">
                            <Shield className="w-3.5 h-3.5 text-amber-600" />
                            Admin Dashboard
                          </span>
                          <ArrowRight className="w-3 h-3 text-ry-stone" />
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
                        className="w-full flex items-center justify-between text-xs text-red-700 hover:text-red-900 py-1"
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
                className="hidden sm:flex items-center gap-1.5 text-[11px] uppercase tracking-editorial font-sans hover:opacity-60 transition-opacity text-ry-onyx"
                title="Sign In / Register"
              >
                <User className="w-4 h-4 stroke-[1.5]" />
                <span className="hidden xl:inline">Sign In</span>
              </Link>
            )}



            {/* Slide-out Cart Trigger */}
            <button
              onClick={toggleCart}
              className="relative flex items-center gap-2 p-1.5 focus:outline-none group text-ry-onyx"
              aria-label="Open Shopping Cart"
            >
              <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5 stroke-[1.5] transition-transform group-hover:scale-105" />
              <span className="text-[11px] font-sans font-medium uppercase tracking-editorial hidden sm:inline">
                Cart
              </span>
              {totalCount > 0 && (
                <span className="w-4 h-4 rounded-full bg-ry-burgundy text-ry-white text-[10px] font-semibold flex items-center justify-center -ml-1 animate-fade-in border border-ry-burgundyLight/40">
                  {totalCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Live Search Slide-Down Drawer */}
        {searchOpen && (
          <div className="bg-ry-white border-b border-ry-ash shadow-md animate-fade-in">
            <div className="max-w-4xl mx-auto px-4 py-4 sm:py-6">
              <div className="relative flex items-center">
                <Search className="w-5 h-5 text-ry-stone absolute left-3" />
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Search perfume, haircare, skincare, candles..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-11 pr-10 py-3 text-sm bg-ry-pearl border border-ry-ash/70 focus:outline-none focus:border-ry-onyx text-ry-onyx placeholder-ry-stone font-sans"
                />
                <button
                  onClick={() => {
                    setSearchOpen(false);
                    setSearchQuery('');
                  }}
                  className="absolute right-3 text-sm text-ry-stone hover:text-ry-onyx"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Instant Search Results */}
              {searchQuery.trim() && (
                <div className="mt-4 pt-3 border-t border-ry-ash/40">
                  {searchResults.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {searchResults.map((product) => (
                        <Link
                          key={product.id}
                          href={`/products/${product.slug}`}
                          onClick={() => {
                            setSearchOpen(false);
                            setSearchQuery('');
                          }}
                          className="flex items-center gap-3 p-2 bg-ry-pearl hover:bg-ry-oatmeal border border-ry-ash/40 transition-colors group"
                        >
                          <div className="w-12 h-14 bg-ry-charcoal relative shrink-0 overflow-hidden">
                            <Image
                              src={product.images[0]?.url || ''}
                              alt={product.title}
                              fill
                              className="object-cover"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <span className="text-[9px] uppercase tracking-editorial text-ry-stone block">
                              {product.category}
                            </span>
                            <h4 className="font-serif text-xs text-ry-onyx group-hover:underline truncate">
                              {product.title}
                            </h4>
                            <span className="text-[11px] font-mono text-ry-charcoal">
                              £{product.basePrice.toFixed(2)}
                            </span>
                          </div>
                          <ArrowRight className="w-3.5 h-3.5 text-ry-stone group-hover:translate-x-1 transition-transform mr-1" />
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-ry-stone py-2">
                      No products found matching “{searchQuery}”. Try searching for “sandalwood”, “serum”, “candle”, or “shampoo”.
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-ry-pearl text-ry-onyx border-b border-ry-ash px-6 py-8 animate-fade-in">
            <nav className="flex flex-col space-y-4 text-sm uppercase tracking-editorial font-sans">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="py-1.5 border-b border-ry-ash/40 flex justify-between items-center"
                >
                  <span>{link.name}</span>
                  <span className="text-xs text-ry-stone">→</span>
                </Link>
              ))}

              <div className="pt-4 flex flex-col space-y-3 text-xs tracking-editorial text-ry-stone">
                {isAuthenticated && user ? (
                  <>
                    <div className="p-3 bg-ry-white border border-ry-ash/60 text-ry-charcoal">
                      <div className="font-serif text-sm text-ry-onyx">{user.name}</div>
                      <div className="text-[10px] text-ry-stone">{user.email}</div>
                      <div className="mt-1 text-[9px] uppercase text-ry-stone">{user.title}</div>
                    </div>
                    <Link
                      href="/dashboard/user"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-2 py-1 text-ry-onyx"
                    >
                      <User className="w-4 h-4" /> My Account & Orders
                    </Link>
                    <Link
                      href="/track"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-2 py-1 text-ry-onyx"
                    >
                      <Truck className="w-4 h-4" /> Track Delivery
                    </Link>
                    {user.role === 'ADMIN' && (
                      <Link
                        href="/dashboard/admin"
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center gap-2 py-1 text-amber-700"
                      >
                        <Shield className="w-4 h-4" /> Admin Dashboard
                      </Link>
                    )}
                    <button
                      type="button"
                      onClick={() => {
                        logout();
                        setMobileMenuOpen(false);
                      }}
                      className="flex items-center gap-2 py-1 text-red-700 text-left"
                    >
                      <LogOut className="w-4 h-4" /> Sign Out
                    </button>
                  </>
                ) : (
                  <Link
                    href="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2 py-2 text-ry-onyx font-medium border-b border-ry-ash/40"
                  >
                    <User className="w-4 h-4" /> Sign In / Register
                  </Link>
                )}


              </div>
            </nav>
          </div>
        )}
      </header>
    </>
  );
}
