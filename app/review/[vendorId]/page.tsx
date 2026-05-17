"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabaseclient";

const blockedEmailDomains = new Set([
  "gmail.com",
  "yahoo.com",
  "outlook.com",
  "hotmail.com",
  "icloud.com",
  "aol.com",
  "live.com",
  "msn.com",
  "proton.me",
  "protonmail.com",
  "yandex.com",
  "mail.com",
  "zoho.com",
  "gmx.com",
  "comcast.net",
]);

export default function VendorReviewPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();

  const vendorId = params.vendorId as string;
  const startingRating = Number(searchParams.get("rating") ?? 0);

  const [checking, setChecking] = useState(true);
  const [allowed, setAllowed] = useState(false);
  const [rating, setRating] = useState(
    startingRating >= 0 && startingRating <= 5 ? startingRating : 0
  );
  const [message, setMessage] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function checkUser() {
      setChecking(true);
      setMessage(null);

      const { data: sessionData } = await supabase.auth.getSession();
      const user = sessionData.session?.user;

      if (!user) {
        router.replace("/signin");
        return;
      }

      const email = user.email?.toLowerCase() ?? "";
      const domain = email.split("@")[1] ?? "";

      if (blockedEmailDomains.has(domain)) {
        setAllowed(false);
        setChecking(false);
        setMessage(
          "Reviews require a campaign, organization, or business email address. Common personal email domains cannot leave reviews."
        );
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      if (profile?.role !== "customer") {
        setAllowed(false);
        setChecking(false);
        setMessage("Only customer accounts can leave vendor reviews.");
        return;
      }

      setAllowed(true);
      setChecking(false);
    }

    checkUser();
  }, [router]);

  async function submitReview() {
    setSaving(true);
    setMessage(null);

    const { data: sessionData } = await supabase.auth.getSession();
    const user = sessionData.session?.user;

    if (!user) {
      setSaving(false);
      router.replace("/signin");
      return;
    }

    const { error } = await supabase.from("vendor_reviews").upsert(
      {
        vendor_id: vendorId,
        reviewer_id: user.id,
        rating,
        updated_at: new Date().toISOString(),
      },
      {
        onConflict: "vendor_id,reviewer_id",
      }
    );

    setSaving(false);

    if (error) {
      console.error("Review save error:", error);
      setMessage(error.message);
      return;
    }

    setMessage("✅ Review submitted.");

    setTimeout(() => {
      router.back();
    }, 900);
  }

  if (checking) {
    return <div className="rm-muted">Checking review eligibility…</div>;
  }

  if (!allowed) {
    return (
      <div className="rm-card" style={{ maxWidth: 720 }}>
        <h1 style={{ fontSize: 28, fontWeight: 900, marginBottom: 8 }}>
          Review Not Available
        </h1>

        <p className="rm-muted">{message}</p>

        <div style={{ marginTop: 16 }}>
          <button className="rm-btn rm-btnGhost" onClick={() => router.back()}>
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="rm-card" style={{ maxWidth: 720 }}>
      <h1 style={{ fontSize: 28, fontWeight: 900, marginBottom: 8 }}>
        Leave a Vendor Review
      </h1>

      <p className="rm-muted" style={{ marginBottom: 16 }}>
        Choose a rating from 0 to 5 stars. Your review applies to this vendor
        across all of their listings.
      </p>

      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 18 }}>
        {[0, 1, 2, 3, 4, 5].map((r) => (
          <button
            key={r}
            type="button"
            className={rating === r ? "rm-btn rm-btnPrimary" : "rm-btn rm-btnGhost"}
            onClick={() => setRating(r)}
          >
            {r === 0 ? "0 Stars" : "★".repeat(r)}
          </button>
        ))}
      </div>

      <button className="rm-cta" onClick={submitReview} disabled={saving}>
        {saving ? "Submitting..." : "Submit Review"}
      </button>

      {message ? (
        <p className="rm-muted" style={{ marginTop: 12 }}>
          {message}
        </p>
      ) : null}
    </div>
  );
}