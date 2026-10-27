import type { Metadata } from 'next';
import { Suspense } from 'react';
import { Playfair_Display, Inter } from 'next/font/google';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import CartDrawer from '@/components/cart/CartDrawer';
import TawkToChat from '@/components/support/TawkToChat';
import GoogleAnalytics from '@/components/analytics/GoogleAnalytics';
import TrafficTracker from '@/components/analytics/TrafficTracker';
import './globals.css';

const playfair = Playfair_Display({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-playfair',
  weight: ['400', '500', '600', '700'],
  style: ['normal', 'italic'],
});

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
  weight: ['300', '400', '500', '600'],
});

export const metadata: Metadata = {
  title: 'Rycarix | Luxury Botanical Hair, Perfumes & Skincare',
  description:
    'Shop artisanal botanical hair, luxury fragrances, clean skincare, and scented candles. Tracked delivery via Evri & Royal Mail.',
  keywords: [
    'Rycarix',
    'Luxury Hair',
    'Artisanal Hair Formulations',
    'Hair Nectars',
    'Perfume',
    'Fragrance',
    'Botanical Skincare',
    'Scented Candles',
    'Klarna Pay in 3',
    'Clearpay Pay in 4',
  ],
  openGraph: {
    title: 'Rycarix | Luxury Botanical Hair, Perfumes & Skincare',
    description: 'Shop artisanal botanical hair, luxury fragrances, clean skincare, and scented candles.',
    url: 'https://www.rycarix.com',
    siteName: 'Rycarix',
    locale: 'en_US',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${playfair.variable} ${inter.variable}`}>
      <body className="bg-ry-pearl text-ry-onyx min-h-screen flex flex-col selection:bg-ry-burgundy selection:text-ry-white">
        <Header />
        <div className="flex-1">{children}</div>
        <CartDrawer />
        <Footer />
        <TawkToChat />
        <GoogleAnalytics />
        <Suspense fallback={null}>
          <TrafficTracker />
        </Suspense>
      </body>
    </html>
  );
}
