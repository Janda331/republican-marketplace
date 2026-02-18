"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseclient";
import { useRouter } from "next/navigation";

type OrderRow = {
  id: string;
  status: string;
  created_at: string;
  listing_id: string;
  listing?: {
    title: string | null;
    category_slug: string | null;
    vendor_name: string | null;
    price_min: number | null;
    price_max: number | null;
  };
};

export default function MyOrdersPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);
  const [orders, setOrders] = useState<OrderRow[]>([]);

  async function loadOrders() {
    setLoading(true);
    setMessage(null);

    const { data: sessionData } = await supabase.auth.getSession();
    const user = sessionData.session?.user;

    if (!user) {
      router.replace("/signin");
      return;
    }

    const { data, error } = await supabase
      .from("orders")
      .select(
        `
        id,
        status,
        created_at,
        listing_id,
        listings:listing_id (
          title,
          category_slug,
          vendor_name,
          price_min,
          price_max
        )
      `
      )
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Load orders error:", error);
      setMessage(error.message);
      setOrders([]);
      setLoading(false);
      return;
    }

    // normalize "listings" field into listing
    const normalized =
      (data ?? []).map((o: any) => ({
        ...o,
        listing: o.listings ?? null,
      })) as OrderRow[];

    setOrders(normalized);
    setLoading(false);
  }

  useEffect(() => {
    loadOrders();
  }, []);

  return (
    <div>
      <div className="rm-card" style={{ marginBottom: 18 }}>
        <h1 style={{ fontSize: 28, fontWeight: 900, marginBottom: 8 }}>
          My Orders
        </h1>
        <p className="rm-muted">
          These are your purchase requests.
        </p>

        <div style={{ marginTop: 12 }}>
          <button className="rm-cta" onClick={loadOrders} disabled={loading}>
            {loading ? "Loading..." : "Refresh"}
          </button>
        </div>

        {message ? (
          <div className="rm-muted" style={{ marginTop: 12, whiteSpace: "pre-wrap" }}>
            {message}
          </div>
        ) : null}
      </div>

      {loading ? (
        <div className="rm-muted">Loading your orders…</div>
      ) : orders.length === 0 ? (
        <div className="rm-muted">No orders yet.</div>
      ) : (
        <div className="rm-grid">
          {orders.map((o) => (
            <div key={o.id} className="rm-card">
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                <span className="rm-pill">{o.status}</span>
                <span className="rm-pill">
                  {new Date(o.created_at).toLocaleString()}
                </span>
              </div>

              <div style={{ marginTop: 10, fontSize: 18, fontWeight: 900 }}>
                {o.listing?.title ?? "Listing"}
              </div>

              <div style={{ marginTop: 10, display: "flex", gap: 10, flexWrap: "wrap" }}>
                {o.listing?.category_slug ? (
                  <span className="rm-pill">{o.listing.category_slug}</span>
                ) : null}

                {o.listing?.vendor_name ? (
                  <span className="rm-pill">{o.listing.vendor_name}</span>
                ) : null}

                {o.listing?.price_min != null || o.listing?.price_max != null ? (
                  <span className="rm-pill">
                    ${o.listing?.price_min ?? "?"} – ${o.listing?.price_max ?? "?"}
                  </span>
                ) : null}
              </div>

              <div style={{ marginTop: 14 }}>
                <a className="rm-btn rm-btnGhost" href={`/listing/${o.listing_id}`}>
                  View Listing
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}