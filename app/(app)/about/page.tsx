const PHASES = [
  {
    phase: "Phase 1",
    title: "Foundation",
    items: [
      "Premium, animated product experience",
      "Scalable backend architecture",
      "Auth, dashboards, conference & research databases",
      "Marksheet engine and analytics groundwork",
    ],
  },
  {
    phase: "Phase 2",
    title: "Free Launch",
    items: [
      "Conference listing platform",
      "Verified Executive Board profiles",
      "Free research library",
      "Delegate dashboard and MUN portfolio",
    ],
  },
  {
    phase: "Phase 3",
    title: "Soft Launch",
    items: [
      "Populated library and multiple live listings",
      "Backend tested end to end",
      "Active social presence and community feedback",
      "Public announcement only once polished",
    ],
  },
  {
    phase: "Phase 4",
    title: "Monetization",
    items: [
      "Premium research subscriptions",
      "Conference promotion packages",
      "Featured EB recruitment",
      "Priority search and newsletter placement",
    ],
  },
];

export default function AboutPage() {
  return (
    <div style={{ minHeight: "100vh" }}>
      <div style={{ maxWidth: 1080, margin: "0 auto", padding: "56px 24px 40px" }}>
        <div className="mono" style={{ fontSize: 11, letterSpacing: 2, color: "var(--coral)", textTransform: "uppercase", marginBottom: 10 }}>
          Vision
        </div>
        <h1 style={{ fontFamily: "Anton, sans-serif", fontWeight: 400, textTransform: "uppercase", fontSize: "clamp(30px, 4.5vw, 54px)", lineHeight: 1.05, marginBottom: 20 }}>
          The operating system for<br />India&apos;s MUN circuit
        </h1>
        <p style={{ fontSize: 15.5, lineHeight: 1.8, color: "rgba(234,217,222,0.7)", maxWidth: 640 }}>
          Not another event listing site — a complete ecosystem spanning discovery, registration, committee management, research, live sessions, awards, and post-conference records. MUNlocked isn&apos;t designed to compete solely on features; its advantage comes from execution: better user experience, local understanding, strong community relationships, and richer research, combined into something significantly harder to copy than any single feature.
        </p>
      </div>

      <div style={{ maxWidth: 1080, margin: "0 auto", padding: "20px 24px 100px" }}>
        <h2 style={{ fontFamily: "Anton, sans-serif", fontWeight: 400, textTransform: "uppercase", fontSize: "clamp(24px, 3vw, 34px)", marginBottom: 34 }}>
          Roadmap
        </h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 22 }}>
          {PHASES.map((p) => (
            <div key={p.phase} style={{ background: "#0F0F10", border: "1px solid rgba(234,217,222,0.1)", borderRadius: 8, padding: 26 }}>
              <div className="mono" style={{ fontSize: 11, letterSpacing: 1.5, textTransform: "uppercase", color: "var(--brass)", marginBottom: 6 }}>
                {p.phase}
              </div>
              <h3 style={{ fontFamily: "Georgia, serif", fontSize: 21, marginBottom: 14 }}>{p.title}</h3>
              <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 8 }}>
                {p.items.map((item) => (
                  <li key={item} className="mono" style={{ fontSize: 12.5, color: "rgba(234,217,222,0.65)", lineHeight: 1.5 }}>
                    · {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
