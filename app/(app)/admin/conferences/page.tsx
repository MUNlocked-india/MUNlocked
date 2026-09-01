import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { sendEmail } from "@/lib/email";

async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user!.id)
    .single();

  if (profile?.role !== "admin") {
    redirect("/dashboard");
  }
  return supabase;
}

async function reviewConference(formData: FormData) {
  "use server";
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const id = String(formData.get("id"));
  const decision = String(formData.get("decision")); // 'approved' | 'rejected'

  const { data: conference } = await supabase
    .from("conferences")
    .select("name, contact_email")
    .eq("id", id)
    .single();

  // RLS also enforces admin-only on this update — this check is a fast-fail
  // for a better error experience, not the actual security boundary.
  await supabase
    .from("conferences")
    .update({ status: decision, reviewed_by: user!.id })
    .eq("id", id);

  if (conference?.contact_email) {
    await sendEmail({
      to: conference.contact_email,
      subject:
        decision === "approved"
          ? `${conference.name} has been approved on MUNlocked`
          : `Update on your MUNlocked listing: ${conference.name}`,
      text:
        decision === "approved"
          ? `Good news — "${conference.name}" has been reviewed and approved. It's now live in the MUNlocked Conference Directory.`
          : `"${conference.name}" was reviewed and was not approved for listing at this time. Reply to this email if you'd like more detail, or revise and resubmit.`,
    });
  }

  redirect("/admin/conferences");
}

export default async function AdminConferencesPage() {
  const supabase = await requireAdmin();

  const { data: pending, error } = await supabase
    .from("conferences")
    .select("id, name, secretariat, contact_email, format, city, event_date, delegate_fee, committees, logo_path, created_at")
    .eq("status", "pending")
    .order("created_at", { ascending: true });

  const submissions = await Promise.all(
    (pending ?? []).map(async (conference) => {
      const logo = conference.logo_path
        ? await supabase.storage.from("conference-assets").createSignedUrl(conference.logo_path, 60 * 10)
        : { data: null };
      return { ...conference, logoUrl: logo.data?.signedUrl ?? null };
    })
  );

  return (
    <div style={{ minHeight: "100vh", padding: "48px 24px 100px" }}>
      <div style={{ maxWidth: 900, margin: "0 auto" }}>
        <div className="mono" style={{ fontSize: 11, letterSpacing: 2, color: "var(--coral)", textTransform: "uppercase", marginBottom: 10 }}>
          File No. IN/MUN/ADMIN — Review Queue
        </div>
        <h1 style={{ fontFamily: "Georgia, serif", fontSize: 30, marginBottom: 8 }}>Pending Conferences</h1>
        <p style={{ color: "rgba(234,217,222,0.6)", fontSize: 14, marginBottom: 34 }}>
          {submissions.length} submission{submissions.length === 1 ? "" : "s"} waiting for review.
        </p>

        {error && <p style={{ color: "#e59aa8" }}>Could not load queue: {error.message}</p>}

        {submissions.length === 0 && (
          <div style={{ background: "#0F0F10", border: "1px dashed rgba(234,217,222,0.2)", borderRadius: 8, padding: 40, textAlign: "center", color: "rgba(234,217,222,0.55)" }}>
            Queue is empty. Nothing waiting on you right now.
          </div>
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          {submissions.map((c) => (
            <div key={c.id} style={{ background: "#0F0F10", border: "1px solid rgba(234,217,222,0.12)", borderRadius: 8, padding: 24 }}>
              <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 10, marginBottom: 10 }}>
                <h3 style={{ fontFamily: "Georgia, serif", fontSize: 19 }}>{c.name}</h3>
                <span className="mono" style={{ fontSize: 10, textTransform: "uppercase", color: "rgba(234,217,222,0.5)" }}>
                  Submitted {new Date(c.created_at).toLocaleDateString("en-IN")}
                </span>
              </div>
              <p className="mono" style={{ fontSize: 12, color: "rgba(234,217,222,0.65)", lineHeight: 1.9 }}>
                <b style={{ color: "var(--coral)" }}>Secretariat:</b> {c.secretariat}<br />
                <b style={{ color: "var(--coral)" }}>Contact:</b> {c.contact_email}<br />
                <b style={{ color: "var(--coral)" }}>Format:</b> {c.format.replace("_", " ")}{c.city ? ` · ${c.city}` : ""}<br />
                <b style={{ color: "var(--coral)" }}>Date:</b> {new Date(c.event_date).toLocaleDateString("en-IN")}<br />
                <b style={{ color: "var(--coral)" }}>Fee:</b> {c.delegate_fee != null ? `₹${c.delegate_fee}` : "—"}<br />
                <b style={{ color: "var(--coral)" }}>Committees:</b> {c.committees?.join(", ") || "—"}
              </p>
              {c.logoUrl && <a href={c.logoUrl} target="_blank" rel="noreferrer" className="mono" style={{ color: "var(--coral)", fontSize: 11 }}>View submitted logo ↗</a>}
              <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
                <form action={reviewConference}>
                  <input type="hidden" name="id" value={c.id} />
                  <input type="hidden" name="decision" value="approved" />
                  <button type="submit" className="mono" style={{ background: "var(--paper)", color: "var(--ink)", border: "none", padding: "10px 18px", borderRadius: 3, fontSize: 11, fontWeight: 700, textTransform: "uppercase", cursor: "pointer" }}>
                    Approve
                  </button>
                </form>
                <form action={reviewConference}>
                  <input type="hidden" name="id" value={c.id} />
                  <input type="hidden" name="decision" value="rejected" />
                  <button type="submit" className="mono" style={{ background: "none", color: "#e59aa8", border: "1.5px solid #8B1E3F", padding: "10px 18px", borderRadius: 3, fontSize: 11, fontWeight: 700, textTransform: "uppercase", cursor: "pointer" }}>
                    Reject
                  </button>
                </form>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
