"use client";

import { useState } from "react";
import { supabase } from "../../lib/supabaseclient";

const states = [
  { value: "", label: "Select your state" },
  { value: "AL", label: "Alabama" },
  { value: "AK", label: "Alaska" },
  { value: "AZ", label: "Arizona" },
  { value: "AR", label: "Arkansas" },
  { value: "CA", label: "California" },
  { value: "CO", label: "Colorado" },
  { value: "CT", label: "Connecticut" },
  { value: "DE", label: "Delaware" },
  { value: "FL", label: "Florida" },
  { value: "GA", label: "Georgia" },
  { value: "HI", label: "Hawaii" },
  { value: "ID", label: "Idaho" },
  { value: "IL", label: "Illinois" },
  { value: "IN", label: "Indiana" },
  { value: "IA", label: "Iowa" },
  { value: "KS", label: "Kansas" },
  { value: "KY", label: "Kentucky" },
  { value: "LA", label: "Louisiana" },
  { value: "ME", label: "Maine" },
  { value: "MD", label: "Maryland" },
  { value: "MA", label: "Massachusetts" },
  { value: "MI", label: "Michigan" },
  { value: "MN", label: "Minnesota" },
  { value: "MS", label: "Mississippi" },
  { value: "MO", label: "Missouri" },
  { value: "MT", label: "Montana" },
  { value: "NE", label: "Nebraska" },
  { value: "NV", label: "Nevada" },
  { value: "NH", label: "New Hampshire" },
  { value: "NJ", label: "New Jersey" },
  { value: "NM", label: "New Mexico" },
  { value: "NY", label: "New York" },
  { value: "NC", label: "North Carolina" },
  { value: "ND", label: "North Dakota" },
  { value: "OH", label: "Ohio" },
  { value: "OK", label: "Oklahoma" },
  { value: "OR", label: "Oregon" },
  { value: "PA", label: "Pennsylvania" },
  { value: "RI", label: "Rhode Island" },
  { value: "SC", label: "South Carolina" },
  { value: "SD", label: "South Dakota" },
  { value: "TN", label: "Tennessee" },
  { value: "TX", label: "Texas" },
  { value: "UT", label: "Utah" },
  { value: "VT", label: "Vermont" },
  { value: "VA", label: "Virginia" },
  { value: "WA", label: "Washington" },
  { value: "WV", label: "West Virginia" },
  { value: "WI", label: "Wisconsin" },
  { value: "WY", label: "Wyoming" },
];

export default function SignUpPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [role, setRole] = useState<"vendor" | "customer">("customer");
  const [state, setState] = useState("");
  const [campaignName, setCampaignName] = useState("");
  const [vendorName, setVendorName] = useState("");

  const [message, setMessage] = useState<string>("");

  async function handleSignUp(e: React.FormEvent) {
    e.preventDefault();
    setMessage("");

    if (!state) {
      setMessage("Please select your state.");
      return;
    }

    if (role === "customer" && !campaignName.trim()) {
      setMessage("Please enter your campaign name.");
      return;
    }

    if (role === "vendor" && !vendorName.trim()) {
      setMessage("Please enter your vendor name.");
      return;
    }

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

    const { error: profileError } = await supabase.from("profiles").insert({
      id: user.id,
      role,
      state,
      campaign_name: role === "customer" ? campaignName.trim() : null,
      vendor_name: role === "vendor" ? vendorName.trim() : null,
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
        <div style={{ display: "flex", gap: 16, marginTop: 12 }}>
          <button
            type="button"
            onClick={() => setRole("customer")}
            className={`rm-roleCard ${role === "customer" ? "rm-roleCardActive" : ""}`}
          >
            <div style={{ fontWeight: 900, fontSize: 18 }}>Customer</div>
            <div className="rm-muted">Browse & purchase services</div>
          </button>

          <button
            type="button"
            onClick={() => setRole("vendor")}
            className={`rm-roleCard ${role === "vendor" ? "rm-roleCardActive" : ""}`}
          >
            <div style={{ fontWeight: 900, fontSize: 18 }}>Vendor</div>
            <div className="rm-muted">List services & receive orders</div>
          </button>
        </div>

        <label className="rm-muted">State</label>
        <select
          className="rm-input"
          value={state}
          onChange={(e) => setState(e.target.value)}
          required
        >
          {states.map((s) => (
            <option key={s.value || "blank"} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>

        {role === "customer" ? (
          <>
            <label className="rm-muted">Campaign Name</label>
            <input
              className="rm-input"
              value={campaignName}
              onChange={(e) => setCampaignName(e.target.value)}
              placeholder="Example: Smith for Congress"
              required
            />
          </>
        ) : (
          <>
            <label className="rm-muted">Vendor Name</label>
            <input
              className="rm-input"
              value={vendorName}
              onChange={(e) => setVendorName(e.target.value)}
              placeholder="Example: Patriot Media Group"
              required
            />
          </>
        )}

        <button type="submit" className="rm-btn" style={{ marginTop: 8 }}>
          Sign Up
        </button>
      </form>

      {message && (
        <p style={{ marginTop: 12 }} className="rm-muted">
          {message}
        </p>
      )}
    </div>
  );
}