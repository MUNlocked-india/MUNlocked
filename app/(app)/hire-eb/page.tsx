import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import SpotlightCard from "@/components/SpotlightCard";
import { rateEb } from "./actions";

export default async function HireEbPage({ searchParams }: { searchParams: Promise<{ q?: string; area?: string }> }) {
  const params = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: ebs, error } = await supabase
    .from("eb_applications")
    .select("id, applicant_id, applicant_email, display_name, bio, experience, eb_experience, delegate_experience, remuneration_expectations, areas_of_expertise, previous_conferences, photo_path, cv_path, created_at")
    .eq("status", "approved")
    .order("created_at", { ascending: false });

  const search = params.q?.trim().toLowerCase() ?? "";
  const matchingEbs = (ebs ?? []).filter((eb) => {
    const matchesSearch = !search || [eb.display_name, eb.bio, eb.experience, ...(eb.areas_of_expertise ?? [])]
      .filter(Boolean)
      .some((value) => String(value).toLowerCase().includes(search));
    const matchesArea = !params.area || eb.areas_of_expertise?.includes(params.area);
    return matchesSearch && matchesArea;
  });
  const expertise = [...new Set((ebs ?? []).flatMap((eb) => eb.areas_of_expertise ?? []))].sort();

  const profiles = await Promise.all(
    matchingEbs.map(async (eb) => {
      const [photo, cv] = await Promise.all([
        eb.photo_path ? supabase.storage.from("eb-profiles").createSignedUrl(eb.photo_path, 60 * 10) : Promise.resolve({ data: null }),
        eb.cv_path ? supabase.storage.from("eb-documents").createSignedUrl(eb.cv_path, 60 * 10) : Promise.resolve({ data: null }),
      ]);
      return { ...eb, photoUrl: photo.data?.signedUrl ?? null, cvUrl: cv.data?.signedUrl ?? null };
    })
  );

  const profileIds = profiles.map((eb) => eb.id);
  const { data: reviews } = user && profileIds.length
    ? await supabase.from("eb_reviews").select("eb_application_id, reviewer_id, rating").in("eb_application_id", profileIds)
    : { data: [] as { eb_application_id: string; reviewer_id: string; rating: number }[] };
  const reviewsByEb = new Map<string, { total: number; count: number; mine?: number }>();
  reviews?.forEach((review) => {
    const current = reviewsByEb.get(review.eb_application_id) ?? { total: 0, count: 0 };
    current.total += review.rating;
    current.count += 1;
    if (review.reviewer_id === user?.id) current.mine = review.rating;
    reviewsByEb.set(review.eb_application_id, current);
  });

  return (
    <div style={{ minHeight: "100vh", padding: "48px 24px 100px" }}>
      <div style={{ maxWidth: 1000, margin: "0 auto" }}>
        <div className="mono" style={{ fontSize: 11, letterSpacing: 2, color: "var(--coral)", textTransform: "uppercase", marginBottom: 10 }}>
          File No. IN/MUN/EB — Marketplace
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: 16, marginBottom: 34 }}>
          <div>
            <h1 style={{ fontFamily: "var(--font-display)", fontSize: 38, marginBottom: 8 }}>Executive Board Directory</h1>
            <p style={{ color: "rgba(234,217,222,0.6)", fontSize: 14, maxWidth: 540 }}>
              Choose chairs from evidence, not familiarity. Every profile places a formal photograph, conference record, public CV and community rating in one honest view.
            </p>
          </div>
          <Link
            href={user ? "/hire-eb/manage" : "/login"}
            className="mono"
            style={{ background: "var(--paper)", color: "var(--ink)", padding: "12px 20px", borderRadius: 3, textDecoration: "none", fontSize: 12, fontWeight: 700, textTransform: "uppercase", whiteSpace: "nowrap" }}
          >
            {user ? "Manage / publish profile" : "+ Publish EB profile"}
          </Link>
        </div>

        <form style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 16 }}>
          <input name="q" defaultValue={params.q} placeholder="Search name, committee, or experience…" style={{ flex: 1, minWidth: 230, background: "#0F0F10", border: "1px solid rgba(234,217,222,.16)", color: "var(--text)", padding: "12px 14px", borderRadius: 6, fontSize: 13 }} />
          {params.area && <input type="hidden" name="area" value={params.area} />}
          <button type="submit" className="mono" style={{ background: "var(--paper)", color: "var(--ink)", border: "none", padding: "0 18px", borderRadius: 6, fontSize: 11, fontWeight: 700, textTransform: "uppercase", cursor: "pointer" }}>Search</button>
        </form>
        {expertise.length > 0 && <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 28 }}><Link href={params.q ? `/hire-eb?q=${encodeURIComponent(params.q)}` : "/hire-eb"} className="mono" style={{ fontSize: 10.5, textTransform: "uppercase", textDecoration: "none", padding: "6px 11px", borderRadius: 99, border: "1px solid rgba(234,217,222,.16)", background: !params.area ? "var(--paper)" : "transparent", color: !params.area ? "var(--ink)" : "rgba(234,217,222,.7)" }}>All expertise</Link>{expertise.map((area) => <Link key={area} href={`/hire-eb?${new URLSearchParams({ ...(params.q ? { q: params.q } : {}), area }).toString()}`} className="mono" style={{ fontSize: 10.5, textTransform: "uppercase", textDecoration: "none", padding: "6px 11px", borderRadius: 99, border: "1px solid rgba(234,217,222,.16)", background: params.area === area ? "var(--paper)" : "transparent", color: params.area === area ? "var(--ink)" : "rgba(234,217,222,.7)" }}>{area}</Link>)}</div>}

        {error && <p style={{ color: "#e59aa8" }}>Could not load EBs: {error.message}</p>}

        {profiles.length === 0 && (
          <div style={{ background: "#0F0F10", border: "1px dashed rgba(234,217,222,0.2)", borderRadius: 8, padding: 40, textAlign: "center", color: "rgba(234,217,222,0.55)" }}>
            {ebs?.length ? "No EB profiles match these filters. Try a different search or expertise." : "No EB profiles have been published yet. Members can publish their profile directly."}
          </div>
        )}

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 22 }}>
          {profiles.map((eb) => (
            <SpotlightCard key={eb.id} className="munlocked-card-hover" style={{ minHeight: 490, borderRadius: 16, boxShadow: "5px 6px 0 rgba(156,110,130,0.2)", transition: "transform 0.25s ease, box-shadow 0.25s ease", backgroundColor: "#111012", backgroundImage: eb.photoUrl ? `url("${eb.photoUrl}")` : "linear-gradient(135deg, #6a4351, #161218 70%)", backgroundSize: "cover", backgroundPosition: "center" }}>
              <div style={{ minHeight: 490, display: "flex", flexDirection: "column", justifyContent: "flex-end", padding: 22, color: "#fff7fa", background: "linear-gradient(180deg, rgba(4,4,5,.08) 0%, rgba(4,4,5,.52) 36%, rgba(4,4,5,.94) 100%)", backdropFilter: "blur(1.5px)" }}>
              <div style={{ padding: "16px 15px 14px", border: "1px solid rgba(255,255,255,.16)", borderRadius: 12, background: "rgba(9,8,10,.56)", backdropFilter: "blur(15px) saturate(125%)", boxShadow: "inset 0 1px 0 rgba(255,255,255,.09)" }}>
              {!eb.photoUrl && <div style={{ width: 50, height: 50, borderRadius: "50%", background: "linear-gradient(135deg, var(--mauve), var(--coral))", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--paper)", fontFamily: "Georgia, serif", fontSize: 18, marginBottom: 12 }}>{(eb.display_name ?? eb.applicant_email)[0]?.toUpperCase()}</div>}
              <h2 style={{ fontFamily: "Georgia, serif", fontSize: 23, marginBottom: 6, color: "#fff7fa" }}>{eb.display_name ?? "Executive Board"}</h2>
              <div className="mono" style={{ fontSize: 10, color: "var(--coral)", letterSpacing: 1, textTransform: "uppercase", marginBottom: 10 }}>Executive Board profile</div>
              {(() => {
                const rating = reviewsByEb.get(eb.id);
                return <p className="mono" style={{ fontSize: 11, color: "rgba(255,247,250,.84)", marginBottom: 10 }}>★ {rating ? (rating.total / rating.count).toFixed(1) : "New"} <span style={{ opacity: .65 }}>· {rating?.count ?? 0} rating{rating?.count === 1 ? "" : "s"}</span></p>;
              })()}
              <p style={{ fontSize: 13.5, lineHeight: 1.6, marginBottom: 10, color: "rgba(255,247,250,.88)" }}>{eb.bio}</p>
              <p className="mono" style={{ fontSize: 11, color: "rgba(255,247,250,.68)", marginBottom: 10 }}>{eb.experience}</p>
              {Object.values((eb.remuneration_expectations ?? {}) as Record<string, string>).some(Boolean) && (
                <p className="mono" style={{ fontSize: 10, color: "rgba(255,247,250,.65)", marginBottom: 10 }}>
                  {Object.entries((eb.remuneration_expectations ?? {}) as Record<string, string>).filter(([, value]) => value).map(([role, value]) => `${role.replaceAll("_", " ")} · ${value}`).join("  /  ")}
                </p>
              )}
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {eb.areas_of_expertise?.map((a: string) => (
                  <span key={a} className="mono" style={{ fontSize: 10, border: "1px solid rgba(255,255,255,.26)", padding: "2px 8px", borderRadius: 20, color: "rgba(255,247,250,.88)", background: "rgba(0,0,0,.2)" }}>
                    {a}
                  </span>
                ))}
              </div>
              {eb.cvUrl && <a href={eb.cvUrl} target="_blank" rel="noreferrer" className="mono" style={{ display:"inline-block", marginTop:14, color:"#fff7fa", fontSize:11, fontWeight:700 }}>View CV / MUN Portfolio ↗</a>}
              {user && user.id !== eb.applicant_id && <form action={rateEb} style={{ display: "flex", gap: 7, alignItems: "center", marginTop: 14 }}><input type="hidden" name="eb_application_id" value={eb.id} /><select name="rating" defaultValue={reviewsByEb.get(eb.id)?.mine ?? ""} required aria-label={`Rate ${eb.display_name ?? "this EB"}`} style={{ padding: "6px 8px", borderRadius: 4, border: "1px solid rgba(255,255,255,.3)", background: "rgba(0,0,0,.36)", color: "#fff7fa", fontSize: 11 }}><option value="" disabled>Rate this EB</option><option value="5">★★★★★ · 5</option><option value="4">★★★★ · 4</option><option value="3">★★★ · 3</option><option value="2">★★ · 2</option><option value="1">★ · 1</option></select><button type="submit" className="mono" style={{ background: "rgba(0,0,0,.26)", color: "#fff7fa", border: "1px solid rgba(255,255,255,.3)", borderRadius: 4, padding: "7px 9px", fontSize: 10, cursor: "pointer", textTransform: "uppercase" }}>Save</button></form>}
              <Link href={user ? `/inbox?eb=${eb.id}` : "/login"} className="mono" style={{ display:"inline-block", marginTop:16, background:"#fff2f6", color:"#181116", padding:"9px 12px", borderRadius:4, textDecoration:"none", fontSize:11, textTransform:"uppercase" }}>Message through MUNlocked →</Link>
              </div></div>
            </SpotlightCard>
          ))}
        </div>
      </div>
    </div>
  );
}
