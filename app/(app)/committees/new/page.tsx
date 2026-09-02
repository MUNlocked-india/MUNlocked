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

  const { data: committeeId, error } = await supabase.rpc("create_committee_with_defaults", {
    p_name: String(formData.get("name") || ""),
    p_code: String(formData.get("code") || ""),
    p_conference_name: String(formData.get("conference_name") || "") || null,
    p_use_default: Boolean(formData.get("sis_marksheet")),
  });

  if (error || !committeeId) {
    redirect(`/committees/new?error=${encodeURIComponent(error?.message ?? "Could not create committee")}`);
  }
  redirect(`/committees/${committeeId}`);
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
