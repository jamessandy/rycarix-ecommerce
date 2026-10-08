'use client';

import React from 'react';
import { Truck, CreditCard, Gift, RotateCcw, ShieldCheck } from 'lucide-react';

export default function PerksBanner() {
  const perks = [
    {
      icon: Truck,
      title: 'Free UK Delivery',
      description: 'Free UK shipping via Evri & Royal Mail on orders over £150.',
    },
    {
      icon: CreditCard,
      title: 'Klarna Pay in 4',
      description: 'Split your purchase into 4 interest-free payments.',
      badge: '0% APR',
    },
    {
      icon: Gift,
      title: '2 Free Samples',
      description: 'Every order includes 2 complimentary samples and gift box.',
    },
    {
      icon: RotateCcw,
      title: '30-Day Returns',
      description: 'Hassle-free returns and exchanges within 30 days.',
    },
  ];

  return (
    <section className="bg-ry-white border-y border-ry-ash/70 py-6 sm:py-8 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {perks.map((perk, index) => {
            const Icon = perk.icon;
            return (
              <div
                key={perk.title}
                className="flex items-start gap-4 p-2 group"
              >
                <div className="w-10 h-10 rounded-full bg-ry-pearl border border-ry-ash/70 flex items-center justify-center shrink-0 text-ry-onyx group-hover:bg-ry-burgundy group-hover:text-ry-white transition-colors">
                  <Icon className="w-4 h-4 stroke-[1.6]" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-xs uppercase tracking-editorial font-medium text-ry-onyx">
                      {perk.title}
                    </h3>
                    {perk.badge && (
                      <span className="text-[9px] px-1.5 py-0.2 bg-[#FFA8CD]/60 text-black font-semibold rounded">
                        {perk.badge}
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-ry-stone leading-relaxed mt-1">
                    {perk.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
