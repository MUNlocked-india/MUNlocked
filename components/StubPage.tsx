import Link from "next/link";

export default function StubPage({ title, blurb }: { title: string; blurb: string }) {
  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <div style={{ textAlign: "center", maxWidth: 480 }}>
        <div className="mono" style={{ fontSize: 11, letterSpacing: 2, color: "var(--coral)", textTransform: "uppercase", marginBottom: 10 }}>
          Coming Next
        </div>
        <h1 style={{ fontFamily: "Georgia, serif", fontSize: 30, marginBottom: 12 }}>{title}</h1>
        <p style={{ color: "rgba(234,217,222,0.65)", fontSize: 14.5, lineHeight: 1.7, marginBottom: 26 }}>{blurb}</p>
        <Link href="/" className="mono" style={{ border: "1.5px solid var(--paper)", padding: "12px 22px", borderRadius: 3, textDecoration: "none", fontSize: 13, color: "var(--text)" }}>
          ← Back to Home
        </Link>
      </div>
    </div>
  );
}
