"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseclient";

const categories = [
  { slug: "Video-Editing", label: "Video Editing / Videography" },
  { slug: "Data-Analysis", label: "Data & Map Analysis" },
  { slug: "Canvassing", label: "Canvassing" },
  { slug: "Mass-Texting", label: "Mass Text Messaging & Emails" },
  { slug: "Graphic-Design", label: "Graphic Design" },
  { slug: "Printing", label: "Sign & Material Printing" },

  { slug: "Consulting", label: "Political Consulting" },
  { slug: "TV-Advertising", label: "TV & Social Media Advertising" },
  { slug: "Website-Development", label: "Website Development" },
];

const ADMIN_EMAILS = new Set([
  "ryleyniemi@gmail.com",
  "niemi2040@gmail.com",
  "therepublicanmarketplace@gmail.com",
]);

function roleLabel(role: string | null) {
  if (role === "vendor") return "Vendor";
  if (role === "admin") return "Admin";
  return "Buyer";
}

export default function AppShell({ children }: { children: React.ReactNode }) {
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [mobileCategoryOpen, setMobileCategoryOpen] = useState(false);
  const [mobileAccountOpen, setMobileAccountOpen] = useState(false);

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

    if (ADMIN_EMAILS.has(email)) {
      setRole("admin");
      setLoadingUser(false);
      return;
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    setRole(profile?.role ?? "customer");
    setLoadingUser(false);
  }

  useEffect(() => {
    refreshAuth();

    const { data: sub } = supabase.auth.onAuthStateChange(() => {
      refreshAuth();
    });

    return () => sub.subscription.unsubscribe();
  }, []);

  async function logout() {
    await supabase.auth.signOut();
    window.location.href = "/";
  }

  const isVendorOrAdmin = role === "vendor" || role === "admin";
  const isAdmin = role === "admin";

  return (
    <>
      <header className="rm-topbar">
        <button
          className="rm-hamburger"
          type="button"
          onClick={() => {
            setMobileCategoryOpen(true);
            setMobileAccountOpen(false);
          }}
        >
          ☰
        </button>

        <a className="rm-logo" href="/">
          <img className="rm-logoMark" src="/logo.png" alt="The Republican Marketplace logo" />
          <span className="rm-logoText">The Republican Marketplace</span>
        </a>

        <nav className="rm-actions">
          {loadingUser ? (
            <div className="rm-muted">Loading…</div>
          ) : !userEmail ? (
            <>
              <a className="rm-btn rm-btnGhost" href="/signup">Sign Up</a>
              <a className="rm-btn rm-btnGhost" href="/signin">Sign In</a>
              <a className="rm-btn rm-btnPrimary" href="/vendor">List</a>
            </>
          ) : (
            <>
              <span className="rm-pill">
                {roleLabel(role)}
              </span>

              <a className="rm-btn rm-btnGhost rm-desktopOnly" href="/account/orders">My Orders</a>

              {isVendorOrAdmin && (
                <>
                  <a className="rm-btn rm-btnPrimary rm-desktopOnly" href="/vendor">List a Service</a>
                  <a className="rm-btn rm-btnGhost rm-desktopOnly" href="/vendor/listings">My Listings</a>
                  <a className="rm-btn rm-btnGhost rm-desktopOnly" href="/vendor/orders">Incoming Orders</a>
                </>
              )}

              {isAdmin && (
                <a className="rm-btn rm-btnGhost rm-desktopOnly" href="/admin">Admin</a>
              )}

              <button className="rm-btn rm-btnGhost rm-desktopOnly" onClick={logout}>
                Logout
              </button>

              <button
                className="rm-btn rm-btnPrimary rm-mobileOnly"
                type="button"
                onClick={() => {
                  setMobileAccountOpen((v) => !v);
                  setMobileCategoryOpen(false);
                }}
              >
                Menu
              </button>
            </>
          )}
        </nav>
      </header>

      {mobileAccountOpen && userEmail ? (
        <div className="rm-mobileAccountPanel">
          <div className="rm-mobileAccountTitle">Signed in as {roleLabel(role)}</div>

          <a className="rm-mobileAccountLink" href="/account/orders">My Orders</a>

          {isVendorOrAdmin && (
            <>
              <a className="rm-mobileAccountLink" href="/vendor">List a Service</a>
              <a className="rm-mobileAccountLink" href="/vendor/listings">My Listings</a>
              <a className="rm-mobileAccountLink" href="/vendor/orders">Incoming Orders</a>
            </>
          )}

          {isAdmin && <a className="rm-mobileAccountLink" href="/admin">Admin</a>}

          <button className="rm-mobileAccountLink rm-mobileLogout" onClick={logout}>
            Logout
          </button>
        </div>
      ) : null}

      {mobileCategoryOpen ? (
        <div className="rm-overlay" onClick={() => setMobileCategoryOpen(false)} />
      ) : null}

      <div className="rm-shell">
        <aside className={`rm-sidebar ${mobileCategoryOpen ? "rm-sidebarOpen" : ""}`}>
          <div className="rm-sideTitle">Categories</div>

          <div className="rm-sideList">
            {categories.map((c) => (
              <a
                key={c.slug}
                className="rm-sideItem"
                href={`/category/${c.slug}`}
                onClick={() => setMobileCategoryOpen(false)}
              >
                <div className="rm-sideItemTitle">{c.label}</div>
                <div className="rm-sideItemSub">View listings →</div>
              </a>
            ))}
          </div>
        </aside>

        <main className="rm-main">{children}</main>
      </div>
    </>
  );
}