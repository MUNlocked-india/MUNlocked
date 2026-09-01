import Link from "next/link";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

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

async function updateEbProfile(formData: FormData) {
  "use server";
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const areas = String(formData.get("areas_of_expertise") || "")
    .split(",")
    .map((area) => area.trim())
    .filter(Boolean);

  const { error } = await supabase
    .from("eb_applications")
    .update({
      display_name: String(formData.get("display_name") || "").trim() || null,
      bio: String(formData.get("bio") || "").trim(),
      experience: String(formData.get("experience") || "").trim(),
      areas_of_expertise: areas,
      previous_conferences: String(formData.get("previous_conferences") || "").trim() || null,
    })
    .eq("id", String(formData.get("eb_application_id")))
    .eq("applicant_id", user.id)
    .eq("status", "approved");

  if (error) redirect(`/hire-eb/manage?error=${encodeURIComponent(error.message)}`);
  revalidatePath("/hire-eb");
  revalidatePath("/");
  redirect("/hire-eb/manage?success=1");
}

export default async function ManageEbProfilePage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; success?: string }>;
}) {
  const params = await searchParams;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: ebProfile } = await supabase
    .from("eb_applications")
    .select("id, display_name, bio, experience, areas_of_expertise, previous_conferences")
    .eq("applicant_id", user.id)
    .eq("status", "approved")
    .maybeSingle();
  if (!ebProfile) redirect("/hire-eb/apply");

  return (
    <div className="auth-wrap" style={{ alignItems: "flex-start", paddingTop: 60 }}>
      <form action={updateEbProfile} className="auth-card" style={{ maxWidth: 560 }}>
        <div className="mono" style={{ fontSize: 11, letterSpacing: 2, color: "var(--coral)", marginBottom: 8, textTransform: "uppercase" }}>
          File No. IN/MUN/EB-PROFILE
        </div>
        <h1 style={{ fontFamily: "Georgia, serif", fontSize: 24, marginBottom: 6 }}>Manage your EB profile</h1>
        <p style={{ fontSize: 13, color: "rgba(7,7,7,0.6)", marginBottom: 20 }}>
          Your marketplace profile is live. Update your public professional details here; your existing formal photo and CV remain unchanged.
        </p>
        {params.success && <p className="success-text">Your EB profile has been updated.</p>}
        {params.error && <p className="error-text">Error: {params.error}</p>}
        <input type="hidden" name="eb_application_id" value={ebProfile.id} />

        <label htmlFor="display_name">Public name</label>
        <input id="display_name" name="display_name" defaultValue={ebProfile.display_name ?? ""} placeholder="Your name" />

        <label htmlFor="bio">Short bio</label>
        <textarea id="bio" name="bio" required rows={3} style={textareaStyle} defaultValue={ebProfile.bio ?? ""} />

        <label htmlFor="experience">MUN experience</label>
        <textarea id="experience" name="experience" required rows={3} style={textareaStyle} defaultValue={ebProfile.experience ?? ""} />

        <label htmlFor="areas_of_expertise">Areas of expertise (comma-separated)</label>
        <input id="areas_of_expertise" name="areas_of_expertise" defaultValue={(ebProfile.areas_of_expertise ?? []).join(", ")} placeholder="UNSC, Crisis Committees, DISEC" />

        <label htmlFor="previous_conferences">Previous conferences</label>
        <textarea id="previous_conferences" name="previous_conferences" rows={2} style={textareaStyle} defaultValue={ebProfile.previous_conferences ?? ""} />

        <button type="submit" className="submit">Save public profile</button>
        <Link href="/hire-eb" className="mono" style={{ display: "block", marginTop: 16, textAlign: "center", color: "var(--ink)", fontSize: 11 }}>View marketplace →</Link>
      </form>
    </div>
  );
}
