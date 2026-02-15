type Props = {
  params: Promise<{ slug: string }>;
};

function titleFromSlug(slug: string) {
  return slug.replace(/-/g, " ");
}

export default async function CategoryPage({ params }: Props) {
  const { slug } = await params;
  const categoryTitle = titleFromSlug(slug);

  const listings = Array.from({ length: 12 }).map((_, i) => ({
    id: i + 1,
    title: `Listing ${i + 1}`,
    vendor: "Vendor Name",
    price: `$${500 + i * 50}–$${1200 + i * 80}`,
    description:
      "Short description that will later come from the database. This card is intentionally tall, rounded, and separated by real gaps.",
  }));

  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <h1 style={{ fontSize: 28, fontWeight: 900, textTransform: "capitalize" }}>
          {categoryTitle}
        </h1>
        <p className="rm-muted">Desktop must be 3 per row. Mobile must be 1 per row.</p>
      </div>

      <div className="rm-grid">
        {listings.map((l) => (
          <div key={l.id} className="rm-card">
            <div>
              <div className="rm-muted" style={{ fontWeight: 800, fontSize: 12, letterSpacing: "0.08em", textTransform: "uppercase" }}>
                {l.vendor}
              </div>

              <div style={{ marginTop: 10, fontSize: 20, fontWeight: 900 }}>
                {l.title}
              </div>

              <div style={{ marginTop: 10 }}>
                <span className="rm-pill">{l.price}</span>
              </div>

              <p className="rm-muted" style={{ marginTop: 14 }}>
                {l.description}
              </p>
            </div>

            <button className="rm-cta">View Details</button>
          </div>
        ))}
      </div>
    </div>
  );
}