'use client';

import { useEffect, useRef } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

export default function TrafficTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const lastTrackedPath = useRef<string | null>(null);

  useEffect(() => {
    const fullPath = searchParams?.toString()
      ? `${pathname}?${searchParams.toString()}`
      : pathname;

    if (lastTrackedPath.current === fullPath) {
      return;
    }
    lastTrackedPath.current = fullPath;

    try {
      const payload = {
        path: fullPath,
        referrer: typeof document !== 'undefined' ? document.referrer : '',
        screenWidth: typeof window !== 'undefined' ? window.innerWidth : 1280,
        category: fullPath.includes('hair') || fullPath.includes('L-Huile') || fullPath.includes('creme-de-soie') || fullPath.includes('wavy-bob')
          ? 'Hair'
          : undefined,
      };

      if (typeof navigator !== 'undefined' && navigator.sendBeacon) {
        const blob = new Blob([JSON.stringify(payload)], { type: 'application/json' });
        navigator.sendBeacon('/api/analytics/traffic', blob);
      } else {
        fetch('/api/analytics/traffic', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
          keepalive: true,
        }).catch(() => {
          // Non-blocking telemetry
        });
      }
    } catch {
      // Ignore background analytics logging errors
    }
  }, [pathname, searchParams]);

  return null;
}
