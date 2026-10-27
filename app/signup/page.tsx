'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Lock,
  Mail,
  User,
  Eye,
  EyeOff,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Crown,
  Truck,
  MapPin,
  Phone,
  Gift,
} from 'lucide-react';
import { useAuthStore } from '@/lib/store/useAuthStore';

function SignupFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get('redirect');

  const { signup } = useAuthStore();

  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Account Credentials
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');

  // Delivery Address Fields
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [country, setCountry] = useState('United Kingdom');
  const [deliveryNote, setDeliveryNote] = useState('');
  const [newsletterOptIn, setNewsletterOptIn] = useState(true);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!name.trim() || !email.trim() || !password) {
      setErrorMessage('Please complete your name, email, and password.');
      return;
    }

    if (password.length < 6) {
      setErrorMessage('Password must be at least 6 characters.');
      return;
    }

    if (!street.trim() || !city.trim() || !postalCode.trim()) {
      setErrorMessage('Please provide your complete delivery address (street, city, postcode).');
      return;
    }

    setIsLoading(true);
    try {
      const deliveryAddress = {
        street: deliveryNote ? `${street.trim()} (Note: ${deliveryNote.trim()})` : street.trim(),
        city: city.trim(),
        state: state.trim(),
        postalCode: postalCode.trim(),
        country,
      };

      const res = await signup(name, email, password, deliveryAddress, phone);
      if (res.success) {
        setSuccessMessage('Welcome to Rycarix. Your client account and delivery address have been recorded.');
        setTimeout(() => {
          router.push(redirectUrl || '/dashboard/user');
        }, 500);
      } else {
        setErrorMessage(res.error || 'Failed to create account.');
      }
    } catch {
      setErrorMessage('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-ry-pearl pt-28 pb-20 px-4 sm:px-6 lg:px-8 flex items-center justify-center font-sans">
      <div className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-12 bg-ry-white border border-ry-ash/70 shadow-2xl overflow-hidden">
        
        {/* Left Side: Client Sanctuary Benefits & Trust */}
        <div className="lg:col-span-5 bg-ry-wine text-ry-white p-8 sm:p-12 flex flex-col justify-between relative overflow-hidden">
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-ry-white/10 border border-ry-white/20 text-[10px] uppercase tracking-editorial font-medium mb-4">
              <Crown className="w-3.5 h-3.5 text-amber-300" />
              <span>Client Sanctuary Onboarding</span>
            </div>

            <h1 className="font-serif text-3xl sm:text-4xl text-ry-white font-normal leading-tight">
              Create Your Private Sanctuary Account
            </h1>

            <p className="text-xs text-ry-ash/80 mt-4 leading-relaxed font-light">
              Register with your delivery address for one-click express courier dispatch, live GPS milestone tracking via Evri and Royal Mail, and split-payment checkout with Klarna and Clearpay.
            </p>

            <div className="mt-8 space-y-4 text-xs font-sans border-t border-ry-burgundy pt-6">
              <div className="flex items-start gap-3">
                <Truck className="w-4 h-4 text-amber-200 mt-0.5 shrink-0" />
                <div>
                  <strong className="text-ry-white font-medium block">Complimentary UK Courier Delivery</strong>
                  <span className="text-ry-ash/70 text-[11px]">Free delivery on orders over £150 with live milestone tracking.</span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <ShieldCheck className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
                <div>
                  <strong className="text-ry-white font-medium block">Klarna (Pay in 3) & Clearpay (Pay in 4)</strong>
                  <span className="text-ry-ash/70 text-[11px]">0% interest split installments available at checkout.</span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Gift className="w-4 h-4 text-amber-300 mt-0.5 shrink-0" />
                <div>
                  <strong className="text-ry-white font-medium block">10% Welcome Gift & 2 Samples</strong>
                  <span className="text-ry-ash/70 text-[11px]">Receive 10% off your inaugural order plus 2 complimentary samples.</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-ry-burgundy text-[11px] text-ry-ash/60">
            Already registered with Rycarix?{' '}
            <Link href="/login" className="text-ry-white underline hover:opacity-80">
              Sign In here &rarr;
            </Link>
          </div>
        </div>

        {/* Right Side: Comprehensive Registration Form */}
        <div className="lg:col-span-7 p-8 sm:p-12 flex flex-col justify-between">
          <div>
            <div className="mb-6">
              <span className="text-[10px] uppercase tracking-[0.3em] text-ry-stone block mb-1">
                Sanctuary Member Registration
              </span>
              <h2 className="font-serif text-2xl sm:text-3xl text-ry-onyx">
                Personal & Delivery Details
              </h2>
              <p className="text-xs text-ry-stone mt-1">
                Provide your delivery address now so future orders dispatch seamlessly.
              </p>
            </div>

            {/* Error Message */}
            {errorMessage && (
              <div className="mb-4 p-3.5 bg-red-50 border border-red-200 text-red-700 text-xs animate-fade-in flex items-center justify-between">
                <span>{errorMessage}</span>
                <button onClick={() => setErrorMessage('')} className="text-red-500 hover:text-red-800 text-sm">
                  &times;
                </button>
              </div>
            )}

            {/* Success Message */}
            {successMessage && (
              <div className="mb-4 p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs animate-fade-in flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{successMessage}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* SECTION 1: ACCOUNT CREDENTIALS */}
              <div>
                <h3 className="text-xs uppercase tracking-editorial font-medium text-ry-onyx border-b border-ry-ash/50 pb-2 mb-3 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-ry-stone" />
                  Account Credentials
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="col-span-2 sm:col-span-1">
                    <label className="block text-[10px] uppercase tracking-editorial text-ry-stone mb-1.5">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Lady Eleanor Vance"
                      className="w-full px-3.5 py-2.5 text-xs bg-ry-pearl/50 border border-ry-ash focus:outline-none focus:border-ry-onyx text-ry-onyx placeholder-ry-stone transition-colors"
                    />
                  </div>

                  <div className="col-span-2 sm:col-span-1">
                    <label className="block text-[10px] uppercase tracking-editorial text-ry-stone mb-1.5">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="client@atelier.com"
                      className="w-full px-3.5 py-2.5 text-xs bg-ry-pearl/50 border border-ry-ash focus:outline-none focus:border-ry-onyx text-ry-onyx placeholder-ry-stone transition-colors"
                    />
                  </div>

                  <div className="col-span-2 sm:col-span-1">
                    <label className="block text-[10px] uppercase tracking-editorial text-ry-stone mb-1.5">
                      Password * (min 6 characters)
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full pl-3.5 pr-10 py-2.5 text-xs bg-ry-pearl/50 border border-ry-ash focus:outline-none focus:border-ry-onyx text-ry-onyx placeholder-ry-stone transition-colors"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-ry-stone hover:text-ry-onyx"
                      >
                        {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  <div className="col-span-2 sm:col-span-1">
                    <label className="block text-[10px] uppercase tracking-editorial text-ry-stone mb-1.5">
                      Phone Number (for Courier SMS Tracking)
                    </label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+44 7700 900077"
                      className="w-full px-3.5 py-2.5 text-xs bg-ry-pearl/50 border border-ry-ash focus:outline-none focus:border-ry-onyx text-ry-onyx placeholder-ry-stone transition-colors"
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 2: DELIVERY ADDRESS */}
              <div>
                <h3 className="text-xs uppercase tracking-editorial font-medium text-ry-onyx border-b border-ry-ash/50 pb-2 mb-3 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-ry-stone" />
                  Primary Delivery Address
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="col-span-1 sm:col-span-3">
                    <label className="block text-[10px] uppercase tracking-editorial text-ry-stone mb-1.5">
                      Street Address & Apartment / Suite *
                    </label>
                    <input
                      type="text"
                      required
                      value={street}
                      onChange={(e) => setStreet(e.target.value)}
                      placeholder="Flat 4B, 18 Grosvenor Gardens"
                      className="w-full px-3.5 py-2.5 text-xs bg-ry-pearl/50 border border-ry-ash focus:outline-none focus:border-ry-onyx text-ry-onyx placeholder-ry-stone transition-colors"
                    />
                  </div>

                  <div className="col-span-1">
                    <label className="block text-[10px] uppercase tracking-editorial text-ry-stone mb-1.5">
                      City / Town *
                    </label>
                    <input
                      type="text"
                      required
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="London"
                      className="w-full px-3.5 py-2.5 text-xs bg-ry-pearl/50 border border-ry-ash focus:outline-none focus:border-ry-onyx text-ry-onyx placeholder-ry-stone transition-colors"
                    />
                  </div>

                  <div className="col-span-1">
                    <label className="block text-[10px] uppercase tracking-editorial text-ry-stone mb-1.5">
                      County / Region
                    </label>
                    <input
                      type="text"
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                      placeholder="Greater London"
                      className="w-full px-3.5 py-2.5 text-xs bg-ry-pearl/50 border border-ry-ash focus:outline-none focus:border-ry-onyx text-ry-onyx placeholder-ry-stone transition-colors"
                    />
                  </div>

                  <div className="col-span-1">
                    <label className="block text-[10px] uppercase tracking-editorial text-ry-stone mb-1.5">
                      Postcode / ZIP *
                    </label>
                    <input
                      type="text"
                      required
                      value={postalCode}
                      onChange={(e) => setPostalCode(e.target.value)}
                      placeholder="SW1W 0DH"
                      className="w-full px-3.5 py-2.5 text-xs bg-ry-pearl/50 border border-ry-ash focus:outline-none focus:border-ry-onyx text-ry-onyx placeholder-ry-stone transition-colors"
                    />
                  </div>

                  <div className="col-span-1 sm:col-span-3">
                    <label className="block text-[10px] uppercase tracking-editorial text-ry-stone mb-1.5">
                      Country / Territory *
                    </label>
                    <select
                      value={country}
                      onChange={(e) => setCountry(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-xs bg-ry-pearl/50 border border-ry-ash focus:outline-none focus:border-ry-onyx text-ry-onyx transition-colors"
                    >
                      <option value="United Kingdom">United Kingdom (Free over £150 via Evri & Royal Mail)</option>
                      <option value="United States">United States (FedEx Express)</option>
                      <option value="France">France (DHL Express EU)</option>
                      <option value="Germany">Germany (DHL Express EU)</option>
                      <option value="Canada">Canada</option>
                      <option value="Australia">Australia</option>
                    </select>
                  </div>

                  <div className="col-span-1 sm:col-span-3">
                    <label className="block text-[10px] uppercase tracking-editorial text-ry-stone mb-1.5">
                      Delivery Safe Place / Gate Instructions (Optional)
                    </label>
                    <input
                      type="text"
                      value={deliveryNote}
                      onChange={(e) => setDeliveryNote(e.target.value)}
                      placeholder="e.g. Leave in porch or with concierge at reception"
                      className="w-full px-3.5 py-2.5 text-xs bg-ry-pearl/50 border border-ry-ash focus:outline-none focus:border-ry-onyx text-ry-onyx placeholder-ry-stone transition-colors"
                    />
                  </div>
                </div>
              </div>

              {/* Newsletter Opt-in */}
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="newsletter"
                  checked={newsletterOptIn}
                  onChange={(e) => setNewsletterOptIn(e.target.checked)}
                  className="rounded border-ry-ash text-ry-burgundy focus:ring-ry-burgundy"
                />
                <label htmlFor="newsletter" className="text-xs text-ry-stone">
                  Send me complimentary sample announcements, member-only previews, and 10% welcome voucher.
                </label>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-4 bg-ry-burgundy text-ry-white text-xs uppercase tracking-editorial font-medium hover:bg-ry-burgundyLight transition-all flex items-center justify-center gap-2 disabled:opacity-70 shadow-luxury"
              >
                {isLoading ? (
                  <span>Registering Sanctuary Account...</span>
                ) : (
                  <>
                    <span>Create Sanctuary Account & Save Delivery Address</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

      </div>
    </div>
  );
}

export default function SignupPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-ry-pearl pt-32 text-center text-xs text-ry-stone">Loading Sanctuary Registration...</div>}>
      <SignupFormContent />
    </Suspense>
  );
}
