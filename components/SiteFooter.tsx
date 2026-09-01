import Image from "next/image";
import { ADMIN_EMAIL } from "@/lib/constants";

export default function SiteFooter() {
  return (
    <footer className="site-footer">
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <Image src="/logo.png" alt="MUNlocked" width={24} height={21} style={{ objectFit: "contain", opacity: 0.7 }} />
        <span className="mono" style={{ fontSize: 10, color: "rgba(234,217,222,0.45)" }}>
          © {new Date().getFullYear()} MUNlocked · Built for better rooms
        </span>
      </div>
      <a href={`mailto:${ADMIN_EMAIL}`} className="mono" style={{ fontSize: 11, color: "rgba(234,217,222,0.55)", textDecoration: "none" }}>
        {ADMIN_EMAIL}
      </a>
    </footer>
  );
}
