import "./globals.css";

const categories = [
  { slug: "video-editing", label: "Video Editing / Videography" },
  { slug: "data-analysis", label: "Data & Map Analysis" },
  { slug: "canvassing", label: "Canvassing" },
  { slug: "mass-texting", label: "Mass Text Messaging & Emails" },
  { slug: "graphic-design", label: "Graphic Design" },
  { slug: "printing", label: "Sign & Material Printing" },
];

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-gray-100 text-gray-900">
        {/* TOP BAR */}
        <header className="sticky top-0 z-50 h-14 border-b bg-white">
          <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-6">
            {/* Logo */}
            <a href="/" className="flex items-center gap-3 font-bold">
              <div className="h-8 w-8 rounded bg-black" />
              <span>The Republican Marketplace</span>
            </a>

            {/* Actions */}
            <nav className="flex items-center gap-3 text-sm">
              <a
                href="/vendor"
                className="rounded border px-3 py-1.5 hover:bg-gray-50"
              >
                Become a Vendor
              </a>
              <a
                href="/vendor"
                className="rounded border px-3 py-1.5 hover:bg-gray-50"
              >
                List a Service
              </a>
              <a
                href="/login"
                className="rounded bg-black px-3 py-1.5 text-white hover:opacity-90"
              >
                Sign In
              </a>
            </nav>
          </div>
        </header>

        {/* APP SHELL */}
        <div className="mx-auto flex max-w-7xl">
          {/* LEFT SIDEBAR */}
          <aside className="sticky top-14 h-[calc(100vh-3.5rem)] w-80 border-r bg-white p-4 overflow-y-auto">
            <div className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
              Categories
            </div>

            <div className="space-y-3">
              {categories.map((c) => (
                <a
                  key={c.slug}
                  href={`/category/${c.slug}`}
                  className="block rounded-xl border bg-white p-4 shadow-sm hover:bg-gray-50"
                >
                  <div className="font-semibold">{c.label}</div>
                  <div className="mt-1 text-sm text-gray-600">
                    View listings →
                  </div>
                </a>
              ))}
            </div>
          </aside>

          {/* RIGHT CONTENT */}
          <main className="min-h-[calc(100vh-3.5rem)] flex-1 p-6">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
