import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import NewCommitteeForm from "./NewCommitteeForm";

async function createCommittee(formData: FormData) {
  "use server";
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data, error } = await supabase
    .from("committees")
    .insert({
      name: String(formData.get("name")),
      code: String(formData.get("code")),
      conference_name: String(formData.get("conference_name") || "") || null,
      created_by: user!.id,
    })
    .select("id")
    .single();

  if (error || !data) {
    redirect(`/committees/new?error=${encodeURIComponent(error?.message ?? "Could not create committee")}`);
  }

  // The creator is automatically the chair — insert their own membership row
  // so committee_members reflects them too (used for the co-chair list UI).
  await supabase.from("committee_members").insert({
    committee_id: data!.id,
    user_id: user!.id,
    email: user!.email!,
    role: "chair",
  });

  redirect(`/committees/${data!.id}`);
}

export default async function NewCommitteePage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;

  return (
    <div className="auth-wrap" style={{ alignItems: "flex-start", paddingTop: 60 }}>
      <NewCommitteeForm createCommittee={createCommittee} errorMessage={params.error} />
    </div>
  );
}
