"use client";

import "./globals.css";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseclient";

const categories = [
  { slug: "video-editing", label: "Video Editing / Videography" },
  { slug: "data-analysis", label: "Data & Map Analysis" },
  { slug: "canvassing", label: "Canvassing" },
  { slug: "mass-texting", label: "Mass Text Messaging & Emails" },
  { slug: "graphic-design", label: "Graphic Design" },
  { slug: "printing", label: "Sign & Material Printing" },
];

const ADMIN_EMAILS = new Set([
  "ryleyniemi@gmail.com",
  "niemi2040@gmail.com",
  "therepublicanmarketplace@gmail.com",
]);

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [loadingUser, setLoadingUser] = useState(true);

  async function refreshAuth() {
    setLoadingUser(true);

    const { data } = await supabase.auth.getSession();
    const user = data.session?.user ?? null;

    if (!user) {
      setUserEmail(null);
      setRole(null);
      setLoadingUser(false);
      return;
    }

    const email = user.email?.toLowerCase() ?? "";
    setUserEmail(email);

    // Admin override (your current MVP rule)
    if (ADMIN_EMAILS.has(email)) {
      setRole("admin");
      setLoadingUser(false);
      return;
    }

    // Otherwise pull role from profiles
    const { data: profile, error } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (error) {
      console.error("Profile load error:", error);
      setRole("customer"); // safe fallback
      setLoadingUser(false);
      return;
    }

    setRole(profile?.role ?? "customer");
    setLoadingUser(false);
  }

  useEffect(() => {
    refreshAuth();

    // Keep header updated if user signs in/out without a full page reload
    const { data: sub } = supabase.auth.onAuthStateChange(() => {
      refreshAuth();
    });

    return () => {
      sub.subscription.unsubscribe();
    };
  }, []);

  async function logout() {
    await supabase.auth.signOut();
    // refresh header + take them home
    await refreshAuth();
    window.location.href = "/";
  }

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
          {loadingUser ? (
            <div className="rm-muted" style={{ fontWeight: 800 }}>
              Loading…
            </div>
          ) : !userEmail ? (
            <>
              <a className="rm-btn rm-btnGhost" href="/signup">
                Sign Up
              </a>

              <a className="rm-btn rm-btnGhost" href="/signin">
                Sign In
              </a>

              <a className="rm-btn rm-btnPrimary" href="/vendor">
                List a Service
              </a>
            </>
          ) : (
            <>
              {/* Signed-in identity */}
              <div className="rm-muted" style={{ fontWeight: 900 }}>
                Signed in: {userEmail}
              </div>

              <span className="rm-pill">{(role ?? "customer").toUpperCase()}</span>

              {/* Customer actions */}
              <a className="rm-btn rm-btnGhost" href="/account/orders">
                My Orders
              </a>

              {/* Vendor actions */}
              {(role === "vendor" || role === "admin") && (
                <>
                  <a className="rm-btn rm-btnPrimary" href="/vendor">
                    List a Service
                  </a>

                  <a className="rm-btn rm-btnGhost" href="/vendor/listings">
                    My Listings
                  </a>

                  <a className="rm-btn rm-btnGhost" href="/vendor/orders">
                    Incoming Orders
                  </a>
                </>
              )}

              {/* Admin actions */}
              {role === "admin" && (
                <a className="rm-btn rm-btnGhost" href="/admin">
                  Admin
                </a>
              )}

              <button className="rm-btn rm-btnGhost" onClick={logout}>
                Logout
              </button>
            </>
          )}
        </nav>

        </header>

        {/* App shell */}
        <div className="rm-shell">
          {/* Left sidebar */}
          <aside className="rm-sidebar">
            <div className="rm-sideTitle">Categories</div>

            <div className="rm-sideList">
              {categories.map((c) => (
                <a
                  key={c.slug}
                  className="rm-sideItem"
                  href={`/category/${c.slug}`}
                >
                  <div className="rm-sideItemTitle">{c.label}</div>
                  <div className="rm-sideItemSub">View listings →</div>
                </a>
              ))}
            </div>
          </aside>

          {/* Main content area */}
          <main className="rm-main">{children}</main>
        </div>
      </body>
    </html>
  );
}
