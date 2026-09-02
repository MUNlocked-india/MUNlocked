"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";

type VoiceRecognition = { lang: string; interimResults: boolean; maxAlternatives: number; start: () => void; onstart: (() => void) | null; onend: (() => void) | null; onerror: (() => void) | null; onresult: ((event: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null };
type VoiceWindow = Window & typeof globalThis & { SpeechRecognition?: new () => VoiceRecognition; webkitSpeechRecognition?: new () => VoiceRecognition };

const WELCOME: UIMessage = { id: "munlocked-welcome", role: "assistant", parts: [{ type: "text", text: "I’m MUNlocked — your committee co-pilot. I can help you turn an agenda into a sharp speech, prepare POIs, choose a motion, or run a calmer dais." }] };
const SUGGESTIONS = [
  ["Build my opening", "Help me build a confident 60-second GSL. Ask for my country, committee, agenda, and position first."],
  ["Prepare POIs", "Help me prepare five substantive POIs. Ask which country I am questioning, the committee, and agenda first."],
  ["Pick a caucus", "Help me choose a moderated caucus topic that moves debate forward. Ask for the agenda and my bloc's goal first."],
  ["Chair the room", "Give me a concise chair script to move from GSL into a moderated caucus, including timing and vote wording."],
] as const;

function messageText(message: UIMessage) {
  return message.parts.filter((part) => part.type === "text").map((part) => part.text).join("");
}

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [listening, setListening] = useState(false);
  const [notice, setNotice] = useState("");
  const [showTeaser, setShowTeaser] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const transport = useMemo(() => new DefaultChatTransport({
    api: "/api/chat",
    fetch: async (input, init) => {
      const response = await fetch(input, init);
      if (!response.ok) {
        const payload = await response.clone().json().catch(() => null) as { error?: string } | null;
        throw new Error(payload?.error || "MUNlocked could not connect. Please try again.");
      }
      return response;
    },
  }), []);
  const { messages, sendMessage, setMessages, status, stop, error } = useChat({ messages: [WELCOME], transport });
  const busy = status === "submitted" || status === "streaming";

  useEffect(() => {
    const timer = window.setTimeout(() => !open && setShowTeaser(true), 1800);
    return () => window.clearTimeout(timer);
  }, [open]);

  useEffect(() => {
    requestAnimationFrame(() => scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" }));
  }, [messages, busy]);

  async function send(text: string) {
    const clean = text.trim();
    if (!clean || busy) return;
    setInput("");
    setNotice("");
    await sendMessage({ text: clean });
  }

  function listen() {
    const Recognition = (window as VoiceWindow).SpeechRecognition || (window as VoiceWindow).webkitSpeechRecognition;
    if (!Recognition) { setNotice("Voice input works in Chrome or Edge. You can still type your question."); return; }
    const recognition = new Recognition();
    recognition.lang = "en-IN";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognition.onstart = () => setListening(true);
    recognition.onend = () => setListening(false);
    recognition.onerror = () => { setListening(false); setNotice("I couldn’t hear that. Try again or type it out."); };
    recognition.onresult = (event) => setInput(event.results[0][0].transcript);
    recognition.start();
  }

  return <>
    <style>{`
      @keyframes munOrbit { to { transform: rotate(360deg); } }
      @keyframes munRise { from { opacity:0; transform:translateY(12px) scale(.97) } to { opacity:1; transform:translateY(0) scale(1) } }
      @keyframes munThinking { 0%,100% { opacity:.3; transform:translateY(0) } 50% { opacity:1; transform:translateY(-4px) } }
      .mun-chat-launch { box-shadow:0 12px 36px rgba(0,0,0,.48); } .mun-chat-launch:before { content:""; position:absolute; inset:-5px; border-radius:inherit; border:1px solid rgba(201,138,148,.45); animation:munOrbit 5s linear infinite; border-left-color:transparent; border-bottom-color:transparent; }
      .mun-chat-panel,.mun-chat-teaser { animation:munRise .34s cubic-bezier(.2,.85,.3,1) both; }
      .mun-chat-suggestion:hover { transform:translateY(-2px); border-color:rgba(201,138,148,.6)!important; color:var(--text)!important; }
      @media (max-width:620px){ .mun-chat-teaser{display:none!important} .mun-chat-launch{right:16px!important;bottom:16px!important} .mun-chat-panel{right:16px!important;bottom:82px!important} }
      @media (prefers-reduced-motion: reduce){ .mun-chat-launch:before,.mun-chat-panel,.mun-chat-teaser{animation:none!important} }
    `}</style>
    {showTeaser && !open && <div className="mun-chat-teaser" style={{ position: "fixed", right: 28, bottom: 100, maxWidth: 270, zIndex: 100, padding: "14px 16px", borderRadius: 13, background: "#101114", border: "1px solid rgba(201,138,148,.32)", boxShadow: "0 16px 45px rgba(0,0,0,.55)" }}><button onClick={() => setShowTeaser(false)} aria-label="Dismiss MUNlocked prompt" style={{ position: "absolute", top: 6, right: 9, border: 0, background: "transparent", color: "rgba(234,217,222,.48)", cursor: "pointer" }}>×</button><div className="mono" style={{ color: "var(--coral)", fontSize: 9, letterSpacing: 1.4, textTransform: "uppercase", marginBottom: 7 }}>MUNlocked is ready</div><p style={{ color: "var(--text)", fontSize: 13, lineHeight: 1.5 }}>Need a motion, a speech, or a way through committee? Ask me.</p><button onClick={() => { setOpen(true); setShowTeaser(false); }} className="mono" style={{ marginTop: 10, border: 0, borderRadius: 99, background: "var(--paper)", color: "var(--ink)", padding: "7px 11px", cursor: "pointer", fontSize: 10, fontWeight: 800, textTransform: "uppercase" }}>Open MUNlocked →</button></div>}
    <button onClick={() => { setOpen((value) => !value); setShowTeaser(false); }} aria-label="Open MUNlocked" className="mun-chat-launch" style={{ position: "fixed", right: 28, bottom: 28, zIndex: 101, height: 54, padding: open ? 0 : "0 19px 0 16px", width: open ? 54 : "auto", border: 0, borderRadius: 999, background: "linear-gradient(135deg,var(--paper),var(--coral))", color: "var(--ink)", display: "flex", gap: 8, alignItems: "center", justifyContent: "center", cursor: "pointer", fontFamily: "Courier New,monospace", fontWeight: 800, fontSize: 11, letterSpacing: .35, textTransform: "uppercase" }}><span style={{ position: "relative", fontSize: 19, lineHeight: 1 }}>{open ? "×" : "✦"}</span>{!open && "MUNlocked"}</button>
    {open && <section className="mun-chat-panel" aria-label="MUNlocked chat" style={{ position: "fixed", zIndex: 100, right: 28, bottom: 98, width: 410, maxWidth: "calc(100vw - 32px)", height: 570, maxHeight: "calc(100vh - 125px)", display: "flex", flexDirection: "column", overflow: "hidden", borderRadius: 17, background: "#101114", border: "1px solid rgba(201,138,148,.34)", boxShadow: "0 25px 70px rgba(0,0,0,.68)" }}>
      <header style={{ padding: "17px 18px 15px", background: "linear-gradient(120deg,rgba(201,138,148,.2),rgba(16,17,20,.6))", borderBottom: "1px solid rgba(234,217,222,.1)", display: "flex", gap: 11, alignItems: "center" }}><div style={{ width: 31, height: 31, borderRadius: 10, background: "var(--paper)", color: "var(--ink)", display: "grid", placeItems: "center", fontWeight: 800 }}>M</div><div><strong style={{ display: "block", color: "var(--text)", fontSize: 15 }}>MUNlocked</strong><span className="mono" style={{ fontSize: 9, color: "rgba(234,217,222,.56)", letterSpacing: 1, textTransform: "uppercase" }}>Your live MUN co-pilot</span></div><span style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 5, color: error ? "#e59aa8" : "#7FA96B", fontSize: 10 }}><i style={{ width: 7, height: 7, borderRadius: "50%", background: error ? "#e59aa8" : "#7FA96B", boxShadow: `0 0 10px ${error ? "#e59aa8" : "#7FA96B"}` }} />{error ? "Connection issue" : busy ? "Thinking" : "Ready"}</span></header>
      <div ref={scrollRef} style={{ flex: 1, overflowY: "auto", padding: "16px", display: "flex", flexDirection: "column", gap: 11 }}>
        {messages.map((message) => { const content = messageText(message); if (!content) return null; const user = message.role === "user"; return <div key={message.id} style={{ maxWidth: "88%", alignSelf: user ? "flex-end" : "flex-start", padding: "10px 12px", borderRadius: user ? "12px 12px 3px 12px" : "12px 12px 12px 3px", background: user ? "var(--paper)" : "rgba(234,217,222,.075)", color: user ? "var(--ink)" : "var(--text)", fontSize: 13, lineHeight: 1.58, whiteSpace: "pre-wrap" }}>{content}</div>; })}
        {busy && <div style={{ display: "flex", gap: 5, alignItems: "center", color: "rgba(234,217,222,.55)", fontSize: 11 }}><span style={{ animation: "munThinking .8s ease infinite" }}>●</span><span style={{ animation: "munThinking .8s .12s ease infinite" }}>●</span><span style={{ animation: "munThinking .8s .24s ease infinite" }}>●</span><span className="mono" style={{ marginLeft: 4, fontSize: 9 }}>MUNlocked is thinking</span></div>}
        {error && <div role="alert" style={{ padding: "10px 12px", borderRadius: 9, border: "1px solid rgba(229,154,168,.3)", background: "rgba(229,154,168,.08)", color: "#efb1bc", fontSize: 11, lineHeight: 1.5 }}>{error.message || "MUNlocked couldn’t respond just now. Try again in a moment."}</div>}
      </div>
      {messages.length <= 1 && <div style={{ padding: "0 16px 12px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 7 }}>{SUGGESTIONS.map(([label, prompt]) => <button key={label} disabled={busy} onClick={() => send(prompt)} className="mun-chat-suggestion" style={{ textAlign: "left", background: "rgba(234,217,222,.035)", color: "rgba(234,217,222,.72)", border: "1px solid rgba(234,217,222,.14)", borderRadius: 8, padding: "8px 9px", cursor: "pointer", fontSize: 10.5, transition: "transform .2s ease,border-color .2s ease,color .2s ease" }}>{label} <span style={{ color: "var(--coral)" }}>↗</span></button>)}</div>}
      <footer style={{ borderTop: "1px solid rgba(234,217,222,.1)", padding: 12 }}><div style={{ display: "flex", gap: 7 }}><input value={input} onChange={(event) => setInput(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter" && !event.shiftKey) { event.preventDefault(); send(input); } }} placeholder="Ask about speeches, POIs, motions…" aria-label="Message MUNlocked" style={{ flex: 1, minWidth: 0, background: "#191a1d", border: "1px solid rgba(234,217,222,.15)", color: "var(--text)", padding: "11px 12px", borderRadius: 8, fontSize: 12.5 }} /><button onClick={listen} disabled={busy || listening} aria-label="Use voice input" style={{ width: 40, border: 0, borderRadius: 8, background: listening ? "var(--coral)" : "rgba(234,217,222,.1)", color: "var(--text)", cursor: "pointer" }}>{listening ? "…" : "◉"}</button>{busy ? <button onClick={stop} className="mono" style={{ border: "1px solid rgba(234,217,222,.25)", borderRadius: 8, background: "transparent", color: "var(--text)", padding: "0 11px", cursor: "pointer", fontSize: 9 }}>Stop</button> : <button onClick={() => send(input)} className="mono" style={{ border: 0, borderRadius: 8, background: "var(--paper)", color: "var(--ink)", padding: "0 12px", cursor: "pointer", fontSize: 10, fontWeight: 800 }}>Send</button>}</div><div style={{ display: "flex", justifyContent: "space-between", paddingTop: 8 }}><span style={{ color: "rgba(234,217,222,.35)", fontSize: 9.5 }}>{notice || "Procedure varies by conference — check your RoP."}</span><button onClick={() => { stop(); setMessages([WELCOME]); setNotice(""); }} className="mono" style={{ border: 0, background: "transparent", color: "rgba(234,217,222,.43)", cursor: "pointer", fontSize: 9 }}>New chat</button></div></footer>
    </section>}
  </>;
}
