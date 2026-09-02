"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { notifyAdmin, sendEmail } from "@/lib/email";
import { EB_ROLES } from "@/lib/eb-profile-options";

function errorRedirect(message: string): never {
  redirect(`/hire-eb/apply?error=${encodeURIComponent(message)}`);
}

export async function submitEbApplication(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const bio = String(formData.get("bio") || "").trim();
  const ebExperience = String(formData.get("eb_experience") || "").trim();
  const delegateExperience = String(formData.get("delegate_experience") || "").trim();
  const areas = formData.getAll("areas_of_expertise").map(String).map((area) => area.trim()).filter(Boolean);
  const remuneration = Object.fromEntries(EB_ROLES.map(({ key }) => [key, String(formData.get(`remuneration_${key}`) || "").trim()]));
  if (!bio || !ebExperience || !delegateExperience || areas.length === 0 || Object.values(remuneration).some((value) => !value)) {
    errorRedirect("Complete your bio, both experience sections, expertise and remuneration preferences.");
  }

  const { data: profile } = await supabase.from("profiles").select("full_name").eq("id", user.id).single();
  const { data: existingProfile } = await supabase.from("eb_applications").select("id").eq("applicant_id", user.id).eq("status", "approved").is("removed_at", null).maybeSingle();
  if (existingProfile) redirect("/hire-eb/manage");

  const photo = formData.get("photo");
  const cv = formData.get("cv");
  if (!(photo instanceof File) || photo.size === 0) errorRedirect("Add a formal profile photo.");
  if (!(cv instanceof File) || cv.size === 0) errorRedirect("Add your CV as a PDF.");
  if (!['image/jpeg', 'image/png', 'image/webp'].includes(photo.type) || photo.size > 5 * 1024 * 1024) errorRedirect("Profile photo must be a JPG, PNG, or WebP under 5 MB.");
  if (cv.type !== "application/pdf" || cv.size > 10 * 1024 * 1024) errorRedirect("CV must be a PDF under 10 MB.");

  const photoPath = `${user.id}/${crypto.randomUUID()}.${photo.name.split(".").pop()?.toLowerCase() || "jpg"}`;
  const cvPath = `${user.id}/${crypto.randomUUID()}.pdf`;
  const [photoUpload, cvUpload] = await Promise.all([
    supabase.storage.from("eb-profiles").upload(photoPath, photo, { contentType: photo.type }),
    supabase.storage.from("eb-documents").upload(cvPath, cv, { contentType: cv.type }),
  ]);
  if (photoUpload.error || cvUpload.error) errorRedirect(photoUpload.error?.message || cvUpload.error?.message || "We could not upload your files. Please try again.");

  const experience = `Executive Board experience:\n${ebExperience}\n\nDelegate experience:\n${delegateExperience}`;
  const { error } = await supabase.from("eb_applications").insert({
    applicant_id: user.id,
    applicant_email: user.email,
    display_name: profile?.full_name ?? user.email,
    bio,
    experience,
    eb_experience: ebExperience,
    delegate_experience: delegateExperience,
    areas_of_expertise: areas,
    remuneration_expectations: remuneration,
    previous_conferences: String(formData.get("previous_conferences") || "").trim() || null,
    photo_path: photoPath,
    cv_path: cvPath,
    status: "approved",
  });
  if (error) errorRedirect(error.code === "23505" ? "You already have a live EB profile. Use Manage Profile to update it." : error.message);

  await Promise.allSettled([
    sendEmail({ to: user.email!, subject: "Your MUNlocked EB profile is live", text: `Hi ${profile?.full_name || "there"},\n\nYour EB profile has been submitted and is now live in the MUNlocked marketplace. Organisers can review your public record and contact you through your MUNlocked inbox.\n\nManage your profile: https://munlocked.vercel.app/hire-eb/manage` }),
    notifyAdmin("New EB profile is live", `${user.email} published an EB profile.\n\nEB experience: ${ebExperience}\nDelegate experience: ${delegateExperience}\nExpertise: ${areas.join(", ")}`),
  ]);
  revalidatePath("/");
  revalidatePath("/hire-eb");
  revalidatePath("/hire-eb/manage");
  redirect("/hire-eb/manage?published=1");
}
