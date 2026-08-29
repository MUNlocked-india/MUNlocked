"use client";

import { useEffect, useRef, useState } from "react";

type Msg = { role: "user" | "assistant"; content: string };

const SUGGESTIONS = [
  "How do I raise a Point of Inquiry?",
  "How do I write a good speech for GSL?",
  "What's the difference between a moderated and unmoderated caucus?",
];

const TEASER_LINES = [
  "How do I raise a Point of Inquiry?",
  "Help me structure a GSL speech.",
  "What's a moderated caucus?",
  "Explain a Point of Order.",
];

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([
    {
      role: "assistant",
      content:
        "Hi, I'm the MUNlocked Assistant. Ask me about points and motions, how to write a POI, speech structure, or anything about committee procedure.",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [showTeaser, setShowTeaser] = useState(false);
  const [teaserIndex, setTeaserIndex] = useState(0);
  const [teaserDismissed, setTeaserDismissed] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Animated intro: the teaser bubble appears a couple seconds after load,
  // then cycles through a few example questions on a timer — a lightweight
  // "motion graphic" that shows what the assistant is for without forcing
  // the user to open it first.
  useEffect(() => {
    const showTimer = setTimeout(() => setShowTeaser(true), 1800);
    return () => clearTimeout(showTimer);
  }, []);

  useEffect(() => {
    if (!showTeaser || teaserDismissed) return;
    const cycle = setInterval(() => {
      setTeaserIndex((i) => (i + 1) % TEASER_LINES.length);
    }, 3200);
    const autoHide = setTimeout(() => setShowTeaser(false), 16000);
    return () => {
      clearInterval(cycle);
      clearTimeout(autoHide);
    };
  }, [showTeaser, teaserDismissed]);

  function scrollToBottom() {
    requestAnimationFrame(() => {
      scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
    });
  }

  async function send(text: string) {
    if (!text.trim() || loading) return;
    const next: Msg[] = [...messages, { role: "user", content: text }];
    setMessages(next);
    setInput("");
    setLoading(true);
    scrollToBottom();

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: next }),
      });
      const data = await res.json();
      const reply: string = res.ok
        ? data.reply
        : "I couldn't reach the assistant right now. Please try again in a moment.";
      setMessages((m) => [...m, { role: "assistant", content: reply }]);
    } catch {
      setMessages((m) => [
        ...m,
        { role: "assistant", content: "I couldn't reach the assistant right now. Please try again in a moment." },
      ]);
    } finally {
      setLoading(false);
      scrollToBottom();
    }
  }

  function openChat() {
    setOpen(true);
    setShowTeaser(false);
    setTeaserDismissed(true);
  }

  return (
    <>
      <style>{`
        @keyframes munlocked-pulse-ring {
          0% { box-shadow: 0 0 0 0 rgba(201,138,148,0.55), 0 10px 30px rgba(0,0,0,0.5); }
          70% { box-shadow: 0 0 0 16px rgba(201,138,148,0), 0 10px 30px rgba(0,0,0,0.5); }
          100% { box-shadow: 0 0 0 0 rgba(201,138,148,0), 0 10px 30px rgba(0,0,0,0.5); }
        }
        @keyframes munlocked-teaser-in {
          from { opacity: 0; transform: translateY(8px) scale(0.97); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes munlocked-line-fade {
          0%, 100% { opacity: 0; transform: translateY(4px); }
          8%, 88% { opacity: 1; transform: translateY(0); }
        }
        .munlocked-chat-btn { animation: munlocked-pulse-ring 2.6s ease-out infinite; }
        .munlocked-teaser { animation: munlocked-teaser-in 0.4s ease forwards; }
        .munlocked-teaser-line { animation: munlocked-line-fade 3.2s ease forwards; }
      `}</style>

      {showTeaser && !open && (
        <div
          className="munlocked-teaser"
          style={{
            position: "fixed",
            bottom: 100,
            right: 28,
            zIndex: 99,
            maxWidth: 260,
            background: "#0F0F10",
            border: "1px solid rgba(201,138,148,0.35)",
            borderRadius: 12,
            padding: "14px 16px",
            boxShadow: "0 14px 40px rgba(0,0,0,0.55)",
          }}
        >
          <button
            onClick={() => { setShowTeaser(false); setTeaserDismissed(true); }}
            aria-label="Dismiss"
            style={{ position: "absolute", top: 8, right: 10, background: "none", border: "none", color: "rgba(234,217,222,0.4)", fontSize: 13, cursor: "pointer" }}
          >
            ✕
          </button>
          <div className="mono" style={{ fontSize: 9.5, letterSpacing: 1, textTransform: "uppercase", color: "var(--coral)", marginBottom: 8 }}>
            MUNlocked Assistant
          </div>
          <div key={teaserIndex} className="munlocked-teaser-line" style={{ fontSize: 13, color: "var(--text)", lineHeight: 1.5, minHeight: 36 }}>
            &ldquo;{TEASER_LINES[teaserIndex]}&rdquo;
          </div>
          <button
            onClick={openChat}
            className="mono"
            style={{ marginTop: 10, background: "var(--paper)", color: "var(--ink)", border: "none", padding: "7px 12px", borderRadius: 20, fontSize: 10.5, fontWeight: 700, textTransform: "uppercase", cursor: "pointer" }}
          >
            Ask me anything →
          </button>
        </div>
      )}

      <button
        onClick={() => (open ? setOpen(false) : openChat())}
        aria-label="Open MUNlocked Assistant"
        className={!open ? "munlocked-chat-btn" : ""}
        style={{
          position: "fixed",
          bottom: 28,
          right: 28,
          height: 54,
          padding: open ? 0 : "0 20px 0 16px",
          width: open ? 54 : "auto",
          borderRadius: 999,
          background: "linear-gradient(135deg, var(--paper), var(--coral))",
          color: "var(--ink)",
          border: "none",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 8,
          cursor: "pointer",
          boxShadow: "0 10px 30px rgba(0,0,0,0.5)",
          zIndex: 100,
          fontWeight: 700,
          fontFamily: "IBM Plex Mono, monospace",
          fontSize: 12,
          textTransform: "uppercase",
          letterSpacing: 0.5,
        }}
      >
        <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8">
          <path d="M21 12c0 4.4-4 8-9 8-1.2 0-2.4-.2-3.4-.6L3 21l1.7-4.4C3.6 15.2 3 13.7 3 12c0-4.4 4-8 9-8s9 3.6 9 8z" />
          <circle cx="8.5" cy="12" r="1" />
          <circle cx="12" cy="12" r="1" />
          <circle cx="15.5" cy="12" r="1" />
        </svg>
        {!open && "Ask MUNlocked"}
      </button>

      {open && (
        <div
          style={{
            position: "fixed",
            bottom: 98,
            right: 28,
            width: 370,
            maxWidth: "calc(100vw - 40px)",
            height: 500,
            maxHeight: "calc(100vh - 150px)",
            background: "#0F0F10",
            border: "1px solid rgba(201,138,148,0.3)",
            borderRadius: 12,
            boxShadow: "0 20px 60px rgba(0,0,0,0.65)",
            zIndex: 100,
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
          }}
        >
          <div style={{ background: "linear-gradient(135deg, rgba(201,138,148,0.16), var(--ink))", borderBottom: "1px solid rgba(234,217,222,0.1)", padding: "16px 18px", display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--coral)", flexShrink: 0, boxShadow: "0 0 8px var(--coral)" }} />
            <div className="mono">
              <b style={{ display: "block", fontSize: 13.5, color: "var(--text)" }}>MUNlocked Assistant</b>
              <span style={{ fontSize: 10, color: "rgba(234,217,222,0.5)", textTransform: "uppercase", letterSpacing: 1 }}>
                Procedure &amp; MUN Basics
              </span>
            </div>
            <button
              onClick={() => setOpen(false)}
              style={{ marginLeft: "auto", background: "none", border: "none", color: "rgba(234,217,222,0.5)", fontSize: 18, cursor: "pointer" }}
            >
              ✕
            </button>
          </div>

          <div ref={scrollRef} style={{ flex: 1, overflowY: "auto", padding: "16px 16px 6px", display: "flex", flexDirection: "column", gap: 12 }}>
            {messages.map((m, i) => (
              <div
                key={i}
                style={{
                  maxWidth: "85%",
                  fontSize: 13,
                  lineHeight: 1.55,
                  padding: "10px 13px",
                  borderRadius: 10,
                  whiteSpace: "pre-wrap",
                  alignSelf: m.role === "user" ? "flex-end" : "flex-start",
                  background: m.role === "user" ? "var(--paper)" : "rgba(234,217,222,0.08)",
                  color: m.role === "user" ? "var(--ink)" : "var(--text)",
                  borderBottomRightRadius: m.role === "user" ? 2 : 10,
                  borderBottomLeftRadius: m.role === "user" ? 10 : 2,
                }}
              >
                {m.content}
              </div>
            ))}
            {loading && (
              <div className="mono" style={{ fontSize: 11, color: "rgba(234,217,222,0.4)" }}>
                Thinking…
              </div>
            )}
          </div>

          {messages.length === 1 && (
            <div style={{ display: "flex", gap: 6, padding: "0 16px 10px", flexWrap: "wrap" }}>
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => send(s)}
                  className="mono"
                  style={{
                    background: "none",
                    border: "1px solid rgba(234,217,222,0.2)",
                    color: "rgba(234,217,222,0.7)",
                    fontSize: 10,
                    padding: "6px 10px",
                    borderRadius: 20,
                    cursor: "pointer",
                  }}
                >
                  {s}
                </button>
              ))}
            </div>
          )}

          <div style={{ borderTop: "1px solid rgba(234,217,222,0.1)", padding: 12, display: "flex", gap: 8 }}>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && send(input)}
              placeholder="Ask about POIs, motions, speeches…"
              style={{
                flex: 1,
                background: "#1A1A1B",
                border: "1px solid rgba(234,217,222,0.15)",
                color: "var(--text)",
                padding: "10px 12px",
                borderRadius: 6,
                fontSize: 13,
              }}
            />
            <button
              onClick={() => send(input)}
              disabled={loading}
              className="mono"
              style={{
                background: "var(--paper)",
                color: "var(--ink)",
                border: "none",
                padding: "0 16px",
                borderRadius: 6,
                fontSize: 11,
                fontWeight: 600,
                textTransform: "uppercase",
                cursor: "pointer",
              }}
            >
              Send
            </button>
          </div>
        </div>
      )}
    </>
  );
}
