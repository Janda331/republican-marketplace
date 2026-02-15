export default function Home() {
  return (
    <div className="rm-card">
      <div>
        <h1 style={{ fontSize: 28, fontWeight: 900, marginBottom: 8 }}>
          Browse Listings
        </h1>
        <p className="rm-muted">
          Choose a category on the left to see listings.
        </p>
      </div>

      <div className="rm-muted">
        This is the home page. The grid appears when you click a category.
      </div>
    </div>
  );
}