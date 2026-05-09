"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseclient";

type AuthStatus = "checking" | "signed-in" | "signed-out" | "error";

export default function AuthGate({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<AuthStatus>("checking");
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;

    async function checkSession() {
      try {
        const timeout = new Promise<"timeout">((resolve) => {
          setTimeout(() => resolve("timeout"), 5000);
        });

        const sessionCheck = supabase.auth.getSession();

        const result = await Promise.race([sessionCheck, timeout]);

        if (!alive) return;

        if (result === "timeout") {
          setStatus("error");
          setMessage("Sign-in check timed out. Please refresh or sign in again.");
          return;
        }

        if (result.error) {
          console.error("AuthGate session error:", result.error);
          setStatus("error");
          setMessage(result.error.message);
          return;
        }

        setStatus(result.data.session?.user ? "signed-in" : "signed-out");
      } catch (err: any) {
        if (!alive) return;

        console.error("AuthGate unexpected error:", err);
        setStatus("error");
        setMessage(err?.message || "Could not check sign-in status.");
      }
    }

    checkSession();

    return () => {
      alive = false;
    };
  }, []);

  if (status === "checking") {
    return <div className="rm-muted">Checking sign-in…</div>;
  }

  if (status === "error") {
    return (
      <div className="rm-card" style={{ maxWidth: 760 }}>
        <h1 style={{ fontSize: 28, fontWeight: 900, marginBottom: 8 }}>
          Sign-in check problem
        </h1>

        <p className="rm-muted">
          {message || "Something went wrong while checking your account."}
        </p>

        <div style={{ display: "flex", gap: 12, marginTop: 16, flexWrap: "wrap" }}>
          <a className="rm-btn rm-btnPrimary" href="/signin">
            Sign In
          </a>

          <a className="rm-btn rm-btnGhost" href="/signup">
            Sign Up
          </a>

          <button
            className="rm-btn rm-btnGhost"
            type="button"
            onClick={() => window.location.reload()}
          >
            Refresh
          </button>
        </div>
      </div>
    );
  }

  if (status === "signed-out") {
    return (
      <div className="rm-card" style={{ maxWidth: 760 }}>
        <h1 style={{ fontSize: 28, fontWeight: 900, marginBottom: 8 }}>
          Sign in to view listing details
        </h1>

        <p className="rm-muted">
          You can browse listings as a viewer, but details require an account.
        </p>

        <div style={{ display: "flex", gap: 12, marginTop: 16, flexWrap: "wrap" }}>
          <a className="rm-btn rm-btnPrimary" href="/signup">
            Sign Up
          </a>

          <a className="rm-btn rm-btnGhost" href="/signin">
            Sign In
          </a>

          <a className="rm-btn rm-btnGhost" href="/">
            Back Home
          </a>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}