import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { sendEmail } from "@/lib/email";

async function requireAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (profile?.role !== "admin") redirect("/dashboard");
  return { supabase, user };
}

async function removeProfile(formData: FormData) {
  "use server";
  const { supabase, user } = await requireAdmin();
  const id = String(formData.get("id") || "");
  const note = String(formData.get("note") || "Removed by MUNlocked administration.").slice(0, 500);
  const { data: profile } = await supabase.from("eb_applications").select("applicant_email, display_name").eq("id", id).single();
  await supabase.from("eb_applications").update({ status: "rejected", removed_at: new Date().toISOString(), removed_by: user.id, removal_note: note }).eq("id", id);
  if (profile?.applicant_email) await sendEmail({ to: profile.applicant_email, subject: "Your MUNlocked EB profile was removed", text: `Your EB marketplace listing${profile.display_name ? ` for ${profile.display_name}` : ""} was removed by a MUNlocked administrator. Reason: ${note}` });
  redirect("/admin/eb-applications");
}

async function addProfile(formData: FormData) {
  "use server";
  const { supabase, user } = await requireAdmin();
  const applicantId = String(formData.get("applicant_id") || "");
  const displayName = String(formData.get("display_name") || "").trim();
  const applicantEmail = String(formData.get("applicant_email") || "").trim().toLowerCase();
  const bio = String(formData.get("bio") || "").trim();
  const experience = String(formData.get("experience") || "").trim();
  const expertise = String(formData.get("areas_of_expertise") || "").split(",").map((area) => area.trim()).filter(Boolean);
  if (!applicantId || !displayName || !applicantEmail || !bio || !experience) redirect("/admin/eb-applications?error=Complete+all+manual+profile+fields.");
  const { error } = await supabase.from("eb_applications").insert({ applicant_id: applicantId, applicant_email: applicantEmail, display_name: displayName, bio, experience, areas_of_expertise: expertise, status: "approved", reviewed_by: user.id });
  if (error) redirect(`/admin/eb-applications?error=${encodeURIComponent(error.message)}`);
  await sendEmail({ to: applicantEmail, subject: "Your EB profile was added to MUNlocked", text: "A MUNlocked admin has added your Executive Board profile to the Hire an EB marketplace. Sign in to respond to enquiries through your Inbox." });
  redirect("/admin/eb-applications?added=1");
}

