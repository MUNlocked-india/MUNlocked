"use client";

import { useEffect, useRef, useState } from "react";

const DEFAULT_SECONDS = 90;

export default function SpeechTimer() {
  const [open, setOpen] = useState(false);
  const [duration, setDuration] = useState(DEFAULT_SECONDS);
  const [remaining, setRemaining] = useState(DEFAULT_SECONDS);
  const [running, setRunning] = useState(false);
  const [buzzing, setBuzzing] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!running) return;
    intervalRef.current = setInterval(() => {
      setRemaining((r) => {
        if (r <= 1) {
          clearInterval(intervalRef.current!);
          setRunning(false);
          setBuzzing(true);
          playBeep();
          setTimeout(() => setBuzzing(false), 3000);
          return 0;
        }
        return r - 1;
      });
    }, 1000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [running]);

  function playBeep() {
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "square";
      osc.frequency.value = 880;
      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.4);
    } catch {
      // Audio isn't critical — the visual buzz still communicates time's up.
    }
  }

  function start() {
    if (remaining === 0) setRemaining(duration);
    setBuzzing(false);
    setRunning(true);
  }
  function pause() {
    setRunning(false);
  }
  function reset() {
    setRunning(false);
    setBuzzing(false);
    setRemaining(duration);
  }

  const ratio = remaining / duration;
  const color = buzzing ? "#E4534B" : ratio > 0.5 ? "#7FA96B" : ratio > 0.15 ? "#D6A24C" : "#E4534B";

  const mins = Math.floor(remaining / 60);
  const secs = remaining % 60;
  const display = `${mins}:${secs.toString().padStart(2, "0")}`;

  return (
    <>
      <style>{`
        @keyframes munlocked-timer-buzz {
          0%, 100% { transform: scale(1); }
          25% { transform: scale(1.06); }
          50% { transform: scale(1); }
          75% { transform: scale(1.06); }
        }
        .munlocked-timer-buzzing { animation: munlocked-timer-buzz 0.5s ease-in-out infinite; }
      `}</style>

      <button
        onClick={() => setOpen((o) => !o)}
        aria-label="Speech Timer"
        className={buzzing ? "munlocked-timer-buzzing" : ""}
        style={{
          position: "fixed",
          bottom: 92,
          right: 28,
          height: 40,
          padding: "0 14px",
          borderRadius: 999,
          background: "#0F0F10",
          border: `1.5px solid ${color}`,
          color: color,
          display: "flex",
          alignItems: "center",
          gap: 7,
          cursor: "pointer",
          zIndex: 99,
          fontFamily: "IBM Plex Mono, monospace",
          fontSize: 12,
          fontWeight: 600,
          boxShadow: "0 6px 18px rgba(0,0,0,0.4)",
        }}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="13" r="8" />
          <path d="M12 9v4l3 2" />
          <path d="M9 2h6" />
        </svg>
        {running || remaining !== duration ? display : "Timer"}
      </button>

      {open && (
        <div
          style={{
            position: "fixed",
            bottom: 138,
            right: 28,
            width: 200,
            background: "#0F0F10",
            border: `1px solid ${color}55`,
            borderRadius: 12,
            padding: 16,
            zIndex: 99,
            boxShadow: "0 14px 40px rgba(0,0,0,0.5)",
          }}
        >
          <div style={{ textAlign: "center", fontFamily: "IBM Plex Mono, monospace", fontSize: 32, fontWeight: 700, color, marginBottom: 12, letterSpacing: 1 }}>
            {display}
          </div>
          <div style={{ display: "flex", gap: 6, marginBottom: 10 }}>
            <button onClick={running ? pause : start} className="mono" style={{ flex: 1, background: color, color: "#0A0A0A", border: "none", padding: "8px 0", borderRadius: 6, fontSize: 11, fontWeight: 700, textTransform: "uppercase", cursor: "pointer" }}>
              {running ? "Pause" : "Start"}
            </button>
            <button onClick={reset} className="mono" style={{ background: "none", border: "1px solid rgba(234,217,222,0.25)", color: "rgba(234,217,222,0.7)", padding: "8px 12px", borderRadius: 6, fontSize: 11, cursor: "pointer" }}>
              Reset
            </button>
          </div>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {[60, 90, 120].map((s) => (
              <button
                key={s}
                onClick={() => { setDuration(s); setRemaining(s); setRunning(false); setBuzzing(false); }}
                className="mono"
                style={{ fontSize: 10, background: duration === s ? "rgba(234,217,222,0.12)" : "none", border: "1px solid rgba(234,217,222,0.2)", color: "rgba(234,217,222,0.6)", padding: "4px 9px", borderRadius: 20, cursor: "pointer" }}
              >
                {s}s
              </button>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
