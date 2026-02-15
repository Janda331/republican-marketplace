import { supabase } from "@/lib/supabaseclient";

type Props = {
  params: Promise<{ slug: string }>;
};

function titleFromSlug(slug: string) {
  return slug.replace(/-/g, " ");
}

export default async function CategoryPage({ params }: Props) {
  const { slug } = await params; // ✅ this is the key fix

  const { data: listings, error } = await supabase
  .from("listings")
  .select("*")
  .eq("category_slug", slug)
  .eq("status", "active");

  if (error) {
    console.error("Supabase error:", error);
  }

  return (
    <div>
      <h1 style={{ fontSize: 28, fontWeight: 900, marginBottom: 20 }}>
        {titleFromSlug(slug)}
      </h1>

      {/* 3 columns desktop, 1 column mobile, with gaps */}
      <div className="rm-grid">
        {listings && listings.length > 0 ? (
          listings.map((listing: any) => (
            <div key={listing.id} className="rm-card">
              <div>
                <div style={{ fontSize: 18, fontWeight: 900 }}>
                  {listing.title}
                </div>
                <p className="rm-muted" style={{ marginTop: 10 }}>
                  {listing.description}
                </p>
                {listing.price ? (
                  <div style={{ marginTop: 12 }}>
                    <span className="rm-pill">{listing.price}</span>
                  </div>
                ) : null}
              </div>

              <button className="rm-cta">View Details</button>
            </div>
          ))
        ) : (
          <div className="rm-muted">No listings yet in this category.</div>
        )}
      </div>
    </div>
  );
}