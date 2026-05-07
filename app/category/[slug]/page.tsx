import { supabase } from "@/lib/supabaseclient";

type Props = {
  params: Promise<{ slug: string }>;
};

function titleFromSlug(slug: string) {
  return slug.replace(/-/g, " ");
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

                <p className="rm-muted" style={{ marginTop: 10 }}>
                  {listing.description}
                </p>

                {listing.price_min != null || listing.price_max != null ? (
                  <div style={{ marginTop: 12 }}>
                    <span className="rm-pill">
                      ${listing.price_min ?? "?"} – ${listing.price_max ?? "?"}
                    </span>
                  </div>
                ) : null}
              </div>

              <a className="rm-cta" href={`/listing/${listing.id}`}>
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