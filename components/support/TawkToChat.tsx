'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/lib/store/useAuthStore';

interface TawkAPI {
  onLoad?: () => void;
  setAttributes?: (attributes: Record<string, unknown>, callback?: (error?: unknown) => void) => void;
  maximize?: () => void;
  minimize?: () => void;
  toggle?: () => void;
  popup?: () => void;
  showWidget?: () => void;
  hideWidget?: () => void;
  getStatus?: () => string;
  isChatOngoing?: () => boolean;
  [key: string]: unknown;
}

declare global {
  interface Window {
    Tawk_API?: TawkAPI;
    Tawk_LoadStart?: Date;
  }
}

export default function TawkToChat() {
  const { user, isAuthenticated } = useAuthStore();

  useEffect(() => {
    // Property and Widget IDs provided for Rycarix Live Concierge
    const propertyId = process.env.NEXT_PUBLIC_TAWK_PROPERTY_ID || '6adbc0451558303471484219';
    const widgetId = process.env.NEXT_PUBLIC_TAWK_WIDGET_ID || '1k5l6e4bp';

    // Prevent duplicate script insertion
    if (document.getElementById('tawk-script')) {
      return;
    }

    window.Tawk_API = window.Tawk_API || {};
    window.Tawk_LoadStart = new Date();

    const s1 = document.createElement('script');
    s1.id = 'tawk-script';
    s1.async = true;
    s1.src = `https://embed.tawk.to/${propertyId}/${widgetId}`;
    s1.charset = 'UTF-8';
    s1.setAttribute('crossorigin', '*');

    // Attach user information when Tawk loads
    window.Tawk_API.onLoad = function () {
      if (isAuthenticated && user && window.Tawk_API?.setAttributes) {
        window.Tawk_API.setAttributes({
          name: user.name,
          email: user.email,
          role: user.role,
        });
      }
    };

    const firstScript = document.getElementsByTagName('script')[0];
    if (firstScript && firstScript.parentNode) {
      firstScript.parentNode.insertBefore(s1, firstScript);
    } else {
      document.body.appendChild(s1);
    }

    return () => {
      // Keep script active across client transitions for persistent chat
    };
  }, [isAuthenticated, user]);

  return null;
}
