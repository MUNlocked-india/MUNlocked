import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { notifyAdmin } from "@/lib/email";

async function submitApplication(formData: FormData) {
  "use server";
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const areas = String(formData.get("areas_of_expertise") || "")
    .split(",")
    .map((a) => a.trim())
    .filter(Boolean);

  const { error } = await supabase.from("eb_applications").insert({
    applicant_id: user!.id,
    applicant_email: user!.email,
    bio: String(formData.get("bio")),
    experience: String(formData.get("experience")),
    areas_of_expertise: areas,
    previous_conferences: String(formData.get("previous_conferences") || "") || null,
    status: "pending",
  });

  if (error) {
    redirect(`/hire-eb/apply?error=${encodeURIComponent(error.message)}`);
  }

  await notifyAdmin(
    "New EB application submitted for review",
    `${user!.email} just applied to become a verified EB.\n\nExperience: ${formData.get("experience")}\nExpertise: ${areas.join(", ")}\n\nReview it at /admin/eb-applications.`
  );

  redirect("/hire-eb/apply?success=1");
}

export default async function ApplyEbPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; success?: string }>;
}) {
  const params = await searchParams;

  return (
    <div className="auth-wrap" style={{ alignItems: "flex-start", paddingTop: 60 }}>
      <form action={submitApplication} className="auth-card" style={{ maxWidth: 520 }}>
        <div className="mono" style={{ fontSize: 11, letterSpacing: 2, color: "var(--coral)", marginBottom: 8, textTransform: "uppercase" }}>
          File No. IN/MUN/EB-APPLY
        </div>
        <h1 style={{ fontFamily: "Georgia, serif", fontSize: 24, marginBottom: 6 }}>Apply as a Verified EB</h1>
        <p style={{ fontSize: 13, color: "rgba(7,7,7,0.6)", marginBottom: 20 }}>
          An admin reviews every application before it's listed. Approved profiles show up in the public "Hire an EB" directory.
        </p>

        {params.success && <p className="success-text">Application submitted — it's now pending admin review.</p>}
        {params.error && <p className="error-text">Error: {params.error}</p>}

        <label htmlFor="bio">Short Bio</label>
        <textarea id="bio" name="bio" required rows={3} style={textareaStyle} placeholder="A few sentences about you." />

        <label htmlFor="experience">MUN Experience</label>
        <textarea id="experience" name="experience" required rows={3} style={textareaStyle} placeholder="Committees chaired, conferences attended, notable achievements." />

        <label htmlFor="areas_of_expertise">Areas of Expertise (comma-separated)</label>
        <input id="areas_of_expertise" name="areas_of_expertise" type="text" placeholder="UNSC, Crisis Committees, DISEC" />

        <label htmlFor="previous_conferences">Previous Conferences (optional)</label>
        <textarea id="previous_conferences" name="previous_conferences" rows={2} style={textareaStyle} placeholder="Aethris MUN 2025 — Vice Chair, UNSC" />

        <button type="submit" className="submit">Submit Application</button>
      </form>
    </div>
  );
}

const textareaStyle: React.CSSProperties = {
  width: "100%",
  padding: "12px 14px",
  border: "1px solid rgba(7,7,7,0.2)",
  borderRadius: 3,
  background: "rgba(255,255,255,0.4)",
  fontFamily: "Georgia, serif",
  fontSize: 14,
  color: "var(--ink)",
  marginTop: 6,
  marginBottom: 16,
  resize: "vertical",
};
