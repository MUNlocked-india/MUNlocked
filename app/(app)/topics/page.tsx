const COMMITTEES = [
  { code: "UNSC", name: "Security Council", tag: "Peace & Security", topics: ["Red Sea maritime security", "Veto reform", "Peacekeeping mandates"] },
  { code: "UNHRC", name: "Human Rights Council", tag: "Human Rights", topics: ["Human rights defenders", "Digital surveillance & spyware", "Minority protections"] },
  { code: "DISEC", name: "Disarmament & International Security", tag: "Disarmament", topics: ["Autonomous weapons (LAWS)", "NPT / CTBT / FMCT", "Cyber warfare norms"] },
  { code: "WHO", name: "World Health Organization", tag: "Health for all", topics: ["Pandemic preparedness accord", "UHC & health workforce migration", "AMR"] },
  { code: "UNEP", name: "UN Environment Programme", tag: "Protecting the planet", topics: ["Global plastics treaty", "Climate finance & loss and damage", "Biodiversity"] },
  { code: "ECOSOC", name: "Economic & Social Council", tag: "Sustainable development", topics: ["Sovereign debt distress", "AI & future of work", "SDG financing"] },
  { code: "AIPPM", name: "All India Political Parties Meet", tag: "Fast-paced, evolving scenarios", topics: ["War cabinets", "Historic scenarios", "Cabinet crisis simulations"] },
  { code: "HISTORIC", name: "Historic UNGA", tag: "Decisions that shaped history", topics: ["Cuban Missile Crisis", "Suez Crisis", "Partition-era diplomacy"] },
  { code: "UNODC", name: "UN Office on Drugs & Crime", tag: "Transnational crime", topics: ["Cross-border narcotics trafficking", "Human trafficking", "Cybercrime conventions"] },
];

export default function TopicsPage() {
  return (
    <div style={{ minHeight: "100vh", padding: "56px 24px 100px" }}>
      <div style={{ maxWidth: 1180, margin: "0 auto" }}>
        <div className="mono" style={{ fontSize: 11, letterSpacing: 2, color: "var(--coral)", textTransform: "uppercase", marginBottom: 10 }}>
          File No. IN/MUN/COMMITTEES
        </div>
        <h1 style={{ fontFamily: "Georgia, serif", fontSize: 32, marginBottom: 10 }}>Committees</h1>
        <p style={{ color: "rgba(234,217,222,0.6)", fontSize: 14.5, maxWidth: 560, marginBottom: 40 }}>
          Browse the committees running across MUNlocked-listed conferences, and the agendas that keep coming up.
        </p>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 22 }}>
          {COMMITTEES.map((c) => (
            <div key={c.code} style={{ background: "var(--paper)", color: "var(--ink)", borderRadius: 6, padding: 24, boxShadow: "5px 6px 0 rgba(156,110,130,0.25)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
                <div style={{ width: 40, height: 40, borderRadius: "50%", background: "rgba(7,7,7,0.08)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <div style={{ width: 14, height: 14, borderRadius: "50%", background: "linear-gradient(135deg, var(--mauve), var(--coral))" }} />
                </div>
                <span className="mono" style={{ fontSize: 10, letterSpacing: 1, textTransform: "uppercase", background: "rgba(7,7,7,0.08)", padding: "3px 8px", borderRadius: 3 }}>
                  {c.code}
                </span>
              </div>
              <h3 style={{ fontFamily: "Georgia, serif", fontSize: 19, marginBottom: 2 }}>{c.name}</h3>
              <p className="mono" style={{ fontSize: 11.5, color: "rgba(7,7,7,0.55)", marginBottom: 14 }}>{c.tag}</p>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {c.topics.map((t) => (
                  <span key={t} className="mono" style={{ fontSize: 10, border: "1px solid rgba(7,7,7,0.2)", padding: "4px 9px", borderRadius: 20, color: "rgba(7,7,7,0.65)" }}>
                    {t}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
