"use client";

import { useRef, useState } from "react";

type Msg = { role: "user" | "assistant"; content: string };

const SUGGESTIONS = [
  "How do I raise a Point of Inquiry?",
  "How do I write a good speech for GSL?",
  "What's the difference between a moderated and unmoderated caucus?",
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
  const scrollRef = useRef<HTMLDivElement>(null);

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

  return (
    <>
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label="Open MUNlocked Assistant"
        style={{
          position: "fixed",
          bottom: 28,
          right: 28,
          width: 58,
          height: 58,
          borderRadius: "50%",
          background: "var(--paper)",
          color: "var(--ink)",
          border: "none",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          boxShadow: "0 10px 30px rgba(0,0,0,0.5)",
          zIndex: 100,
        }}
      >
        <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" strokeWidth="1.6">
          <path d="M21 12c0 4.4-4 8-9 8-1.2 0-2.4-.2-3.4-.6L3 21l1.7-4.4C3.6 15.2 3 13.7 3 12c0-4.4 4-8 9-8s9 3.6 9 8z" />
          <circle cx="8.5" cy="12" r="1" />
          <circle cx="12" cy="12" r="1" />
          <circle cx="15.5" cy="12" r="1" />
        </svg>
      </button>

      {open && (
        <div
          style={{
            position: "fixed",
            bottom: 98,
            right: 28,
            width: 360,
            maxWidth: "calc(100vw - 40px)",
            height: 480,
            maxHeight: "calc(100vh - 150px)",
            background: "#0F0F10",
            border: "1px solid rgba(234,217,222,0.15)",
            borderRadius: 10,
            boxShadow: "0 20px 60px rgba(0,0,0,0.6)",
            zIndex: 100,
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
          }}
        >
          <div style={{ background: "var(--ink)", borderBottom: "1px solid rgba(234,217,222,0.1)", padding: "14px 18px", display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--coral)", flexShrink: 0 }} />
            <div className="mono">
              <b style={{ display: "block", fontSize: 13, color: "var(--text)" }}>MUNlocked Assistant</b>
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
