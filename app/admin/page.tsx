"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseclient";

const ADMIN_EMAILS = new Set([
  "ryleyniemi@gmail.com",
  "niemi2040@gmail.com",
  "therepublicanmarketplace@gmail.com",
]);

type Listing = {
  id: string;
  created_at?: string;
  status?: string | null;
  category_slug?: string | null;
  title?: string | null;
  vendor_name?: string | null;
  description?: string | null;
  price_min?: number | null;
  price_max?: number | null;
  image_url?: string | null;
  contact_email?: string | null;
  contact_phone?: string | null;
  website_url?: string | null;
};

export default function AdminPage() {
  const router = useRouter();
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);

  async function loadPending() {
    setLoading(true);
    setMessage(null);

    const { data, error } = await supabase
      .from("listings")
      .select("*")
      .eq("status", "pending")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Load pending error:", error);
      setMessage(error.message);
      setListings([]);
      setLoading(false);
      return;
    }

    setListings((data as Listing[]) ?? []);
    setLoading(false);
  }

  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getSession();
      const user = data.session?.user;

      if (!user) {
        router.replace("/signin");
        return;
      }

      const email = user.email?.toLowerCase() || "";
      if (!ADMIN_EMAILS.has(email)) {
        setMessage("Not authorized.");
        setLoading(false);
        return;
      }

      loadPending();
    })();
  }, [router]);

  async function setStatus(id: string, status: "approved" | "rejected") {
    setMessage(null);

    const { data, error } = await supabase
      .from("listings")
      .update({ status })
      .eq("id", id)
      .select("id,status")
      .single();

    if (error) {
      console.error("Update status error:", error);
      setMessage(error.message);
      return;
    }

    if (!data) {
      setMessage("No row updated (likely blocked by RLS).");
      return;
    }

    setListings((prev) => prev.filter((l) => l.id !== id));
  }

  return (
    <div>
      <div className="rm-card" style={{ marginBottom: 18 }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 900, marginBottom: 8 }}>
            Admin Approval
          </h1>
          <p className="rm-muted">
            These are <b>pending</b> listings. Approve to make them public.
          </p>
        </div>

        <div style={{ marginTop: 12 }}>
          <button className="rm-cta" onClick={loadPending} disabled={loading}>
            {loading ? "Loading..." : "Refresh Pending"}
          </button>
        </div>

        {message ? (
          <div
            className="rm-muted"
            style={{ marginTop: 12, whiteSpace: "pre-wrap" }}
          >
            {message}
          </div>
        ) : null}
      </div>

      {loading ? (
        <div className="rm-muted">Loading pending listings…</div>
      ) : listings.length === 0 ? (
        <div className="rm-muted">No pending listings right now.</div>
      ) : (
        <div className="rm-grid">
          {listings.map((l) => {
            const hasContactInfo =
              l.contact_email || l.contact_phone || l.website_url;

            return (
              <div key={l.id} className="rm-card">
                {l.image_url ? (
                  <div className="rm-listingImageFrame">
                    <img
                      src={l.image_url}
                      alt={l.title || "Listing image"}
                      className="rm-listingImage"
                    />
                  </div>
                ) : null}

                <div>
                  <div className="rm-muted" style={{ fontWeight: 900 }}>
                    {l.vendor_name || "Unknown Vendor"}
                  </div>

                  <div style={{ marginTop: 8, fontSize: 20, fontWeight: 900 }}>
                    {l.title || "(No title)"}
                  </div>

                  <div
                    style={{
                      marginTop: 10,
                      display: "flex",
                      gap: 10,
                      flexWrap: "wrap",
                    }}
                  >
                    {l.category_slug ? (
                      <span className="rm-pill">{l.category_slug}</span>
                    ) : null}

                    <span className="rm-pill">{l.status || "pending"}</span>

                    {l.price_min != null || l.price_max != null ? (
                      <span className="rm-pill">
                        ${l.price_min ?? "?"} – ${l.price_max ?? "?"}
                      </span>
                    ) : null}
                  </div>

                  {l.description ? (
                    <p className="rm-muted" style={{ marginTop: 14 }}>
                      {l.description}
                    </p>
                  ) : null}

                  {hasContactInfo ? (
                    <div
                      style={{
                        marginTop: 14,
                        padding: 12,
                        borderRadius: 14,
                        background: "#f9fafb",
                        border: "1px solid rgba(17,24,39,0.10)",
                      }}
                    >
                      <div style={{ fontWeight: 900, marginBottom: 8 }}>
                        Contact Info
                      </div>

                      {l.contact_email ? (
                        <p className="rm-muted" style={{ margin: "6px 0" }}>
                          <b>Email:</b>{" "}
                          <a href={`mailto:${l.contact_email}`}>
                            {l.contact_email}
                          </a>
                        </p>
                      ) : null}

                      {l.contact_phone ? (
                        <p className="rm-muted" style={{ margin: "6px 0" }}>
                          <b>Phone:</b>{" "}
                          <a href={`tel:${l.contact_phone}`}>
                            {l.contact_phone}
                          </a>
                        </p>
                      ) : null}

                      {l.website_url ? (
                        <p className="rm-muted" style={{ margin: "6px 0" }}>
                          <b>Website:</b>{" "}
                          <a href={l.website_url} target="_blank" rel="noreferrer">
                            {l.website_url}
                          </a>
                        </p>
                      ) : null}
                    </div>
                  ) : null}

                  {l.created_at ? (
                    <p className="rm-muted" style={{ marginTop: 10, fontSize: 12 }}>
                      Submitted: {new Date(l.created_at).toLocaleString()}
                    </p>
                  ) : null}
                </div>

                <div style={{ display: "flex", gap: 12, marginTop: 16 }}>
                  <button
                    className="rm-cta"
                    onClick={() => setStatus(l.id, "approved")}
                    style={{ flex: 1 }}
                  >
                    Approve
                  </button>

                  <button
                    onClick={() => setStatus(l.id, "rejected")}
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
                  >
                    Reject
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}