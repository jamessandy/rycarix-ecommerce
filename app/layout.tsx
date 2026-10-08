import type { Metadata } from 'next';
import { Playfair_Display, Inter } from 'next/font/google';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import CartDrawer from '@/components/cart/CartDrawer';
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
  title: 'Rycarix | Luxury Perfumes, Hair Care & Skincare',
  description:
    'Shop luxury fragrances, botanical hair care, clean skincare, and scented candles. Free shipping on orders over £150 and Klarna Pay in 4.',
  keywords: [
    'Rycarix',
    'Perfume',
    'Fragrance',
    'Luxury Hair Care',
    'Botanical Skincare',
    'Scented Candles',
    'Klarna',
  ],
  openGraph: {
    title: 'Rycarix | Luxury Perfumes, Hair Care & Skincare',
    description: 'Shop luxury fragrances, botanical hair care, clean skincare, and scented candles.',
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
      </body>
    </html>
  );
}
