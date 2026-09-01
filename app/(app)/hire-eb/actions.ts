"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function rateEb(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const ebApplicationId = String(formData.get("eb_application_id") || "");
  const rating = Number(formData.get("rating"));
  if (!ebApplicationId || !Number.isInteger(rating) || rating < 1 || rating > 5) return;

  await supabase.from("eb_reviews").upsert(
    { eb_application_id: ebApplicationId, reviewer_id: user.id, rating, updated_at: new Date().toISOString() },
    { onConflict: "eb_application_id,reviewer_id" }
  );
  revalidatePath("/hire-eb");
}
