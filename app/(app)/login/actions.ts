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

  // Fire-and-forget, deliberately NOT awaited: a slow or failing Resend call
  // must never be able to block or break the actual login redirect. Errors
  // are swallowed here on purpose — this is a nice-to-have side effect, not
  // part of the auth-critical path.
  notifyAdmin("Successful login", `${email} just logged in to MUNlocked.`).catch(() => {});

  redirect("/");
}

export async function resendConfirmationAction(formData: FormData) {
  const email = String(formData.get("email"));
  const supabase = await createClient();

  const { error } = await supabase.auth.resend({ type: "signup", email });

  if (error) {
    redirect(`/login?error=${encodeURIComponent(error.message)}`);
  }
  redirect(`/login?resent=1`);
}
