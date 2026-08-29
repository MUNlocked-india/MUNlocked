import Image from "next/image";

export default function FounderPage() {
  return (
    <div style={{ minHeight: "100vh" }}>
      <div style={{ maxWidth: 1080, margin: "0 auto", padding: "56px 24px 100px" }}>
        <div className="mono" style={{ fontSize: 11, letterSpacing: 2, color: "var(--coral)", textTransform: "uppercase", marginBottom: 10 }}>
          File No. IN/MUN/FOUNDER — Personal Record
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "minmax(220px, 340px) 1fr", gap: 48, alignItems: "flex-start" }}>
          <div style={{ borderRadius: 10, overflow: "hidden", border: "1px solid rgba(234,217,222,0.12)", boxShadow: "0 20px 50px rgba(0,0,0,0.4)" }}>
            <Image src="/founder.jpg" alt="Rishi Sahni" width={900} height={1200} style={{ width: "100%", height: "auto", display: "block" }} priority />
          </div>

          <div>
            <h1 style={{ fontFamily: "Georgia, serif", fontSize: 36, marginBottom: 6 }}>Rishi Sahni</h1>
            <p className="mono" style={{ fontSize: 12.5, color: "var(--mauve)", letterSpacing: 0.5, marginBottom: 26 }}>
              Founder, MUNlocked — Chairperson, IMF, Aethris MUN
            </p>

            <p style={{ fontFamily: "Georgia, serif", fontStyle: "italic", fontSize: 20, lineHeight: 1.5, borderLeft: "3px solid var(--coral)", paddingLeft: 18, color: "var(--text)", maxWidth: 560, marginBottom: 28 }}>
              &ldquo;I&apos;m not trying to build another listings site. I&apos;m trying to build the thing that makes bias harder to get away with.&rdquo;
            </p>

            <div style={{ maxWidth: 560, display: "flex", flexDirection: "column", gap: 16 }}>
              <p style={{ fontSize: 15, lineHeight: 1.8, color: "rgba(234,217,222,0.75)" }}>
                I&apos;ve sat on enough dais benches and enough delegate rows to know the same complaints on repeat: Executive Boards picked because of who they know, not what they know. Conferences that quietly favor their own circle. First-time delegates walking into committee with no idea what a POI even is, because no one handed them a background guide.
              </p>
              <p style={{ fontSize: 15, lineHeight: 1.8, color: "rgba(234,217,222,0.75)" }}>
                MUNlocked exists to remove the guesswork. Executive Boards get hired on a public track record, not a group chat. Conferences list themselves against real, checked criteria, and I personally review every one before it goes live. Research is free from day one, verified before it&apos;s published, and credited to the person who actually wrote it. Every committee runs on one shared, transparent marksheet instead of five conflicting spreadsheets passed around on the last day.
              </p>
              <p style={{ fontSize: 15, lineHeight: 1.8, color: "rgba(234,217,222,0.75)" }}>
                I want a first-timer&apos;s first conference to feel like it was actually built for them — and I want the circuit to be judged on preparation and argument, not on who you happen to know.
              </p>
            </div>

            <div className="mono" style={{ marginTop: 28, fontSize: 12, letterSpacing: 1 }}>
              <b style={{ display: "block", fontFamily: "Georgia, serif", fontSize: 17, letterSpacing: 0, marginBottom: 2 }}>Rishi Sahni</b>
              Founder, MUNlocked
            </div>
          </div>
        </div>

        <div style={{ marginTop: 70, paddingTop: 40, borderTop: "1px solid rgba(234,217,222,0.08)" }}>
          <div className="mono" style={{ fontSize: 11, letterSpacing: 2, color: "var(--brass)", textTransform: "uppercase", marginBottom: 8 }}>
            The Standing Rules
          </div>
          <h2 style={{ fontFamily: "Georgia, serif", fontSize: 26, marginBottom: 30 }}>What MUNlocked Won&apos;t Compromise On</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 30 }}>
            <div style={{ borderTop: "2px solid var(--coral)", paddingTop: 16 }}>
              <div className="mono" style={{ fontSize: 10.5, color: "rgba(234,217,222,0.4)", textTransform: "uppercase", marginBottom: 8 }}>Rule 01</div>
              <h3 style={{ fontFamily: "Georgia, serif", fontSize: 18, marginBottom: 8 }}>No Closed Rooms</h3>
              <p style={{ fontSize: 13.5, color: "rgba(234,217,222,0.6)", lineHeight: 1.7 }}>Every EB appointment and every conference listing goes through a visible, checkable process — not a private group chat.</p>
            </div>
            <div style={{ borderTop: "2px solid var(--coral)", paddingTop: 16 }}>
              <div className="mono" style={{ fontSize: 10.5, color: "rgba(234,217,222,0.4)", textTransform: "uppercase", marginBottom: 8 }}>Rule 02</div>
              <h3 style={{ fontFamily: "Georgia, serif", fontSize: 18, marginBottom: 8 }}>Research Stays Free</h3>
              <p style={{ fontSize: 13.5, color: "rgba(234,217,222,0.6)", lineHeight: 1.7 }}>A first-time delegate should never have to pay to understand their committee. Verified research is free from day one.</p>
            </div>
            <div style={{ borderTop: "2px solid var(--coral)", paddingTop: 16 }}>
              <div className="mono" style={{ fontSize: 10.5, color: "rgba(234,217,222,0.4)", textTransform: "uppercase", marginBottom: 8 }}>Rule 03</div>
              <h3 style={{ fontFamily: "Georgia, serif", fontSize: 18, marginBottom: 8 }}>One Record, Not Five Spreadsheets</h3>
              <p style={{ fontSize: 13.5, color: "rgba(234,217,222,0.6)", lineHeight: 1.7 }}>Scoring, attendance, and recognition live in one shared marksheet the whole dais and Secretariat can actually see.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
