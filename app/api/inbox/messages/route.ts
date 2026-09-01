import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { sendEmail } from "@/lib/email";

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Sign in to send a message." }, { status: 401 });
  const body = await request.json().catch(() => null) as { conversationId?: string; body?: string } | null;
  const conversationId = body?.conversationId?.trim();
  const messageBody = body?.body?.trim().slice(0, 4000);
  if (!conversationId || !messageBody) return NextResponse.json({ error: "Message cannot be empty." }, { status: 400 });
  const { data: conversation } = await supabase.from("conversations").select("subject, organizer_id, organizer_email, eb_applications(applicant_email, applicant_id)").eq("id", conversationId).single();
  if (!conversation) return NextResponse.json({ error: "Conversation not found." }, { status: 404 });
  const { data: message, error } = await supabase.from("messages").insert({ conversation_id: conversationId, sender_id: user.id, body: messageBody }).select("id, sender_id, body, created_at").single();
  if (error || !message) return NextResponse.json({ error: error?.message ?? "Unable to send message." }, { status: 400 });
  const eb = Array.isArray(conversation.eb_applications) ? conversation.eb_applications[0] : conversation.eb_applications;
  const recipient = user.id === conversation.organizer_id ? eb?.applicant_email : conversation.organizer_email;
  if (recipient) await sendEmail({ to: recipient, subject: `New MUNlocked message: ${conversation.subject}`, text: "You have a new message in your MUNlocked Inbox. Sign in to read and respond." });
  return NextResponse.json({ message });
}
