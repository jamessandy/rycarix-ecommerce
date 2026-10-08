'use client';

import React from 'react';
import { Star, CheckCircle } from 'lucide-react';
import { CUSTOMER_REVIEWS } from '@/lib/data/mockData';

export default function CustomerReviews() {
  return (
    <section className="py-24 sm:py-32 bg-ry-pearl text-ry-onyx font-sans border-b border-ry-ash/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Customer Testimonials Section */}
        <div>
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 sm:mb-16 gap-6">
            <div>
              <span className="text-[11px] uppercase tracking-[0.3em] text-ry-stone block mb-2">
                Customer Reviews
              </span>
              <h2 className="font-serif text-3xl sm:text-5xl font-normal text-ry-onyx leading-tight">
                What Our Customers Say
              </h2>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex text-amber-500">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-current" />
                ))}
              </div>
              <span className="text-sm font-medium text-ry-onyx">4.9 / 5.0</span>
              <span className="text-xs text-ry-stone">• Based on 850+ Customer Reviews</span>
            </div>
          </div>

          {/* Reviews Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {CUSTOMER_REVIEWS.map((review) => (
              <div
                key={review.id}
                className="bg-ry-white p-6 border border-ry-ash/70 flex flex-col justify-between shadow-sm hover:border-ry-onyx/50 transition-colors"
              >
                <div>
                  {/* Star Rating */}
                  <div className="flex text-amber-500 mb-3">
                    {[...Array(review.rating)].map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-current" />
                    ))}
                  </div>

                  {/* Title & Comment */}
                  <h3 className="font-serif text-base text-ry-onyx mb-2 leading-snug">
                    {review.title}
                  </h3>
                  <p className="text-xs text-ry-charcoal/80 leading-relaxed font-sans mb-4">
                    “{review.comment}”
                  </p>
                </div>

                <div className="pt-4 border-t border-ry-ash/40">
                  <div className="text-[11px] font-medium text-ry-onyx">
                    {review.author}
                  </div>
                  <div className="text-[10px] text-ry-stone flex items-center justify-between mt-0.5">
                    <span>{review.location}</span>
                    <span className="text-[9px] uppercase tracking-editorial bg-ry-pearl px-1.5 py-0.5 border border-ry-ash/40">
                      {review.category}
                    </span>
                  </div>
                  {review.verified && (
                    <div className="flex items-center gap-1 text-[9px] text-emerald-700 mt-2 font-medium">
                      <CheckCircle className="w-3 h-3" />
                      <span>Verified Buyer</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

        </div>

      </div>
    </section>
  );
}
