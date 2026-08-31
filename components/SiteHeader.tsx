import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/server";
import AnimatedNavLinks from "@/components/AnimatedNavLinks";

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
      <AnimatedNavLinks isLoggedIn={!!user} />
    </nav>
  );
}
