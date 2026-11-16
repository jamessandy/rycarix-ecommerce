"use client";

import React from "react";

interface OrderTrackerProps {
  order: {
    id: string;
    orderNumber: string;
    status: "PENDING" | "PREPARING" | "SHIPPED" | "DELIVERED" | "CANCELLED" | string;
    trackingNumber?: string | null;
    carrier?: string | null;
    trackingUrl?: string | null;
    totalAmount?: number | string | null;
    total?: number | string | null;
    createdAt: string | Date;
  };
}

export function OrderTrackerCard({ order }: OrderTrackerProps) {
  const hasTracking =
    Boolean(order.trackingNumber) &&
    (order.status === "SHIPPED" || order.status === "DELIVERED");

  const steps = [
    {
      label: "Package Being Prepared",
      description: "Our studio is preparing and packing your order.",
      completed: ["PREPARING", "SHIPPED", "DELIVERED"].includes(order.status),
    },
    {
      label: "Sent Out for Delivery",
      description: "Handed over to courier from 83 Fulwell Road, Sunderland.",
      completed: ["SHIPPED", "DELIVERED"].includes(order.status),
    },
    {
      label: "Tracking Number Available",
      description: hasTracking
        ? `${order.carrier || "Courier"}: ${order.trackingNumber}`
        : "Available once your package is dispatched.",
      completed: hasTracking,
    },
  ];

  const displayTotal = order.totalAmount ?? order.total ?? 0;

  return (
    <div className="border border-neutral-200 p-6 bg-white space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-neutral-100 pb-4">
        <div>
          <p className="text-xs uppercase tracking-widest text-neutral-500">
            Order #{order.orderNumber}
          </p>
          <p className="text-sm text-neutral-600">
            Placed on {new Date(order.createdAt).toLocaleDateString("en-GB")}
          </p>
        </div>
        <div className="text-right">
          <p className="text-sm font-medium">£{Number(displayTotal).toFixed(2)}</p>
        </div>
      </div>

      {/* 3-Stage Fulfillment Stepper */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {steps.map((step, index) => (
          <div
            key={step.label}
            className={`p-4 border ${
              step.completed
                ? "border-black bg-neutral-50"
                : "border-neutral-200 opacity-60"
            }`}
          >
            <div className="flex items-center gap-2 mb-1">
              <span
                className={`w-5 h-5 rounded-full text-xs flex items-center justify-center ${
                  step.completed
                    ? "bg-black text-white"
                    : "bg-neutral-200 text-neutral-600"
                }`}
              >
                {step.completed ? "✓" : index + 1}
              </span>
              <h4 className="text-xs font-semibold uppercase tracking-wider">
                {step.label}
              </h4>
            </div>
            <p className="text-xs text-neutral-600 mt-1">{step.description}</p>
          </div>
        ))}
      </div>

      {/* Active Tracking Details Box */}
      {hasTracking && (
        <div className="bg-neutral-900 text-white p-4 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-widest text-neutral-400">
              Live Tracking Details ({order.carrier || "Courier"})
            </p>
            <p className="text-sm font-mono mt-1">{order.trackingNumber}</p>
          </div>
          {order.trackingUrl && (
            <a
              href={order.trackingUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 bg-white text-black text-xs uppercase tracking-widest font-medium hover:bg-neutral-200 transition"
            >
              Track Parcel
            </a>
          )}
        </div>
      )}
    </div>
  );
}
