import Link from "next/link";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { sendEmail } from "@/lib/email";

async function reply(conversationId: string, formData: FormData) {
  "use server";
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const body = String(formData.get("body") || "").trim();
  if (!body) return;
  const { data: conversation } = await supabase.from("conversations").select("subject, organizer_id, eb_application_id, eb_applications(applicant_email, applicant_id)").eq("id", conversationId).single();
  const { error } = await supabase.from("messages").insert({ conversation_id: conversationId, sender_id: user.id, body });
  if (!error && conversation) {
    const eb = Array.isArray(conversation.eb_applications) ? conversation.eb_applications[0] : conversation.eb_applications;
    const target = user.id === conversation.organizer_id ? eb?.applicant_email : null;
    if (target) await sendEmail({ to: target, subject: `New reply: ${conversation.subject}`, text: "You have a new reply in your MUNlocked Inbox." });
  }
  revalidatePath(`/inbox/${conversationId}`);
}

export default async function ThreadPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const { data: conversation } = await supabase.from("conversations").select("id, subject, created_at").eq("id", id).single();
  if (!conversation) redirect("/inbox");
  const { data: messages } = await supabase.from("messages").select("id, sender_id, body, created_at").eq("conversation_id", id).order("created_at");
  const boundReply = reply.bind(null, id);
  return <div style={{ minHeight:"100vh", padding:"52px 24px" }}><div style={{ maxWidth:760, margin:"0 auto" }}><Link href="/inbox" className="mono" style={{ fontSize:11, color:"var(--coral)" }}>← BACK TO INBOX</Link><h1 style={{ fontFamily:"Georgia,serif", fontSize:30, margin:"18px 0 22px" }}>{conversation.subject}</h1><div style={{ display:"flex", flexDirection:"column", gap:10, marginBottom:22 }}>{messages?.map(m => <div key={m.id} style={{ alignSelf:m.sender_id===user.id?"flex-end":"flex-start", maxWidth:"82%", padding:"12px 14px", background:m.sender_id===user.id?"var(--paper)":"#151515", color:m.sender_id===user.id?"var(--ink)":"var(--text)", borderRadius:10, lineHeight:1.55 }}>{m.body}<div className="mono" style={{ marginTop:7, fontSize:9, opacity:.5 }}>{new Date(m.created_at).toLocaleString()}</div></div>)}</div><form action={boundReply} style={{ display:"flex", gap:10 }}><textarea name="body" required rows={3} placeholder="Write a reply…" style={{ flex:1, padding:12, borderRadius:8, resize:"vertical" }}/><button className="submit" style={{ width:"auto", padding:"0 18px" }}>Reply</button></form></div></div>;
}
