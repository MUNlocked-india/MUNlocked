import Image from "next/image";
import Link from "next/link";
import { ADMIN_EMAIL } from "@/lib/constants";

export default function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="site-footer-orbit" aria-hidden="true"><span /><span /><span /></div>
      <div className="site-footer-cta">
        <p className="mono">THE ROOM IS YOURS</p>
        <h2>Prepare deeply. Chair fairly.<br />Walk in ready.</h2>
        <Link href="/login" className="site-footer-cta-link">Enter MUNlocked <span>↗</span></Link>
      </div>
      <div className="site-footer-grid">
        <div className="site-footer-brand">
          <Link href="/" className="site-footer-logo"><Image src="/logo.png" alt="" width={34} height={29} /><strong>MUN<span>locked</span></strong></Link>
          <p>One serious workspace for delegates, chairs and conference teams—from first research note to final gavel.</p>
        </div>
        <nav aria-label="Platform links"><h3>Platform</h3><Link href="/conferences">Conference directory</Link><Link href="/hire-eb">Executive Board</Link><Link href="/research">Research library</Link><Link href="/committees">Digital dais</Link><Link href="/topics">Committee desk</Link></nav>
        <nav aria-label="Company links"><h3>Explore</h3><Link href="/about">Our mission</Link><Link href="/founder">Meet the founder</Link><Link href="/conferences/submit">List your MUN</Link><Link href="/login">Sign in</Link><a href={`mailto:${ADMIN_EMAIL}`}>Contact us</a></nav>
      </div>
      <div className="site-footer-bottom"><span>© {new Date().getFullYear()} MUNlocked</span><span className="site-footer-status"><i /> Built in India for better rooms</span><a href={`mailto:${ADMIN_EMAIL}`}>{ADMIN_EMAIL}</a></div>
    </footer>
  );
}
