import "./globals.css";

const categories = [
  { slug: "video-editing", label: "Video Editing / Videography" },
  { slug: "data-analysis", label: "Data & Map Analysis" },
  { slug: "canvassing", label: "Canvassing" },
  { slug: "mass-texting", label: "Mass Text Messaging & Emails" },
  { slug: "graphic-design", label: "Graphic Design" },
  { slug: "printing", label: "Sign & Material Printing" },
];

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="rm-body">
        {/* Top bar */}
        <header className="rm-topbar">
          <a className="rm-logo" href="/">
            <span className="rm-logoMark" />
            <span>The Republican Marketplace</span>
          </a>

          <nav className="rm-actions">
            <a className="rm-btn rm-btnGhost" href="/vendor">
              Become a Vendor
            </a>
            <a className="rm-btn rm-btnGhost" href="/vendor">
              List a Service
            </a>
            <a className="rm-btn rm-btnPrimary" href="/login">
              Sign In
            </a>
          </nav>
        </header>

        {/* App shell */}
        <div className="rm-shell">
          {/* Left sidebar */}
          <aside className="rm-sidebar">
            <div className="rm-sideTitle">Categories</div>

            <div className="rm-sideList">
              {categories.map((c) => (
                <a key={c.slug} className="rm-sideItem" href={`/category/${c.slug}`}>
                  <div className="rm-sideItemTitle">{c.label}</div>
                  <div className="rm-sideItemSub">View listings →</div>
                </a>
              ))}
            </div>
          </aside>

          {/* Main content area (must be wide and unconstrained) */}
          <main className="rm-main">{children}</main>
        </div>
      </body>
    </html>
  );
}