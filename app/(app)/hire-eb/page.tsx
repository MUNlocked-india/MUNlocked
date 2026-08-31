import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export default async function HireEbPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: ebs, error } = await supabase
    .from("eb_applications")
    .select("id, applicant_email, bio, experience, areas_of_expertise, previous_conferences, created_at")
    .eq("status", "approved")
    .order("created_at", { ascending: false });

  return (
    <div style={{ minHeight: "100vh", padding: "48px 24px 100px" }}>
      <div style={{ maxWidth: 1000, margin: "0 auto" }}>
        <div className="mono" style={{ fontSize: 11, letterSpacing: 2, color: "var(--coral)", textTransform: "uppercase", marginBottom: 10 }}>
          File No. IN/MUN/EB — Marketplace
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: 16, marginBottom: 34 }}>
          <div>
            <h1 style={{ fontFamily: "Georgia, serif", fontSize: 32, marginBottom: 8 }}>Hire an EB</h1>
            <p style={{ color: "rgba(234,217,222,0.6)", fontSize: 14, maxWidth: 540 }}>
              Every profile here has been reviewed and approved by an admin — chairs get discovered on record, not on who they know.
            </p>
          </div>
          <Link
            href={user ? "/hire-eb/apply" : "/login"}
            className="mono"
            style={{ background: "var(--paper)", color: "var(--ink)", padding: "12px 20px", borderRadius: 3, textDecoration: "none", fontSize: 12, fontWeight: 700, textTransform: "uppercase", whiteSpace: "nowrap" }}
          >
            + Apply as EB
          </Link>
        </div>

        {error && <p style={{ color: "#e59aa8" }}>Could not load EBs: {error.message}</p>}

        {ebs?.length === 0 && (
          <div style={{ background: "#0F0F10", border: "1px dashed rgba(234,217,222,0.2)", borderRadius: 8, padding: 40, textAlign: "center", color: "rgba(234,217,222,0.55)" }}>
            No approved EB profiles yet. Applications go into a pending queue for admin review.
          </div>
        )}

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 22 }}>
          {ebs?.map((eb) => (
            <div key={eb.id} className="munlocked-card-hover" style={{ background: "var(--paper)", color: "var(--ink)", borderRadius: 14, padding: 22, boxShadow: "5px 6px 0 rgba(156,110,130,0.2)", transition: "transform 0.25s ease, box-shadow 0.25s ease" }}>
              <div style={{ width: 44, height: 44, borderRadius: "50%", background: "linear-gradient(135deg, var(--mauve), var(--coral))", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--paper)", fontFamily: "Georgia, serif", fontSize: 17, marginBottom: 12 }}>
                {eb.applicant_email[0]?.toUpperCase()}
              </div>
              <p style={{ fontSize: 13.5, lineHeight: 1.6, marginBottom: 10, color: "rgba(7,7,7,0.75)" }}>{eb.bio}</p>
              <p className="mono" style={{ fontSize: 11, color: "rgba(7,7,7,0.55)", marginBottom: 10 }}>{eb.experience}</p>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {eb.areas_of_expertise?.map((a: string) => (
                  <span key={a} className="mono" style={{ fontSize: 10, border: "1px solid rgba(7,7,7,0.25)", padding: "2px 8px", borderRadius: 20, color: "rgba(7,7,7,0.65)" }}>
                    {a}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
