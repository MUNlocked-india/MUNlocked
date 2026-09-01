import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import InboxThreadClient from "@/components/InboxThreadClient";

export default async function ThreadPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const { data: conversation } = await supabase.from("conversations").select("id, subject, organizer_id, organizer_email, eb_applications(display_name, applicant_email, applicant_id)").eq("id", id).single();
  if (!conversation) redirect("/inbox");
  const { data: messages } = await supabase.from("messages").select("id, sender_id, body, created_at").eq("conversation_id", id).order("created_at");
  const eb = Array.isArray(conversation.eb_applications) ? conversation.eb_applications[0] : conversation.eb_applications;
  const participant = user.id === conversation.organizer_id ? (eb?.display_name ?? eb?.applicant_email ?? "Executive Board") : (conversation.organizer_email ?? "Conference organiser");
  return <><div style={{ maxWidth: 840, margin: "24px auto 0", padding: "0 18px" }}><Link href="/inbox" className="mono" style={{ fontSize: 11, color: "var(--coral)", textDecoration: "none" }}>← ALL CONVERSATIONS</Link></div><InboxThreadClient conversationId={id} userId={user.id} title={conversation.subject} participant={participant} initialMessages={messages ?? []} /></>;
}
