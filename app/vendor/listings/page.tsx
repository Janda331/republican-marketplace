"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseclient";
import { useRouter } from "next/navigation";

type Listing = {
  id: string;
  created_at?: string;
  status?: "pending" | "approved" | "rejected" | string | null;
  category_slug?: string | null;
  title?: string | null;
  vendor_name?: string | null;
  description?: string | null;
  price_min?: number | null;
  price_max?: number | null;
};

export default function VendorListingsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);
  const [listings, setListings] = useState<Listing[]>([]);

  async function loadMyListings() {
    setLoading(true);
    setMessage(null);

    const { data: sessionData } = await supabase.auth.getSession();
    const user = sessionData.session?.user;

    if (!user) {
      router.replace("/signin");
      return;
    }

    // Confirm vendor/admin role
    const { data: profile, error: profErr } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profErr) {
      console.error("Profile load error:", profErr);
      setMessage(profErr.message);
      setLoading(false);
      return;
    }

    const role = profile?.role ?? "customer";
    if (role !== "vendor" && role !== "admin") {
      setMessage("Not authorized. Vendor account required.");
      setLoading(false);
      return;
    }

    // Load vendor's listings
    const { data, error } = await supabase
      .from("listings")
      .select("*")
      .eq("vendor_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Load listings error:", error);
      setMessage(error.message);
      setListings([]);
      setLoading(false);
      return;
    }

    setListings((data as Listing[]) ?? []);
    setLoading(false);
  }

  useEffect(() => {
    loadMyListings();
  }, []);

  return (
    <div>
      <div className="rm-card" style={{ marginBottom: 18 }}>
        <h1 style={{ fontSize: 28, fontWeight: 900, marginBottom: 8 }}>
          My Listings
        </h1>
        <p className="rm-muted">
          These are the listings you have submitted (pending/approved/rejected).
        </p>

        <div style={{ marginTop: 12, display: "flex", gap: 12, flexWrap: "wrap" }}>
          <a className="rm-btn rm-btnPrimary" href="/vendor">
            + New Listing
          </a>

          <button className="rm-cta" onClick={loadMyListings} disabled={loading}>
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
        <div className="rm-muted">Loading your listings…</div>
      ) : listings.length === 0 ? (
        <div className="rm-muted">No listings yet. Click “New Listing”.</div>
      ) : (
        <div className="rm-grid">
          {listings.map((l) => (
            <div key={l.id} className="rm-card">
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                {l.status ? <span className="rm-pill">{l.status}</span> : null}
                {l.category_slug ? <span className="rm-pill">{l.category_slug}</span> : null}
                {l.price_min != null || l.price_max != null ? (
                  <span className="rm-pill">
                    ${l.price_min ?? "?"} – ${l.price_max ?? "?"}
                  </span>
                ) : null}
              </div>

              <div style={{ marginTop: 10, fontSize: 18, fontWeight: 900 }}>
                {l.title ?? "(No title)"}
              </div>

              {l.description ? (
                <p className="rm-muted" style={{ marginTop: 10 }}>
                  {l.description}
                </p>
              ) : null}

              <div style={{ display: "flex", gap: 12, marginTop: 14, flexWrap: "wrap" }}>
                <a className="rm-btn rm-btnGhost" href={`/listing/${l.id}`}>
                  View
                </a>

                {l.category_slug ? (
                  <a className="rm-btn rm-btnGhost" href={`/category/${l.category_slug}`}>
                    Category
                  </a>
                ) : null}
              </div>

              <div className="rm-muted" style={{ marginTop: 10, fontSize: 12 }}>
                {l.created_at ? `Created: ${new Date(l.created_at).toLocaleString()}` : ""}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
