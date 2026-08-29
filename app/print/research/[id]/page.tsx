import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function ResearchDownloadPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: paper } = await supabase
    .from("research_papers")
    .select("title, committee, agenda, full_text, author_name")
    .eq("id", id)
    .single();

  if (!paper) redirect("/research");

  const stamp = `Downloaded by ${user!.email} · MUNlocked · ${new Date().toLocaleString("en-IN")}`;

  return (
    <div style={{ background: "#f4efe8", color: "#1a1a1a", fontFamily: "Georgia, serif", minHeight: "100vh" }}>
      <style
        dangerouslySetInnerHTML={{
          __html: `
            @media print { .munlocked-print-btn { display: none !important; } }
          `,
        }}
      />

      <div style={{ position: "fixed", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", pointerEvents: "none", zIndex: 0, overflow: "hidden" }}>
        {[...Array(6)].map((_, i) => (
          <span
            key={i}
            style={{
              position: "absolute",
              top: `${i * 16}%`,
              transform: "rotate(-30deg)",
              fontFamily: "Courier New, monospace",
              fontSize: 20,
              color: "rgba(0,0,0,0.08)",
              whiteSpace: "nowrap",
              letterSpacing: 2,
            }}
          >
            {stamp}
          </span>
        ))}
      </div>

      <button
        className="munlocked-print-btn"
        onClick={undefined}
        style={{ position: "fixed", top: 20, right: 20, zIndex: 2, background: "#1a1a1a", color: "#fff", border: "none", padding: "10px 18px", borderRadius: 4, fontFamily: "Courier New, monospace", fontSize: 12, textTransform: "uppercase", cursor: "pointer" }}
        id="munlocked-print-trigger"
      >
        Print / Save as PDF
      </button>

      <div style={{ maxWidth: 720, margin: "0 auto", padding: "60px 50px 100px", position: "relative", zIndex: 1 }}>
        <div style={{ fontFamily: "Courier New, monospace", fontSize: 12, color: "#555", marginBottom: 30 }}>
          MUNlocked Founder Research · {paper.committee} · {paper.agenda}
        </div>
        <h1 style={{ fontSize: 26, marginBottom: 4 }}>{paper.title}</h1>
        <div style={{ fontFamily: "Courier New, monospace", fontSize: 12, color: "#555", marginBottom: 30 }}>By {paper.author_name}</div>
        <div style={{ whiteSpace: "pre-wrap", fontSize: 14.5, lineHeight: 1.8 }}>{paper.full_text}</div>
        <div style={{ marginTop: 50, paddingTop: 16, borderTop: "1px solid #ccc", fontFamily: "Courier New, monospace", fontSize: 10.5, color: "#777" }}>
          {stamp}
        </div>
      </div>

      <script
        dangerouslySetInnerHTML={{
          __html: `document.getElementById('munlocked-print-trigger')?.addEventListener('click', () => window.print());`,
        }}
      />
    </div>
  );
}
