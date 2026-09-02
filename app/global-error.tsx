"use client";

export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <html lang="en"><body style={{ margin: 0, minHeight: "100vh", display: "grid", placeItems: "center", padding: 24, background: "radial-gradient(circle at 20% 10%,#2a1d24,transparent 38rem),#080709", color: "#f4edf0", fontFamily: '"Segoe UI",Arial,sans-serif' }}>
    <main style={{ width: "min(620px,100%)", padding: "clamp(28px,6vw,58px)", border: "1px solid rgba(244,237,240,.14)", borderRadius: 24, background: "rgba(15,13,16,.88)", boxShadow: "0 30px 90px rgba(0,0,0,.45)" }}>
      <p style={{ margin: "0 0 18px", color: "#e2a0af", font: "10px/1.2 monospace", letterSpacing: 2 }}>MUNLOCKED / RECOVERY DESK</p>
      <h1 style={{ margin: 0, fontSize: "clamp(42px,8vw,76px)", lineHeight: .92, letterSpacing: "-.06em", textTransform: "uppercase" }}>The room paused.<br />Your work is safe.</h1>
      <p style={{ margin: "24px 0 0", maxWidth: 480, color: "rgba(244,237,240,.62)", fontSize: 15, lineHeight: 1.65 }}>A visual effect failed to start on this browser. Reload the interface to continue; your account and saved work have not been changed.</p>
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 28 }}><button onClick={reset} style={{ border: 0, borderRadius: 999, padding: "13px 18px", background: "#f3e7eb", color: "#070707", fontWeight: 800, cursor: "pointer" }}>Reload MUNlocked ↻</button><a href="/" style={{ border: "1px solid rgba(244,237,240,.18)", borderRadius: 999, padding: "12px 18px", color: "#f4edf0", textDecoration: "none", fontWeight: 650 }}>Return home</a></div>
    </main>
  </body></html>;
}
