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
  KeyRound,
  Crown,
} from 'lucide-react';
import { useAuthStore, DEMO_USERS } from '@/lib/store/useAuthStore';

function LoginFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get('redirect');

  const { login, signup, loginAsDemo, isAuthenticated, user } = useAuthStore();

  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Form Fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [newsletterOptIn, setNewsletterOptIn] = useState(true);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!email || !password) {
      setErrorMessage('Please provide both your email and password.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await login(email, password);
      if (res.success) {
        setSuccessMessage('Welcome back!');
        setTimeout(() => {
          if (redirectUrl) {
            router.push(redirectUrl);
          } else if (email.toLowerCase().includes('admin')) {
            router.push('/dashboard/admin');
          } else {
            router.push('/dashboard/user');
          }
        }, 400);
      } else {
        setErrorMessage(res.error || 'Invalid credentials.');
      }
    } catch {
      setErrorMessage('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!name || !email || !password) {
      setErrorMessage('Please fill in all required fields.');
      return;
    }

    if (password.length < 6) {
      setErrorMessage('Password must be at least 6 characters.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await signup(name, email, password);
      if (res.success) {
        setSuccessMessage('Your account has been created successfully!');
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

  const handleQuickDemo = (roleKey: 'VIP_CLIENT' | 'ADMIN' | 'USER') => {
    setIsLoading(true);
    loginAsDemo(roleKey);
    setTimeout(() => {
      setIsLoading(false);
      if (roleKey === 'ADMIN') {
        router.push(redirectUrl || '/dashboard/admin');
      } else {
        router.push(redirectUrl || '/dashboard/user');
      }
    }, 300);
  };

  return (
    <div className="min-h-screen bg-ry-pearl pt-28 pb-20 px-4 sm:px-6 lg:px-8 flex items-center justify-center font-sans">
      <div className="max-w-5xl w-full grid grid-cols-1 lg:grid-cols-12 bg-ry-white border border-ry-ash/70 shadow-xl overflow-hidden">
        
        {/* Left Side: Benefits & Demo Accounts */}
        <div className="lg:col-span-5 bg-ry-wine text-ry-white p-8 sm:p-12 flex flex-col justify-between relative overflow-hidden">
          <div className="relative z-10">
            <span className="text-[10px] uppercase tracking-[0.35em] text-ry-stone block mb-2 font-medium">
              Customer Portal
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl text-ry-white font-normal leading-tight">
              Sign In to Your Account
            </h2>
            <p className="text-xs text-ry-stone mt-4 leading-relaxed">
              Track packages in real time, view your order history, manage saved addresses, and see your Klarna payment schedules.
            </p>

            <div className="mt-8 space-y-4 text-xs font-sans border-t border-ry-burgundy pt-6">
              <div className="flex items-start gap-3">
                <Crown className="w-4 h-4 text-amber-300 mt-0.5 shrink-0" />
                <div>
                  <strong className="text-ry-white font-medium block">Member Perks</strong>
                  <span className="text-ry-stone text-[11px]">Free shipping on orders over £150 and early access to sales.</span>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <ShieldCheck className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
                <div>
                  <strong className="text-ry-white font-medium block">Klarna & Stripe Payments</strong>
                  <span className="text-ry-stone text-[11px]">Manage Pay in 4 installments and stored cards securely.</span>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Sparkles className="w-4 h-4 text-amber-200 mt-0.5 shrink-0" />
                <div>
                  <strong className="text-ry-white font-medium block">Wishlist & Orders</strong>
                  <span className="text-ry-stone text-[11px]">Save products to your wishlist and download order invoices.</span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Demo Switcher */}
          <div className="relative z-10 mt-10 pt-6 border-t border-ry-burgundy">
            <span className="text-[9px] uppercase tracking-editorial text-amber-200/90 font-medium block mb-2.5 flex items-center gap-1.5">
              <KeyRound className="w-3 h-3 text-amber-300" /> Demo Test Accounts
            </span>
            <div className="space-y-2">
              <button
                type="button"
                onClick={() => handleQuickDemo('VIP_CLIENT')}
                className="w-full text-left p-2.5 bg-ry-burgundyDeep/80 hover:bg-ry-burgundyDeep border border-ry-burgundyLight/30 hover:border-ry-white/50 transition-all flex items-center justify-between group"
              >
                <div>
                  <div className="text-xs text-ry-white font-serif group-hover:text-amber-200 transition-colors">
                    Éléonore de Vance (Customer)
                  </div>
                  <div className="text-[10px] text-ry-stone">
                    VIP Member • Has orders & Klarna schedule
                  </div>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-ry-stone group-hover:text-white group-hover:translate-x-1 transition-all" />
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemo('ADMIN')}
                className="w-full text-left p-2.5 bg-ry-burgundyDeep/80 hover:bg-ry-burgundyDeep border border-ry-burgundyLight/30 hover:border-ry-white/50 transition-all flex items-center justify-between group"
              >
                <div>
                  <div className="text-xs text-ry-white font-serif group-hover:text-amber-200 transition-colors">
                    Henri Laurent (Store Admin)
                  </div>
                  <div className="text-[10px] text-ry-stone">
                    Admin • Product catalog & inventory management
                  </div>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-ry-stone group-hover:text-white group-hover:translate-x-1 transition-all" />
              </button>
            </div>
          </div>
        </div>

        {/* Right Side: Authentication Forms */}
        <div className="lg:col-span-7 p-8 sm:p-12 flex flex-col justify-center">
          
          {/* Status Message if already logged in */}
          {isAuthenticated && user && (
            <div className="mb-6 p-3.5 bg-ry-pearl border border-ry-ash flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-ry-stone">
                  Logged in as <strong className="text-ry-onyx">{user.name}</strong> ({user.title})
                </span>
              </div>
              <Link
                href={user.role === 'ADMIN' ? '/dashboard/admin' : '/dashboard/user'}
                className="underline font-medium hover:text-ry-stone uppercase text-[10px] tracking-editorial"
              >
                Go to Account &rarr;
              </Link>
            </div>
          )}

          {/* Toggle Header Tabs */}
          <div className="flex border-b border-ry-ash mb-8 text-xs uppercase tracking-editorial font-medium">
            <button
              type="button"
              onClick={() => {
                setMode('signin');
                setErrorMessage('');
                setSuccessMessage('');
              }}
              className={`pb-3.5 pr-6 font-medium transition-all relative ${
                mode === 'signin'
                  ? 'text-ry-onyx border-b-2 border-ry-onyx'
                  : 'text-ry-stone hover:text-ry-onyx'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('signup');
                setErrorMessage('');
                setSuccessMessage('');
              }}
              className={`pb-3.5 px-6 font-medium transition-all relative ${
                mode === 'signup'
                  ? 'text-ry-onyx border-b-2 border-ry-onyx'
                  : 'text-ry-stone hover:text-ry-onyx'
              }`}
            >
              Create Account
            </button>
          </div>

          {/* Feedback Alerts */}
          {errorMessage && (
            <div className="mb-6 p-3.5 bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2 animate-fade-in">
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="mb-6 p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2 animate-fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Form 1: Sign In */}
          {mode === 'signin' && (
            <form onSubmit={handleSignIn} className="space-y-5 animate-fade-in">
              <div>
                <label className="block text-[10px] uppercase tracking-editorial text-ry-stone mb-1.5 font-medium">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-ry-stone absolute left-3.5 top-3.5" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    required
                    className="w-full pl-10 pr-4 py-3 bg-ry-pearl border border-ry-ash text-xs text-ry-onyx placeholder-ry-stone/70 focus:outline-none focus:border-ry-onyx transition-colors"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-[10px] uppercase tracking-editorial text-ry-stone font-medium">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setEmail('eleonore.devance@luxury-atelier.com');
                      setPassword('password123');
                    }}
                    className="text-[10px] text-ry-stone hover:text-ry-onyx underline transition-colors"
                  >
                    Auto-fill demo user
                  </button>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-ry-stone absolute left-3.5 top-3.5" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    required
                    className="w-full pl-10 pr-10 py-3 bg-ry-pearl border border-ry-ash text-xs text-ry-onyx placeholder-ry-stone/70 focus:outline-none focus:border-ry-onyx transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-ry-stone hover:text-ry-onyx"
                    aria-label="Toggle password visibility"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-ry-stone">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    defaultChecked
                    className="w-3.5 h-3.5 rounded-none border-ry-ash text-ry-onyx accent-ry-onyx focus:ring-0"
                  />
                  <span className="text-[11px]">Remember me</span>
                </label>
                <span className="text-[11px] underline underline-offset-4 cursor-pointer hover:text-ry-onyx">
                  Forgot password?
                </span>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 bg-ry-burgundy text-ry-white text-xs uppercase tracking-editorial font-medium hover:bg-ry-burgundyLight transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-sm"
              >
                {isLoading ? (
                  <span>Signing In...</span>
                ) : (
                  <>
                    <span>Sign In</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <div className="pt-4 text-center text-xs text-ry-stone">
                Don’t have an account?{' '}
                <button
                  type="button"
                  onClick={() => setMode('signup')}
                  className="text-ry-onyx font-medium underline underline-offset-4"
                >
                  Create one here
                </button>
              </div>
            </form>
          )}

          {/* Form 2: Sign Up */}
          {mode === 'signup' && (
            <form onSubmit={handleSignUp} className="space-y-5 animate-fade-in">
              <div>
                <label className="block text-[10px] uppercase tracking-editorial text-ry-stone mb-1.5 font-medium">
                  Full Name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-ry-stone absolute left-3.5 top-3.5" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Sarah Jenkins"
                    required
                    className="w-full pl-10 pr-4 py-3 bg-ry-pearl border border-ry-ash text-xs text-ry-onyx placeholder-ry-stone/70 focus:outline-none focus:border-ry-onyx transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-editorial text-ry-stone mb-1.5 font-medium">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-ry-stone absolute left-3.5 top-3.5" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    required
                    className="w-full pl-10 pr-4 py-3 bg-ry-pearl border border-ry-ash text-xs text-ry-onyx placeholder-ry-stone/70 focus:outline-none focus:border-ry-onyx transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-editorial text-ry-stone mb-1.5 font-medium">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-ry-stone absolute left-3.5 top-3.5" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="At least 6 characters"
                    required
                    className="w-full pl-10 pr-10 py-3 bg-ry-pearl border border-ry-ash text-xs text-ry-onyx placeholder-ry-stone/70 focus:outline-none focus:border-ry-onyx transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-ry-stone hover:text-ry-onyx"
                    aria-label="Toggle password visibility"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Newsletter Perk Checkbox */}
              <div className="p-3.5 bg-ry-pearl border border-ry-ash/70 space-y-2">
                <label className="flex items-start gap-2.5 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={newsletterOptIn}
                    onChange={(e) => setNewsletterOptIn(e.target.checked)}
                    className="mt-0.5 w-3.5 h-3.5 rounded-none border-ry-ash text-ry-onyx accent-ry-onyx focus:ring-0"
                  />
                  <span className="text-[11px] text-ry-charcoal leading-relaxed">
                    Sign up for the newsletter to get <strong>10% off</strong> your first order (code: <strong>RYCARIX10</strong>) and news about special sales.
                  </span>
                </label>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 bg-ry-burgundy text-ry-white text-xs uppercase tracking-editorial font-medium hover:bg-ry-burgundyLight transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-sm"
              >
                {isLoading ? (
                  <span>Creating Account...</span>
                ) : (
                  <>
                    <span>Create Account</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <div className="pt-4 text-center text-xs text-ry-stone">
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => setMode('signin')}
                  className="text-ry-onyx font-medium underline underline-offset-4"
                >
                  Sign in
                </button>
              </div>
            </form>
          )}

        </div>

      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-ry-pearl pt-32 text-center text-xs text-ry-stone">Loading...</div>}>
      <LoginFormContent />
    </Suspense>
  );
}
