import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function ResearchDetailPage({
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
    .select("id, title, committee, document_type, agenda, summary, full_text, author_name, created_at")
    .eq("id", id)
    .single();

  if (!paper) redirect("/research");

  return (
    <div style={{ minHeight: "100vh", padding: "56px 24px 100px" }}>
      <div style={{ maxWidth: 780, margin: "0 auto" }}>
        <span className="mono" style={{ fontSize: 11, letterSpacing: 1, textTransform: "uppercase", background: "rgba(234,217,222,0.08)", padding: "4px 10px", borderRadius: 3, color: "var(--coral)" }}>
          {paper.document_type}
        </span>
        <h1 style={{ fontFamily: "Georgia, serif", fontSize: 32, margin: "16px 0 8px" }}>{paper.title}</h1>
        <p className="mono" style={{ fontSize: 12, color: "rgba(234,217,222,0.55)", marginBottom: 24 }}>
          {paper.committee} · {paper.agenda} · By {paper.author_name}
        </p>

        <div style={{ background: "#0F0F10", border: "1px solid rgba(234,217,222,0.1)", borderRadius: 8, padding: 30, whiteSpace: "pre-wrap", fontSize: 14.5, lineHeight: 1.8, color: "rgba(234,217,222,0.8)", marginBottom: 24 }}>
          {paper.full_text}
        </div>

        <a
          href={`/print/research/${paper.id}`}
          target="_blank"
          rel="noreferrer"
          className="mono"
          style={{ display: "inline-block", background: "var(--paper)", color: "var(--ink)", padding: "12px 22px", borderRadius: 3, textDecoration: "none", fontSize: 12, fontWeight: 700, textTransform: "uppercase" }}
        >
          Download (Watermarked) →
        </a>
      </div>
    </div>
  );
}
