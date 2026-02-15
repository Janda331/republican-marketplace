"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseclient";

const categories = [
  { slug: "video-editing", label: "Video Editing / Videography" },
  { slug: "data-analysis", label: "Data & Map Analysis" },
  { slug: "canvassing", label: "Canvassing" },
  { slug: "mass-texting", label: "Mass Text Messaging & Emails" },
  { slug: "graphic-design", label: "Graphic Design" },
  { slug: "printing", label: "Sign & Material Printing" },
];

export default function VendorPage() {
  const [vendorName, setVendorName] = useState("");
  const [categorySlug, setCategorySlug] = useState(categories[0].slug);
  const [title, setTitle] = useState("");
  const [priceMin, setPriceMin] = useState("");
  const [priceMax, setPriceMax] = useState("");
  const [description, setDescription] = useState("");

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function submitListing(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    const { error } = await supabase.from("listings").insert([
      {
        vendor_name: vendorName,
        category_slug: categorySlug,
        title,
        description,
        price_min: priceMin ? Number(priceMin) : null,
        price_max: priceMax ? Number(priceMax) : null,
        status: "pending",
      },
    ]);

    setLoading(false);

    if (error) {
        console.error("FULL ERROR:", error);
        setMessage(error.message);
        return;
    }

    setVendorName("");
    setTitle("");
    setPriceMin("");
    setPriceMax("");
    setDescription("");
    setMessage("✅ Submitted! Your listing is pending approval.");
  }

  return (
    <div className="rm-card">
      <div>
        <h1 style={{ fontSize: 28, fontWeight: 900, marginBottom: 8 }}>
          List a Service
        </h1>
        <p className="rm-muted">
          Submit a listing. It will be marked <b>pending</b> until approved.
        </p>
      </div>

      <form onSubmit={submitListing} style={{ marginTop: 16 }}>
        <div style={{ display: "grid", gap: 12 }}>
          <input
            className="rm-input"
            placeholder="Vendor / Business Name"
            value={vendorName}
            onChange={(e) => setVendorName(e.target.value)}
            required
          />

          <select
            className="rm-input"
            value={categorySlug}
            onChange={(e) => setCategorySlug(e.target.value)}
          >
            {categories.map((c) => (
              <option key={c.slug} value={c.slug}>
                {c.label}
              </option>
            ))}
          </select>

          <input
            className="rm-input"
            placeholder="Listing Title (e.g., Website Development)"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <input
              className="rm-input"
              placeholder="Min Price (e.g., 500)"
              value={priceMin}
              onChange={(e) => setPriceMin(e.target.value)}
            />
            <input
              className="rm-input"
              placeholder="Max Price (e.g., 1200)"
              value={priceMax}
              onChange={(e) => setPriceMax(e.target.value)}
            />
          </div>

          <textarea
            className="rm-input"
            placeholder="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={5}
            required
          />

          <button className="rm-cta" type="submit" disabled={loading}>
            {loading ? "Submitting..." : "Submit Listing"}
          </button>

          {message ? <div className="rm-muted">{message}</div> : null}
        </div>
      </form>
    </div>
  );
}