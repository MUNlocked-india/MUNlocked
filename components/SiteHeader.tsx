import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/server";

export default async function SiteHeader() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <nav
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "16px 48px",
        borderBottom: "1px solid rgba(234,217,222,0.08)",
      }}
    >
      <Link href="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
        <Image src="/logo.png" alt="MUNlocked" width={36} height={32} style={{ objectFit: "contain" }} priority />
        <span style={{ fontFamily: "Georgia, serif", fontSize: 18, color: "var(--text)", letterSpacing: 0.2 }}>
          MUN<span style={{ color: "var(--coral)" }}>locked</span>
        </span>
      </Link>
      <div className="mono" style={{ display: "flex", gap: 26, alignItems: "center", fontSize: 12, letterSpacing: 0.5, textTransform: "uppercase" }}>
        <Link href="/conferences" style={{ color: "var(--text)", textDecoration: "none", opacity: 0.7 }}>Conferences</Link>
        <Link href="/hire-eb" style={{ color: "var(--text)", textDecoration: "none", opacity: 0.7 }}>Hire an EB</Link>
        <Link href="/research" style={{ color: "var(--text)", textDecoration: "none", opacity: 0.7 }}>Research</Link>
        {user && (
          <Link href="/committees" style={{ color: "var(--text)", textDecoration: "none", opacity: 0.7 }}>Committees</Link>
        )}
        <Link
          href={user ? "/dashboard" : "/login"}
          style={{ background: "var(--paper)", color: "var(--ink)", padding: "8px 16px", borderRadius: 3, textDecoration: "none", fontWeight: 700 }}
        >
          {user ? "Dashboard" : "Sign In"}
        </Link>
      </div>
    </nav>
  );
}
