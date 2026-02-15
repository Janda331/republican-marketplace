"use client";

import { useState } from "react";
import { supabase } from "../../lib/supabaseclient";

export default function SignInPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState<string>("");

  async function handleSignIn(e: React.FormEvent) {
    e.preventDefault();
    setMessage("");

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setMessage(error.message);
      return;
    }

    setMessage("✅ Signed in. Go back to the home page.");
  }

  async function handleSignOut() {
    await supabase.auth.signOut();
    setMessage("Signed out.");
  }

  return (
    <div className="rm-card" style={{ maxWidth: 520 }}>
      <h1 style={{ fontSize: 28, fontWeight: 900, marginBottom: 10 }}>
        Sign in
      </h1>

      <form onSubmit={handleSignIn} style={{ display: "grid", gap: 12 }}>
        <label className="rm-muted">Email</label>
        <input
          className="rm-input"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@email.com"
          required
        />

        <label className="rm-muted">Password</label>
        <input
          className="rm-input"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          required
        />

        <button type="submit" className="rm-btn" style={{ marginTop: 8 }}>
          Sign In
        </button>
      </form>

      <button
        className="rm-btn rm-btn-ghost"
        style={{ marginTop: 12 }}
        onClick={handleSignOut}
        type="button"
      >
        Sign Out
      </button>

      {message && <p style={{ marginTop: 12 }} className="rm-muted">{message}</p>}
    </div>
  );
}