export default async function AdminEbMarketplacePage({ searchParams }: { searchParams: Promise<{ added?: string; error?: string }> }) {
  const params = await searchParams;
  const { supabase } = await requireAdmin();
  const [{ data: active, error }, { data: members }, { count: legacyPending }] = await Promise.all([
    supabase.from("eb_applications").select("id, display_name, applicant_email, bio, experience, areas_of_expertise, previous_conferences, photo_path, cv_path, created_at").eq("status", "approved").order("created_at", { ascending: false }),
    supabase.from("profiles").select("id, full_name, role").order("full_name").limit(100),
    supabase.from("eb_applications").select("id", { count: "exact", head: true }).eq("status", "pending"),
  ]);
  const listings = await Promise.all((active ?? []).map(async (profile) => {
    const [photo, cv] = await Promise.all([profile.photo_path ? supabase.storage.from("eb-profiles").createSignedUrl(profile.photo_path, 600) : Promise.resolve({ data: null }), profile.cv_path ? supabase.storage.from("eb-documents").createSignedUrl(profile.cv_path, 600) : Promise.resolve({ data: null })]);
    return { ...profile, photoUrl: photo.data?.signedUrl ?? null, cvUrl: cv.data?.signedUrl ?? null };
  }));
  return <div style={{ minHeight: "100vh", padding: "48px 24px 100px" }}><div style={{ maxWidth: 1000, margin: "0 auto" }}>
    <div className="mono" style={{ fontSize: 11, letterSpacing: 2, color: "var(--coral)", textTransform: "uppercase", marginBottom: 10 }}>MUNlocked Admin · EB Marketplace</div>
    <h1 style={{ fontFamily: "Georgia, serif", fontSize: 30, marginBottom: 8 }}>Live EB Profiles</h1>
    <p style={{ color: "rgba(234,217,222,.62)", marginBottom: 28 }}>Profiles publish instantly. Use this space to add an existing member’s profile or remove a listing that breaks marketplace rules.</p>
    {params.added && <p className="success-text">EB profile added and published.</p>}{params.error && <p className="error-text">{params.error}</p>}{error && <p className="error-text">{error.message}</p>}
    <form action={addProfile} className="auth-card" style={{ maxWidth: "none", marginBottom: 28 }}><h2 style={{ fontFamily: "Georgia, serif", fontSize: 20, marginBottom: 8 }}>Add an EB profile</h2><p style={{ fontSize: 12, color: "rgba(7,7,7,.62)", marginBottom: 16 }}>Choose an existing MUNlocked member so the profile can receive inbox enquiries.</p><div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(210px,1fr))", gap: 12 }}><div><label htmlFor="applicant_id">MUNlocked member</label><select id="applicant_id" name="applicant_id" required style={fieldStyle}><option value="">Select member…</option>{members?.map((member) => <option key={member.id} value={member.id}>{member.full_name} · {member.role}</option>)}</select></div><div><label htmlFor="display_name">Display name</label><input id="display_name" name="display_name" required /></div><div><label htmlFor="applicant_email">Registered email</label><input id="applicant_email" name="applicant_email" type="email" required /></div><div><label htmlFor="areas_of_expertise">Expertise</label><input id="areas_of_expertise" name="areas_of_expertise" placeholder="UNSC, DISEC" /></div></div><label htmlFor="bio">Bio</label><textarea id="bio" name="bio" required rows={2} style={areaStyle} /><label htmlFor="experience">Experience</label><textarea id="experience" name="experience" required rows={2} style={areaStyle} /><button className="submit">Publish profile</button></form>
    {legacyPending ? <p className="mono" style={{ fontSize: 11, color: "var(--brass)", marginBottom: 18 }}>{legacyPending} older pending profile{legacyPending === 1 ? "" : "s"} remain private until their owner republishes them.</p> : null}
    {listings.length === 0 ? <div style={{ border: "1px dashed rgba(234,217,222,.2)", borderRadius: 10, padding: 34, textAlign: "center", opacity: .65 }}>No live EB profiles yet.</div> : <div style={{ display: "grid", gap: 14 }}>{listings.map((profile) => <article key={profile.id} style={{ background: "#101011", border: "1px solid rgba(234,217,222,.12)", borderRadius: 12, padding: 20, display: "flex", gap: 16, alignItems: "flex-start", flexWrap: "wrap" }}>{profile.photoUrl ? <a href={profile.photoUrl} target="_blank" rel="noreferrer" style={{ color: "inherit" }}>View photo ↗</a> : <div style={{ width: 46, height: 46, borderRadius: "50%", background: "var(--mauve)", display: "grid", placeItems: "center", color: "var(--ink)" }}>{profile.display_name?.[0]}</div>}<div style={{ flex: 1, minWidth: 220 }}><h3 style={{ fontFamily: "Georgia, serif", fontSize: 19, marginBottom: 5 }}>{profile.display_name ?? profile.applicant_email}</h3><div className="mono" style={{ fontSize: 10, color: "var(--coral)", marginBottom: 8 }}>{profile.applicant_email}</div><p style={{ fontSize: 13, lineHeight: 1.6, marginBottom: 7 }}>{profile.bio}</p><p className="mono" style={{ fontSize: 11, opacity: .6 }}>{profile.areas_of_expertise?.join(" · ") || "General MUN"}{profile.cvUrl && <> · <a href={profile.cvUrl} target="_blank" rel="noreferrer" style={{ color: "var(--coral)" }}>CV ↗</a></>}</p></div><form action={removeProfile} style={{ minWidth: 170 }}><input type="hidden" name="id" value={profile.id} /><input name="note" placeholder="Removal reason" style={{ width: "100%", marginBottom: 8, background: "#1a1a1b", border: "1px solid rgba(234,217,222,.16)", color: "var(--text)", padding: 8, borderRadius: 5, fontSize: 11 }} /><button className="mono" style={{ width: "100%", background: "transparent", border: "1px solid #8b1e3f", color: "#e59aa8", borderRadius: 5, padding: "8px 10px", cursor: "pointer", fontSize: 10, textTransform: "uppercase" }}>Remove listing</button></form></article>)}</div>}
  </div></div>;
}

const fieldStyle: React.CSSProperties = { width: "100%", padding: "12px 14px", border: "1px solid rgba(7,7,7,.2)", borderRadius: 3, background: "rgba(255,255,255,.5)", color: "var(--ink)", marginTop: 6, marginBottom: 16 };
const areaStyle: React.CSSProperties = { width: "100%", padding: "12px 14px", border: "1px solid rgba(7,7,7,.2)", borderRadius: 3, background: "rgba(255,255,255,.5)", color: "var(--ink)", marginTop: 6, marginBottom: 16, resize: "vertical" };
