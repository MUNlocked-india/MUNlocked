import AboutRace from "@/components/AboutRace";

const STATIONS = [
  ["01", "Verified EB", "Evidence-led profiles and direct MUNlocked enquiries."],
  ["02", "Open Research", "Free guides give every delegate a stronger start."],
  ["03", "ASKMUNlocked", "Speeches, motions, POIs and procedure by text or voice."],
  ["04", "Live Dais", "Shared marksheets and live scores replace scattered files."],
  ["05", "Better Rooms", "Verified conferences, prepared delegates and credible EBs."],
];
export default function AboutPage() {
  return <AboutRace><main style={{ minHeight: "160vh", padding: "64px 24px 110px" }}><style>{`@keyframes rise{from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:translateY(0)}}.race-station{animation:rise .55s both}`}</style><div style={{ maxWidth: 1100, margin: "0 auto" }}>
    <div className="mono" style={{ fontSize: 11, letterSpacing: 2, color: "var(--coral)", textTransform: "uppercase" }}>MUNlocked · The long race</div>
    <h1 style={{ fontFamily: "Anton, sans-serif", fontWeight: 400, textTransform: "uppercase", fontSize: "clamp(38px,6vw,78px)", lineHeight: .94, margin: "14px 0" }}>From the first motion<br />to the final gavel.</h1>
    <p style={{ maxWidth: 610, fontSize: 16, lineHeight: 1.75, color: "rgba(234,217,222,.7)", marginBottom: 50 }}>A fairer MUN circuit—where preparation and a real track record matter more than gatekeeping.</p>
    <div style={{ borderTop: "2px dashed rgba(234,217,222,.25)", paddingTop: 30 }}><div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(185px,1fr))", gap: 16 }}>{STATIONS.map(([number, title, copy], index) => <section key={number} className="race-station" style={{ animationDelay: `${index * 120}ms`, background: "rgba(12,10,17,.78)", border: "1px solid rgba(234,217,222,.15)", borderRadius: 14, padding: 20, minHeight: 210 }}><div className="mono" style={{ color: "var(--brass)", fontSize: 11, letterSpacing: 2 }}>{number} · STATION</div><h2 style={{ fontFamily: "Georgia,serif", fontSize: 22, margin: "26px 0 12px" }}>{title}</h2><p style={{ fontSize: 13.5, lineHeight: 1.65, color: "rgba(234,217,222,.64)" }}>{copy}</p></section>)}</div></div>
  </div></main></AboutRace>;
}
