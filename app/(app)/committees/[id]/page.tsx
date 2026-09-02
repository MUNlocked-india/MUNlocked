import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { COUNTRY_BUNDLES } from "@/lib/countryBundles";
import RenameColumnInput from "@/components/RenameColumnInput";
import SessionTimerDesk from "@/components/SessionTimerDesk";
import ExportMarksheet from "@/components/ExportMarksheet";
import { inviteCoChair, addDelegate, addBundle, removeDelegate, updateMarks, addColumn, renameColumn, removeColumn } from "./actions";

export default async function CommitteePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: committee, error: committeeError } = await supabase
    .from("committees")
    .select("id, name, code, conference_name, created_by")
    .eq("id", id)
    .single();

  if (committeeError || !committee) redirect("/committees");

  const [membersResult, columnsResult, delegatesResult] = await Promise.all([
    supabase.from("committee_members").select("email, role").eq("committee_id", id),
    supabase.from("marksheet_columns").select("id, key, label, position").eq("committee_id", id).order("position", { ascending: true }),
    supabase.from("delegates").select("id, country, delegate_name, marks(custom_scores, notes, award)").eq("committee_id", id).order("country", { ascending: true }),
  ]);

  const members = membersResult.data ?? [];
  const cols = columnsResult.data ?? [];
  const delegates = delegatesResult.data ?? [];
  const columnKeys = cols.map((column) => column.key);

  const boundInvite = inviteCoChair.bind(null, id);
  const boundAddDelegate = addDelegate.bind(null, id);
  const boundAddBundle = addBundle.bind(null, id);
  const boundRemove = removeDelegate.bind(null, id);
  const boundUpdateMarks = updateMarks.bind(null, id, columnKeys);
  const boundAddColumn = addColumn.bind(null, id);
  const boundRenameColumn = renameColumn.bind(null, id);
  const boundRemoveColumn = removeColumn.bind(null, id);

  const totals: Record<string, number> = Object.fromEntries(cols.map((column) => [column.key, 0]));
  let bestDelegateId: string | null = null;
  let bestDelegateTotal = -1;

  for (const delegate of delegates) {
    const mark = Array.isArray(delegate.marks) ? delegate.marks[0] : delegate.marks;
    const scores = (mark?.custom_scores ?? {}) as Record<string, number>;
    let rowTotal = 0;
    for (const column of cols) {
      const value = Number(scores[column.key] ?? 0);
      totals[column.key] += value;
      rowTotal += value;
    }
    if (rowTotal > bestDelegateTotal) {
      bestDelegateTotal = rowTotal;
      bestDelegateId = delegate.id;
    }
  }

  const bestDelegate = delegates.find((delegate) => delegate.id === bestDelegateId);
  const exportHeaders = ["Country", ...cols.map((column) => column.label), "Total", "Notes", "Award"];
  const exportRows = delegates.map((delegate) => {
    const mark = Array.isArray(delegate.marks) ? delegate.marks[0] : delegate.marks;
    const scores = (mark?.custom_scores ?? {}) as Record<string, number>;
    const rowTotal = cols.reduce((sum, column) => sum + Number(scores[column.key] ?? 0), 0);
    return [delegate.country, ...cols.map((column) => Number(scores[column.key] ?? 0)), rowTotal, mark?.notes ?? "", mark?.award ?? ""];
  });

  return (
    <div className="marksheet-studio">
      <div className="marksheet-studio-glow" aria-hidden="true" />
      <div className="marksheet-studio-shell">
        <header className="marksheet-intro">
          <div>
            <p className="marksheet-kicker">MUNlocked · Digital dais workspace</p>
            <h1>{committee.name}</h1>
            <div className="marksheet-meta"><span>{committee.code}</span>{committee.conference_name ? <span>{committee.conference_name}</span> : null}<span>{delegates.length} portfolios</span></div>
          </div>
          <div className="marksheet-intro-note"><i aria-hidden="true">01</i><p>Run roll call, speakers, motions and scoring from one calm live workspace.</p></div>
        </header>

        <div className="marksheet-summary">
          <article><span>Portfolios</span><strong>{delegates.length}</strong><p>Live committee roster</p></article>
          <article><span>Scoring signals</span><strong>{cols.length}</strong><p>Editable grading criteria</p></article>
          <article className="leader-card"><span>Current lead</span><strong>{bestDelegate?.country ?? "No scores yet"}</strong><p>{bestDelegate ? `${bestDelegateTotal.toFixed(1)} recorded points` : "The board updates as the dais scores"}</p></article>
        </div>

        <SessionTimerDesk delegates={delegates.map(({ id: delegateId, country }) => ({ id: delegateId, country }))} committeeName={committee.name} committeeCode={committee.code} conferenceName={committee.conference_name} />

        <section id="marksheet" className="marksheet-record-section">
          <div className="marksheet-section-heading">
            <div><p>02 · Assessment room</p><h2>The live marksheet</h2></div>
            <div className="marksheet-heading-copy">Every score, private note and award stays in one shared record for the dais.</div>
          </div>

          <div className="marksheet-record-layout">
            <aside className="marksheet-toolrail">
              <details open>
                <summary><span>Build roster</span><i>+</i></summary>
                <div className="toolrail-content">
                  <p>Add a recognised bloc in one click, or type a single portfolio.</p>
                  <div className="bundle-grid">
                    {Object.keys(COUNTRY_BUNDLES).map((bundle) => <form action={boundAddBundle} key={bundle}><input type="hidden" name="bundle" value={bundle} /><button type="submit">+ {bundle}</button></form>)}
                  </div>
                  <form action={boundAddDelegate} className="toolrail-inline-form"><input type="text" name="country" placeholder="Add a single country…" required /><button type="submit">Add</button></form>
                </div>
              </details>

              <details>
                <summary><span>Scoring criteria</span><i>+</i></summary>
                <div className="toolrail-content"><p>Add any conference-specific signal to the default sheet.</p><form action={boundAddColumn} className="toolrail-inline-form"><input type="text" name="label" placeholder="e.g. Position paper" required /><button type="submit">Add</button></form></div>
              </details>

              <details>
                <summary><span>Export record</span><i>+</i></summary>
                <div className="toolrail-content"><p>Download live scores, notes and awards as a clean CSV record.</p><ExportMarksheet fileName={`${committee.code || committee.name}-marksheet`} headers={exportHeaders} rows={exportRows} /></div>
              </details>
            </aside>

            <div className="marksheet-sheet-card">
              <div className="marksheet-sheet-head">
                <div><span>Live scoring</span><h3>{delegates.length} delegate{delegates.length === 1 ? "" : "s"}</h3></div>
                {bestDelegate ? <span className="best-delegate-pill">★ Best delegate · {bestDelegate.country}</span> : null}
              </div>

              {delegates.length === 0 ? <div className="marksheet-empty"><span>＋</span><h3>Your scoring room is ready.</h3><p>Add a country or a quick bundle from the panel beside the sheet.</p></div> : null}
              {delegates.length > 0 && cols.length === 0 ? <div className="marksheet-empty"><span>＋</span><h3>Add your first criterion.</h3><p>Open “Scoring criteria” and build the sheet your conference needs.</p></div> : null}

              {delegates.length > 0 && cols.length > 0 ? (
                <div className="marksheet-table-wrap">
                  <table className="marksheet-table">
                    <thead><tr><th>Portfolio</th>{cols.map((column) => <th key={column.id}><div className="column-heading"><RenameColumnInput action={boundRenameColumn} columnId={column.id} defaultLabel={column.label} /><form action={boundRemoveColumn}><input type="hidden" name="column_id" value={column.id} /><button type="submit" title="Remove criterion" aria-label={`Remove ${column.label}`}>×</button></form></div></th>)}<th>Total</th><th>Chair notes</th><th>Award</th><th><span className="sr-only">Actions</span></th></tr></thead>
                    <tbody>
                      {delegates.map((delegate) => {
                        const mark = Array.isArray(delegate.marks) ? delegate.marks[0] : delegate.marks;
                        const scores = (mark?.custom_scores ?? {}) as Record<string, number>;
                        const rowTotal = cols.reduce((sum, column) => sum + Number(scores[column.key] ?? 0), 0);
                        const isBest = delegate.id === bestDelegateId;
                        return (
                          <tr key={delegate.id} className={isBest ? "is-leading" : ""}>
                            <td><form action={boundUpdateMarks} id={`form-${delegate.id}`}><input type="hidden" name="delegate_id" value={delegate.id} /></form><span className="portfolio-name">{isBest ? <i>★</i> : null}{delegate.country}</span></td>
                            {cols.map((column) => <td key={column.id}><input className="score-input" type="number" min={0} step="0.5" name={`col_${column.key}`} form={`form-${delegate.id}`} defaultValue={scores[column.key] ?? 0} aria-label={`${column.label} score for ${delegate.country}`} /></td>)}
                            <td><strong className="row-total">{rowTotal.toFixed(1)}</strong></td>
                            <td><input className="notes-input" type="text" name="notes" form={`form-${delegate.id}`} defaultValue={mark?.notes ?? ""} placeholder="Add a note…" aria-label={`Notes for ${delegate.country}`} /></td>
                            <td><select className="award-select" name="award" form={`form-${delegate.id}`} defaultValue={mark?.award ?? ""} aria-label={`Award for ${delegate.country}`}><option value="">No award</option><option>Best Delegate</option><option>High Commendation</option><option>Special Mention</option><option>Verbal Mention</option></select></td>
                            <td><div className="row-actions"><button type="submit" form={`form-${delegate.id}`} className="save-score">Save</button><form action={boundRemove}><input type="hidden" name="delegate_id" value={delegate.id} /><button type="submit" className="remove-portfolio" aria-label={`Remove ${delegate.country}`}>×</button></form></div></td>
                          </tr>
                        );
                      })}
                    </tbody>
                    <tfoot><tr><td>Column totals</td>{cols.map((column) => <td key={column.id}>{totals[column.key]}</td>)}<td>—</td><td /><td /><td /></tr></tfoot>
                  </table>
                </div>
              ) : null}
            </div>
          </div>
        </section>

        <section id="dais-sharing" className="dais-sharing-section">
          <div className="dais-sharing-copy"><p>03 · Shared dais</p><h2>One room. One record.</h2><span>Invite a co-chair by email. They receive access to this exact committee and can keep the session moving with you.</span></div>
          <div className="dais-sharing-card">
            <div className="dais-members">{members.map((member) => <div key={member.email}><span>{member.email.slice(0, 1).toUpperCase()}</span><p><strong>{member.email}</strong><small>{member.role === "chair" ? "Chair" : "Co-chair"}</small></p></div>)}</div>
            <form action={boundInvite} className="dais-invite-form"><label htmlFor="co-chair-email">Invite another member of the dais</label><div><input id="co-chair-email" type="email" name="email" placeholder="co-chair@school.edu" required /><button type="submit">Send invitation →</button></div></form>
          </div>
        </section>
      </div>
    </div>
  );
}
