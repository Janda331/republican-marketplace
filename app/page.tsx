import { supabase } from "../lib/supabaseclient";

const featuredListingIds: string[] = [
  "2b004e6b-92c1-4eea-9262-c4ae88050ad2",
  "639989b3-9a09-4dde-aa41-1b269487fe2c",
  "3cf6da6d-bad5-4113-b5a6-ccdba0981d14",
];

function formatPrice(listing: any) {
  const min = listing.price_min;
  const max = listing.price_max;
  const unit = listing.price_unit || "total";

  if (min == null && max == null) return null;

  if (min != null && max != null && Number(min) === Number(max)) {
    return `$${min} ${unit}`;
  }

  return `$${min ?? "?"} – $${max ?? "?"} ${unit}`;
}

function truncateDescription(description?: string | null) {
  if (!description) return "";
  if (description.length <= 220) return description;

  return `${description.slice(0, 220)}...`;
}

export default async function Home() {
  const query = supabase
    .from("listings")
    .select("*")
    .eq("status", "approved")
    .limit(3);

  const { data: fallbackListings, error: fallbackError } = await query;

  let featuredListings = fallbackListings ?? [];

  if (featuredListingIds.length > 0) {
    const { data } = await supabase
      .from("listings")
      .select("*")
      .in("id", featuredListingIds)
      .eq("status", "approved");

    featuredListings =
      data?.sort(
        (a: any, b: any) =>
          featuredListingIds.indexOf(a.id) - featuredListingIds.indexOf(b.id)
      ) ?? [];
  }

  if (fallbackError) {
    console.error("Homepage listing load error:", fallbackError);
  }

  return (
    <div>
      <section
        className="rm-card"
        style={{
          marginBottom: 22,
          minHeight: "unset",
          background:
            "linear-gradient(135deg, #ffffff 0%, #f9fafb 55%, #eef2ff 100%)",
        }}
      >
        <div>
          <div className="rm-pill" style={{ marginBottom: 14 }}>
            Political Services Marketplace
          </div>

          <h1
            style={{
              fontSize: 48,
              fontWeight: 950,
              lineHeight: 1.05,
              marginBottom: 12,
            }}
          >
            The Republican Marketplace
          </h1>

          <p
            className="rm-muted"
            style={{
              fontSize: 16,
              lineHeight: 1.7,
              maxWidth: 760,
            }}
          >
            Find trusted campaign vendors, political consultants, media teams,
            printing services, canvassing support, digital advertising help, and
            other Republican campaign services in one place.
          </p>
        </div>

        <div
          style={{
            marginTop: 18,
            display: "flex",
            gap: 12,
            flexWrap: "wrap",
          }}
        >
          <a className="rm-btn rm-btnPrimary" href="/category/Data-Analysis">
            Browse Services
          </a>

          <a className="rm-btn rm-btnGhost" href="/vendor">
            List a Service
          </a>
        </div>
      </section>

      <div style={{ marginBottom: 14 }}>
        <h2 style={{ fontSize: 24, fontWeight: 900, marginBottom: 6 }}>
          Featured Services
        </h2>
        <p className="rm-muted">
          A few highlighted marketplace listings to help campaigns get started.
        </p>
      </div>

      {featuredListings.length > 0 ? (
        <div className="rm-grid">
          {featuredListings.map((listing: any) => (
            <div key={listing.id} className="rm-card">
              {listing.vendor_name ? (
                <div
                  style={{
                    fontSize: 24,
                    fontWeight: 900,
                    marginBottom: 12,
                    lineHeight: 1.1,
                  }}
                >
                  {listing.vendor_name}
                </div>
              ) : null}
              {listing.image_url ? (
                <div className="rm-listingImageFrame">
                  <img
                    src={listing.image_url}
                    alt={listing.title ?? "Listing image"}
                    className="rm-listingImage"
                  />
                </div>
              ) : null}

              <div>
                <div style={{ fontSize: 18, fontWeight: 900 }}>
                  {listing.title}
                </div>

                <div
                  style={{
                    display: "flex",
                    gap: 8,
                    flexWrap: "wrap",
                    marginTop: 10,
                  }}
                >
                  {listing.category_slug ? (
                    <span className="rm-pill">{listing.category_slug}</span>
                  ) : null}

                  {formatPrice(listing) ? (
                    <span className="rm-pill">{formatPrice(listing)}</span>
                  ) : null}
                </div>

                {listing.description ? (
                  <p className="rm-muted" style={{ marginTop: 12 }}>
                    {truncateDescription(listing.description)}
                  </p>
                ) : null}
              </div>

              <a
                className="rm-cta"
                href={`/listing/${listing.id}`}
                style={{
                  background: "#ED1C24",
                  border: "0px solid #111111",
                  marginTop: 16,
                }}
              >
                View Details
              </a>
            </div>
          ))}
        </div>
      ) : (
        <div className="rm-card" style={{ minHeight: "unset" }}>
          <p className="rm-muted">
            No approved featured listings yet. Approve listings in the admin
            panel and they will appear here.
          </p>
        </div>
      )}
    </div>
  );
} 