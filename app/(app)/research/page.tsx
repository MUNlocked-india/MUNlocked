import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { toggleUpvote } from "./actions";

const COMMITTEES = ["UNSC", "UNHRC", "DISEC", "ECOSOC", "WHO", "UNEP", "AIPPM", "UNODC"];

export default async function ResearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; committee?: string }>;
}) {
  const params = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let query = supabase
    .from("research_papers")
    .select("id, title, committee, document_type, agenda, summary, author_name, created_at")
    .eq("status", "approved")
    .order("created_at", { ascending: false });

  if (params.committee) query = query.eq("committee", params.committee);
  if (params.q) query = query.or(`title.ilike.%${params.q}%,agenda.ilike.%${params.q}%,summary.ilike.%${params.q}%`);

  const { data: papers, error } = await query;

  // Upvote counts, fetched in one shot rather than N+1 queries.
  const paperIds = papers?.map((p) => p.id) ?? [];
  const { data: upvoteRows } = paperIds.length
    ? await supabase.from("research_upvotes").select("paper_id, user_id").in("paper_id", paperIds)
    : { data: [] as { paper_id: string; user_id: string }[] };
  const upvoteCounts = new Map<string, number>();
  const userUpvoted = new Set<string>();
  upvoteRows?.forEach((r) => {
    upvoteCounts.set(r.paper_id, (upvoteCounts.get(r.paper_id) ?? 0) + 1);
    if (user && r.user_id === user.id) userUpvoted.add(r.paper_id);
  });

  return (
    <div style={{ minHeight: "100vh", padding: "56px 24px 100px" }}>
      <div style={{ maxWidth: 1180, margin: "0 auto" }}>
        <div className="mono" style={{ fontSize: 11, letterSpacing: 2, color: "var(--coral)", textTransform: "uppercase", marginBottom: 10 }}>
          File No. IN/MUN/RESEARCH — Library
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: 16, marginBottom: 28 }}>
          <div>
            <h1 style={{ fontFamily: "Georgia, serif", fontSize: 32, marginBottom: 8 }}>Free Research Library</h1>
            <p style={{ color: "rgba(234,217,222,0.6)", fontSize: 14, maxWidth: 560 }}>
              Every guide is screened before it&apos;s published. Search by agenda, upvote what actually helped you.
            </p>
          </div>
          <Link href={user ? "/research/submit" : "/login"} className="mono" style={{ background: "var(--paper)", color: "var(--ink)", padding: "12px 20px", borderRadius: 3, textDecoration: "none", fontSize: 12, fontWeight: 700, textTransform: "uppercase", whiteSpace: "nowrap" }}>
            + Submit Research
          </Link>
        </div>

        <form style={{ display: "flex", gap: 10, marginBottom: 16, flexWrap: "wrap" }}>
          <input
            type="text"
            name="q"
            defaultValue={params.q}
            placeholder="Search agenda, committee, keyword…"
            style={{ flex: 1, minWidth: 240, background: "#0F0F10", border: "1px solid rgba(234,217,222,0.15)", color: "var(--text)", padding: "12px 14px", fontFamily: "IBM Plex Mono, monospace", fontSize: 13, borderRadius: 3 }}
          />
          {params.committee && <input type="hidden" name="committee" value={params.committee} />}
          <button type="submit" className="mono" style={{ background: "var(--paper)", color: "var(--ink)", border: "none", padding: "0 20px", fontFamily: "IBM Plex Mono, monospace", fontSize: 12, letterSpacing: 1, textTransform: "uppercase", fontWeight: 600, borderRadius: 3, cursor: "pointer" }}>
            Search
          </button>
        </form>

        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 30 }}>
          <Link href="/research" className="mono" style={{ fontSize: 11, textTransform: "uppercase", padding: "6px 14px", borderRadius: 20, textDecoration: "none", border: "1px solid rgba(234,217,222,0.15)", background: !params.committee ? "var(--paper)" : "transparent", color: !params.committee ? "var(--ink)" : "rgba(234,217,222,0.6)" }}>
            All
          </Link>
          {COMMITTEES.map((c) => (
            <Link key={c} href={`/research?committee=${c}`} className="mono" style={{ fontSize: 11, textTransform: "uppercase", padding: "6px 14px", borderRadius: 20, textDecoration: "none", border: "1px solid rgba(234,217,222,0.15)", background: params.committee === c ? "var(--paper)" : "transparent", color: params.committee === c ? "var(--ink)" : "rgba(234,217,222,0.6)" }}>
              {c}
            </Link>
          ))}
        </div>

        {error && <p style={{ color: "#e59aa8" }}>Could not load research: {error.message}</p>}

        {papers?.length === 0 && (
          <div style={{ background: "#0F0F10", border: "1px dashed rgba(234,217,222,0.2)", borderRadius: 8, padding: 40, textAlign: "center", color: "rgba(234,217,222,0.55)" }}>
            No approved research matches yet. Every upload is screened for research value before it appears — downloads are watermarked.
          </div>
        )}

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 22 }}>
          {papers?.map((p) => {
            const upvoted = userUpvoted.has(p.id);
            const boundToggle = toggleUpvote.bind(null, p.id);
            return (
              <div key={p.id} className="munlocked-card-hover" style={{ background: "var(--paper)", color: "var(--ink)", borderRadius: 14, padding: 22, boxShadow: "5px 6px 0 rgba(156,110,130,0.2)", transition: "transform 0.25s ease, box-shadow 0.25s ease" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                  <span className="mono" style={{ fontSize: 10, letterSpacing: 1, textTransform: "uppercase", background: "rgba(7,7,7,0.08)", padding: "3px 8px", borderRadius: 3 }}>
                    {p.document_type}
                  </span>
                  <form action={boundToggle}>
                    <button type="submit" className="mono" style={{ background: "none", border: "1px solid rgba(7,7,7,0.2)", color: upvoted ? "var(--ink)" : "rgba(7,7,7,0.5)", fontWeight: upvoted ? 700 : 400, borderRadius: 4, padding: "3px 8px", fontSize: 11, cursor: "pointer" }}>
                      ▲ {upvoteCounts.get(p.id) ?? 0}
                    </button>
                  </form>
                </div>
                <Link href={`/research/${p.id}`} style={{ textDecoration: "none", color: "inherit" }}>
                  <h3 style={{ fontFamily: "Georgia, serif", fontSize: 18, lineHeight: 1.25, marginBottom: 8 }}>{p.title}</h3>
                </Link>
                <p className="mono" style={{ fontSize: 11, color: "rgba(7,7,7,0.55)", marginBottom: 10 }}>{p.committee} · {p.agenda}</p>
                <p style={{ fontSize: 13, color: "rgba(7,7,7,0.7)", lineHeight: 1.55, marginBottom: 14 }}>{p.summary}</p>
                <p className="mono" style={{ fontSize: 11, color: "rgba(7,7,7,0.5)" }}>By {p.author_name}</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
