import { supabase } from "@/lib/supabaseclient";

type Props = {
  params: Promise<{ slug: string }>;
};

function titleFromSlug(slug: string) {
  return slug.replace(/-/g, " ");
}

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

function renderStars(rating: number | null) {
  if (rating == null) return "☆☆☆☆☆";

  const rounded = Math.round(rating);
  return "★".repeat(rounded) + "☆".repeat(5 - rounded);
}

export default async function CategoryPage({ params }: Props) {
  const { slug } = await params;

  if (!slug) {
    return <div className="rm-card">Invalid category (missing slug)</div>;
  }

  const { data: listings, error } = await supabase
    .from("listings")
    .select("*")
    .eq("category_slug", slug)
    .eq("status", "approved");

  if (error) console.error("Supabase error:", error);

  const vendorIds = Array.from(
    new Set((listings ?? []).map((l: any) => l.vendor_id).filter(Boolean))
  );

  const { data: ratingSummaries } =
    vendorIds.length > 0
      ? await supabase
          .from("vendor_rating_summary")
          .select("*")
          .in("vendor_id", vendorIds)
      : { data: [] };

  const ratingsByVendor = new Map(
    (ratingSummaries ?? []).map((r: any) => [r.vendor_id, r])
  );

  return (
    <div>
      <h1 style={{ fontSize: 28, fontWeight: 900, marginBottom: 20 }}>
        {titleFromSlug(slug)}
      </h1>

      <div className="rm-grid">
        {listings && listings.length > 0 ? (
          listings.map((listing: any) => {
            const ratingSummary = ratingsByVendor.get(listing.vendor_id);
            const averageRating = ratingSummary?.average_rating ?? null;
            const reviewCount = ratingSummary?.review_count ?? 0;

            return (
              <div key={listing.id} className="rm-card">
                {listing.vendor_name ? (
                  <div
                    style={{
                      fontSize: 36,
                      fontWeight: 900,
                      marginBottom: 8,
                      lineHeight: 1.1,
                      textAlign: "center",
                      width: "100%",
                    }}
                  >
                    {listing.vendor_name}
                  </div>
                ) : null}

                <div
                  style={{
                    textAlign: "center",
                    marginBottom: 12,
                  }}
                >
                  <span
                    style={{
                      color: "#f59e0b",
                      fontSize: 18,
                      letterSpacing: 1,
                      fontWeight: 900,
                    }}
                  >
                    {renderStars(averageRating)}
                  </span>

                  <span className="rm-muted" style={{ marginLeft: 6 }}>
                    {averageRating != null
                      ? `${averageRating}/5 (${reviewCount})`
                      : "No reviews"}
                  </span>
                </div>

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

                  <p className="rm-muted" style={{ marginTop: 10, lineHeight: 1.6 }}>
                    {listing.description ? (
                      listing.description.length > 200 ? (
                        <>
                          {listing.description.slice(0, 200)}
                          <span
                            style={{
                              color: "#6b7280",
                              fontStyle: "italic",
                              fontWeight: 600,
                            }}
                          >
                            {" "}
                            ... View Details to read more
                          </span>
                        </>
                      ) : (
                        listing.description
                      )
                    ) : (
                      ""
                    )}
                  </p>

                  {formatPrice(listing) ? (
                    <div style={{ marginTop: 14, marginBottom: 18 }}>
                      <span className="rm-pill">{formatPrice(listing)}</span>
                    </div>
                  ) : null}
                </div>

                <a
                  className="rm-cta"
                  href={`/listing/${listing.id}`}
                  style={{
                    background: "#ED1C24",
                    border: "0px solid #111111",
                  }}
                >
                  View Details
                </a>
              </div>
            );
          })
        ) : (
          <div className="rm-muted">
            No approved listings yet in this category.
          </div>
        )}
      </div>
    </div>
  );
}