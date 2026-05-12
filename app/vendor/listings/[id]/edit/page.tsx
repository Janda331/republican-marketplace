"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseclient";

const categories = [
  { slug: "Video-Editing", label: "Video Editing / Videography" },
  { slug: "Data-Analysis", label: "Data & Map Analysis" },
  { slug: "Canvassing", label: "Canvassing" },
  { slug: "Mass-Texting", label: "Mass Text Messaging & Emails" },
  { slug: "Graphic-Design", label: "Graphic Design" },
  { slug: "Printing", label: "Sign & Material Printing" },
  { slug: "Consulting", label: "Political Consulting" },

  { slug: "TV-Advertising", label: "TV & Social Media Advertising" },
  { slug: "Website-Development", label: "Website Development" },
];
const priceUnits = [
  { value: "", label: "Flat / Total Price" },
  { value: "per flyer", label: "Per Flyer" },
  { value: "per text", label: "Per Text" },
  { value: "per email", label: "Per Email" },
  { value: "per hour", label: "Per Hour" },
  { value: "per day", label: "Per Day" },
  { value: "per week", label: "Per Week" },
  { value: "per month", label: "Per Month" },
  { value: "per door knock", label: "Per Door Knock" },
  { value: "per call", label: "Per Call" },
  { value: "per mail piece", label: "Per Mail Piece" },
  { value: "per graphic", label: "Per Graphic" },
  { value: "per video", label: "Per Video" },
  { value: "per website", label: "Per Website" },
  { value: "per event", label: "Per Event" },
  { value: "per campaign", label: "Per Campaign" },
];
type Listing = {
  id: string;
  vendor_id: string;
  status?: string | null;
  vendor_name?: string | null;
  category_slug?: string | null;
  title?: string | null;
  description?: string | null;
  price_min?: number | null;
  price_max?: number | null;
  price_unit?: string | null;
  image_url?: string | null;
  contact_email?: string | null;
  contact_phone?: string | null;
  website_url?: string | null;
};

