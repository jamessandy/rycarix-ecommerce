"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";

export function AdminTrackingForm({ order }: { order: any }) {
  const router = useRouter();
  const [status, setStatus] = useState(order.status || "PREPARING");
  const [carrier, setCarrier] = useState(order.carrier || "Royal Mail");
  const [trackingNumber, setTrackingNumber] = useState(order.trackingNumber || "");
  const [trackingUrl, setTrackingUrl] = useState(order.trackingUrl || "");
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setSuccessMsg("");
    try {
      const res = await fetch(`/api/admin/orders/${order.id}/tracking`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, carrier, trackingNumber, trackingUrl }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to update order");
      }
      setSuccessMsg("Tracking updated and customer notified!");
      router.refresh();
      setTimeout(() => setSuccessMsg(""), 4000);
    } catch (err: any) {
      alert(err.message || "Error saving tracking details.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSave} className="space-y-3 p-4 border border-neutral-200 bg-neutral-50 rounded-sm">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-xs uppercase tracking-wider text-neutral-600 mb-1 font-medium">
            Order Stage
          </label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full border border-neutral-300 px-3 py-2 text-sm bg-white"
          >
            <option value="PREPARING">Preparing Package</option>
            <option value="SHIPPED">Sent Out (Dispatched)</option>
            <option value="DELIVERED">Delivered</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>

        <div>
          <label className="block text-xs uppercase tracking-wider text-neutral-600 mb-1 font-medium">
            Courier / Carrier
          </label>
          <input
            type="text"
            placeholder="e.g., Royal Mail, DPD, DHL"
            value={carrier}
            onChange={(e) => setCarrier(e.target.value)}
            className="w-full border border-neutral-300 px-3 py-2 text-sm bg-white"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-xs uppercase tracking-wider text-neutral-600 mb-1 font-medium">
            Tracking Number
          </label>
          <input
            type="text"
            placeholder="Enter tracking number"
            value={trackingNumber}
            onChange={(e) => setTrackingNumber(e.target.value)}
            className="w-full border border-neutral-300 px-3 py-2 text-sm font-mono bg-white"
          />
        </div>

        <div>
          <label className="block text-xs uppercase tracking-wider text-neutral-600 mb-1 font-medium">
            Tracking Link (Optional)
          </label>
          <input
            type="url"
            placeholder="https://..."
            value={trackingUrl}
            onChange={(e) => setTrackingUrl(e.target.value)}
            className="w-full border border-neutral-300 px-3 py-2 text-sm bg-white"
          />
        </div>
      </div>

      <div className="flex items-center gap-3 pt-1">
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 bg-black text-white text-xs uppercase tracking-widest hover:bg-neutral-800 disabled:opacity-50 transition"
        >
          {loading ? "Updating & Notifying..." : "Save & Notify Customer"}
        </button>
        {successMsg && (
          <span className="text-xs text-green-700 font-medium">
            ✓ {successMsg}
          </span>
        )}
      </div>
    </form>
  );
}
