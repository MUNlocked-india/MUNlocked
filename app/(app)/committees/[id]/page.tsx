import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { COUNTRY_BUNDLES } from "@/lib/countryBundles";
import SessionTimerDesk from "@/components/SessionTimerDesk";
import ExportMarksheet from "@/components/ExportMarksheet";
import { inviteCoChair, addDelegate, addBundle, removeDelegate, updateDelegateReview } from "./actions";

const ASSESSMENT_LABELS: Record<string, string> = {
  not_reviewed: "Not reviewed",
  engaged: "Engaged",
  strong: "Strong contribution",
  standout: "Standout",
};

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

  const [membersResult, delegatesResult] = await Promise.all([
    supabase.from("committee_members").select("email, role").eq("committee_id", id),
    supabase.from("delegates").select("id, country, delegate_name, marks(custom_scores, notes, award)").eq("committee_id", id).order("country", { ascending: true }),
  ]);

  const members = membersResult.data ?? [];
  const delegates = delegatesResult.data ?? [];

  const boundInvite = inviteCoChair.bind(null, id);
  const boundAddDelegate = addDelegate.bind(null, id);
  const boundAddBundle = addBundle.bind(null, id);
  const boundRemove = removeDelegate.bind(null, id);
  const reviewedCount = delegates.filter((delegate) => {
    const mark = Array.isArray(delegate.marks) ? delegate.marks[0] : delegate.marks;
    const review = (mark?.custom_scores ?? {}) as Record<string, unknown>;
    return review.assessment && review.assessment !== "not_reviewed";
  }).length;
  const awardedCount = delegates.filter((delegate) => {
    const mark = Array.isArray(delegate.marks) ? delegate.marks[0] : delegate.marks;
    return Boolean(mark?.award);
  }).length;
  const exportHeaders = ["Country", "Assessment", "Chair notes", "Award"];
  const exportRows = delegates.map((delegate) => {
    const mark = Array.isArray(delegate.marks) ? delegate.marks[0] : delegate.marks;
    const review = (mark?.custom_scores ?? {}) as Record<string, unknown>;
    const assessment = typeof review.assessment === "string" ? review.assessment : "not_reviewed";
    return [delegate.country, ASSESSMENT_LABELS[assessment] ?? ASSESSMENT_LABELS.not_reviewed, mark?.notes ?? "", mark?.award ?? ""];
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
          <div className="marksheet-intro-note"><i aria-hidden="true">01</i><p>Run roll call, speakers, motions and quick chair reviews from one calm live workspace.</p></div>
        </header>

        <div className="marksheet-summary">
          <article><span>Portfolios</span><strong>{delegates.length}</strong><p>Live committee roster</p></article>
          <article><span>Reviewed</span><strong>{reviewedCount}/{delegates.length}</strong><p>Quick chair assessments saved</p></article>
          <article className="leader-card"><span>Awards selected</span><strong>{awardedCount}</strong><p>Recognition stays a deliberate dais decision</p></article>
        </div>

        <SessionTimerDesk delegates={delegates.map(({ id: delegateId, country }) => ({ id: delegateId, country }))} committeeName={committee.name} committeeCode={committee.code} conferenceName={committee.conference_name} />

        <section id="marksheet" className="marksheet-record-section">
          <div className="marksheet-section-heading">
            <div><p>02 · Chair review desk</p><h2>Mark the room, not a spreadsheet.</h2></div>
            <div className="marksheet-heading-copy">Use one clear assessment, a short private note, and awards only when the dais is ready. No totals to calculate.</div>
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
                <summary><span>Export record</span><i>+</i></summary>
                <div className="toolrail-content"><p>Download the dais review record with assessments, notes and awards.</p><ExportMarksheet fileName={`${committee.code || committee.name}-chair-review`} headers={exportHeaders} rows={exportRows} /></div>
              </details>
            </aside>

            <div className="marksheet-sheet-card">
              <div className="marksheet-sheet-head">
                <div><span>Quick review board</span><h3>{delegates.length} delegate{delegates.length === 1 ? "" : "s"}</h3></div>
                <span className="best-delegate-pill">No points. Just clear chair judgement.</span>
              </div>

              {delegates.length === 0 ? <div className="marksheet-empty"><span>＋</span><h3>Your scoring room is ready.</h3><p>Add a country or a quick bundle from the panel beside the sheet.</p></div> : null}
              {delegates.length > 0 ? <div className="delegate-review-grid">{delegates.map((delegate) => {
                const mark = Array.isArray(delegate.marks) ? delegate.marks[0] : delegate.marks;
                const review = (mark?.custom_scores ?? {}) as Record<string, unknown>;
                const assessment = typeof review.assessment === "string" ? review.assessment : "not_reviewed";
                return <form action={updateDelegateReview.bind(null, id)} className="delegate-review-card" key={delegate.id}>
                  <input type="hidden" name="delegate_id" value={delegate.id} />
                  <div className="delegate-review-head"><span>{delegate.country.slice(0, 2).toUpperCase()}</span><div><h3>{delegate.country}</h3><p>{ASSESSMENT_LABELS[assessment] ?? ASSESSMENT_LABELS.not_reviewed}</p></div><button type="submit" className="remove-portfolio" formAction={boundRemove}>×</button></div>
                  <label htmlFor={`assessment-${delegate.id}`}>Chair assessment</label>
                  <select id={`assessment-${delegate.id}`} name="assessment" defaultValue={assessment} className="assessment-select"><option value="not_reviewed">Not reviewed yet</option><option value="engaged">Engaged</option><option value="strong">Strong contribution</option><option value="standout">Standout</option></select>
                  <label htmlFor={`notes-${delegate.id}`}>Private dais note</label>
                  <textarea id={`notes-${delegate.id}`} name="notes" defaultValue={mark?.notes ?? ""} placeholder="One short reminder for the dais…" rows={2} />
                  <div className="delegate-review-footer"><select name="award" defaultValue={mark?.award ?? ""} aria-label={`Award for ${delegate.country}`}><option value="">No award selected</option><option>Best Delegate</option><option>High Commendation</option><option>Special Mention</option><option>Verbal Mention</option></select><button type="submit" className="save-score">Save review</button></div>
                </form>;
              })}</div> : null}
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
