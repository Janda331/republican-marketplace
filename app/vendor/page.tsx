"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseclient";

const categories = [
  { slug: "video-editing", label: "Video Editing / Videography" },
  { slug: "data-analysis", label: "Data & Map Analysis" },
  { slug: "canvassing", label: "Canvassing" },
  { slug: "mass-texting", label: "Mass Text Messaging & Emails" },
  { slug: "graphic-design", label: "Graphic Design" },
  { slug: "printing", label: "Sign & Material Printing" },
];

type Role = "admin" | "vendor" | "customer";

export default function VendorPage() {
  const router = useRouter();

  const [checking, setChecking] = useState(true);
  const [role, setRole] = useState<Role | null>(null);

  const [vendorName, setVendorName] = useState("");
  const [categorySlug, setCategorySlug] = useState(categories[0].slug);
  const [title, setTitle] = useState("");
  const [priceMin, setPriceMin] = useState("");
  const [priceMax, setPriceMax] = useState("");
  const [description, setDescription] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      if (imagePreview) URL.revokeObjectURL(imagePreview);
    };
  }, [imagePreview]);

  useEffect(() => {
    (async () => {
      setChecking(true);

      const { data: sessionData } = await supabase.auth.getSession();
      const session = sessionData.session;

      if (!session?.user) {
        router.replace("/signup");
        return;
      }

      const { data: profile, error } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", session.user.id)
        .single();

      if (error) {
        console.error("Profile role fetch error:", error);
        setMessage("Could not load your account role. Try signing out/in.");
        setChecking(false);
        return;
      }

      setRole(profile.role as Role);
      setChecking(false);
    })();
  }, [router]);

  async function submitListing(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    const { data: sessionData } = await supabase.auth.getSession();
    const user = sessionData.session?.user;

    if (!user) {
      setLoading(false);
      router.replace("/signup");
      return;
    }

    let imageUrl: string | null = null;

    if (imageFile) {
      const fileExt = imageFile.name.split(".").pop();
      const fileName = `${user.id}/${crypto.randomUUID()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("listing-images")
        .upload(fileName, imageFile);

      if (uploadError) {
        console.error("Image upload error:", uploadError);
        setLoading(false);
        setMessage(uploadError.message);
        return;
      }

      const { data } = supabase.storage
        .from("listing-images")
        .getPublicUrl(fileName);

      imageUrl = data.publicUrl;
    }

    const { error } = await supabase.from("listings").insert([
      {
        vendor_name: vendorName,
        category_slug: categorySlug,
        title,
        description,
        price_min: priceMin ? Number(priceMin) : null,
        price_max: priceMax ? Number(priceMax) : null,
        status: "pending",
        vendor_id: user.id,
        image_url: imageUrl,
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
    setImageFile(null);
    setImagePreview(null);
    setMessage("✅ Submitted! Your listing is pending approval.");
  }

  if (checking) {
    return <div className="rm-muted">Checking your account…</div>;
  }

  if (role !== "vendor" && role !== "admin") {
    return (
      <div className="rm-card">
        <h1 style={{ fontSize: 28, fontWeight: 900, marginBottom: 8 }}>
          Vendor access required
        </h1>
        <p className="rm-muted">
          Your account is currently a <b>{role}</b>. Only vendors can list services.
        </p>

        <div style={{ marginTop: 14, display: "flex", gap: 10, flexWrap: "wrap" }}>
          <a className="rm-btn rm-btnGhost" href="/signup">
            Create a vendor account
          </a>
          <a
            className="rm-btn rm-btnGhost"
            href="/signin"
            onClick={async (e) => {
              e.preventDefault();
              await supabase.auth.signOut();
              router.replace("/signin");
            }}
          >
            Sign out
          </a>
        </div>

        {message ? (
          <div className="rm-muted" style={{ marginTop: 12 }}>
            {message}
          </div>
        ) : null}
      </div>
    );
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

          <div>
            <input
              className="rm-input"
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0] ?? null;
                setImageFile(file);

                if (imagePreview) {
                  URL.revokeObjectURL(imagePreview);
                }

                if (file) {
                  setImagePreview(URL.createObjectURL(file));
                } else {
                  setImagePreview(null);
                }
              }}
            />

            <div className="rm-imageHelp" style={{ marginTop: 8 }}>
              Preview below shows how your image will appear. Wide landscape images work best.
            </div>

            {imagePreview ? (
              <div
                className="rm-listingImageFrame"
                style={{
                  marginTop: 12,
                  maxWidth: 420,
                }}
              >
                <img
                  src={imagePreview}
                  alt="Listing preview"
                  className="rm-listingImage"
                />
              </div>
            ) : null}
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