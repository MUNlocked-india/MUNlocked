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
    <nav className="site-header">
      <Link href="/" className="site-brand">
        <span className="site-brand-mark"><Image src="/logo.png" alt="" width={25} height={22} style={{ objectFit: "contain" }} priority /></span>
        <span className="site-brand-name">
          MUN<span style={{ color: "var(--coral)" }}>locked</span>
        </span>
      </Link>
      <AnimatedNavLinks isLoggedIn={!!user} />
    </nav>
  );
}
