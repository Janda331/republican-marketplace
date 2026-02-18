"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseclient";

export default function AuthGate({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  const [signedIn, setSignedIn] = useState(false);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getSession();
      setSignedIn(!!data.session?.user);
      setReady(true);
    })();
  }, []);

  if (!ready) {
    return <div className="rm-muted">Checking sign-in…</div>;
  }

  if (!signedIn) {
    return (
      <div className="rm-card" style={{ maxWidth: 760 }}>
        <h1 style={{ fontSize: 28, fontWeight: 900, marginBottom: 8 }}>
          Sign in to view listing details
        </h1>
        <p className="rm-muted">
          You can browse listings as a viewer, but details require an account.
        </p>

        <div style={{ display: "flex", gap: 12, marginTop: 16, flexWrap: "wrap" }}>
          <a className="rm-btn rm-btnPrimary" href="/signup">Sign Up</a>
          <a className="rm-btn rm-btnGhost" href="/signin">Sign In</a>
          <a className="rm-btn rm-btnGhost" href="/">Back Home</a>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}