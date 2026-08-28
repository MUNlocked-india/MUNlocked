import Link from "next/link";
import Image from "next/image";
import "./landing.css";
import ChatWidget from "@/components/ChatWidget";
import { ADMIN_EMAIL } from "@/lib/constants";

export default function Home() {
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

      <nav className="lp-nav">
        <Link href="/" className="lp-logo">
          <Image src="/logo.png" alt="MUNlocked" width={30} height={26} style={{ objectFit: "contain" }} priority />
          <div className="lp-logo-text">MUN<span>locked</span></div>
        </Link>
        <div className="lp-nav-links">
          <Link href="/conferences">Conferences</Link>
          <Link href="/hire-eb">Hire an EB</Link>
          <Link href="/research">Research</Link>
          <Link href="/login" className="lp-nav-cta">Sign In</Link>
        </div>
      </nav>

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

      <section className="placards-section">
        <div className="placards-head">Raise to Vote</div>
        <div className="placards-title">Three Motions on the Floor</div>
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

      <section className="rules-section">
        <div className="rules-head">The Standing Rules</div>
        <div className="rules-title">What MUNlocked Won&apos;t Compromise On</div>
        <div className="rules-grid">
          <div className="rule">
            <div className="rule-num">Rule 01</div>
            <h3>No Closed Rooms</h3>
            <p>Every EB appointment and every conference listing goes through a visible, checkable process — not a private group chat.</p>
          </div>
          <div className="rule">
            <div className="rule-num">Rule 02</div>
            <h3>Research Stays Free</h3>
            <p>A first-time delegate should never have to pay to understand their committee. Verified research is free from day one.</p>
          </div>
          <div className="rule">
            <div className="rule-num">Rule 03</div>
            <h3>One Record, Not Five Spreadsheets</h3>
            <p>Scoring, attendance, and recognition live in one shared marksheet the whole dais and Secretariat can actually see.</p>
          </div>
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

      <ChatWidget />
    </>
  );
}
