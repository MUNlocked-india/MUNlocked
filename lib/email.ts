// Server-only. Never import this from a Client Component — RESEND_API_KEY
// must stay off the browser bundle entirely.

import { ADMIN_EMAIL } from "./constants";

const FROM_ADDRESS = "MUNlocked <onboarding@resend.dev>";

export async function sendEmail({
  to,
  subject,
  text,
}: {
  to: string;
  subject: string;
  text: string;
}) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.warn("RESEND_API_KEY not set — skipping email send:", subject, "to", to);
    return { skipped: true };
  }

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      // reply_to points real replies at the official MUNlocked inbox even
      // though the send-from address has to stay on Resend's shared domain
      // until a real MUNlocked domain is verified (see README).
      body: JSON.stringify({ from: FROM_ADDRESS, to, subject, text, reply_to: ADMIN_EMAIL }),
    });
    if (!res.ok) {
      console.error("Resend send failed:", await res.text());
      return { skipped: false, ok: false };
    }
    return { skipped: false, ok: true };
  } catch (err) {
    console.error("Resend send threw:", err);
    return { skipped: false, ok: false };
  }
}

// Convenience wrapper for the "every update lands in the admin inbox" pattern
// — new conference submitted, new EB application, successful logins, etc.
export async function notifyAdmin(subject: string, text: string) {
  return sendEmail({ to: ADMIN_EMAIL, subject: `[MUNlocked] ${subject}`, text });
}
