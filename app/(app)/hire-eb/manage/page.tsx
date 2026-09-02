import Link from "next/link";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { COMMITTEE_EXPERTISE, EB_ROLES, REMUNERATION_OPTIONS } from "@/lib/eb-profile-options";

async function updateEbProfile(formData: FormData) {
  "use server";
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const bio = String(formData.get("bio") || "").trim();
  const ebExperience = String(formData.get("eb_experience") || "").trim();
  const delegateExperience = String(formData.get("delegate_experience") || "").trim();
  const areas = formData.getAll("areas_of_expertise").map(String).map((area) => area.trim()).filter(Boolean);
  const remuneration = Object.fromEntries(EB_ROLES.map(({ key }) => [key, String(formData.get(`remuneration_${key}`) || "").trim()]));
  if (!bio || !ebExperience || !delegateExperience || areas.length === 0 || Object.values(remuneration).some((value) => !value)) redirect("/hire-eb/manage?error=Please+complete+every+public+profile+field.");

  const experience = `Executive Board experience:\n${ebExperience}\n\nDelegate experience:\n${delegateExperience}`;
  const { error } = await supabase.from("eb_applications").update({
    display_name: String(formData.get("display_name") || "").trim() || null,
    bio, experience, eb_experience: ebExperience, delegate_experience: delegateExperience,
    areas_of_expertise: areas, remuneration_expectations: remuneration,
    previous_conferences: String(formData.get("previous_conferences") || "").trim() || null,
  }).eq("id", String(formData.get("eb_application_id"))).eq("applicant_id", user.id).eq("status", "approved").is("removed_at", null);

  if (error) redirect(`/hire-eb/manage?error=${encodeURIComponent(error.message)}`);
  revalidatePath("/"); revalidatePath("/hire-eb"); revalidatePath("/hire-eb/manage");
  redirect("/hire-eb/manage?success=1");
}

export default async function ManageEbProfilePage({ searchParams }: { searchParams: Promise<{ error?: string; success?: string; published?: string }> }) {
  const params = await searchParams;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const { data: ebProfile } = await supabase.from("eb_applications")
    .select("id, display_name, bio, experience, eb_experience, delegate_experience, areas_of_expertise, remuneration_expectations, previous_conferences")
    .eq("applicant_id", user.id).eq("status", "approved").is("removed_at", null).maybeSingle();
  if (!ebProfile) redirect("/hire-eb/apply");
  const remuneration = (ebProfile.remuneration_expectations ?? {}) as Record<string, string>;

  return <main className="eb-profile-page"><form action={updateEbProfile} className="eb-profile-form">
    <div className="eb-form-heading"><span className="mono">PROFILE / LIVE MARKETPLACE</span><h1>Keep your record<br />ready for the room.</h1><p>Your profile is visible in the Hire an EB marketplace. Update the details organisers use to make a confident, informed choice.</p></div>
    {(params.success || params.published) && <p className="eb-form-success" role="status">Your EB profile is live and up to date across MUNlocked.</p>}
    {params.error && <p className="eb-form-error" role="alert">{params.error}</p>}
    <input type="hidden" name="eb_application_id" value={ebProfile.id} />
    <section className="eb-form-section"><div className="eb-section-label"><span>01</span><div><h2>Your public identity</h2><p>Make the listing unmistakably yours.</p></div></div><div className="eb-form-grid"><label className="eb-field eb-field-wide"><span>Public name</span><input name="display_name" defaultValue={ebProfile.display_name ?? ""} placeholder="Your name" /></label><label className="eb-field eb-field-wide"><span>Short bio</span><textarea name="bio" required rows={3} defaultValue={ebProfile.bio ?? ""} /></label></div></section>
    <section className="eb-form-section"><div className="eb-section-label"><span>02</span><div><h2>Your MUN record</h2><p>Separate dais leadership from delegate experience.</p></div></div><div className="eb-form-grid"><label className="eb-field"><span>Executive Board experience</span><textarea name="eb_experience" required rows={5} defaultValue={ebProfile.eb_experience || ebProfile.experience || ""} /></label><label className="eb-field"><span>Delegate experience</span><textarea name="delegate_experience" required rows={5} defaultValue={ebProfile.delegate_experience ?? ""} /></label><label className="eb-field eb-field-wide"><span>Previous conferences <em>Optional</em></span><textarea name="previous_conferences" rows={2} defaultValue={ebProfile.previous_conferences ?? ""} /></label></div></section>
    <section className="eb-form-section"><div className="eb-section-label"><span>03</span><div><h2>Where you work best</h2><p>Select every committee family you can chair confidently.</p></div></div><label className="eb-field eb-field-wide"><span>Areas of expertise</span><select name="areas_of_expertise" required multiple size={8} defaultValue={ebProfile.areas_of_expertise ?? []}>{COMMITTEE_EXPERTISE.map((committee) => <option key={committee} value={committee}>{committee}</option>)}</select><small>Hold Ctrl (Windows) or ⌘ (Mac) to select more than one committee.</small></label></section>
    <section className="eb-form-section"><div className="eb-section-label"><span>04</span><div><h2>Role & remuneration</h2><p>One clear availability card, with an expectation for every role.</p></div></div><div className="eb-remuneration-card">{EB_ROLES.map(({ key, label }) => <label key={key}><span>{label}</span><select name={`remuneration_${key}`} required defaultValue={remuneration[key] || ""}><option value="" disabled>Select expectation</option>{REMUNERATION_OPTIONS.map((option) => <option key={option} value={option}>{option}</option>)}</select></label>)}</div></section>
    <button type="submit" className="eb-publish-button">Save public profile <span>↗</span></button><Link href="/hire-eb" className="eb-marketplace-link">View my marketplace profile <span>→</span></Link>
  </form></main>;
}
