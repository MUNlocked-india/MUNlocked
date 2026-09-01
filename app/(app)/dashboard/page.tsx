import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { signOutAction } from "@/lib/actions";

const ROLE_LABEL: Record<string, string> = {
  delegate: "Delegate",
  eb: "Executive Board",
  organizer: "Organizer",
  admin: "Admin",
};

export default async function DashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, role")
    .eq("id", user!.id)
    .single();

  const isAdmin = profile?.role === "admin";

  return (
    <div style={{ minHeight: "100vh", padding: 48, maxWidth: 720, margin: "0 auto" }}>
      <div className="mono" style={{ fontSize: 11, letterSpacing: 2, color: "var(--coral)", textTransform: "uppercase", marginBottom: 10 }}>
        File No. IN/MUN/DASHBOARD
      </div>
      <h1 style={{ fontFamily: "Georgia, serif", fontSize: 30, marginBottom: 8 }}>
        Welcome, {profile?.full_name ?? "Delegate"}
      </h1>
      <p className="mono" style={{ fontSize: 12, color: "rgba(234,217,222,0.6)", textTransform: "uppercase", letterSpacing: 1, marginBottom: 30 }}>
        Role: {profile ? ROLE_LABEL[profile.role] : "—"} · {user!.email}
      </p>

      <div style={{ background: "#0F0F10", border: "1px solid rgba(234,217,222,0.1)", borderRadius: 6, padding: 26, marginBottom: 24 }}>
        <p style={{ color: "rgba(234,217,222,0.7)", fontSize: 14, lineHeight: 1.7 }}>
          This confirms the real thing is working: your account was created via
          Supabase Auth, a <code>profiles</code> row was created automatically by
          the database trigger with the role you picked at signup, and this page
          is protected server-side — try opening it in an incognito window while
          logged out and you'll get redirected to <code>/login</code>.
        </p>
      </div>

      <div style={{ display: "flex", gap: 12, marginBottom: 24, flexWrap: "wrap" }}>
        <a href="/committees" className="mono" style={{ background: "var(--paper)", color: "var(--ink)", padding: "12px 20px", borderRadius: 3, textDecoration: "none", fontSize: 12, fontWeight: 700, textTransform: "uppercase" }}>
          Your Committees →
        </a>
        <a href="/conferences" className="mono" style={{ border: "1.5px solid rgba(234,217,222,0.3)", color: "var(--text)", padding: "12px 20px", borderRadius: 3, textDecoration: "none", fontSize: 12, fontWeight: 700, textTransform: "uppercase" }}>
          Conference Directory →
        </a>
        <a href="/hire-eb" className="mono" style={{ border: "1.5px solid rgba(234,217,222,0.3)", color: "var(--text)", padding: "12px 20px", borderRadius: 3, textDecoration: "none", fontSize: 12, fontWeight: 700, textTransform: "uppercase" }}>
          Hire an EB →
        </a>
      </div>

      {isAdmin && (
        <div style={{ background: "#0F0F10", border: "1px solid rgba(201,138,148,0.3)", borderRadius: 6, padding: 22, marginBottom: 24 }}>
          <div className="mono" style={{ fontSize: 10.5, letterSpacing: 1.5, textTransform: "uppercase", color: "var(--coral)", marginBottom: 12 }}>
            Admin — Secretariat Tools
          </div>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <a href="/admin/conferences" className="mono" style={{ background: "var(--coral)", color: "var(--ink)", padding: "10px 18px", borderRadius: 3, textDecoration: "none", fontSize: 12, fontWeight: 700, textTransform: "uppercase" }}>
              Review Conferences
            </a>
            <a href="/admin/eb-applications" className="mono" style={{ background: "var(--coral)", color: "var(--ink)", padding: "10px 18px", borderRadius: 3, textDecoration: "none", fontSize: 12, fontWeight: 700, textTransform: "uppercase" }}>
              Manage EB Marketplace
            </a>
            <a href="/admin/research" className="mono" style={{ background: "var(--coral)", color: "var(--ink)", padding: "10px 18px", borderRadius: 3, textDecoration: "none", fontSize: 12, fontWeight: 700, textTransform: "uppercase" }}>
              Review Research
            </a>
          </div>
        </div>
      )}

      <form action={signOutAction}>
        <button type="submit" className="submit" style={{ width: "auto", padding: "12px 22px" }}>
          Sign Out
        </button>
      </form>
    </div>
  );
}
