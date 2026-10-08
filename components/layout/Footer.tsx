'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Check, ShieldCheck, Lock } from 'lucide-react';

export default function Footer() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
    }
  };

  return (
    <footer className="bg-ry-wine text-ry-white pt-20 pb-12 border-t border-ry-burgundy font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Top: 10% Welcome Newsletter */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 pb-16 border-b border-ry-burgundy items-center">
          <div className="lg:col-span-6">
            <span className="text-[10px] uppercase tracking-[0.3em] text-ry-stone block mb-2">
              Newsletter
            </span>
            <h3 className="font-serif text-2xl sm:text-3xl text-ry-white font-normal">
              Get 10% Off Your First Order
            </h3>
            <p className="text-xs text-ry-stone mt-2 max-w-md">
              Subscribe to receive exclusive offers, new product launches, and seasonal discounts.
            </p>
          </div>

          <div className="lg:col-span-6">
            {subscribed ? (
              <div className="p-4 bg-ry-charcoal/80 border border-emerald-600/40 text-xs text-emerald-400 flex items-center gap-2">
                <Check className="w-4 h-4 shrink-0" />
                <span>Thank you! Your 10% discount code <strong>RYCARIX10</strong> has been sent to your email.</span>
              </div>
            ) : (
              <form className="flex flex-col sm:flex-row gap-2" onSubmit={handleSubscribe}>
                <input
                  type="email"
                  placeholder="Enter your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="flex-1 bg-ry-burgundyDeep/60 border border-ry-burgundyLight/30 px-4 py-3 text-xs text-ry-white placeholder-ry-stone focus:outline-none focus:border-ry-white transition-colors"
                  required
                />
                <button
                  type="submit"
                  className="px-6 py-3 bg-ry-white text-ry-onyx text-xs uppercase tracking-editorial font-medium hover:bg-ry-oatmeal transition-colors shrink-0"
                >
                  Subscribe
                </button>
              </form>
            )}
            <p className="text-[10px] text-ry-stone mt-2">
              By subscribing, you agree to our Privacy Policy. No spam, unsubscribe anytime.
            </p>
          </div>
        </div>

        {/* Middle: Store Directory */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8 py-16 border-b border-ry-burgundy text-xs">
          
          {/* Brand Column */}
          <div className="col-span-2 md:col-span-4 lg:col-span-2 pr-6">
            <span className="font-serif text-2xl tracking-[0.25em] uppercase font-normal text-ry-white block mb-3">
              Rycarix
            </span>
            <p className="text-xs text-ry-stone leading-relaxed max-w-sm mb-4">
              Luxury perfumes, botanical hair care, clean skincare, and scented home goods crafted with premium ingredients.
            </p>
            <div className="flex items-center gap-3 text-[10px] text-ry-ash/80">
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                Klarna Official Partner
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Lock className="w-3.5 h-3.5" />
                256-Bit SSL Encrypted
              </span>
            </div>
          </div>

          {/* Shop Categories */}
          <div className="space-y-3">
            <h4 className="text-[10px] uppercase tracking-[0.25em] text-ry-white font-medium">
              Shop
            </h4>
            <ul className="space-y-2 text-ry-stone">
              <li>
                <Link href="/#catalog" className="hover:text-ry-white transition-colors">
                  Shop All Products
                </Link>
              </li>
              <li>
                <Link href="/#catalog" className="hover:text-ry-white transition-colors">
                  Perfume & Fragrance
                </Link>
              </li>
              <li>
                <Link href="/#catalog" className="hover:text-ry-white transition-colors">
                  Skincare
                </Link>
              </li>
              <li>
                <Link href="/#catalog" className="hover:text-ry-white transition-colors">
                  Hair Care
                </Link>
              </li>
              <li>
                <Link href="/#catalog" className="hover:text-ry-white transition-colors">
                  Body & Bath
                </Link>
              </li>
              <li>
                <Link href="/#catalog" className="hover:text-ry-white transition-colors">
                  Home & Candles
                </Link>
              </li>
              <li>
                <Link href="/#catalog" className="hover:text-ry-white transition-colors">
                  Accessories
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Service */}
          <div className="space-y-3">
            <h4 className="text-[10px] uppercase tracking-[0.25em] text-ry-white font-medium">
              Customer Service
            </h4>
            <ul className="space-y-2 text-ry-stone">
              <li>
                <Link href="/login" className="hover:text-ry-white transition-colors">
                  Sign In / Register
                </Link>
              </li>
              <li>
                <Link href="/dashboard/user" className="hover:text-ry-white transition-colors">
                  My Account & Wishlist
                </Link>
              </li>
              <li>
                <Link href="/track" className="hover:text-ry-white transition-colors">
                  Track My Order
                </Link>
              </li>
              <li>
                <span className="hover:text-ry-white transition-colors cursor-pointer">
                  Klarna FAQ
                </span>
              </li>
              <li>
                <span className="hover:text-ry-white transition-colors cursor-pointer">
                  Shipping Information
                </span>
              </li>
              <li>
                <span className="hover:text-ry-white transition-colors cursor-pointer">
                  Returns & Exchanges
                </span>
              </li>
              <li>
                <span className="hover:text-ry-white transition-colors cursor-pointer">
                  Contact Support
                </span>
              </li>
            </ul>
          </div>

          {/* About Company */}
          <div className="space-y-3">
            <h4 className="text-[10px] uppercase tracking-[0.25em] text-ry-white font-medium">
              About Us
            </h4>
            <ul className="space-y-2 text-ry-stone">
              <li>
                <Link href="/#philosophy" className="hover:text-ry-white transition-colors">
                  Our Story & Ingredients
                </Link>
              </li>
              <li>
                <Link href="/#transparency" className="hover:text-ry-white transition-colors">
                  Product Transparency
                </Link>
              </li>
              <li>
                <span className="hover:text-ry-white transition-colors cursor-pointer">
                  Sustainability
                </span>
              </li>
              <li>
                <Link href="/dashboard/admin" className="hover:text-ry-white transition-colors">
                  Admin Dashboard
                </Link>
              </li>
              <li>
                <span className="hover:text-ry-white transition-colors cursor-pointer">
                  Press & Media
                </span>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom: Copyright & Legal */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-[11px] text-ry-stone gap-4">
          <div>
            &copy; {new Date().getFullYear()} Rycarix. All rights reserved.
          </div>

          {/* Accepted Payment Hallmarks */}
          <div className="flex items-center gap-3 text-[10px] tracking-subtle text-ry-ash/70">
            <span className="bg-[#FFA8CD] text-black font-semibold text-[8px] px-1 py-0.2 rounded-sm">
              Klarna.
            </span>
            <span>Stripe</span>
            <span>Apple Pay</span>
            <span>Visa</span>
            <span>Mastercard</span>
            <span>Amex</span>
          </div>

          <div className="flex space-x-6">
            <span className="hover:text-ry-white transition-colors cursor-pointer">
              Privacy Policy
            </span>
            <span className="hover:text-ry-white transition-colors cursor-pointer">
              Terms of Service
            </span>
            <span className="hover:text-ry-white transition-colors cursor-pointer">
              Accessibility
            </span>
          </div>
        </div>

      </div>
    </footer>
  );
}
