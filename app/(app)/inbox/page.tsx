import Link from "next/link";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { sendEmail } from "@/lib/email";
import InquiryTemplates from "@/components/InquiryTemplates";

async function sendMessage(formData: FormData) {
  "use server";
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const ebId = String(formData.get("eb_id"));
  const subject = String(formData.get("subject")).trim();
  const body = String(formData.get("body")).trim();
  if (!ebId || subject.length < 3 || !body) redirect("/inbox?error=Add+a+subject+and+message.");
  const { data: conversation, error } = await supabase.from("conversations")
    .upsert({ organizer_id: user.id, organizer_email: user.email, eb_application_id: ebId, subject }, { onConflict: "organizer_id,eb_application_id,subject" })
    .select("id").single();
  if (error || !conversation) redirect(`/inbox?error=${encodeURIComponent(error?.message || "Unable to start conversation.")}`);
  await supabase.from("messages").insert({ conversation_id: conversation.id, sender_id: user.id, body });
  const { data: eb } = await supabase.from("eb_applications").select("applicant_email").eq("id", ebId).single();
  if (eb?.applicant_email) await sendEmail({ to: eb.applicant_email, subject: `New MUNlocked inquiry: ${subject}`, text: `You have a new inquiry in your MUNlocked Inbox. Sign in to reply.` });
  revalidatePath("/inbox");
  redirect("/inbox?sent=1");
}

export default async function InboxPage({ searchParams }: { searchParams: Promise<{ eb?: string; sent?: string; error?: string }> }) {
  const params = await searchParams;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const { data: conversations } = await supabase.from("conversations").select("id, subject, created_at, eb_application_id").order("created_at", { ascending: false });
  const conversationIds = (conversations ?? []).map((conversation) => conversation.id);
  const { data: messageRows } = conversationIds.length
    ? await supabase.from("messages").select("id, conversation_id, sender_id").in("conversation_id", conversationIds)
    : { data: [] as { id: string; conversation_id: string; sender_id: string }[] };
  const messageIds = messageRows?.map((message) => message.id) ?? [];
  const { data: readRows } = messageIds.length
    ? await supabase.from("message_reads").select("message_id").eq("reader_id", user.id).in("message_id", messageIds)
    : { data: [] as { message_id: string }[] };
  const readMessageIds = new Set((readRows ?? []).map((read) => read.message_id));
  const unreadByConversation = new Map<string, number>();
  messageRows?.forEach((message) => {
    if (message.sender_id !== user.id && !readMessageIds.has(message.id)) {
      unreadByConversation.set(message.conversation_id, (unreadByConversation.get(message.conversation_id) ?? 0) + 1);
    }
  });
  const { data: selectedEb } = params.eb ? await supabase.from("eb_applications").select("id, applicant_email, bio").eq("id", params.eb).eq("status", "approved").maybeSingle() : { data: null };
  return <div style={{ minHeight: "100vh", padding: "56px 24px" }}><div style={{ maxWidth: 900, margin: "0 auto" }}>
    <div className="mono" style={{ fontSize: 11, letterSpacing: 2, color: "var(--coral)", textTransform: "uppercase", marginBottom: 10 }}>MUNlocked · Inbox</div>
    <h1 style={{ fontFamily: "Georgia, serif", fontSize: 32, marginBottom: 8 }}>Your EB conversations</h1>
    <p style={{ color: "rgba(234,217,222,0.62)", marginBottom: 28 }}>Keep conference hiring conversations inside MUNlocked. Both sides receive an email alert when a new message arrives.</p>
    {params.sent && <p className="success-text">Message sent — the EB has been notified by email.</p>}{params.error && <p className="error-text">{params.error}</p>}
    {selectedEb && <form action={sendMessage} className="auth-card" style={{ maxWidth: 620, marginBottom: 30 }}><input type="hidden" name="eb_id" value={selectedEb.id}/><h2 style={{ fontFamily: "Georgia, serif", fontSize: 21, marginBottom: 8 }}>Contact {selectedEb.applicant_email}</h2><p style={{ fontSize: 13, color: "rgba(7,7,7,.65)", marginBottom: 18 }}>{selectedEb.bio}</p><InquiryTemplates /><label htmlFor="subject">Conference / appointment subject</label><input id="subject" name="subject" required placeholder="e.g. Chair invitation for AcmeMUN 2026"/><label htmlFor="body">Your message</label><textarea id="body" name="body" required rows={7} style={{ width:"100%", padding:12, marginTop:6, marginBottom:16, resize:"vertical" }} placeholder="Introduce your conference, committee, dates, role, and next steps."/><button className="submit">Send via MUNlocked</button></form>}
    <div style={{ display:"grid", gap:10 }}>{conversations?.length ? conversations.map(c => { const unread = unreadByConversation.get(c.id) ?? 0; return <Link href={`/inbox/${c.id}`} key={c.id} style={{ border:"1px solid rgba(234,217,222,.14)", padding:16, borderRadius:8, textDecoration:"none", display:"flex", justifyContent:"space-between", gap:14, alignItems:"center" }}><div><b>{c.subject}</b><div className="mono" style={{ fontSize:11, opacity:.55, marginTop:6 }}>Conversation active · {new Date(c.created_at).toLocaleDateString()}</div></div>{unread > 0 && <span className="mono" style={{ minWidth:22, height:22, display:"inline-flex", alignItems:"center", justifyContent:"center", borderRadius:99, background:"var(--coral)", color:"var(--ink)", fontSize:10, fontWeight:700 }}>{unread}</span>}</Link>}) : <p style={{ opacity:.65 }}>No conversations yet. <Link href="/hire-eb">Browse verified EBs →</Link></p>}</div>
  </div></div>;
}
