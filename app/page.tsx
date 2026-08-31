import Link from "next/link";
import Image from "next/image";
import "./landing.css";
import { ADMIN_EMAIL } from "@/lib/constants";
import SiteHeader from "@/components/SiteHeader";
import Reveal from "@/components/Reveal";
import BlurText from "@/components/BlurText";
import { createClient } from "@/lib/supabase/server";

export default async function Home() {
  const supabase = await createClient();

  const [{ count: confCount }, { count: ebCount }, { count: researchCount }, { data: latestResearch }, { data: latestEbs }] =
    await Promise.all([
      supabase.from("conferences").select("*", { count: "exact", head: true }).eq("status", "approved"),
      supabase.from("eb_applications").select("*", { count: "exact", head: true }).eq("status", "approved"),
      supabase.from("research_papers").select("*", { count: "exact", head: true }).eq("status", "approved"),
      supabase
        .from("research_papers")
        .select("id, title, committee, agenda, author_name")
        .eq("status", "approved")
        .order("created_at", { ascending: false })
        .limit(3),
      supabase
        .from("eb_applications")
        .select("id, applicant_email, experience, areas_of_expertise")
        .eq("status", "approved")
        .order("created_at", { ascending: false })
        .limit(3),
    ]);

  return (
    <>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link
        href="https://fonts.googleapis.com/css2?family=Anton&family=IBM+Plex+Mono:wght@400;500;600&family=Source+Serif+4:opsz,wght@8..60,400;8..60,600&display=swap"
        rel="stylesheet"
      />

      <div className="dais-bar">
        <span>MUNLOCKED</span><span className="dot">•</span>
        <span>UNGA — FIRST COMMITTEE</span><span className="dot">•</span>
        <span>AGENDA ITEM 04</span><span className="dot">•</span>
        <span>STATUS <b>IN SESSION</b></span>
      </div>

      <SiteHeader />

      <section className="hero">
        <div className="hero-left">
          <svg className="globe-watermark" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="100" cy="100" r="98" stroke="#EAD9DE" strokeWidth="0.8" />
            <ellipse cx="100" cy="100" rx="98" ry="38" stroke="#EAD9DE" strokeWidth="0.8" />
            <ellipse cx="100" cy="100" rx="98" ry="68" stroke="#EAD9DE" strokeWidth="0.8" />
            <ellipse cx="100" cy="100" rx="60" ry="98" stroke="#EAD9DE" strokeWidth="0.8" />
            <ellipse cx="100" cy="100" rx="30" ry="98" stroke="#EAD9DE" strokeWidth="0.8" />
            <line x1="2" y1="100" x2="198" y2="100" stroke="#EAD9DE" strokeWidth="0.8" />
            <line x1="100" y1="2" x2="100" y2="198" stroke="#EAD9DE" strokeWidth="0.8" />
          </svg>

          <div className="stamp">
            <svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <path id="circlePath" d="M 60, 60 m -46, 0 a 46,46 0 1,1 92,0 a 46,46 0 1,1 -92,0" fill="none" />
              </defs>
              <circle cx="60" cy="60" r="58" fill="none" stroke="#C98A94" strokeWidth="2" />
              <circle cx="60" cy="60" r="50" fill="none" stroke="#C98A94" strokeWidth="1" />
              <text fontFamily="IBM Plex Mono, monospace" fontSize="8.5" fontWeight={600} fill="#C98A94" letterSpacing="1">
                <textPath href="#circlePath" startOffset="2%">SESSION IN PROGRESS • SESSION IN PROGRESS •</textPath>
              </text>
            </svg>
            <Image src="/logo.png" alt="" width={44} height={40} className="stamp-mark" />
          </div>

          <div className="file-code">File No. IN/MUN/2026 — Unclassified</div>
          <h1>The <span className="hl">operating<br />system</span> for<br />India&apos;s <span className="hl2">MUN circuit</span></h1>
          <p className="dossier">No closed rooms. No favored circles. Every <b>Executive Board</b> hired on record, every conference checked before it&apos;s listed, every delegate handed real research from day one.</p>
          <div className="cta-row">
            <Link href="/conferences" className="btn btn-solid">Explore Conferences</Link>
            <Link href="/signup" className="btn btn-outline">Join as Delegate</Link>
          </div>
        </div>
        <div className="hero-right">
          <div className="right-eyebrow">Motion Carried</div>
          <div className="right-head">Built to end the guesswork</div>
          <p className="right-body">Biased EBs. Biased conferences. First-timers with no research and no idea what a POI even is. MUNlocked is the fix: EBs hired on a public track record, conferences reviewed before they&apos;re listed, and one shared marksheet the whole dais can see.</p>
          <div className="signatures">
            <div className="sig-box">DELEGATE</div>
            <div className="sig-box">CHAIR</div>
            <div className="sig-box">ORGANIZER</div>
          </div>
        </div>
      </section>

      {/* ---------- LIVE STATS ---------- */}
      <section style={{ background: "#0F0F10", borderTop: "1px solid rgba(234,217,222,0.08)", borderBottom: "1px solid rgba(234,217,222,0.08)", padding: "44px 24px" }}>
        <Reveal>
          <div style={{ display: "flex", justifyContent: "center", gap: 60, flexWrap: "wrap", maxWidth: 900, margin: "0 auto" }}>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontFamily: "Anton, sans-serif", fontSize: 42, color: "var(--paper)" }}>{confCount ?? 0}</div>
              <div className="mono" style={{ fontSize: 11, letterSpacing: 1, textTransform: "uppercase", color: "rgba(234,217,222,0.5)", marginTop: 4 }}>Listed Conferences</div>
            </div>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontFamily: "Anton, sans-serif", fontSize: 42, color: "var(--paper)" }}>{ebCount ?? 0}</div>
              <div className="mono" style={{ fontSize: 11, letterSpacing: 1, textTransform: "uppercase", color: "rgba(234,217,222,0.5)", marginTop: 4 }}>Verified EBs</div>
            </div>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontFamily: "Anton, sans-serif", fontSize: 42, color: "var(--paper)" }}>{researchCount ?? 0}</div>
              <div className="mono" style={{ fontSize: 11, letterSpacing: 1, textTransform: "uppercase", color: "rgba(234,217,222,0.5)", marginTop: 4 }}>Research Papers</div>
            </div>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontFamily: "Anton, sans-serif", fontSize: 42, color: "var(--paper)" }}>Pan-India</div>
              <div className="mono" style={{ fontSize: 11, letterSpacing: 1, textTransform: "uppercase", color: "rgba(234,217,222,0.5)", marginTop: 4 }}>Conference Network</div>
            </div>
          </div>
        </Reveal>
      </section>

      {/* ---------- HOW IT WORKS ---------- */}
      <section style={{ padding: "90px 24px", maxWidth: 1100, margin: "0 auto" }}>
        <div className="mono" style={{ textAlign: "center", fontSize: 11, letterSpacing: 2, textTransform: "uppercase", color: "var(--brass)", marginBottom: 10 }}>
          How It Works
        </div>
        <BlurText
          as="h2"
          text="Everything a Committee Needs, One Place"
          style={{ fontFamily: "Anton, sans-serif", fontWeight: 400, textTransform: "uppercase", fontSize: "clamp(24px, 3.2vw, 40px)", textAlign: "center", marginBottom: 56, display: "block" }}
        />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 28 }}>
          {[
            { n: "01", t: "Discover", d: "Browse checked conferences and committees, filtered by agenda, city, and format." },
            { n: "02", t: "Prepare", d: "Pull free, verified background guides and country profiles from the research library." },
            { n: "03", t: "Compete", d: "EBs hired on a public record run committee off one shared, live digital marksheet." },
            { n: "04", t: "Get Recognized", d: "Scores, awards, and your MUN portfolio build up on your profile automatically." },
          ].map((s, i) => (
            <Reveal key={s.n} delay={i * 100}>
              <div style={{ borderTop: "2px solid var(--coral)", paddingTop: 18 }}>
                <div className="mono" style={{ fontSize: 11, color: "rgba(234,217,222,0.4)", marginBottom: 8 }}>{s.n}</div>
                <h3 style={{ fontFamily: "Georgia, serif", fontSize: 19, marginBottom: 8 }}>{s.t}</h3>
                <p style={{ fontSize: 13.5, color: "rgba(234,217,222,0.6)", lineHeight: 1.7 }}>{s.d}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="placards-section">
        <Reveal>
          <div className="placards-head">Raise to Vote</div>
          <div className="placards-title">Three Motions on the Floor</div>
        </Reveal>
        <div className="placards">
          <Link href="/conferences" className="placard">
            <div className="placard-stripe"></div>
            <div className="placard-body">
              <svg className="placard-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4"><rect x="4" y="3" width="16" height="18" rx="1.5" /><line x1="7.5" y1="8" x2="16.5" y2="8" /><line x1="7.5" y1="12" x2="16.5" y2="12" /><line x1="7.5" y1="16" x2="13" y2="16" /></svg>
              <div className="placard-code">Motion 01 — Listings</div>
              <h3>Conference Directory</h3>
              <p>Committee matrices, brochures, delegate fees, and registration links. Every conference is checked and approved before it goes live.</p>
            </div>
            <div className="placard-handle"></div>
          </Link>
          <Link href="/hire-eb" className="placard">
            <div className="placard-stripe"></div>
            <div className="placard-body">
              <svg className="placard-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4"><path d="M14 3l7 7-2 2-7-7z" /><path d="M13.5 5.5l-9 9v3.5H8l9-9" /><line x1="4" y1="21" x2="10" y2="21" /></svg>
              <div className="placard-code">Motion 02 — Hire an EB</div>
              <h3>Hire an EB</h3>
              <p>Conferences come here to recruit, not just browse. Public track records, ratings, and availability.</p>
            </div>
            <div className="placard-handle"></div>
          </Link>
          <Link href="/research" className="placard">
            <div className="placard-stripe"></div>
            <div className="placard-body">
              <svg className="placard-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4"><path d="M4 5.5C4 4.7 4.7 4 5.5 4H12v16H5.5A1.5 1.5 0 0 1 4 18.5z" /><path d="M20 5.5c0-.8-.7-1.5-1.5-1.5H12v16h6.5a1.5 1.5 0 0 0 1.5-1.5z" /></svg>
              <div className="placard-code">Motion 03 — Research</div>
              <h3>Free Research Library</h3>
              <p>Verified background guides, free from day one. Every download is watermarked to its source.</p>
            </div>
            <div className="placard-handle"></div>
          </Link>
        </div>

        <div className="flag-strip">
          <span>India</span><span>Japan</span><span>Brazil</span><span>France</span><span>South Africa</span><span>USA</span><span>Germany</span><span>UAE</span>
        </div>
      </section>

      {/* ---------- LIVE SPOTLIGHTS ---------- */}
      <section style={{ padding: "90px 24px", maxWidth: 1100, margin: "0 auto" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 50 }}>
          <Reveal>
            <div>
              <div className="mono" style={{ fontSize: 11, letterSpacing: 2, textTransform: "uppercase", color: "var(--coral)", marginBottom: 8 }}>Live From the Library</div>
              <h3 style={{ fontFamily: "Georgia, serif", fontSize: 24, marginBottom: 20 }}>Latest Research</h3>
              {latestResearch && latestResearch.length > 0 ? (
                <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                  {latestResearch.map((r) => (
                    <Link key={r.id} href={`/research/${r.id}`} style={{ textDecoration: "none", color: "inherit", display: "block", borderBottom: "1px solid rgba(234,217,222,0.1)", paddingBottom: 12 }}>
                      <div style={{ fontFamily: "Georgia, serif", fontSize: 15.5, marginBottom: 4 }}>{r.title}</div>
                      <div className="mono" style={{ fontSize: 11, color: "rgba(234,217,222,0.5)" }}>{r.committee} · {r.agenda} · By {r.author_name}</div>
                    </Link>
                  ))}
                </div>
              ) : (
                <p style={{ fontSize: 13.5, color: "rgba(234,217,222,0.5)" }}>No approved research yet — be the first to submit.</p>
              )}
              <Link href="/research" className="mono" style={{ display: "inline-block", marginTop: 16, fontSize: 11.5, letterSpacing: 0.5, textTransform: "uppercase", color: "var(--coral)", textDecoration: "none" }}>Browse the library →</Link>
            </div>
          </Reveal>
          <Reveal delay={120}>
            <div>
              <div className="mono" style={{ fontSize: 11, letterSpacing: 2, textTransform: "uppercase", color: "var(--coral)", marginBottom: 8 }}>Verified This Week</div>
              <h3 style={{ fontFamily: "Georgia, serif", fontSize: 24, marginBottom: 20 }}>Newest EBs</h3>
              {latestEbs && latestEbs.length > 0 ? (
                <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                  {latestEbs.map((eb) => (
                    <div key={eb.id} style={{ borderBottom: "1px solid rgba(234,217,222,0.1)", paddingBottom: 12 }}>
                      <div style={{ fontFamily: "Georgia, serif", fontSize: 15.5, marginBottom: 4 }}>{eb.applicant_email}</div>
                      <div className="mono" style={{ fontSize: 11, color: "rgba(234,217,222,0.5)" }}>{eb.experience?.slice(0, 60)}{eb.experience && eb.experience.length > 60 ? "…" : ""}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <p style={{ fontSize: 13.5, color: "rgba(234,217,222,0.5)" }}>No verified EBs yet — applications are reviewed before listing.</p>
              )}
              <Link href="/hire-eb" className="mono" style={{ display: "inline-block", marginTop: 16, fontSize: 11.5, letterSpacing: 0.5, textTransform: "uppercase", color: "var(--coral)", textDecoration: "none" }}>Hire an EB →</Link>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="rules-section">
        <Reveal>
          <div className="rules-head">The Standing Rules</div>
          <div className="rules-title">What MUNlocked Won&apos;t Compromise On</div>
        </Reveal>
        <div className="rules-grid">
          <Reveal>
            <div className="rule">
              <div className="rule-num">Rule 01</div>
              <h3>No Closed Rooms</h3>
              <p>Every EB appointment and every conference listing goes through a visible, checkable process — not a private group chat.</p>
            </div>
          </Reveal>
          <Reveal delay={100}>
            <div className="rule">
              <div className="rule-num">Rule 02</div>
              <h3>Research Stays Free</h3>
              <p>A first-time delegate should never have to pay to understand their committee. Verified research is free from day one.</p>
            </div>
          </Reveal>
          <Reveal delay={200}>
            <div className="rule">
              <div className="rule-num">Rule 03</div>
              <h3>One Record, Not Five Spreadsheets</h3>
              <p>Scoring, attendance, and recognition live in one shared marksheet the whole dais and Secretariat can actually see.</p>
            </div>
          </Reveal>
        </div>
      </section>

      <footer style={{ borderTop: "1px solid rgba(234,217,222,0.08)", padding: "26px 48px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <Image src="/logo.png" alt="MUNlocked" width={24} height={21} style={{ objectFit: "contain", opacity: 0.7 }} />
          <span className="mono" style={{ fontSize: 11, color: "rgba(234,217,222,0.45)" }}>© {new Date().getFullYear()} MUNlocked</span>
        </div>
        <a href={`mailto:${ADMIN_EMAIL}`} className="mono" style={{ fontSize: 11, color: "rgba(234,217,222,0.55)", textDecoration: "none" }}>
          {ADMIN_EMAIL}
        </a>
      </footer>
    </>
  );
}
