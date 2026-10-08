'use client';

import React from 'react';

const PHILOSOPHIES = [
  {
    number: '01',
    title: 'Ethically Sourced Ingredients',
    subtitle: 'Quality Over Mass Production',
    description:
      'We work directly with growers and artisanal makers for our Mysore sandalwood, organic cold-pressed oils, hand-poured ceramic vessels, and genuine leather goods. Every raw material is ethically harvested with sustainable practices.',
    footnote: '100% Traceable Ingredients',
  },
  {
    number: '02',
    title: 'Clean, Effective Formulas',
    subtitle: 'No Harmful Chemicals',
    description:
      'All skincare and hair products are made without parabens, sulfates, silicones, or synthetic dyes. Perfumes are formulated at high concentrations (28% to 32% pure essence) for remarkable all-day longevity.',
    footnote: '100% Cruelty-Free',
  },
  {
    number: '03',
    title: 'Sustainable Packaging',
    subtitle: 'Recyclable Glass & Plastic-Free Shipping',
    description:
      'All bottles and jars use heavy, recyclable biophotonic glass or reusable ceramic vessels. Orders are shipped in 100% recycled FSC-certified boxes with biodegradable paper tape and plant-based padding.',
    footnote: 'Plastic-Free Shipping',
  },
];

export default function Philosophy() {
  return (
    <section id="philosophy" className="py-24 sm:py-32 bg-ry-pearl text-ry-onyx border-b border-ry-ash/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="max-w-3xl mb-16 sm:mb-24">
          <span className="text-[11px] uppercase tracking-[0.3em] text-ry-stone font-sans block mb-3">
            Our Standards
          </span>
          <h2 className="font-serif text-3xl sm:text-5xl font-normal leading-tight text-ry-onyx">
            Our Commitment to <span className="italic">Clean Ingredients</span>, <span className="italic">Quality</span> & Sustainability.
          </h2>
        </div>

        {/* Numbered 01, 02, 03 Editorial Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12 border-t border-ry-ash pt-12">
          {PHILOSOPHIES.map((item) => (
            <div
              key={item.number}
              className="flex flex-col justify-between group hover:translate-y-[-2px] transition-transform duration-300"
            >
              <div>
                {/* Large Editorial Number */}
                <div className="font-serif text-4xl sm:text-5xl text-ry-stone/40 font-light mb-6 group-hover:text-ry-onyx transition-colors">
                  {item.number}
                </div>

                {/* Subtitle / Tag */}
                <span className="text-[10px] uppercase tracking-editorial text-ry-stone block font-sans mb-2">
                  {item.subtitle}
                </span>

                {/* Title */}
                <h3 className="font-serif text-xl sm:text-2xl text-ry-onyx mb-4 leading-snug">
                  {item.title}
                </h3>

                {/* Narrative */}
                <p className="font-sans text-xs sm:text-sm text-ry-charcoal/80 leading-relaxed">
                  {item.description}
                </p>
              </div>

              {/* Footnote */}
              <div className="mt-8 pt-4 border-t border-ry-ash/50 text-[10px] uppercase tracking-editorial text-ry-stone font-sans">
                {item.footnote}
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
