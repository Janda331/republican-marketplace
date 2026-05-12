import { supabase } from "@/lib/supabaseclient";
import AuthGate from "./AuthGate";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function ListingDetailPage({ params }: Props) {
  const { id } = await params;

  const { data: listing, error } = await supabase
    .from("listings")
    .select("*")
    .eq("id", id)
    .eq("status", "approved")
    .single();

  if (error || !listing) {
    return (
      <div className="rm-card" style={{ maxWidth: 760 }}>
        <h1 style={{ fontSize: 28, fontWeight: 900, marginBottom: 8 }}>
          Listing not found
        </h1>

        <p className="rm-muted">
          This listing may not exist or you may not have access.
        </p>

        <a className="rm-btn rm-btnGhost" href="/">
          Back Home
        </a>
      </div>
    );
  }

  const hasContactInfo =
    listing.contact_email || listing.contact_phone || listing.website_url;

  return (
    <AuthGate>
      <div className="rm-card" style={{ maxWidth: 900 }}>
        {listing.image_url ? (
          <div className="rm-listingImageFrame">
            <img
              src={listing.image_url}
              alt={listing.title ?? "Listing image"}
              className="rm-listingImage"
            />
          </div>
        ) : null}

        <h1 style={{ fontSize: 28, fontWeight: 900, marginBottom: 10 }}>
          {listing.title}
        </h1>

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 14 }}>
          {listing.category_slug ? <span className="rm-pill">{listing.category_slug}</span> : null}
          {listing.status ? <span className="rm-pill">{listing.status}</span> : null}
          {listing.vendor_name ? <span className="rm-pill">{listing.vendor_name}</span> : null}
        </div>

        {listing.price_min != null || listing.price_max != null ? (
          <div style={{ marginBottom: 12 }}>
            <span className="rm-pill">
              ${listing.price_min ?? "?"} – ${listing.price_max ?? "?"}

              {listing.price_unit ? (
                <span style={{ marginLeft: 6, fontWeight: 700, opacity: 0.8 }}>
                  {listing.price_unit}
                </span>
              ) : (
                <span style={{ marginLeft: 6, fontWeight: 700, opacity: 0.8 }}>
                  total
                </span>
              )}
            </span>
          </div>
        ) : null}

        {listing.description ? (
          <p className="rm-muted" style={{ whiteSpace: "pre-wrap" }}>
            {listing.description}
          </p>
        ) : (
          <p className="rm-muted">No description provided.</p>
        )}

        {hasContactInfo ? (
          <div
            className="rm-card"
            style={{
              marginTop: 18,
              minHeight: "unset",
              boxShadow: "none",
              background: "#f9fafb",
            }}
          >
            <h2 style={{ fontSize: 20, fontWeight: 900, marginBottom: 10 }}>
              Contact Information
            </h2>

            {listing.contact_email ? (
              <p className="rm-muted">
                <b>Email:</b>{" "}
                <a href={`mailto:${listing.contact_email}`}>
                  {listing.contact_email}
                </a>
              </p>
            ) : null}

            {listing.contact_phone ? (
              <p className="rm-muted">
                <b>Phone:</b>{" "}
                <a href={`tel:${listing.contact_phone}`}>
                  {listing.contact_phone}
                </a>
              </p>
            ) : null}

            {listing.website_url ? (
              <p className="rm-muted">
                <b>Website:</b>{" "}
                <a href={listing.website_url} target="_blank" rel="noreferrer">
                  {listing.website_url}
                </a>
              </p>
            ) : null}
          </div>
        ) : null}

        <div style={{ display: "flex", gap: 12, marginTop: 18, flexWrap: "wrap" }}>
          <a
            className="rm-btn rm-btnGhost"
            href={listing.category_slug ? `/category/${listing.category_slug}` : "/"}
          >
            Back to Category
          </a>

          <a className="rm-btn rm-btnGhost" href="/">
            Back Home
          </a>
        </div>
      </div>
    </AuthGate>
  );
}