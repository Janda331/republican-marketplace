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

  // Same exact price
  if (
    min != null &&
    max != null &&
    Number(min) === Number(max)
  ) {
    return `$${min} ${unit}`;
  }

  // Range
  return `$${min ?? "?"} – $${max ?? "?"} ${unit}`;
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

  return (
    <div>
      <h1 style={{ fontSize: 28, fontWeight: 900, marginBottom: 20 }}>
        {titleFromSlug(slug)}
      </h1>

      <div className="rm-grid">
        {listings && listings.length > 0 ? (
          listings.map((listing: any) => (
            <div key={listing.id} className="rm-card">
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

                <p
                  className="rm-muted"
                  style={{
                    marginTop: 10,
                    lineHeight: 1.6,
                  }}
                >
                  {listing.description ? (
                    listing.description.length > 300 ? (
                      <>
                        {listing.description.slice(0, 300)}

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
                  <div
                    style={{
                      marginTop: 14,
                      marginBottom: 18,
                    }}
                  >
                    <span className="rm-pill">
                      {formatPrice(listing)}
                    </span>
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
          ))
        ) : (
          <div className="rm-muted">
            No approved listings yet in this category.
          </div>
        )}
      </div>
    </div>
  );
}