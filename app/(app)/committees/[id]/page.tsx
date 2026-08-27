import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { COUNTRY_BUNDLES } from "@/lib/countryBundles";
import {
  inviteCoChair,
  addDelegate,
  addBundle,
  removeDelegate,
  updateMarks,
} from "./actions";

const SCORE_COLS: { key: string; label: string }[] = [
  { key: "poi", label: "POI" },
  { key: "chits", label: "Chits" },
  { key: "verbal_reply", label: "Verbal Reply" },
  { key: "gsl", label: "GSL" },
  { key: "mod", label: "MOD" },
  { key: "decorum", label: "Decorum" },
  { key: "research", label: "Research" },
  { key: "documentation", label: "Documentation" },
];

export default async function CommitteePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: committee, error: committeeError } = await supabase
    .from("committees")
    .select("id, name, code, conference_name, created_by")
    .eq("id", id)
    .single();

  if (committeeError || !committee) {
    redirect("/committees");
  }

  const { data: members } = await supabase
    .from("committee_members")
    .select("email, role")
    .eq("committee_id", id);

  const { data: delegates } = await supabase
    .from("delegates")
    .select("id, country, delegate_name, marks(poi, chits, verbal_reply, gsl, mod, decorum, research, documentation, notes)")
    .eq("committee_id", id)
    .order("country", { ascending: true });

  const boundInvite = inviteCoChair.bind(null, id);
  const boundAddDelegate = addDelegate.bind(null, id);
  const boundAddBundle = addBundle.bind(null, id);
  const boundRemove = removeDelegate.bind(null, id);
  const boundUpdateMarks = updateMarks.bind(null, id);

  return (
    <div style={{ minHeight: "100vh", padding: "48px 24px 120px" }}>
      <div style={{ maxWidth: 1180, margin: "0 auto" }}>
        <div className="mono" style={{ fontSize: 11, letterSpacing: 2, color: "var(--coral)", textTransform: "uppercase", marginBottom: 10 }}>
          File No. IN/MUN/MARKSHEET/{committee!.code}
        </div>
        <h1 style={{ fontFamily: "Georgia, serif", fontSize: 32, marginBottom: 6 }}>
          {committee!.name} <span style={{ color: "var(--coral)" }}>({committee!.code})</span>
        </h1>
        {committee!.conference_name && (
          <p className="mono" style={{ fontSize: 12, color: "rgba(234,217,222,0.55)", marginBottom: 30 }}>{committee!.conference_name}</p>
        )}

        {/* ---------- Co-chairs / sharing ---------- */}
        <div style={{ background: "#0F0F10", border: "1px solid rgba(234,217,222,0.1)", borderRadius: 8, padding: 22, marginBottom: 26 }}>
          <h2 style={{ fontFamily: "Georgia, serif", fontSize: 17, marginBottom: 12 }}>Dais &amp; Sharing</h2>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 14 }}>
            {members?.map((m) => (
              <span key={m.email} className="mono" style={{ fontSize: 11, background: "rgba(234,217,222,0.08)", padding: "5px 10px", borderRadius: 20, color: "rgba(234,217,222,0.75)" }}>
                {m.email} · {m.role === "chair" ? "Chair" : "Co-Chair"}
              </span>
            ))}
          </div>
          <form action={boundInvite} style={{ display: "flex", gap: 8 }}>
            <input
              type="email"
              name="email"
              placeholder="co-chair@school.edu"
              required
              style={{ flex: 1, maxWidth: 320, background: "#1A1A1B", border: "1px solid rgba(234,217,222,0.15)", color: "var(--text)", padding: "10px 12px", borderRadius: 6, fontSize: 13 }}
            />
            <button type="submit" className="mono" style={{ background: "var(--paper)", color: "var(--ink)", border: "none", padding: "0 16px", borderRadius: 6, fontSize: 11, fontWeight: 700, textTransform: "uppercase", cursor: "pointer" }}>
              Invite to Dais
            </button>
          </form>
          <p className="mono" style={{ fontSize: 10.5, color: "rgba(234,217,222,0.4)", marginTop: 10 }}>
            Anyone invited here — plus your MUNlocked admin (Secretariat) — sees this exact marksheet live, no separate copy.
          </p>
        </div>

        {/* ---------- Quick-add roster ---------- */}
        <div style={{ background: "#0F0F10", border: "1px solid rgba(234,217,222,0.1)", borderRadius: 8, padding: 22, marginBottom: 26 }}>
          <h2 style={{ fontFamily: "Georgia, serif", fontSize: 17, marginBottom: 12 }}>Build the Roster</h2>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 14 }}>
            {Object.keys(COUNTRY_BUNDLES).map((bundle) => (
              <form action={boundAddBundle} key={bundle}>
                <input type="hidden" name="bundle" value={bundle} />
                <button type="submit" className="mono" style={{ fontSize: 11, border: "1px solid rgba(201,138,148,0.4)", background: "rgba(201,138,148,0.08)", color: "var(--coral)", padding: "8px 14px", borderRadius: 20, cursor: "pointer" }}>
                  + {bundle}
                </button>
              </form>
            ))}
          </div>
          <form action={boundAddDelegate} style={{ display: "flex", gap: 8 }}>
            <input
              type="text"
              name="country"
              placeholder="Add a single country…"
              required
              style={{ flex: 1, maxWidth: 320, background: "#1A1A1B", border: "1px solid rgba(234,217,222,0.15)", color: "var(--text)", padding: "10px 12px", borderRadius: 6, fontSize: 13 }}
            />
            <button type="submit" className="mono" style={{ background: "none", border: "1.5px solid rgba(234,217,222,0.3)", color: "var(--text)", padding: "0 16px", borderRadius: 6, fontSize: 11, fontWeight: 700, textTransform: "uppercase", cursor: "pointer" }}>
              Add
            </button>
          </form>
        </div>

        {/* ---------- Marksheet ---------- */}
        <div style={{ background: "#0F0F10", border: "1px solid rgba(234,217,222,0.1)", borderRadius: 8, padding: 22, overflowX: "auto" }}>
          <h2 style={{ fontFamily: "Georgia, serif", fontSize: 17, marginBottom: 16 }}>Marksheet ({delegates?.length ?? 0} delegates)</h2>

          {(!delegates || delegates.length === 0) && (
            <p style={{ color: "rgba(234,217,222,0.5)", fontSize: 13.5 }}>No delegates yet — add some above to start grading.</p>
          )}

          {delegates && delegates.length > 0 && (
            <table style={{ borderCollapse: "collapse", width: "100%", minWidth: 900 }}>
              <thead>
                <tr>
                  <th style={thStyle}>Country</th>
                  {SCORE_COLS.map((c) => (
                    <th key={c.key} style={thStyle}>{c.label}</th>
                  ))}
                  <th style={thStyle}>Notes</th>
                  <th style={thStyle}></th>
                </tr>
              </thead>
              <tbody>
                {delegates.map((d) => {
                  const m = Array.isArray(d.marks) ? d.marks[0] : d.marks;
                  return (
                    <tr key={d.id}>
                      <td style={tdStyle}>
                        <form action={boundUpdateMarks} id={`form-${d.id}`}>
                          <input type="hidden" name="delegate_id" value={d.id} />
                        </form>
                        <span className="mono" style={{ fontSize: 13 }}>{d.country}</span>
                      </td>
                      {SCORE_COLS.map((c) => (
                        <td key={c.key} style={tdStyle}>
                          <input
                            type="number"
                            min={0}
                            name={c.key}
                            form={`form-${d.id}`}
                            defaultValue={m?.[c.key as keyof typeof m] ?? 0}
                            style={numInputStyle}
                          />
                        </td>
                      ))}
                      <td style={tdStyle}>
                        <input type="text" name="notes" form={`form-${d.id}`} defaultValue={m?.notes ?? ""} placeholder="—" style={notesInputStyle} />
                      </td>
                      <td style={tdStyle}>
                        <div style={{ display: "flex", gap: 6 }}>
                          <button type="submit" form={`form-${d.id}`} className="mono" style={saveBtnStyle}>Save</button>
                          <form action={boundRemove}>
                            <input type="hidden" name="delegate_id" value={d.id} />
                            <button type="submit" className="mono" style={removeBtnStyle}>✕</button>
                          </form>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

const thStyle: React.CSSProperties = {
  textAlign: "left",
  fontFamily: "IBM Plex Mono, monospace",
  fontSize: 10.5,
  letterSpacing: 0.5,
  textTransform: "uppercase",
  color: "rgba(234,217,222,0.5)",
  padding: "8px 10px",
  borderBottom: "1px solid rgba(234,217,222,0.12)",
};
const tdStyle: React.CSSProperties = {
  padding: "8px 10px",
  borderBottom: "1px solid rgba(234,217,222,0.06)",
  verticalAlign: "middle",
};
const numInputStyle: React.CSSProperties = {
  width: 48,
  background: "#1A1A1B",
  border: "1px solid rgba(234,217,222,0.15)",
  color: "var(--text)",
  padding: "6px 6px",
  borderRadius: 4,
  fontSize: 12.5,
  textAlign: "center",
};
const notesInputStyle: React.CSSProperties = {
  width: 130,
  background: "#1A1A1B",
  border: "1px solid rgba(234,217,222,0.15)",
  color: "var(--text)",
  padding: "6px 8px",
  borderRadius: 4,
  fontSize: 12,
};
const saveBtnStyle: React.CSSProperties = {
  background: "var(--paper)",
  color: "var(--ink)",
  border: "none",
  padding: "6px 10px",
  borderRadius: 4,
  fontSize: 10.5,
  fontWeight: 700,
  textTransform: "uppercase",
  cursor: "pointer",
};
const removeBtnStyle: React.CSSProperties = {
  background: "none",
  color: "#e59aa8",
  border: "1px solid #8B1E3F",
  padding: "6px 9px",
  borderRadius: 4,
  fontSize: 11,
  cursor: "pointer",
};
