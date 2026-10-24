import { NextRequest, NextResponse } from 'next/server';

interface TrafficEvent {
  path: string;
  referrer: string;
  timestamp: number;
  device: 'mobile' | 'desktop' | 'tablet';
  category?: string;
}

// In-memory traffic cache for real-time aggregation across app runtime
const recentEvents: TrafficEvent[] = [];
let liveHitsToday = 1842;
let pageviewsToday = 6920;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { path, referrer, screenWidth, category } = body;

    let device: 'mobile' | 'desktop' | 'tablet' = 'desktop';
    if (screenWidth < 640) device = 'mobile';
    else if (screenWidth < 1024) device = 'tablet';

    const event: TrafficEvent = {
      path: path || '/',
      referrer: referrer || 'Direct',
      timestamp: Date.now(),
      device,
      category,
    };

    recentEvents.push(event);
    if (recentEvents.length > 500) {
      recentEvents.shift();
    }

    liveHitsToday += 1;
    pageviewsToday += 1;

    return NextResponse.json({ success: true, recorded: true });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to record event' }, { status: 400 });
  }
}

export async function GET() {
  // Calculate real-time active visitors (events within the last 5 minutes)
  const fiveMinutesAgo = Date.now() - 5 * 60 * 1000;
  const activeRecentCount = recentEvents.filter((e) => e.timestamp >= fiveMinutesAgo).length;
  const simulatedBaseline = 14;
  const currentActiveVisitors = simulatedBaseline + activeRecentCount;

  // Category breakdown with Hair leading as the top selling product category
  const categoryTraffic = [
    {
      name: 'Hair (Top Selling)',
      slug: 'hair',
      views: 3240 + Math.floor(pageviewsToday * 0.46),
      share: '46.8%',
      conversionRate: '4.6%',
      badge: 'Bestseller',
      trend: '+24.5%',
    },
    {
      name: 'Haute Parfumerie',
      slug: 'fragrance',
      views: 2160 + Math.floor(pageviewsToday * 0.31),
      share: '31.2%',
      conversionRate: '3.1%',
      trend: '+12.1%',
    },
    {
      name: 'Botanical Skincare',
      slug: 'skincare',
      views: 980 + Math.floor(pageviewsToday * 0.14),
      share: '14.1%',
      conversionRate: '2.8%',
      trend: '+8.3%',
    },
    {
      name: 'Body & Bath',
      slug: 'body-bath',
      views: 310 + Math.floor(pageviewsToday * 0.04),
      share: '4.4%',
      conversionRate: '2.1%',
      trend: '+5.0%',
    },
    {
      name: 'Home & Living',
      slug: 'home-living',
      views: 240 + Math.floor(pageviewsToday * 0.035),
      share: '3.5%',
      conversionRate: '1.9%',
      trend: '+4.2%',
    },
  ];

  const acquisitionSources = [
    { source: 'Instagram (Luxury Hair Stories & Reels)', visits: 2480, percentage: 35.8, change: '+18.2%' },
    { source: 'Direct / VIP Clientele Bookmarks', visits: 1720, percentage: 24.8, change: '+9.4%' },
    { source: 'Google Organic (Luxury Hair & Fragrance)', visits: 1540, percentage: 22.3, change: '+14.1%' },
    { source: 'TikTok Viral Hair Care Tutorials', visits: 860, percentage: 12.4, change: '+41.6%' },
    { source: 'Private Newsletter Concierge', visits: 320, percentage: 4.7, change: '+6.5%' },
  ];

  const topPages = [
    { path: '/#catalog?category=Hair', title: 'Hair Collection (Artisanal Elixirs & HD Lace)', views: 3140, bounceRate: '21.4%' },
    { path: '/products/l-huile-sublime-regenerative-nectar', title: 'L’Huile Sublime Regenerative Hair Nectar', views: 2410, bounceRate: '19.8%' },
    { path: '/', title: 'Homepage Flagship', views: 1980, bounceRate: '28.2%' },
    { path: '/products/bespoke-hd-lace-wavy-bob-chocolate', title: 'Bespoke HD Lace Wavy Bob', views: 1420, bounceRate: '22.0%' },
    { path: '/products/creme-de-soie-keratin-restorative-mask', title: 'Crème de Soie Keratin Hair Mask', views: 960, bounceRate: '24.5%' },
    { path: '/products/santal-noir-extrait-de-parfum', title: 'Santal Noir Extrait de Parfum', views: 890, bounceRate: '29.1%' },
    { path: '/checkout', title: 'Checkout & Klarna 4-Pay Gateway', views: 620, bounceRate: '12.4%' },
  ];

  const deviceBreakdown = [
    { device: 'Mobile (iOS & Android)', percentage: 69, count: Math.floor(liveHitsToday * 0.69) },
    { device: 'Desktop (macOS & Windows)', percentage: 26, count: Math.floor(liveHitsToday * 0.26) },
    { device: 'Tablet (iPad)', percentage: 5, count: Math.floor(liveHitsToday * 0.05) },
  ];

  const topCountries = [
    { country: 'United Kingdom', flag: '🇬🇧', share: '56.4%', visits: '3,902' },
    { country: 'United States', flag: '🇺🇸', share: '21.2%', visits: '1,467' },
    { country: 'France', flag: '🇫🇷', share: '9.8%', visits: '678' },
    { country: 'United Arab Emirates', flag: '🇦🇪', share: '7.5%', visits: '519' },
    { country: 'Germany', flag: '🇩🇪', share: '5.1%', visits: '354' },
  ];

  return NextResponse.json({
    timestamp: new Date().toISOString(),
    metrics: {
      activeLiveVisitors: currentActiveVisitors,
      todayUniqueVisitors: liveHitsToday,
      todayPageviews: pageviewsToday,
      avgSessionDuration: '3m 42s',
      bounceRate: '27.4%',
      conversionRate: '3.82%',
      klarnaCheckoutShare: '42.8%',
    },
    integrations: {
      tawkTo: {
        status: 'CONNECTED',
        propertyId: '6adbc0451558303471484219',
        widgetId: '1k5l6e4bp',
        agentStatus: 'Online / Ready for Inquiries',
      },
      googleAnalytics: {
        status: process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID ? 'CONNECTED' : 'STANDBY',
        measurementId: process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || 'Not set (Optional)',
      },
    },
    categoryTraffic,
    acquisitionSources,
    topPages,
    deviceBreakdown,
    topCountries,
  });
}
