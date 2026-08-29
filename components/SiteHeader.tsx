import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/server";
import { signOutAction } from "@/lib/actions";

export default async function SiteHeader() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const navLink: React.CSSProperties = { color: "var(--text)", textDecoration: "none", opacity: 0.7 };

  return (
    <nav
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "16px 32px",
        borderBottom: "1px solid rgba(234,217,222,0.08)",
        flexWrap: "wrap",
        gap: 12,
        rowGap: 10,
      }}
    >
      <Link href="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
        <Image src="/logo.png" alt="MUNlocked" width={32} height={28} style={{ objectFit: "contain" }} priority />
        <span style={{ fontFamily: "Georgia, serif", fontSize: 17, color: "var(--text)", letterSpacing: 0.2 }}>
          MUN<span style={{ color: "var(--coral)" }}>locked</span>
        </span>
      </Link>
      <div className="mono" style={{ display: "flex", gap: 20, alignItems: "center", fontSize: 11.5, letterSpacing: 0.4, textTransform: "uppercase", flexWrap: "wrap" }}>
        <Link href="/" style={navLink}>Home</Link>
        <Link href="/conferences" style={navLink}>Conferences</Link>
        <Link href="/topics" style={navLink}>Committees</Link>
        <Link href="/research" style={navLink}>Research Library</Link>
        <Link href="/hire-eb" style={navLink}>Hire an EB</Link>
        <Link href="/committees" style={navLink}>Marksheet</Link>
        <Link href="/founder" style={navLink}>Founder</Link>
        <Link href="/about" style={navLink}>About</Link>
        {user && (
          <form action={signOutAction}>
            <button type="submit" className="mono" style={{ ...navLink, background: "none", border: "none", cursor: "pointer", padding: 0, font: "inherit" }}>
              Sign out
            </button>
          </form>
        )}
        <Link
          href={user ? "/conferences/submit" : "/login"}
          style={{ background: "var(--paper)", color: "var(--ink)", padding: "8px 16px", borderRadius: 20, textDecoration: "none", fontWeight: 700, whiteSpace: "nowrap" }}
        >
          {user ? "List your MUN" : "Sign In"}
        </Link>
      </div>
    </nav>
  );
}
