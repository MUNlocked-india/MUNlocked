"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { COUNTRY_BUNDLES } from "@/lib/countryBundles";

async function requireUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  return { supabase, user: user! };
}

export async function inviteCoChair(committeeId: string, formData: FormData) {
  const { supabase } = await requireUser();
  const email = String(formData.get("email") || "").trim().toLowerCase();
  if (!email) return;

  await supabase.from("committee_members").insert({
    committee_id: committeeId,
    email,
    role: "co_chair",
  });

  revalidatePath(`/committees/${committeeId}`);
}

export async function addDelegate(committeeId: string, formData: FormData) {
  const { supabase } = await requireUser();
  const country = String(formData.get("country") || "").trim();
  if (!country) return;

  const { data: delegate } = await supabase
    .from("delegates")
    .insert({ committee_id: committeeId, country })
    .select("id")
    .single();

  if (delegate) {
    await supabase.from("marks").insert({ delegate_id: delegate.id });
  }

  revalidatePath(`/committees/${committeeId}`);
}

export async function addBundle(committeeId: string, formData: FormData) {
  const { supabase } = await requireUser();
  const bundleName = String(formData.get("bundle") || "");
  const countries = COUNTRY_BUNDLES[bundleName];
  if (!countries) return;

  const { data: existing } = await supabase
    .from("delegates")
    .select("country")
    .eq("committee_id", committeeId);
  const existingSet = new Set((existing ?? []).map((d) => d.country));
  const toInsert = countries.filter((c) => !existingSet.has(c));

  if (toInsert.length > 0) {
    const { data: inserted } = await supabase
      .from("delegates")
      .insert(toInsert.map((country) => ({ committee_id: committeeId, country })))
      .select("id");

    if (inserted) {
      await supabase.from("marks").insert(inserted.map((d) => ({ delegate_id: d.id })));
    }
  }

  revalidatePath(`/committees/${committeeId}`);
}

export async function removeDelegate(committeeId: string, formData: FormData) {
  const { supabase } = await requireUser();
  const delegateId = String(formData.get("delegate_id"));
  await supabase.from("delegates").delete().eq("id", delegateId);
  revalidatePath(`/committees/${committeeId}`);
}

function slugify(label: string) {
  const base = label.trim().toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "");
  return `${base || "col"}_${Math.random().toString(36).slice(2, 6)}`;
}

export async function addColumn(committeeId: string, formData: FormData) {
  const { supabase } = await requireUser();
  const label = String(formData.get("label") || "").trim();
  if (!label) return;

  const { data: existingCols } = await supabase
    .from("marksheet_columns")
    .select("position")
    .eq("committee_id", committeeId)
    .order("position", { ascending: false })
    .limit(1);
  const nextPos = (existingCols?.[0]?.position ?? -1) + 1;

  await supabase.from("marksheet_columns").insert({
    committee_id: committeeId,
    key: slugify(label),
    label,
    position: nextPos,
  });

  revalidatePath(`/committees/${committeeId}`);
}

export async function renameColumn(committeeId: string, formData: FormData) {
  const { supabase } = await requireUser();
  const columnId = String(formData.get("column_id"));
  const label = String(formData.get("label") || "").trim();
  if (!label) return;

  await supabase.from("marksheet_columns").update({ label }).eq("id", columnId);
  revalidatePath(`/committees/${committeeId}`);
}

export async function removeColumn(committeeId: string, formData: FormData) {
  const { supabase } = await requireUser();
  const columnId = String(formData.get("column_id"));
  await supabase.from("marksheet_columns").delete().eq("id", columnId);
  revalidatePath(`/committees/${committeeId}`);
}

export async function updateMarks(committeeId: string, columnKeys: string[], formData: FormData) {
  const { supabase, user } = await requireUser();
  const delegateId = String(formData.get("delegate_id"));

  const scores: Record<string, number> = {};
  for (const key of columnKeys) {
    const raw = formData.get(`col_${key}`);
    scores[key] = raw ? Math.max(0, Number(raw)) : 0;
  }

  await supabase
    .from("marks")
    .update({
      custom_scores: scores,
      notes: String(formData.get("notes") || ""),
      award: String(formData.get("award") || ""),
      updated_by: user.id,
      updated_at: new Date().toISOString(),
    })
    .eq("delegate_id", delegateId);

  revalidatePath(`/committees/${committeeId}`);
}
