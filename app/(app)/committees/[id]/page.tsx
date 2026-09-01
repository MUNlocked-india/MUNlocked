import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { COUNTRY_BUNDLES } from "@/lib/countryBundles";
import RenameColumnInput from "@/components/RenameColumnInput";
import SpeechTimer from "@/components/SpeechTimer";
import {
  inviteCoChair,
  addDelegate,
  addBundle,
  removeDelegate,
  updateMarks,
  addColumn,
  renameColumn,
  removeColumn,
} from "./actions";

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

  const { data: columns } = await supabase
    .from("marksheet_columns")
    .select("id, key, label, position")
    .eq("committee_id", id)
    .order("position", { ascending: true });

  const { data: delegates } = await supabase
    .from("delegates")
    .select("id, country, delegate_name, marks(custom_scores, notes, award)")
    .eq("committee_id", id)
    .order("country", { ascending: true });

  const cols = columns ?? [];
  const columnKeys = cols.map((c) => c.key);

  const boundInvite = inviteCoChair.bind(null, id);
  const boundAddDelegate = addDelegate.bind(null, id);
  const boundAddBundle = addBundle.bind(null, id);
  const boundRemove = removeDelegate.bind(null, id);
  const boundUpdateMarks = updateMarks.bind(null, id, columnKeys);
  const boundAddColumn = addColumn.bind(null, id);
  const boundRenameColumn = renameColumn.bind(null, id);
  const boundRemoveColumn = removeColumn.bind(null, id);

  // Totals per column, and best-delegate (highest sum across all columns).
  const totals: Record<string, number> = {};
  cols.forEach((c) => (totals[c.key] = 0));
  let bestDelegateId: string | null = null;
  let bestDelegateTotal = -1;

  delegates?.forEach((d) => {
    const m = Array.isArray(d.marks) ? d.marks[0] : d.marks;
    const scores = (m?.custom_scores ?? {}) as Record<string, number>;
    let rowTotal = 0;
    cols.forEach((c) => {
      const v = Number(scores[c.key] ?? 0);
      totals[c.key] += v;
      rowTotal += v;
    });
    if (rowTotal > bestDelegateTotal) {
      bestDelegateTotal = rowTotal;
      bestDelegateId = d.id;
    }
  });

  return (
    <div style={{ minHeight: "100vh", padding: "48px 24px 120px" }}>
      <div style={{ maxWidth: 1300, margin: "0 auto" }}>
        <div className="mono" style={{ fontSize: 11, letterSpacing: 2, color: "var(--coral)", textTransform: "uppercase", marginBottom: 10 }}>
          File No. IN/MUN/MARKSHEET/{committee!.code}
        </div>
        <h1 style={{ fontFamily: "Georgia, serif", fontSize: 32, marginBottom: 6 }}>
          {committee!.name} <span style={{ color: "var(--coral)" }}>({committee!.code})</span>
        </h1>
        {committee!.conference_name && (
          <p className="mono" style={{ fontSize: 12, color: "rgba(234,217,222,0.55)", marginBottom: 30 }}>{committee!.conference_name}</p>
        )}

        <div style={{ display: "grid", gridTemplateColumns: "260px 1fr", gap: 24, alignItems: "flex-start" }}>
          {/* ---------- LEFT SIDEBAR: roster tools ---------- */}
          <div style={{ display: "flex", flexDirection: "column", gap: 18, position: "sticky", top: 20 }}>
            <div style={{ background: "#0F0F10", border: "1px solid rgba(234,217,222,0.1)", borderRadius: 14, padding: 20 }}>
              <h2 style={{ fontFamily: "Georgia, serif", fontSize: 15, marginBottom: 12 }}>Quick-Add Bundles</h2>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {Object.keys(COUNTRY_BUNDLES).map((bundle) => (
                  <form action={boundAddBundle} key={bundle}>
                    <input type="hidden" name="bundle" value={bundle} />
                    <button type="submit" className="mono" style={{ width: "100%", textAlign: "left", fontSize: 11.5, border: "1px solid rgba(201,138,148,0.35)", background: "rgba(201,138,148,0.06)", color: "var(--coral)", padding: "8px 12px", borderRadius: 8, cursor: "pointer" }}>
                      + {bundle}
                    </button>
                  </form>
                ))}
              </div>
              <form action={boundAddDelegate} style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 14 }}>
                <input
                  type="text"
                  name="country"
                  placeholder="Add single country…"
                  required
                  style={{ background: "#1A1A1B", border: "1px solid rgba(234,217,222,0.15)", color: "var(--text)", padding: "9px 11px", borderRadius: 8, fontSize: 12.5 }}
                />
                <button type="submit" className="mono" style={{ background: "none", border: "1.5px solid rgba(234,217,222,0.3)", color: "var(--text)", padding: "8px 0", borderRadius: 8, fontSize: 11, fontWeight: 700, textTransform: "uppercase", cursor: "pointer" }}>
                  Add
                </button>
              </form>
            </div>

            <div style={{ background: "#0F0F10", border: "1px solid rgba(234,217,222,0.1)", borderRadius: 14, padding: 20 }}>
              <h2 style={{ fontFamily: "Georgia, serif", fontSize: 15, marginBottom: 12 }}>Dais &amp; Sharing</h2>
              <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 12 }}>
                {members?.map((m) => (
                  <span key={m.email} className="mono" style={{ fontSize: 10.5, background: "rgba(234,217,222,0.08)", padding: "5px 9px", borderRadius: 8, color: "rgba(234,217,222,0.75)" }}>
                    {m.email} · {m.role === "chair" ? "Chair" : "Co-Chair"}
                  </span>
                ))}
              </div>
              <form action={boundInvite} style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <input
                  type="email"
                  name="email"
                  placeholder="co-chair@school.edu"
                  required
                  style={{ background: "#1A1A1B", border: "1px solid rgba(234,217,222,0.15)", color: "var(--text)", padding: "9px 11px", borderRadius: 8, fontSize: 12 }}
                />
                <button type="submit" className="mono" style={{ background: "var(--paper)", color: "var(--ink)", border: "none", padding: "8px 0", borderRadius: 8, fontSize: 11, fontWeight: 700, textTransform: "uppercase", cursor: "pointer" }}>
                  Invite to Dais
                </button>
              </form>
              <p className="mono" style={{ fontSize: 10, color: "rgba(234,217,222,0.4)", marginTop: 10, lineHeight: 1.5 }}>
                Invited co-chairs and MUNlocked admins see this exact live sheet.
              </p>
            </div>

            <div style={{ background: "#0F0F10", border: "1px solid rgba(234,217,222,0.1)", borderRadius: 14, padding: 20 }}>
              <h2 style={{ fontFamily: "Georgia, serif", fontSize: 15, marginBottom: 12 }}>Add Grading Column</h2>
              <form action={boundAddColumn} style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <input
                  type="text"
                  name="label"
                  placeholder="e.g. Position Paper"
                  required
                  style={{ background: "#1A1A1B", border: "1px solid rgba(234,217,222,0.15)", color: "var(--text)", padding: "9px 11px", borderRadius: 8, fontSize: 12.5 }}
                />
                <button type="submit" className="mono" style={{ background: "var(--brass)", color: "var(--ink)", border: "none", padding: "8px 0", borderRadius: 8, fontSize: 11, fontWeight: 700, textTransform: "uppercase", cursor: "pointer" }}>
                  + Add Column
                </button>
              </form>
            </div>
          </div>

          {/* ---------- RIGHT: the marksheet grid ---------- */}
          <div style={{ background: "#0F0F10", border: "1px solid rgba(234,217,222,0.1)", borderRadius: 14, padding: 22, overflowX: "auto" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, flexWrap: "wrap", gap: 8 }}>
              <h2 style={{ fontFamily: "Georgia, serif", fontSize: 17 }}>Marksheet ({delegates?.length ?? 0} delegates)</h2>
              {bestDelegateId && (
                <span className="mono" style={{ fontSize: 10.5, background: "rgba(199,166,107,0.15)", border: "1px solid var(--brass)", color: "var(--brass)", padding: "5px 10px", borderRadius: 20, textTransform: "uppercase" }}>
                  🏆 Best Delegate: {delegates?.find((d) => d.id === bestDelegateId)?.country}
                </span>
              )}
            </div>

            {(!delegates || delegates.length === 0) && (
              <p style={{ color: "rgba(234,217,222,0.5)", fontSize: 13.5 }}>No delegates yet — use a bundle or add a country on the left to start grading.</p>
            )}

            {delegates && delegates.length > 0 && cols.length > 0 && (
              <table style={{ borderCollapse: "collapse", width: "100%", minWidth: 900 }}>
                <thead>
                  <tr>
                    <th style={thStyle}>Country</th>
                    {cols.map((c) => (
                      <th key={c.id} style={{ ...thStyle, minWidth: 92 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                          <RenameColumnInput action={boundRenameColumn} columnId={c.id} defaultLabel={c.label} />
                          <form action={boundRemoveColumn}>
                            <input type="hidden" name="column_id" value={c.id} />
                            <button type="submit" title="Remove column" style={{ background: "none", border: "none", color: "rgba(234,217,222,0.3)", cursor: "pointer", fontSize: 11, padding: 0 }}>✕</button>
                          </form>
                        </div>
                      </th>
                    ))}
                    <th style={thStyle}>Notes</th>
                    <th style={thStyle}>Award</th>
                    <th style={thStyle}></th>
                  </tr>
                </thead>
                <tbody>
                  {delegates.map((d) => {
                    const m = Array.isArray(d.marks) ? d.marks[0] : d.marks;
                    const scores = (m?.custom_scores ?? {}) as Record<string, number>;
                    const isBest = d.id === bestDelegateId;
                    return (
                      <tr key={d.id} style={isBest ? { background: "rgba(199,166,107,0.06)" } : undefined}>
                        <td style={tdStyle}>
                          <form action={boundUpdateMarks} id={`form-${d.id}`}>
                            <input type="hidden" name="delegate_id" value={d.id} />
                          </form>
                          <span className="mono" style={{ fontSize: 13 }}>{isBest ? "🏆 " : ""}{d.country}</span>
                        </td>
                        {cols.map((c) => (
                          <td key={c.id} style={tdStyle}>
                            <input
                              type="number"
                              min={0}
                              name={`col_${c.key}`}
                              form={`form-${d.id}`}
                              defaultValue={scores[c.key] ?? 0}
                              style={numInputStyle}
                            />
                          </td>
                        ))}
                        <td style={tdStyle}>
                          <input type="text" name="notes" form={`form-${d.id}`} defaultValue={m?.notes ?? ""} placeholder="—" style={notesInputStyle} />
                        </td>
                        <td style={tdStyle}>
                          <select name="award" form={`form-${d.id}`} defaultValue={m?.award ?? ""} style={{ ...notesInputStyle, width: 150 }}>
                            <option value="">—</option><option>Best Delegate</option><option>High Commendation</option><option>Special Mention</option><option>Verbal Mention</option>
                          </select>
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
                <tfoot>
                  <tr style={{ borderTop: "2px solid rgba(234,217,222,0.15)" }}>
                    <td style={{ ...tdStyle, fontFamily: "IBM Plex Mono, monospace", fontSize: 11, textTransform: "uppercase", color: "var(--brass)" }}>Totals</td>
                    {cols.map((c) => (
                      <td key={c.id} style={{ ...tdStyle, fontFamily: "IBM Plex Mono, monospace", fontSize: 12.5, color: "var(--brass)", fontWeight: 700, textAlign: "center" }}>
                        {totals[c.key]}
                      </td>
                    ))}
                    <td style={tdStyle}></td>
                    <td style={tdStyle}></td>
                    <td style={tdStyle}></td>
                  </tr>
                </tfoot>
              </table>
            )}

            {cols.length === 0 && (
              <p style={{ color: "rgba(234,217,222,0.5)", fontSize: 13.5 }}>No grading columns yet — add one from the left sidebar.</p>
            )}
          </div>
        </div>
      </div>
      <SpeechTimer />
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
  borderRadius: 6,
  fontSize: 12.5,
  textAlign: "center",
};
const notesInputStyle: React.CSSProperties = {
  width: 130,
  background: "#1A1A1B",
  border: "1px solid rgba(234,217,222,0.15)",
  color: "var(--text)",
  padding: "6px 8px",
  borderRadius: 6,
  fontSize: 12,
};
const saveBtnStyle: React.CSSProperties = {
  background: "var(--paper)",
  color: "var(--ink)",
  border: "none",
  padding: "6px 10px",
  borderRadius: 6,
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
  borderRadius: 6,
  fontSize: 11,
  cursor: "pointer",
};
