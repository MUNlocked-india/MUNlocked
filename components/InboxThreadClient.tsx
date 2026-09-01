"use client";

import { useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Message = { id: string; sender_id: string; body: string; created_at: string };

export default function InboxThreadClient({ conversationId, userId, title, participant, initialMessages }: { conversationId: string; userId: string; title: string; participant: string; initialMessages: Message[] }) {
  const [messages, setMessages] = useState(initialMessages);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const endRef = useRef<HTMLDivElement>(null);
  const addMessage = (message: Message) => setMessages((current) => current.some((item) => item.id === message.id) ? current : [...current, message]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
    fetch("/api/inbox/read", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ conversationId }) }).catch(() => undefined);
  }, [conversationId, messages.length]);

  useEffect(() => {
    const supabase = createClient();
    const channel = supabase.channel(`munlocked-inbox-${conversationId}`).on("postgres_changes", { event: "INSERT", schema: "public", table: "messages", filter: `conversation_id=eq.${conversationId}` }, (payload) => addMessage(payload.new as Message)).subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [conversationId]);

  async function send() {
    const body = draft.trim(); if (!body || sending) return;
    setSending(true); setError("");
    try {
      const response = await fetch("/api/inbox/messages", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ conversationId, body }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Message failed to send.");
      addMessage(data.message as Message); setDraft("");
    } catch (sendError) { setError(sendError instanceof Error ? sendError.message : "Message failed to send."); }
    finally { setSending(false); }
  }

  return <div style={{ minHeight: "100vh", padding: "28px 18px 72px" }}><div style={{ maxWidth: 840, margin: "0 auto", border: "1px solid rgba(234,217,222,.14)", borderRadius: 16, background: "#101011", overflow: "hidden", boxShadow: "0 18px 55px rgba(0,0,0,.28)" }}>
    <header style={{ padding: "16px 20px", borderBottom: "1px solid rgba(234,217,222,.12)", display: "flex", alignItems: "center", gap: 12, background: "linear-gradient(90deg, rgba(201,138,148,.15), transparent)" }}><div style={{ width: 40, height: 40, borderRadius: "50%", display: "grid", placeItems: "center", background: "linear-gradient(135deg,var(--mauve),var(--coral))", color: "var(--ink)", fontFamily: "Georgia,serif", fontSize: 17 }}>{participant[0]?.toUpperCase() ?? "M"}</div><div><div className="mono" style={{ fontSize: 10, color: "var(--coral)", letterSpacing: 1, textTransform: "uppercase" }}>MUNlocked inquiry · live</div><h1 style={{ margin: "3px 0 0", fontFamily: "Georgia,serif", fontSize: 20 }}>{title}</h1></div><span className="mono" style={{ marginLeft: "auto", fontSize: 10, color: "rgba(234,217,222,.5)" }}>{participant}</span></header>
    <main aria-live="polite" style={{ height: "min(62vh, 560px)", overflowY: "auto", padding: "20px", display: "flex", flexDirection: "column", gap: 11, background: "radial-gradient(circle at 50% 0, rgba(201,138,148,.08), transparent 36%)" }}><div className="mono" style={{ alignSelf: "center", fontSize: 10, color: "rgba(234,217,222,.42)", background: "rgba(234,217,222,.06)", padding: "5px 9px", borderRadius: 99 }}>Messages stay on MUNlocked</div>{messages.map((message, index) => { const mine = message.sender_id === userId; const lastMine = mine && !messages.slice(index + 1).some((item) => item.sender_id === userId); return <div key={message.id} style={{ alignSelf: mine ? "flex-end" : "flex-start", maxWidth: "78%" }}><div style={{ padding: "11px 13px", borderRadius: mine ? "14px 14px 3px 14px" : "14px 14px 14px 3px", background: mine ? "var(--paper)" : "#202023", color: mine ? "var(--ink)" : "var(--text)", lineHeight: 1.55, whiteSpace: "pre-wrap", fontSize: 14 }}>{message.body}</div><div className="mono" style={{ marginTop: 4, fontSize: 9, opacity: .5, textAlign: mine ? "right" : "left" }}>{new Date(message.created_at).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "numeric", minute: "2-digit" })}{lastMine ? " · sent" : ""}</div></div>; })}<div ref={endRef} /></main>
    <footer style={{ borderTop: "1px solid rgba(234,217,222,.12)", padding: 12 }}>{error && <p className="mono" style={{ color: "#e59aa8", fontSize: 10, margin: "0 0 8px" }}>{error}</p>}<div style={{ display: "flex", gap: 9, alignItems: "flex-end" }}><textarea value={draft} onChange={(event) => setDraft(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter" && !event.shiftKey) { event.preventDefault(); send(); } }} rows={1} placeholder="Message…" style={{ flex: 1, minHeight: 44, maxHeight: 132, resize: "vertical", padding: "12px 13px", borderRadius: 10, border: "1px solid rgba(234,217,222,.16)", background: "#19191b", color: "var(--text)", fontSize: 14 }} /><button type="button" onClick={send} disabled={!draft.trim() || sending} className="mono" style={{ height: 44, border: "none", borderRadius: 10, padding: "0 16px", background: "var(--paper)", color: "var(--ink)", fontWeight: 700, fontSize: 11, textTransform: "uppercase", cursor: "pointer", opacity: !draft.trim() || sending ? .55 : 1 }}>{sending ? "Sending…" : "Send"}</button></div><p className="mono" style={{ fontSize: 9, color: "rgba(234,217,222,.38)", margin: "8px 2px 0" }}>Press Enter to send · Shift + Enter for a new line</p></footer>
  </div></div>;
}
