'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  User,
  Eye,
  EyeOff,
  ShieldCheck,
  ArrowRight,
  CheckCircle2,
  Crown,
  Truck,
  MapPin,
} from 'lucide-react';
import { useAuthStore } from '@/lib/store/useAuthStore';

type SignupFieldErrors = {
  name?: string;
  email?: string;
  password?: string;
};

function SignupFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get('redirect');

  const { signup } = useAuthStore();

  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [fieldErrors, setFieldErrors] = useState<SignupFieldErrors>({});

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

  const clearFieldError = (field: keyof SignupFieldErrors) => {
    setFieldErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
  };

  const validateEmailField = (val: string) => {
    const trimmed = val.trim();
    if (!trimmed) return 'Email address is required.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) return 'Enter a valid email address.';
    return '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    const nameErr = !name.trim() ? 'Full name is required.' : '';
    const emailErr = validateEmailField(email);
    const passErr =
      !password || password.length < 6 ? 'Password must be at least 6 characters.' : '';

    if (nameErr || emailErr || passErr) {
      setFieldErrors({
        name: nameErr || undefined,
        email: emailErr || undefined,
        password: passErr || undefined,
      });
      return;
    }

    setIsLoading(true);
    try {
      const hasAddressInput = street.trim() || city.trim() || postalCode.trim();
      const deliveryAddress = hasAddressInput
        ? {
            street: deliveryNote.trim()
              ? `${street.trim()} (Note: ${deliveryNote.trim()})`
              : street.trim(),
            city: city.trim(),
            state: state.trim(),
            postalCode: postalCode.trim(),
            country,
          }
        : undefined;

      const res = await signup(name, email, password, deliveryAddress, phone);
      if (res.success) {
        setSuccessMessage('Welcome to Rycarix. Your client account and delivery details have been saved.');
        setTimeout(() => {
          router.push(redirectUrl || '/dashboard/user');
        }, 350);
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
              <span>Customer Account Creation</span>
            </div>

            <h1 className="font-serif text-3xl sm:text-4xl text-ry-white font-normal leading-tight">
              Create Your Private Rycarix Account
            </h1>

            <p className="text-xs text-ry-ash/80 mt-4 leading-relaxed font-light">
              Save your contact phone number and delivery address for streamlined checkout, live dispatch updates via Royal Mail &amp; international couriers, and split-payment flexibility.
            </p>

            <div className="mt-8 space-y-4 text-xs font-sans border-t border-ry-burgundy pt-6">
              <div className="flex items-start gap-3">
                <Truck className="w-4 h-4 text-amber-200 mt-0.5 shrink-0" />
                <div>
                  <strong className="text-ry-white font-medium block">Tracked Courier Delivery</strong>
                  <span className="text-ry-ash/70 text-[11px]">UK Standard £3.50, Free over £100, and tracked worldwide shipping.</span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <ShieldCheck className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
                <div>
                  <strong className="text-ry-white font-medium block">Secure Encrypted Checkout</strong>
                  <span className="text-ry-ash/70 text-[11px]">Bank-grade encryption and privacy assurance.</span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Crown className="w-4 h-4 text-amber-300 mt-0.5 shrink-0" />
                <div>
                  <strong className="text-ry-white font-medium block">VIP Member Access</strong>
                  <span className="text-ry-ash/70 text-[11px]">Private invitations to limited releases and events.</span>
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
                Account Registration
              </span>
              <h2 className="font-serif text-2xl sm:text-3xl text-ry-onyx">
                Personal &amp; Delivery Details
              </h2>
              <p className="text-xs text-ry-stone mt-1">
                Provide your contact number and delivery address now so future orders dispatch seamlessly.
              </p>
            </div>

            {errorMessage && (
              <div className="mb-4 p-3.5 bg-red-50 border border-red-200 text-red-700 text-xs animate-fade-in flex items-center justify-between">
                <span>{errorMessage}</span>
                <button
                  type="button"
                  onClick={() => setErrorMessage('')}
                  className="text-red-500 hover:text-red-800 text-sm"
                  aria-label="Dismiss error"
                >
                  &times;
                </button>
              </div>
            )}

            {successMessage && (
              <div className="mb-4 p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs animate-fade-in flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{successMessage}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} noValidate className="space-y-6">
              {/* SECTION 1: ACCOUNT CREDENTIALS */}
              <div>
                <h3 className="text-xs uppercase tracking-editorial font-medium text-ry-onyx border-b border-ry-ash/50 pb-2 mb-3 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-ry-stone" />
                  Account Credentials
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="col-span-2 sm:col-span-1">
                    <label
                      htmlFor="reg-name"
                      className="block text-[10px] uppercase tracking-editorial text-ry-stone mb-1.5"
                    >
                      Full Name *
                    </label>
                    <input
                      id="reg-name"
                      name="name"
                      type="text"
                      autoComplete="name"
                      required
                      value={name}
                      onChange={(e) => {
                        setName(e.target.value);
                        clearFieldError('name');
                      }}
                      onBlur={() => {
                        if (!name.trim()) setFieldErrors((p) => ({ ...p, name: 'Full name is required.' }));
                      }}
                      aria-invalid={Boolean(fieldErrors.name)}
                      placeholder="Lady Eleanor Vance"
                      className={`w-full px-3.5 py-2.5 text-xs bg-ry-pearl/50 border focus:outline-none focus:border-ry-onyx text-ry-onyx placeholder-ry-stone transition-colors ${
                        fieldErrors.name ? 'border-red-500' : 'border-ry-ash'
                      }`}
                    />
                    {fieldErrors.name && (
                      <p className="mt-1 text-[11px] text-red-600">{fieldErrors.name}</p>
                    )}
                  </div>

                  <div className="col-span-2 sm:col-span-1">
                    <label
                      htmlFor="reg-email"
                      className="block text-[10px] uppercase tracking-editorial text-ry-stone mb-1.5"
                    >
                      Email Address *
                    </label>
                    <input
                      id="reg-email"
                      name="email"
                      type="email"
                      autoComplete="username"
                      spellCheck={false}
                      required
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        clearFieldError('email');
                      }}
                      onBlur={() => {
                        const err = validateEmailField(email);
                        if (err) setFieldErrors((p) => ({ ...p, email: err }));
                      }}
                      aria-invalid={Boolean(fieldErrors.email)}
                      placeholder="client@rycarix.com"
                      className={`w-full px-3.5 py-2.5 text-xs bg-ry-pearl/50 border focus:outline-none focus:border-ry-onyx text-ry-onyx placeholder-ry-stone transition-colors ${
                        fieldErrors.email ? 'border-red-500' : 'border-ry-ash'
                      }`}
                    />
                    {fieldErrors.email && (
                      <p className="mt-1 text-[11px] text-red-600">{fieldErrors.email}</p>
                    )}
                  </div>

                  <div className="col-span-2 sm:col-span-1">
                    <label
                      htmlFor="reg-password"
                      className="block text-[10px] uppercase tracking-editorial text-ry-stone mb-1.5"
                    >
                      Password * (min 6 characters)
                    </label>
                    <div className="relative">
                      <input
                        id="reg-password"
                        name="password"
                        type={showPassword ? 'text' : 'password'}
                        autoComplete="new-password"
                        required
                        value={password}
                        onChange={(e) => {
                          setPassword(e.target.value);
                          clearFieldError('password');
                        }}
                        onBlur={() => {
                          if (!password || password.length < 6) {
                            setFieldErrors((p) => ({
                              ...p,
                              password: 'Password must be at least 6 characters.',
                            }));
                          }
                        }}
                        aria-invalid={Boolean(fieldErrors.password)}
                        placeholder="••••••••"
                        className={`w-full pl-3.5 pr-10 py-2.5 text-xs bg-ry-pearl/50 border focus:outline-none focus:border-ry-onyx text-ry-onyx placeholder-ry-stone transition-colors ${
                          fieldErrors.password ? 'border-red-500' : 'border-ry-ash'
                        }`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-ry-stone hover:text-ry-onyx"
                        aria-label="Toggle password visibility"
                      >
                        {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                    {fieldErrors.password && (
                      <p className="mt-1 text-[11px] text-red-600">{fieldErrors.password}</p>
                    )}
                  </div>

                  <div className="col-span-2 sm:col-span-1">
                    <label
                      htmlFor="reg-phone"
                      className="block text-[10px] uppercase tracking-editorial text-ry-stone mb-1.5"
                    >
                      Phone Number (for Courier SMS Tracking)
                    </label>
                    <input
                      id="reg-phone"
                      name="phone"
                      type="tel"
                      autoComplete="tel"
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
                  Primary Delivery Address (Optional)
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="col-span-1 sm:col-span-3">
                    <label
                      htmlFor="reg-street"
                      className="block text-[10px] uppercase tracking-editorial text-ry-stone mb-1.5"
                    >
                      Street Address &amp; Apartment / Suite
                    </label>
                    <input
                      id="reg-street"
                      name="street"
                      type="text"
                      autoComplete="street-address"
                      value={street}
                      onChange={(e) => setStreet(e.target.value)}
                      placeholder="Flat 4B, 18 Grosvenor Gardens"
                      className="w-full px-3.5 py-2.5 text-xs bg-ry-pearl/50 border border-ry-ash focus:outline-none focus:border-ry-onyx text-ry-onyx placeholder-ry-stone transition-colors"
                    />
                  </div>

                  <div className="col-span-1">
                    <label
                      htmlFor="reg-city"
                      className="block text-[10px] uppercase tracking-editorial text-ry-stone mb-1.5"
                    >
                      City / Town
                    </label>
                    <input
                      id="reg-city"
                      name="city"
                      type="text"
                      autoComplete="address-level2"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="London"
                      className="w-full px-3.5 py-2.5 text-xs bg-ry-pearl/50 border border-ry-ash focus:outline-none focus:border-ry-onyx text-ry-onyx placeholder-ry-stone transition-colors"
                    />
                  </div>

                  <div className="col-span-1">
                    <label
                      htmlFor="reg-state"
                      className="block text-[10px] uppercase tracking-editorial text-ry-stone mb-1.5"
                    >
                      County / Region
                    </label>
                    <input
                      id="reg-state"
                      name="state"
                      type="text"
                      autoComplete="address-level1"
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                      placeholder="Greater London"
                      className="w-full px-3.5 py-2.5 text-xs bg-ry-pearl/50 border border-ry-ash focus:outline-none focus:border-ry-onyx text-ry-onyx placeholder-ry-stone transition-colors"
                    />
                  </div>

                  <div className="col-span-1">
                    <label
                      htmlFor="reg-postal"
                      className="block text-[10px] uppercase tracking-editorial text-ry-stone mb-1.5"
                    >
                      Postcode / ZIP (Optional)
                    </label>
                    <input
                      id="reg-postal"
                      name="postalCode"
                      type="text"
                      autoComplete="postal-code"
                      value={postalCode}
                      onChange={(e) => setPostalCode(e.target.value)}
                      placeholder="SW1W 0DH"
                      className="w-full px-3.5 py-2.5 text-xs bg-ry-pearl/50 border border-ry-ash focus:outline-none focus:border-ry-onyx text-ry-onyx placeholder-ry-stone transition-colors"
                    />
                  </div>

                  <div className="col-span-1 sm:col-span-3">
                    <label
                      htmlFor="reg-country"
                      className="block text-[10px] uppercase tracking-editorial text-ry-stone mb-1.5"
                    >
                      Country / Territory
                    </label>
                    <select
                      id="reg-country"
                      name="country"
                      autoComplete="country-name"
                      value={country}
                      onChange={(e) => setCountry(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-xs bg-ry-pearl/50 border border-ry-ash focus:outline-none focus:border-ry-onyx text-ry-onyx transition-colors"
                    >
                      <option value="United Kingdom">United Kingdom</option>
                      <option value="Ireland">Ireland (Europe)</option>
                      <option value="France">France (Europe)</option>
                      <option value="Germany">Germany (Europe)</option>
                      <option value="United States">United States (USA &amp; Canada)</option>
                      <option value="Canada">Canada (USA &amp; Canada)</option>
                      <option value="Australia">Australia (Rest of World)</option>
                    </select>
                  </div>

                  <div className="col-span-1 sm:col-span-3">
                    <label
                      htmlFor="reg-note"
                      className="block text-[10px] uppercase tracking-editorial text-ry-stone mb-1.5"
                    >
                      Delivery Safe Place / Gate Instructions (Optional)
                    </label>
                    <input
                      id="reg-note"
                      name="deliveryNote"
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
                  name="newsletter"
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
                  <span>Registering Account...</span>
                ) : (
                  <>
                    <span>Create Account &amp; Save Profile</span>
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
    <Suspense fallback={<div className="min-h-screen bg-ry-pearl pt-32 text-center text-xs text-ry-stone">Loading Registration...</div>}>
      <SignupFormContent />
    </Suspense>
  );
}
