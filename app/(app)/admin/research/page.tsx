import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { reviewResearch } from "../../research/actions";

async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user!.id).single();
  if (profile?.role !== "admin") redirect("/dashboard");
  return supabase;
}

export default async function AdminResearchPage() {
  const supabase = await requireAdmin();

  const { data: pending, error } = await supabase
    .from("research_papers")
    .select("id, title, committee, document_type, agenda, summary, author_name, submitted_by_email, created_at")
    .eq("status", "pending")
    .order("created_at", { ascending: true });

  return (
    <div style={{ minHeight: "100vh", padding: "48px 24px 100px" }}>
      <div style={{ maxWidth: 900, margin: "0 auto" }}>
        <div className="mono" style={{ fontSize: 11, letterSpacing: 2, color: "var(--coral)", textTransform: "uppercase", marginBottom: 10 }}>
          File No. IN/MUN/ADMIN — Research Review Queue
        </div>
        <h1 style={{ fontFamily: "Georgia, serif", fontSize: 30, marginBottom: 8 }}>Pending Research</h1>
        <p style={{ color: "rgba(234,217,222,0.6)", fontSize: 14, marginBottom: 34 }}>
          {pending?.length ?? 0} submission{pending?.length === 1 ? "" : "s"} waiting for review.
        </p>

        {error && <p style={{ color: "#e59aa8" }}>Could not load queue: {error.message}</p>}

        {pending?.length === 0 && (
          <div style={{ background: "#0F0F10", border: "1px dashed rgba(234,217,222,0.2)", borderRadius: 8, padding: 40, textAlign: "center", color: "rgba(234,217,222,0.55)" }}>
            Queue is empty.
          </div>
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          {pending?.map((r) => (
            <div key={r.id} style={{ background: "#0F0F10", border: "1px solid rgba(234,217,222,0.12)", borderRadius: 8, padding: 24 }}>
              <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 10, marginBottom: 10 }}>
                <h3 style={{ fontFamily: "Georgia, serif", fontSize: 18 }}>{r.title}</h3>
                <span className="mono" style={{ fontSize: 10, textTransform: "uppercase", color: "rgba(234,217,222,0.5)" }}>
                  Submitted {new Date(r.created_at).toLocaleDateString("en-IN")}
                </span>
              </div>
              <p className="mono" style={{ fontSize: 12, color: "rgba(234,217,222,0.65)", lineHeight: 1.9, marginBottom: 12 }}>
                <b style={{ color: "var(--coral)" }}>By:</b> {r.author_name} ({r.submitted_by_email})<br />
                <b style={{ color: "var(--coral)" }}>Committee:</b> {r.committee} · {r.document_type}<br />
                <b style={{ color: "var(--coral)" }}>Agenda:</b> {r.agenda}
              </p>
              <p style={{ fontSize: 13.5, color: "rgba(234,217,222,0.7)", lineHeight: 1.7, marginBottom: 16 }}>{r.summary}</p>
              <div style={{ display: "flex", gap: 10 }}>
                <form action={reviewResearch}>
                  <input type="hidden" name="id" value={r.id} />
                  <input type="hidden" name="decision" value="approved" />
                  <button type="submit" className="mono" style={{ background: "var(--paper)", color: "var(--ink)", border: "none", padding: "10px 18px", borderRadius: 3, fontSize: 11, fontWeight: 700, textTransform: "uppercase", cursor: "pointer" }}>
                    Approve
                  </button>
                </form>
                <form action={reviewResearch}>
                  <input type="hidden" name="id" value={r.id} />
                  <input type="hidden" name="decision" value="rejected" />
                  <button type="submit" className="mono" style={{ background: "none", color: "#e59aa8", border: "1.5px solid #8B1E3F", padding: "10px 18px", borderRadius: 3, fontSize: 11, fontWeight: 700, textTransform: "uppercase", cursor: "pointer" }}>
                    Reject
                  </button>
                </form>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
