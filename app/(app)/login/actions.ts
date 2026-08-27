"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { notifyAdmin } from "@/lib/email";

export async function loginAction(formData: FormData) {
  const email = String(formData.get("email"));
  const password = String(formData.get("password"));

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    redirect(`/login?error=${encodeURIComponent(error.message)}`);
  }

  // Fire-and-forget-ish: awaited so the request stays server-side and the
  // Resend API key never reaches the browser, but this shouldn't be relied
  // on to block navigation if the email provider is slow — Resend requests
  // are quick, so this stays inline for now rather than adding a queue.
  await notifyAdmin("Successful login", `${email} just logged in to MUNlocked.`);

  redirect("/dashboard");
}
