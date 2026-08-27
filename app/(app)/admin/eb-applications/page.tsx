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

  if (profile?.role !== "admin") redirect("/dashboard");
  return { supabase, user: user! };
}

async function reviewApplication(formData: FormData) {
  "use server";
  const { supabase, user } = await requireAdmin();

  const id = String(formData.get("id"));
  const decision = String(formData.get("decision"));

  const { data: application } = await supabase
    .from("eb_applications")
    .select("applicant_email")
    .eq("id", id)
    .single();

  await supabase
    .from("eb_applications")
    .update({ status: decision, reviewed_by: user.id })
    .eq("id", id);

  if (application?.applicant_email) {
    await sendEmail({
      to: application.applicant_email,
      subject:
        decision === "approved"
          ? "You're a verified EB on MUNlocked"
          : "Update on your MUNlocked EB application",
      text:
        decision === "approved"
          ? "Your Executive Board application has been reviewed and approved. Your profile is now live in the Hire an EB directory."
          : "Your Executive Board application was reviewed and was not approved at this time. You're welcome to revise and reapply.",
    });
  }

  redirect("/admin/eb-applications");
}

export default async function AdminEbApplicationsPage() {
  const { supabase } = await requireAdmin();

  const { data: pending, error } = await supabase
    .from("eb_applications")
    .select("id, applicant_email, bio, experience, areas_of_expertise, previous_conferences, created_at")
    .eq("status", "pending")
    .order("created_at", { ascending: true });

  return (
    <div style={{ minHeight: "100vh", padding: "48px 24px 100px" }}>
      <div style={{ maxWidth: 900, margin: "0 auto" }}>
        <div className="mono" style={{ fontSize: 11, letterSpacing: 2, color: "var(--coral)", textTransform: "uppercase", marginBottom: 10 }}>
          File No. IN/MUN/ADMIN — EB Review Queue
        </div>
        <h1 style={{ fontFamily: "Georgia, serif", fontSize: 30, marginBottom: 8 }}>Pending EB Applications</h1>
        <p style={{ color: "rgba(234,217,222,0.6)", fontSize: 14, marginBottom: 34 }}>
          {pending?.length ?? 0} application{pending?.length === 1 ? "" : "s"} waiting for review.
        </p>

        {error && <p style={{ color: "#e59aa8" }}>Could not load queue: {error.message}</p>}

        {pending?.length === 0 && (
          <div style={{ background: "#0F0F10", border: "1px dashed rgba(234,217,222,0.2)", borderRadius: 8, padding: 40, textAlign: "center", color: "rgba(234,217,222,0.55)" }}>
            Queue is empty.
          </div>
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          {pending?.map((a) => (
            <div key={a.id} style={{ background: "#0F0F10", border: "1px solid rgba(234,217,222,0.12)", borderRadius: 8, padding: 24 }}>
              <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 10, marginBottom: 10 }}>
                <h3 style={{ fontFamily: "Georgia, serif", fontSize: 18 }}>{a.applicant_email}</h3>
                <span className="mono" style={{ fontSize: 10, textTransform: "uppercase", color: "rgba(234,217,222,0.5)" }}>
                  Applied {new Date(a.created_at).toLocaleDateString("en-IN")}
                </span>
              </div>
              <p className="mono" style={{ fontSize: 12, color: "rgba(234,217,222,0.65)", lineHeight: 1.9 }}>
                <b style={{ color: "var(--coral)" }}>Bio:</b> {a.bio}<br />
                <b style={{ color: "var(--coral)" }}>Experience:</b> {a.experience}<br />
                <b style={{ color: "var(--coral)" }}>Expertise:</b> {a.areas_of_expertise?.join(", ") || "—"}<br />
                {a.previous_conferences && (
                  <><b style={{ color: "var(--coral)" }}>Previous Conferences:</b> {a.previous_conferences}</>
                )}
              </p>
              <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
                <form action={reviewApplication}>
                  <input type="hidden" name="id" value={a.id} />
                  <input type="hidden" name="decision" value="approved" />
                  <button type="submit" className="mono" style={{ background: "var(--paper)", color: "var(--ink)", border: "none", padding: "10px 18px", borderRadius: 3, fontSize: 11, fontWeight: 700, textTransform: "uppercase", cursor: "pointer" }}>
                    Approve
                  </button>
                </form>
                <form action={reviewApplication}>
                  <input type="hidden" name="id" value={a.id} />
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
