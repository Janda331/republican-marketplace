import { supabase } from "@/lib/supabaseclient";
import AuthGate from "./AuthGate";
import CheckoutButton from "./CheckoutButton";
type Props = {
  params: Promise<{ id: string }>;
};

export default async function ListingDetailPage({ params }: Props) {
  const { id } = await params;

  // 1) Viewer gating: require sign-in to view details
  const { data: sessionData } = await supabase.auth.getSession();
  const session = sessionData.session;

  

  // 2) Signed in: load listing
  // If your listings.id is numeric, change `.eq("id", id)` to `.eq("id", Number(id))`
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
        <a className="rm-btn rm-btnGhost" href="/">Back Home</a>
      </div>
    );
  }

  return (
    <AuthGate>
      <div className="rm-card" style={{ maxWidth: 900 }}>
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

          <CheckoutButton listingId={listing.id} />
        </div>
      </div>
    </AuthGate>
  );
}