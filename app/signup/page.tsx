"use client";

import { useState } from "react";
import { supabase } from "../../lib/supabaseclient";

export default function SignUpPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"vendor" | "customer">("customer");
  const [message, setMessage] = useState<string>("");

  async function handleSignUp(e: React.FormEvent) {
    e.preventDefault();
    setMessage("");

    // 1) Create auth user
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      setMessage(error.message);
      return;
    }

    const user = data.user;
    if (!user) {
      setMessage("Signup created, but no user returned. Try signing in.");
      return;
    }

    // 2) Create profile row with role
    const { error: profileError } = await supabase.from("profiles").insert({
      id: user.id,
      role,
    });

    if (profileError) {
      setMessage("Profile error: " + profileError.message);
      return;
    }

    setMessage("✅ Account created. You can now sign in.");
  }

  return (
    <div className="rm-card" style={{ maxWidth: 520 }}>
      <h1 style={{ fontSize: 28, fontWeight: 900, marginBottom: 10 }}>
        Create account
      </h1>

      <form onSubmit={handleSignUp} style={{ display: "grid", gap: 12 }}>
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

        <label className="rm-muted">Account type</label>
        <div style={{ display: "flex", gap: 10 }}>
          <button
            type="button"
            className={role === "customer" ? "rm-btn" : "rm-btn rm-btn-ghost"}
            onClick={() => setRole("customer")}
          >
            Customer
          </button>
          <button
            type="button"
            className={role === "vendor" ? "rm-btn" : "rm-btn rm-btn-ghost"}
            onClick={() => setRole("vendor")}
          >
            Vendor
          </button>
        </div>

        <button type="submit" className="rm-btn" style={{ marginTop: 8 }}>
          Sign Up
        </button>
      </form>

      {message && <p style={{ marginTop: 12 }} className="rm-muted">{message}</p>}
    </div>
  );
}