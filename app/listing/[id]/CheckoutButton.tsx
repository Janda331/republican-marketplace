"use client";

import { useState } from "react";

export default function CheckoutButton({ listingId }: { listingId: string }) {
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  async function goToCheckout() {
    setLoading(true);
    setMsg(null);

    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ listingId }),
      });

      const json = await res.json();

      if (!res.ok) {
        setMsg(json?.error || "Checkout failed.");
        setLoading(false);
        return;
      }

      // Stripe gives us the hosted checkout page URL
      window.location.href = json.url;
    } catch (e: any) {
      setMsg(e?.message || "Checkout failed.");
      setLoading(false);
    }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <button className="rm-btn rm-btnPrimary" onClick={goToCheckout} disabled={loading}>
        {loading ? "Redirecting..." : "Pay Now"}
      </button>
      {msg ? <div className="rm-muted">{msg}</div> : null}
    </div>
  );
}