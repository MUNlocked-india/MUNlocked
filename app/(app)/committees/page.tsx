import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function CommitteesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: committees, error } = await supabase
    .from("committees")
    .select("id, name, code, conference_name, created_at")
    .order("created_at", { ascending: false });

  return (
    <div style={{ minHeight: "100vh", padding: "48px 24px 100px" }}>
      <div style={{ maxWidth: 900, margin: "0 auto" }}>
        <div className="mono" style={{ fontSize: 11, letterSpacing: 2, color: "var(--coral)", textTransform: "uppercase", marginBottom: 10 }}>
          File No. IN/MUN/MARKSHEET
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: 16, marginBottom: 34 }}>
          <div>
            <h1 style={{ fontFamily: "var(--font-display)", fontSize: 38, marginBottom: 8 }}>Your Digital Dais</h1>
            <p style={{ color: "rgba(234,217,222,0.6)", fontSize: 14, maxWidth: 520 }}>
              One live record for the entire dais—shared scoring, speaker timing and awards that keep every chair aligned without spreadsheet chaos.
            </p>
          </div>
          <Link href="/committees/new" className="mono" style={{ background: "var(--paper)", color: "var(--ink)", padding: "12px 20px", borderRadius: 3, textDecoration: "none", fontSize: 12, fontWeight: 700, textTransform: "uppercase", whiteSpace: "nowrap" }}>
            + New Committee
          </Link>
        </div>

        {error && <p style={{ color: "#e59aa8" }}>Could not load committees: {error.message}</p>}

        {committees?.length === 0 && (
          <div style={{ background: "#0F0F10", border: "1px dashed rgba(234,217,222,0.2)", borderRadius: 8, padding: 40, textAlign: "center", color: "rgba(234,217,222,0.55)" }}>
            No committees yet. Create one to start building your delegate roster and marksheet.
          </div>
        )}

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 18 }}>
          {committees?.map((c) => (
            <Link
              key={c.id}
              href={`/committees/${c.id}`}
              style={{ display: "block", background: "var(--paper)", color: "var(--ink)", borderRadius: 6, padding: 22, textDecoration: "none", boxShadow: "5px 6px 0 rgba(156,110,130,0.25)" }}
            >
              <span className="mono" style={{ fontSize: 10, letterSpacing: 1, textTransform: "uppercase", background: "rgba(7,7,7,0.08)", padding: "3px 8px", borderRadius: 3 }}>
                {c.code}
              </span>
              <h3 style={{ fontFamily: "Georgia, serif", fontSize: 19, margin: "10px 0 4px" }}>{c.name}</h3>
              {c.conference_name && <p className="mono" style={{ fontSize: 11, color: "rgba(7,7,7,0.55)" }}>{c.conference_name}</p>}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
