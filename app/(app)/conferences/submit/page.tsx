import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { notifyAdmin } from "@/lib/email";

async function submitConference(formData: FormData) {
  "use server";
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const committees = String(formData.get("committees") || "")
    .split(",")
    .map((c) => c.trim())
    .filter(Boolean);

  const { error } = await supabase.from("conferences").insert({
    submitted_by: user!.id,
    name: String(formData.get("name")),
    secretariat: String(formData.get("secretariat")),
    contact_email: String(formData.get("contact_email")),
    format: String(formData.get("format")),
    city: String(formData.get("city") || "") || null,
    event_date: String(formData.get("event_date")),
    delegate_fee: formData.get("delegate_fee") ? Number(formData.get("delegate_fee")) : null,
    committees,
    registration_url: String(formData.get("registration_url") || "") || null,
    status: "pending",
  });

  if (error) {
    redirect(`/conferences/submit?error=${encodeURIComponent(error.message)}`);
  }

  await notifyAdmin(
    "New conference submitted for review",
    `"${formData.get("name")}" was just submitted by ${user!.email}.\n\nSecretariat: ${formData.get("secretariat")}\nFormat: ${formData.get("format")}\nDate: ${formData.get("event_date")}\n\nReview it at /admin/conferences.`
  );

  redirect("/conferences/submit?success=1");
}

export default async function SubmitConferencePage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; success?: string }>;
}) {
  const params = await searchParams;

  return (
    <div className="auth-wrap" style={{ alignItems: "flex-start", paddingTop: 60 }}>
      <form action={submitConference} className="auth-card" style={{ maxWidth: 520 }}>
        <div className="mono" style={{ fontSize: 11, letterSpacing: 2, color: "var(--coral)", marginBottom: 8, textTransform: "uppercase" }}>
          File No. IN/MUN/CONF-SUBMIT
        </div>
        <h1 style={{ fontFamily: "Georgia, serif", fontSize: 24, marginBottom: 6 }}>Submit Your Conference</h1>
        <p style={{ fontSize: 13, color: "rgba(7,7,7,0.6)", marginBottom: 20 }}>
          Every submission goes into a pending queue. An admin reviews it before it appears in the public directory.
        </p>

        {params.success && (
          <p className="success-text">Submitted — it's now pending admin review.</p>
        )}
        {params.error && <p className="error-text">Error: {params.error}</p>}

        <label htmlFor="name">Conference Name</label>
        <input id="name" name="name" type="text" required />

        <label htmlFor="secretariat">Organizing Secretariat</label>
        <input id="secretariat" name="secretariat" type="text" required placeholder="e.g. Stonehill International School MUN" />

        <label htmlFor="contact_email">Contact Email</label>
        <input id="contact_email" name="contact_email" type="email" required />

        <label htmlFor="format">Format</label>
        <select
          id="format"
          name="format"
          required
          style={{ width: "100%", padding: "12px 14px", border: "1px solid rgba(7,7,7,0.2)", borderRadius: 3, background: "rgba(255,255,255,0.5)", fontSize: 14, color: "var(--ink)", marginTop: 6, marginBottom: 16 }}
        >
          <option value="online">Online</option>
          <option value="in_person">In-Person</option>
          <option value="hybrid">Hybrid</option>
        </select>

        <label htmlFor="city">City (optional)</label>
        <input id="city" name="city" type="text" />

        <label htmlFor="event_date">Event Date</label>
        <input id="event_date" name="event_date" type="date" required />

        <label htmlFor="delegate_fee">Delegate Fee in ₹ (optional)</label>
        <input id="delegate_fee" name="delegate_fee" type="number" min="0" />

        <label htmlFor="committees">Committees (comma-separated)</label>
        <input id="committees" name="committees" type="text" placeholder="UNSC, DISEC, UNHRC" />

        <label htmlFor="registration_url">Registration Link (optional)</label>
        <input id="registration_url" name="registration_url" type="url" placeholder="https://…" />

        <button type="submit" className="submit">Submit for Review</button>
      </form>
    </div>
  );
}
