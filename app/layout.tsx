"use client";

import "./globals.css";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseclient";

export const metadata = {
  title: "The Republican Marketplace",
  description:
    "The premier marketplace for Republican campaign services and political vendors.",

  icons: {
    icon: "/favicon.ico",
  },

  openGraph: {
    title: "The Republican Marketplace",
    description:
      "The premier marketplace for Republican campaign services and political vendors.",
    url: "https://therepublicanmarketplace.com",
    siteName: "The Republican Marketplace",

    images: [
      {
        url: "https://therepublicanmarketplace.com/logo.png",
        width: 1200,
        height: 1200,
        alt: "The Republican Marketplace",
      },
    ],

    locale: "en_US",
    type: "website",
  },

  twitter: {
    card: "summary_large_image",
    title: "The Republican Marketplace",
    description:
      "The premier marketplace for Republican campaign services and political vendors.",
    images: ["https://therepublicanmarketplace.com/logo.png"],
  },
};
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

function roleLabel(role: string | null) {
  if (role === "vendor") return "Vendor";
  if (role === "admin") return "Admin";
  return "Buyer";
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
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

    const { data: profile, error } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (error) {
      console.error("Profile load error:", error);
      setRole("customer");
      setLoadingUser(false);
      return;
    }

    setRole(profile?.role ?? "customer");
    setLoadingUser(false);
  }

  useEffect(() => {
    refreshAuth();

    const { data: sub } = supabase.auth.onAuthStateChange(() => {
      refreshAuth();
    });

    return () => {
      sub.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    const viewportContent =
      "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no";

    let viewport = document.querySelector(
      'meta[name="viewport"]'
    ) as HTMLMetaElement | null;

    if (!viewport) {
      viewport = document.createElement("meta");
      viewport.name = "viewport";
      document.head.appendChild(viewport);
    }

    viewport.content = viewportContent;
  }, []);

  async function logout() {
    await supabase.auth.signOut();
    await refreshAuth();
    window.location.href = "/";
  }

  const isVendorOrAdmin = role === "vendor" || role === "admin";
  const isAdmin = role === "admin";

  return (
    <html lang="en">
      <body className="rm-body">
        <header className="rm-topbar">
          <button
            className="rm-hamburger"
            type="button"
            onClick={() => {
              setMobileCategoryOpen(true);
              setMobileAccountOpen(false);
            }}
            aria-label="Open categories menu"
          >
            ☰
          </button>

          <a className="rm-logo" href="/">
            <img
              className="rm-logoMark"
              src="/logo.png"
              alt="The Republican Marketplace logo"
            />
            <span className="rm-logoText">The Republican Marketplace</span>
          </a>

          <nav className="rm-actions">
            {loadingUser ? (
              <div className="rm-muted rm-headerLoading">Loading…</div>
            ) : !userEmail ? (
              <>
                <a className="rm-btn rm-btnGhost" href="/signup">
                  Sign Up
                </a>

                <a className="rm-btn rm-btnGhost" href="/signin">
                  Sign In
                </a>

                <a className="rm-btn rm-btnPrimary" href="/vendor">
                  List
                </a>
              </>
            ) : (
              <>
                <div className="rm-desktopOnly rm-muted" style={{ fontWeight: 900 }}>
                  Signed in: {userEmail}
                </div>

                <span className="rm-pill rm-desktopOnly">
                  {(role ?? "customer").toUpperCase()}
                </span>

                <span className="rm-pill rm-mobileSignedIn">
                  Signed in as {roleLabel(role)}
                </span>

                <a className="rm-btn rm-btnGhost rm-desktopOnly" href="/account/orders">
                  My Orders
                </a>

                {isVendorOrAdmin && (
                  <>
                    <a className="rm-btn rm-btnPrimary rm-desktopOnly" href="/vendor">
                      List a Service
                    </a>

                    <a className="rm-btn rm-btnGhost rm-desktopOnly" href="/vendor/listings">
                      My Listings
                    </a>

                    <a className="rm-btn rm-btnGhost rm-desktopOnly" href="/vendor/orders">
                      Incoming Orders
                    </a>
                  </>
                )}

                {isAdmin && (
                  <a className="rm-btn rm-btnGhost rm-desktopOnly" href="/admin">
                    Admin
                  </a>
                )}

                <button
                  className="rm-btn rm-btnGhost rm-desktopOnly"
                  onClick={logout}
                  type="button"
                >
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
            <div className="rm-mobileAccountTitle">
              Signed in as {roleLabel(role)}
            </div>

            <a
              className="rm-mobileAccountLink"
              href="/account/orders"
              onClick={() => setMobileAccountOpen(false)}
            >
              My Orders
            </a>

            {isVendorOrAdmin ? (
              <>
                <a
                  className="rm-mobileAccountLink"
                  href="/vendor"
                  onClick={() => setMobileAccountOpen(false)}
                >
                  List a Service
                </a>

                <a
                  className="rm-mobileAccountLink"
                  href="/vendor/listings"
                  onClick={() => setMobileAccountOpen(false)}
                >
                  My Listings
                </a>

                <a
                  className="rm-mobileAccountLink"
                  href="/vendor/orders"
                  onClick={() => setMobileAccountOpen(false)}
                >
                  Incoming Orders
                </a>
              </>
            ) : null}

            {isAdmin ? (
              <a
                className="rm-mobileAccountLink"
                href="/admin"
                onClick={() => setMobileAccountOpen(false)}
              >
                Admin
              </a>
            ) : null}

            <button className="rm-mobileAccountLink rm-mobileLogout" onClick={logout}>
              Logout
            </button>
          </div>
        ) : null}

        {mobileCategoryOpen ? (
          <div
            className="rm-overlay"
            onClick={() => setMobileCategoryOpen(false)}
          />
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
      </body>
    </html>
  );
}