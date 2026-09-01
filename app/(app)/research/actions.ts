"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { notifyAdmin, sendEmail } from "@/lib/email";

export async function submitResearch(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase.from("profiles").select("full_name").eq("id", user!.id).single();
  const document = formData.get("document");
  let filePath: string | null = null;
  if (document instanceof File && document.size > 0) {
    if (!['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'].includes(document.type) || document.size > 15 * 1024 * 1024) {
      redirect(`/research/submit?error=${encodeURIComponent("Upload a PDF or DOCX under 15 MB.")}`);
    }
    const extension = document.name.split(".").pop()?.toLowerCase() || "pdf";
    filePath = `${user.id}/${crypto.randomUUID()}.${extension}`;
    const { error: uploadError } = await supabase.storage.from("research-uploads").upload(filePath, document, { contentType: document.type });
    if (uploadError) redirect(`/research/submit?error=${encodeURIComponent(uploadError.message)}`);
  }

  const { error } = await supabase.from("research_papers").insert({
    submitted_by: user!.id,
    submitted_by_email: user!.email,
    author_name: profile?.full_name ?? user!.email!,
    title: String(formData.get("title")),
    committee: String(formData.get("committee")),
    document_type: String(formData.get("document_type") || "Background Guide"),
    agenda: String(formData.get("agenda")),
    summary: String(formData.get("summary")),
    full_text: String(formData.get("full_text")),
    file_path: filePath,
    status: "pending",
  });

  if (error) {
    redirect(`/research/submit?error=${encodeURIComponent(error.message)}`);
  }

  await notifyAdmin(
    "New research submitted for review",
    `"${formData.get("title")}" (${formData.get("committee")}) was just submitted by ${user!.email}.\n\nReview it at /admin/research.`
  );

  redirect("/research/submit?success=1");
}

export async function toggleUpvote(paperId: string) {
  "use server";
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: existing } = await supabase
    .from("research_upvotes")
    .select("paper_id")
    .eq("paper_id", paperId)
    .eq("user_id", user!.id)
    .maybeSingle();

  if (existing) {
    await supabase.from("research_upvotes").delete().eq("paper_id", paperId).eq("user_id", user!.id);
  } else {
    await supabase.from("research_upvotes").insert({ paper_id: paperId, user_id: user!.id });
  }

  revalidatePath("/research");
  revalidatePath(`/research/${paperId}`);
}

async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user!.id).single();
  if (profile?.role !== "admin") redirect("/dashboard");
  return { supabase, user: user! };
}

export async function reviewResearch(formData: FormData) {
  "use server";
  const { supabase, user } = await requireAdmin();

  const id = String(formData.get("id"));
  const decision = String(formData.get("decision"));

  const { data: paper } = await supabase
    .from("research_papers")
    .select("title, submitted_by_email")
    .eq("id", id)
    .single();

  await supabase.from("research_papers").update({ status: decision, reviewed_by: user.id }).eq("id", id);

  if (paper?.submitted_by_email) {
    await sendEmail({
      to: paper.submitted_by_email,
      subject:
        decision === "approved"
          ? `Your research "${paper.title}" is live on MUNlocked`
          : `Update on your MUNlocked research submission`,
      text:
        decision === "approved"
          ? `Good news — "${paper.title}" was reviewed and approved. It's now live in the Free Research Library, credited to you.`
          : `"${paper.title}" was reviewed and wasn't approved for the library at this time. You're welcome to revise and resubmit.`,
    });
  }

  revalidatePath("/admin/research");
  revalidatePath("/research");
  redirect("/admin/research");
}
