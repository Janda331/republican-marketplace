import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);

// Server-side Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL as string,
  // Prefer SERVICE ROLE for server routes; if you don't have it yet,
  // this will still work ONLY if your listings table is public/RLS off.
  (process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) as string
);

export async function POST(req: Request) {
  try {
    const { listingId } = await req.json();

    if (!listingId) {
      return NextResponse.json({ error: "Missing listingId" }, { status: 400 });
    }

    // Load listing from DB (so user can't tamper price)
    const { data: listing, error } = await supabase
      .from("listings")
      .select("id, title, price_min, price_max, status")
      .eq("id", listingId)
      .single();

    if (error || !listing) {
      return NextResponse.json({ error: "Listing not found" }, { status: 404 });
    }

    if (listing.status !== "approved") {
      return NextResponse.json({ error: "Listing not approved" }, { status: 403 });
    }

    // Price choice (best default without asking you):
    // Use price_max if it exists, otherwise price_min.
    const dollars =
      listing.price_max ?? listing.price_min ?? null;

    if (dollars == null || Number.isNaN(Number(dollars))) {
      return NextResponse.json({ error: "Listing has no price set" }, { status: 400 });
    }

    const amountCents = Math.round(Number(dollars) * 100);

    const origin =
      req.headers.get("origin") || "http://localhost:3000";

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: listing.title || "Service",
            },
            unit_amount: amountCents,
          },
          quantity: 1,
        },
      ],
      success_url: `${origin}/account/orders?success=1`,
      cancel_url: `${origin}/listing/${listingId}?canceled=1`,
      metadata: {
        listing_id: listingId,
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message || "Checkout error" },
      { status: 500 }
    );
  }
}