"use client";

import { useEffect, useRef, useState } from "react";

type TimerKey = "speech" | "caucus";
type TimerState = Record<TimerKey, { duration: number; remaining: number; running: boolean; finished: boolean }>;

const PRESETS: Record<TimerKey, number[]> = {
  speech: [60, 75, 90, 120],
  caucus: [300, 600, 900, 1200],
};

function display(seconds: number) {
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;
}

export default function SessionTimerDesk() {
  const [timers, setTimers] = useState<TimerState>({
    speech: { duration: 90, remaining: 90, running: false, finished: false },
    caucus: { duration: 600, remaining: 600, running: false, finished: false },
  });
  const audioContext = useRef<AudioContext | null>(null);

  function chime() {
    try {
      audioContext.current ??= new AudioContext();
      const context = audioContext.current;
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      oscillator.frequency.setValueAtTime(784, context.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(1047, context.currentTime + 0.22);
      gain.gain.setValueAtTime(0.001, context.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.12, context.currentTime + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.001, context.currentTime + 0.5);
      oscillator.connect(gain);
      gain.connect(context.destination);
      oscillator.start();
      oscillator.stop(context.currentTime + 0.52);
    } catch {
      // The visual finish state remains useful if a browser blocks audio.
    }
  }

  useEffect(() => {
    const interval = window.setInterval(() => {
      let shouldChime = false;
      setTimers((current) => {
        const next = { ...current };
        (Object.keys(current) as TimerKey[]).forEach((key) => {
          const timer = current[key];
          if (!timer.running) return;
          if (timer.remaining <= 1) {
            next[key] = { ...timer, remaining: 0, running: false, finished: true };
            shouldChime = true;
          } else {
            next[key] = { ...timer, remaining: timer.remaining - 1 };
          }
        });
        return next;
      });
      if (shouldChime) chime();
    }, 1000);
    return () => window.clearInterval(interval);
  }, []);

  function toggle(key: TimerKey) {
    setTimers((current) => {
      const timer = current[key];
      return { ...current, [key]: { ...timer, remaining: timer.remaining || timer.duration, running: !timer.running, finished: false } };
    });
  }

  function reset(key: TimerKey) {
    setTimers((current) => ({ ...current, [key]: { ...current[key], remaining: current[key].duration, running: false, finished: false } }));
  }

  function setDuration(key: TimerKey, seconds: number) {
    setTimers((current) => ({ ...current, [key]: { duration: seconds, remaining: seconds, running: false, finished: false } }));
  }

  const running = Object.values(timers).some((timer) => timer.running);

  return (
    <section className="dais-timer-desk" aria-label="Dais timer controls">
      <style>{`
        @keyframes daisGlow { 0%, 100% { opacity: .42; transform: translateX(-2%); } 50% { opacity: .9; transform: translateX(3%); } }
        @keyframes daisPulse { 0%, 100% { box-shadow: 0 0 0 0 rgba(228,83,75,.34); } 50% { box-shadow: 0 0 0 11px rgba(228,83,75,0); } }
        .dais-timer-desk { position: relative; overflow: hidden; background: linear-gradient(125deg,#101114 0%,#17141a 58%,#101114 100%); border: 1px solid rgba(234,217,222,.17); border-radius: 18px; padding: 20px; margin: 0 0 24px; }
        .dais-timer-desk:before { content:""; position:absolute; inset:-35% -10%; background:radial-gradient(circle,rgba(201,138,148,.2),transparent 36%); animation:daisGlow 7s ease-in-out infinite; pointer-events:none; }
        .dais-timer-grid { position:relative; display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:14px; }
        .dais-timer-panel { border:1px solid rgba(234,217,222,.13); background:rgba(4,4,5,.42); border-radius:14px; padding:15px; display:grid; grid-template-columns:84px 1fr; gap:14px; align-items:center; }
        .dais-timer-panel.is-finished { border-color:#e4534b; animation:daisPulse .9s ease-in-out infinite; }
        .dais-timer-ring { width:82px; aspect-ratio:1; border-radius:50%; display:grid; place-items:center; position:relative; }
        .dais-timer-ring:after { content:""; position:absolute; inset:7px; border-radius:50%; background:#101114; }
        .dais-timer-value { z-index:1; font-family:var(--font-geist-mono,monospace); font-size:15px; font-weight:800; letter-spacing:-1px; }
        .dais-timer-presets button:hover { background:rgba(234,217,222,.12)!important; color:#fff!important; }
        @media(max-width:700px){ .dais-timer-grid{grid-template-columns:1fr}.dais-timer-panel{grid-template-columns:76px 1fr}.dais-timer-ring{width:74px} }
      `}</style>
      <div style={{ position: "relative", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16, flexWrap: "wrap", marginBottom: 16 }}>
        <div>
          <div className="mono" style={{ color: "var(--coral)", fontSize: 10, letterSpacing: 1.8, textTransform: "uppercase", marginBottom: 5 }}>Live dais controls</div>
          <h2 style={{ fontFamily: "Georgia, serif", fontSize: 20 }}>Keep the room moving.</h2>
        </div>
        <button onClick={() => setTimers((current) => Object.fromEntries(Object.entries(current).map(([key, timer]) => [key, { ...timer, running: !running, finished: false }])) as TimerState)} className="mono" style={{ background: running ? "transparent" : "var(--paper)", color: running ? "var(--text)" : "var(--ink)", border: running ? "1px solid rgba(234,217,222,.28)" : "none", borderRadius: 7, padding: "9px 12px", cursor: "pointer", fontSize: 10, fontWeight: 800, textTransform: "uppercase" }}>{running ? "Pause all" : "Start both"}</button>
      </div>
      <div className="dais-timer-grid">
        {(Object.keys(timers) as TimerKey[]).map((key) => {
          const timer = timers[key];
          const ratio = Math.max(0, timer.remaining / timer.duration);
          const color = timer.finished ? "#e4534b" : ratio > .35 ? "#7FA96B" : "#D6A24C";
          const label = key === "speech" ? "Speaker clock" : "Caucus clock";
          const description = key === "speech" ? "GSL, POI reply, or moderated speech" : "Moderated or unmoderated caucus";
          return <div key={key} className={`dais-timer-panel${timer.finished ? " is-finished" : ""}`}>
            <div className="dais-timer-ring" style={{ background: `conic-gradient(${color} ${ratio * 360}deg, rgba(234,217,222,.12) 0deg)` }}><span className="dais-timer-value" style={{ color }}>{display(timer.remaining)}</span></div>
            <div>
              <div className="mono" style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: 1, color: "var(--text)", marginBottom: 3 }}>{label}</div>
              <p style={{ fontSize: 11, color: "rgba(234,217,222,.5)", marginBottom: 10 }}>{timer.finished ? "Time. Bring the room back." : description}</p>
              <div style={{ display: "flex", gap: 7, marginBottom: 9 }}><button onClick={() => toggle(key)} className="mono" style={{ background: color, color: "#080809", border: "none", borderRadius: 5, padding: "7px 10px", cursor: "pointer", fontWeight: 800, fontSize: 10 }}>{timer.running ? "Pause" : "Start"}</button><button onClick={() => reset(key)} className="mono" style={{ background: "transparent", color: "rgba(234,217,222,.75)", border: "1px solid rgba(234,217,222,.2)", borderRadius: 5, padding: "7px 10px", cursor: "pointer", fontSize: 10 }}>Reset</button></div>
              <div className="dais-timer-presets" style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>{PRESETS[key].map((seconds) => <button key={seconds} onClick={() => setDuration(key, seconds)} className="mono" style={{ background: timer.duration === seconds ? "rgba(234,217,222,.13)" : "transparent", color: "rgba(234,217,222,.58)", border: "1px solid rgba(234,217,222,.14)", borderRadius: 99, padding: "4px 7px", cursor: "pointer", fontSize: 9 }}>{display(seconds)}</button>)}</div>
            </div>
          </div>;
        })}
      </div>
    </section>
  );
}
