"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseclient";
import { useRouter } from "next/navigation";

type VendorOrder = {
  id: string;
  status: string;
  created_at: string;
  listing_id: string;
  listings?: {
    title: string | null;
    category_slug: string | null;
    price_min: number | null;
    price_max: number | null;
    vendor_name: string | null;
  } | null;
};

export default function VendorOrdersPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);
  const [orders, setOrders] = useState<VendorOrder[]>([]);

  async function ensureVendor() {
    const { data: sessionData } = await supabase.auth.getSession();
    const user = sessionData.session?.user;

    if (!user) {
      router.replace("/signin");
      return null;
    }

    const { data: profile, error } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (error) {
      setMessage(error.message);
      return null;
    }

    if (profile?.role !== "vendor" && profile?.role !== "admin") {
      setMessage("Not authorized. Vendor account required.");
      setLoading(false);
      return null;
    }

    return user;
  }

  async function loadOrders() {
    setLoading(true);
    setMessage(null);

    const user = await ensureVendor();
    if (!user) return;

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
          price_min,
          price_max,
          vendor_name
        )
      `
      )
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Load vendor orders error:", error);
      setMessage(error.message);
      setOrders([]);
      setLoading(false);
      return;
    }

    setOrders((data as any[]) ?? []);
    setLoading(false);
  }

  async function setOrderStatus(orderId: string, status: "accepted" | "declined") {
    setMessage(null);

    const { data, error } = await supabase
      .from("orders")
      .update({ status })
      .eq("id", orderId)
      .select("id,status")
      .single();

    if (error) {
      console.error("Update order status error:", error);
      setMessage(error.message);
      return;
    }

    if (!data) {
      setMessage("No order updated (likely blocked by RLS).");
      return;
    }

    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status: data.status } : o))
    );
  }

  useEffect(() => {
    loadOrders();
  }, []);

  return (
    <div>
      <div className="rm-card" style={{ marginBottom: 18 }}>
        <h1 style={{ fontSize: 28, fontWeight: 900, marginBottom: 8 }}>
          Incoming Orders
        </h1>
        <p className="rm-muted">
          These are purchase requests for your listings. You can accept or decline.
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
        <div className="rm-muted">Loading incoming orders…</div>
      ) : orders.length === 0 ? (
        <div className="rm-muted">No incoming orders yet.</div>
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
                {o.listings?.title ?? "Listing"}
              </div>

              <div style={{ marginTop: 10, display: "flex", gap: 10, flexWrap: "wrap" }}>
                {o.listings?.category_slug ? (
                  <span className="rm-pill">{o.listings.category_slug}</span>
                ) : null}

                {o.listings?.price_min != null || o.listings?.price_max != null ? (
                  <span className="rm-pill">
                    ${o.listings?.price_min ?? "?"} – ${o.listings?.price_max ?? "?"}
                  </span>
                ) : null}
              </div>

              <div style={{ display: "flex", gap: 12, marginTop: 16 }}>
                <button
                  className="rm-cta"
                  onClick={() => setOrderStatus(o.id, "accepted")}
                  style={{ flex: 1 }}
                  disabled={o.status !== "requested"}
                >
                  Accept
                </button>

                <button
                  onClick={() => setOrderStatus(o.id, "declined")}
                  style={{
                    flex: 1,
                    borderRadius: 14,
                    padding: "12px 14px",
                    background: "#ffffff",
                    color: "#111827",
                    fontWeight: 900,
                    border: "1px solid rgba(17,24,39,0.15)",
                    cursor: "pointer",
                  }}
                  disabled={o.status !== "requested"}
                >
                  Decline
                </button>
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