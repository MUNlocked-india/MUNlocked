import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  const body = await request.json().catch(() => null) as { conversationId?: string } | null;
  if (!body?.conversationId) return NextResponse.json({ error: "Conversation required." }, { status: 400 });
  const { data: incoming } = await supabase.from("messages").select("id").eq("conversation_id", body.conversationId).neq("sender_id", user.id).limit(200);
  if (incoming?.length) await supabase.from("message_reads").upsert(incoming.map((message) => ({ message_id: message.id, reader_id: user.id })), { onConflict: "message_id,reader_id", ignoreDuplicates: true });
  return NextResponse.json({ ok: true });
}
