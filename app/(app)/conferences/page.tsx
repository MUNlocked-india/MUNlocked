import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import SpotlightCard from "@/components/SpotlightCard";

export default async function ConferencesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: conferences, error } = await supabase
    .from("conferences")
    .select("id, name, secretariat, format, city, event_date, delegate_fee, committees, registration_url, logo_path")
    .eq("status", "approved")
    .order("event_date", { ascending: true });

  const listings = await Promise.all(
    (conferences ?? []).map(async (conference) => {
      const logo = conference.logo_path
        ? await supabase.storage.from("conference-assets").createSignedUrl(conference.logo_path, 60 * 10)
        : { data: null };
      return { ...conference, logoUrl: logo.data?.signedUrl ?? null };
    })
  );

  return (
    <div style={{ minHeight: "100vh", padding: "48px 24px 100px" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <div className="mono" style={{ fontSize: 11, letterSpacing: 2, color: "var(--coral)", textTransform: "uppercase", marginBottom: 10 }}>
          File No. IN/MUN/CONF — Directory
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: 16, marginBottom: 34 }}>
          <div>
            <h1 style={{ fontFamily: "var(--font-display)", fontSize: 38, marginBottom: 8 }}>Conference Directory</h1>
            <p style={{ color: "rgba(234,217,222,0.6)", fontSize: 14, maxWidth: 560 }}>
              Compare the rooms worth entering—dates, committees, fees and registration details presented clearly, with every listing reviewed before it goes live.
            </p>
          </div>
          <Link
            href={user ? "/conferences/submit" : "/login"}
            className="mono"
            style={{ background: "var(--paper)", color: "var(--ink)", padding: "12px 20px", borderRadius: 3, textDecoration: "none", fontSize: 12, fontWeight: 700, textTransform: "uppercase", whiteSpace: "nowrap" }}
          >
            + Submit a Conference
          </Link>
        </div>

        {error && (
          <p className="error-text" style={{ color: "#e59aa8" }}>
            Could not load conferences: {error.message}. Have you run <code>supabase/schema.sql</code> yet?
          </p>
        )}

        {!error && listings.length === 0 && (
          <div style={{ background: "#0F0F10", border: "1px dashed rgba(234,217,222,0.2)", borderRadius: 8, padding: 40, textAlign: "center", color: "rgba(234,217,222,0.55)" }}>
            No approved conferences yet. Submissions go into a pending queue for admin review — be the first to submit one.
          </div>
        )}

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 22 }}>
          {listings.map((c) => (
            <SpotlightCard key={c.id} className="munlocked-card-hover" style={{ background: "var(--paper)", color: "var(--ink)", borderRadius: 14, padding: 22, boxShadow: "5px 6px 0 rgba(156,110,130,0.2)", transition: "transform 0.25s ease, box-shadow 0.25s ease" }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "flex-start" }}>
                <span className="mono" style={{ fontSize: 10, letterSpacing: 1, textTransform: "uppercase", background: "rgba(7,7,7,0.08)", padding: "3px 8px", borderRadius: 3 }}>
                  {c.format.replace("_", " ")}
                </span>
                {c.logoUrl && <img src={c.logoUrl} alt={`${c.name} logo`} style={{ width: 58, height: 58, objectFit: "contain", borderRadius: 9, background: "rgba(7,7,7,.04)", padding: 5 }} />}
              </div>
              <h3 style={{ fontFamily: "Georgia, serif", fontSize: 19, margin: "12px 0 6px" }}>{c.name}</h3>
              <p className="mono" style={{ fontSize: 11, color: "rgba(7,7,7,0.55)", marginBottom: 10 }}>
                {new Date(c.event_date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                {c.city ? ` · ${c.city}` : ""}
                {c.delegate_fee != null ? ` · ₹${c.delegate_fee}` : ""}
              </p>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 14 }}>
                {c.committees?.map((committee: string) => (
                  <span key={committee} className="mono" style={{ fontSize: 10, border: "1px solid rgba(7,7,7,0.25)", padding: "2px 8px", borderRadius: 20, color: "rgba(7,7,7,0.65)" }}>
                    {committee}
                  </span>
                ))}
              </div>
              <p className="mono" style={{ fontSize: 11, color: "rgba(7,7,7,0.5)", marginBottom: 12 }}>{c.secretariat}</p>
              {c.registration_url && (
                <a href={c.registration_url} target="_blank" rel="noreferrer" className="mono" style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", color: "var(--ink)", borderBottom: "1.5px solid var(--ink)", textDecoration: "none" }}>
                  Register →
                </a>
              )}
            </SpotlightCard>
          ))}
        </div>
      </div>
    </div>
  );
}
