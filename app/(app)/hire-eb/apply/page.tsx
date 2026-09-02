import { redirect } from "next/navigation";
import EbProfileForm from "@/components/EbProfileForm";
import { createClient } from "@/lib/supabase/server";

export default async function ApplyEbPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const [params, supabase] = await Promise.all([searchParams, createClient()]);
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/hire-eb/apply");

  const { data: existingProfile } = await supabase
    .from("eb_applications")
    .select("id")
    .eq("applicant_id", user.id)
    .eq("status", "approved")
    .is("removed_at", null)
    .maybeSingle();
  if (existingProfile) redirect("/hire-eb/manage");

  return (
    <main className="eb-profile-page">
      <EbProfileForm error={params.error} />
    </main>
  );
}
