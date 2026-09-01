"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";

const ROLES = [
  { value: "delegate", label: "Delegate" },
  { value: "eb", label: "Executive Board" },
  { value: "organizer", label: "Organizer" },
] as const;

export default function SignupPage() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<(typeof ROLES)[number]["value"]>("delegate");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const supabase = createClient();
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        // This payload is what the `handle_new_user` trigger reads to create
        // the profiles row — see supabase/schema.sql.
        data: { full_name: fullName, role },
        emailRedirectTo: `${window.location.origin}/auth/confirm?next=/`,
      },
    });

    setLoading(false);
    if (error) {
      setError(error.message);
      return;
    }
    setSent(true);
  }

  if (sent) {
    return (
      <div className="auth-wrap" style={{ flexDirection: "column", gap: 22 }}>
        <Image src="/logo.png" alt="MUNlocked" width={72} height={65} style={{ objectFit: "contain" }} />
        <div className="auth-card" style={{ textAlign: "center" }}>
          <h1 style={{ fontFamily: "Georgia, serif", fontSize: 22, marginBottom: 10 }}>
            Check your inbox
          </h1>
          <p style={{ fontSize: 13.5, color: "rgba(7,7,7,0.7)" }}>
            We sent a confirmation link to <b>{email}</b>. Click it to activate
            your account, then log in.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-wrap" style={{ flexDirection: "column", gap: 22 }}>
      <Image src="/logo.png" alt="MUNlocked" width={72} height={65} style={{ objectFit: "contain" }} priority />
      <form className="auth-card" onSubmit={handleSubmit}>
        <div className="mono" style={{ fontSize: 11, letterSpacing: 2, color: "var(--coral)", marginBottom: 8, textTransform: "uppercase" }}>
          File No. IN/MUN/ACCESS
        </div>
        <h1 style={{ fontFamily: "Georgia, serif", fontSize: 26, marginBottom: 6 }}>
          Join MUNlocked
        </h1>
        <p style={{ fontSize: 13, color: "rgba(7,7,7,0.6)", marginBottom: 22 }}>
          Pick how you'll use MUNlocked. This determines which dashboard you land on.
        </p>

        {error && <p className="error-text">{error}</p>}

        <label>I am joining as</label>
        <div className="role-grid">
          {ROLES.map((r) => (
            <button
              type="button"
              key={r.value}
              className={`role-opt${role === r.value ? " selected" : ""}`}
              onClick={() => setRole(r.value)}
            >
              {r.label}
            </button>
          ))}
        </div>

        <label htmlFor="fullName">Full Name</label>
        <input
          id="fullName"
          type="text"
          required
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
        />

        <label htmlFor="email">Email</label>
        <input
          id="email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <label htmlFor="password">Password</label>
        <input
          id="password"
          type="password"
          required
          minLength={6}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button type="submit" className="submit" disabled={loading}>
          {loading ? "Creating account…" : "Create Account"}
        </button>

        <p className="mono" style={{ fontSize: 11, textAlign: "center", marginTop: 16, color: "rgba(7,7,7,0.5)" }}>
          Already have an account? <Link href="/login" style={{ textDecoration: "underline" }}>Log in</Link>
        </p>
      </form>
    </div>
  );
}