export default function EditListingPage() {
  const router = useRouter();
  const params = useParams();
  const listingId = params.id as string;

  const [checking, setChecking] = useState(true);
  const [authorized, setAuthorized] = useState(false);

  const [vendorName, setVendorName] = useState("");
  const [categorySlug, setCategorySlug] = useState(categories[0].slug);
  const [title, setTitle] = useState("");
  const [priceMin, setPriceMin] = useState("");
  const [priceMax, setPriceMax] = useState("");
  const [priceUnit, setPriceUnit] = useState("");
  const [description, setDescription] = useState("");

  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState("");

  const [currentImageUrl, setCurrentImageUrl] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      if (imagePreview) URL.revokeObjectURL(imagePreview);
    };
  }, [imagePreview]);

  useEffect(() => {
    async function loadListing() {
      setChecking(true);
      setMessage(null);

      const { data: sessionData } = await supabase.auth.getSession();
      const user = sessionData.session?.user;

      if (!user) {
        router.replace("/signin");
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      const role = profile?.role ?? "customer";

      if (role !== "vendor" && role !== "admin") {
        setMessage("Not authorized. Vendor account required.");
        setAuthorized(false);
        setChecking(false);
        return;
      }

      const { data: listing, error } = await supabase
        .from("listings")
        .select("*")
        .eq("id", listingId)
        .single();

      if (error || !listing) {
        console.error("Load listing error:", error);
        setMessage(error?.message || "Listing not found.");
        setAuthorized(false);
        setChecking(false);
        return;
      }

      const row = listing as Listing;

      if (role !== "admin" && row.vendor_id !== user.id) {
        setMessage("Not authorized. You can only edit your own listings.");
        setAuthorized(false);
        setChecking(false);
        return;
      }

      setAuthorized(true);

      setVendorName(row.vendor_name ?? "");
      setCategorySlug(row.category_slug ?? categories[0].slug);
      setTitle(row.title ?? "");
      setPriceMin(row.price_min != null ? String(row.price_min) : "");
      setPriceMax(row.price_max != null ? String(row.price_max) : "");
      setPriceUnit(row.price_unit ?? "");
      setDescription(row.description ?? "");
      setContactEmail(row.contact_email ?? "");
      setContactPhone(row.contact_phone ?? "");
      setWebsiteUrl(row.website_url ?? "");
      setCurrentImageUrl(row.image_url ?? null);

      setChecking(false);
    }

    if (listingId) loadListing();
  }, [listingId, router]);

  async function saveListing(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    const { data: sessionData } = await supabase.auth.getSession();
    const user = sessionData.session?.user;

    if (!user) {
      setSaving(false);
      router.replace("/signin");
      return;
    }

    let imageUrl = currentImageUrl;

    if (imageFile) {
      const fileExt = imageFile.name.split(".").pop();
      const fileName = `${user.id}/${crypto.randomUUID()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("listing-images")
        .upload(fileName, imageFile);

      if (uploadError) {
        console.error("Image upload error:", uploadError);
        setSaving(false);
        setMessage(uploadError.message);
        return;
      }

      const { data } = supabase.storage
        .from("listing-images")
        .getPublicUrl(fileName);

      imageUrl = data.publicUrl;
    }

    const rawWebsite = websiteUrl.trim();

    let cleanedWebsite: string | null = null;

    if (rawWebsite !== "") {
      if (
        rawWebsite.startsWith("http://") ||
        rawWebsite.startsWith("https://")
      ) {
        cleanedWebsite = rawWebsite;
      } else {
        cleanedWebsite = `https://${rawWebsite}`;
      }
    }

    const { error } = await supabase
      .from("listings")
      .update({
        vendor_name: vendorName,
        category_slug: categorySlug,
        title,
        description,
        price_min: priceMin ? Number(priceMin) : null,
        price_max: priceMax ? Number(priceMax) : null,
        price_unit: priceUnit || null,
        image_url: imageUrl,

        contact_email: contactEmail.trim() || null,
        contact_phone: contactPhone.trim() || null,
        website_url: cleanedWebsite,

        // Re-approval rule:
        status: "pending",
      })
      .eq("id", listingId)
      .eq("vendor_id", user.id);

    setSaving(false);

    if (error) {
      console.error("Update listing error:", error);
      setMessage(error.message);
      return;
    }

   setMessage("✅ Edit submitted, pending admin approval.");

    setTimeout(() => {
      router.push("/vendor/listings");
    }, 800);
  }

  if (checking) {
    return <div className="rm-muted">Loading listing editor…</div>;
  }

  if (!authorized) {
    return (
      <div className="rm-card" style={{ maxWidth: 760 }}>
        <h1 style={{ fontSize: 28, fontWeight: 900, marginBottom: 8 }}>
          Cannot edit listing
        </h1>

        <p className="rm-muted">{message || "You are not authorized."}</p>

        <div style={{ display: "flex", gap: 12, marginTop: 16, flexWrap: "wrap" }}>
          <a className="rm-btn rm-btnGhost" href="/vendor/listings">
            Back to My Listings
          </a>
          <a className="rm-btn rm-btnGhost" href="/">
            Back Home
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="rm-card">
      <div>
        <h1 style={{ fontSize: 28, fontWeight: 900, marginBottom: 8 }}>
          Edit Listing
        </h1>

        <p className="rm-muted">
          Editing a listing will send it back to <b>pending</b> for admin approval.
        </p>
      </div>

      <form onSubmit={saveListing} style={{ marginTop: 16 }}>
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
            placeholder="Listing Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <input
              className="rm-input"
              placeholder="Min Price"
              value={priceMin}
              onChange={(e) => setPriceMin(e.target.value)}
            />
            <select
              className="rm-input"
              value={priceUnit}
              onChange={(e) => setPriceUnit(e.target.value)}
            >
              {priceUnits.map((u) => (
                <option key={u.value} value={u.value}>
                  {u.label}
                </option>
              ))}
            </select>
            <input
              className="rm-input"
              placeholder="Max Price"
              value={priceMax}
              onChange={(e) => setPriceMax(e.target.value)}
            />
          </div>

          <input
            className="rm-input"
            type="email"
            placeholder="Contact Email (optional)"
            value={contactEmail}
            onChange={(e) => setContactEmail(e.target.value)}
          />

          <input
            className="rm-input"
            type="tel"
            placeholder="Phone Number (optional)"
            value={contactPhone}
            onChange={(e) => setContactPhone(e.target.value)}
          />

          <input
            className="rm-input"
            placeholder="Website (optional) — example.com"
            value={websiteUrl}
            onChange={(e) => setWebsiteUrl(e.target.value)}
          />

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
              Upload a new image only if you want to replace the existing one.
            </div>

            {imagePreview ? (
              <div className="rm-listingImageFrame" style={{ marginTop: 12, maxWidth: 420 }}>
                <img src={imagePreview} alt="New listing preview" className="rm-listingImage" />
              </div>
            ) : currentImageUrl ? (
              <div className="rm-listingImageFrame" style={{ marginTop: 12, maxWidth: 420 }}>
                <img src={currentImageUrl} alt="Current listing" className="rm-listingImage" />
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

          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <button className="rm-cta" type="submit" disabled={saving}>
              {saving ? "Saving..." : "Save Changes"}
            </button>

            <a className="rm-btn rm-btnGhost" href="/vendor/listings">
              Cancel
            </a>
          </div>

          {message ? <div className="rm-muted">{message}</div> : null}
        </div>
      </form>
    </div>
  );
}