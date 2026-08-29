import { submitResearch } from "../actions";

export default async function SubmitResearchPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; success?: string }>;
}) {
  const params = await searchParams;

  return (
    <div className="auth-wrap" style={{ alignItems: "flex-start", paddingTop: 60 }}>
      <form action={submitResearch} className="auth-card" style={{ maxWidth: 560 }}>
        <div className="mono" style={{ fontSize: 11, letterSpacing: 2, color: "var(--coral)", marginBottom: 8, textTransform: "uppercase" }}>
          File No. IN/MUN/RESEARCH-SUBMIT
        </div>
        <h1 style={{ fontFamily: "Georgia, serif", fontSize: 24, marginBottom: 6 }}>Submit Research</h1>
        <p style={{ fontSize: 13, color: "rgba(7,7,7,0.6)", marginBottom: 20 }}>
          Every submission is screened for research value, then reviewed by the MUNlocked admin. Marketing, spam, or off-agenda writing is rejected.
        </p>

        {params.success && <p className="success-text">Submitted — it's now pending admin review.</p>}
        {params.error && <p className="error-text">Error: {params.error}</p>}

        <label htmlFor="title">Title</label>
        <input id="title" name="title" type="text" required />

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
          <div>
            <label htmlFor="committee">Committee</label>
            <input id="committee" name="committee" type="text" required placeholder="UNSC" />
          </div>
          <div>
            <label htmlFor="document_type">Document Type</label>
            <select
              id="document_type"
              name="document_type"
              style={{ width: "100%", padding: "12px 14px", border: "1px solid rgba(7,7,7,0.2)", borderRadius: 3, background: "rgba(255,255,255,0.5)", fontSize: 14, color: "var(--ink)", marginTop: 6, marginBottom: 16 }}
            >
              <option>Background Guide</option>
              <option>Policy Brief</option>
              <option>Country Profile</option>
              <option>Crisis Note</option>
            </select>
          </div>
        </div>

        <label htmlFor="agenda">Agenda</label>
        <input id="agenda" name="agenda" type="text" required placeholder="e.g. Global Plastics Treaty" />

        <label htmlFor="summary">Summary (shown on the card)</label>
        <textarea id="summary" name="summary" required rows={3} style={textareaStyle} />

        <label htmlFor="full_text">Full Research Text</label>
        <textarea id="full_text" name="full_text" required rows={10} style={textareaStyle} placeholder="Paste the full background guide / brief here." />

        <button type="submit" className="submit">Submit for Review</button>
      </form>
    </div>
  );
}

const textareaStyle: React.CSSProperties = {
  width: "100%",
  padding: "12px 14px",
  border: "1px solid rgba(7,7,7,0.2)",
  borderRadius: 3,
  background: "rgba(255,255,255,0.4)",
  fontFamily: "Georgia, serif",
  fontSize: 14,
  color: "var(--ink)",
  marginTop: 6,
  marginBottom: 16,
  resize: "vertical",
};
