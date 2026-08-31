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

  // Seed the default grading columns so the sheet isn't empty on first load.
  // The chair can rename, remove, or add more from here.
  const DEFAULT_COLUMNS = [
    { key: "poi", label: "POI" },
    { key: "chits", label: "Chits" },
    { key: "verbal_reply", label: "Verbal Reply" },
    { key: "gsl", label: "GSL" },
    { key: "mod", label: "MOD" },
    { key: "decorum", label: "Decorum" },
    { key: "research", label: "Research" },
    { key: "documentation", label: "Documentation" },
  ];
  await supabase.from("marksheet_columns").insert(
    DEFAULT_COLUMNS.map((c, i) => ({ committee_id: data!.id, key: c.key, label: c.label, position: i }))
  );

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
