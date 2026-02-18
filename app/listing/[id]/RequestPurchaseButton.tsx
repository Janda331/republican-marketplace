"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseclient";

export default function RequestPurchaseButton({ listingId }: { listingId: string }) {
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  async function requestPurchase() {
    setLoading(true);
    setMsg(null);

    const { data: sessionData } = await supabase.auth.getSession();
    const user = sessionData.session?.user;

    if (!user) {
      setMsg("You must be signed in to request a purchase.");
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from("orders")
      .insert([
        {
          listing_id: listingId,
          buyer_id: user.id,
          status: "requested",
        },
      ])
      .select("id,status")
      .single();

    setLoading(false);

    if (error) {
      console.error("Order insert error:", error);
      setMsg(error.message);
      return;
    }

    setMsg(`✅ Request sent! Order status: ${data.status}`);
  }

  return (
    <div style={{ display: "grid", gap: 10 }}>
      <button className="rm-btn rm-btnPrimary" type="button" onClick={requestPurchase} disabled={loading}>
        {loading ? "Sending..." : "Request Purchase"}
      </button>

      {msg ? <div className="rm-muted">{msg}</div> : null}
    </div>
  );
}