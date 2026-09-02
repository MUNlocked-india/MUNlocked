"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type Delegate = { id: string; country: string };
type Attendance = "present" | "voting" | "absent";
type DeskView = "roll-call" | "gsl" | "motions";
type Clock = { duration: number; remaining: number; running: boolean; finished: boolean };

const SPEECH_PRESETS = [45, 60, 75, 90];
const CAUCUS_PRESETS = [300, 600, 900, 1200];

function display(seconds: number) {
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;
}

function countryMark(country: string) {
  return country.split(/\s+/).map((part) => part[0]).join("").slice(0, 2).toUpperCase();
}

function nextAttendance(current: Attendance): Attendance {
  if (current === "present") return "voting";
  if (current === "voting") return "absent";
  return "present";
}

export default function SessionTimerDesk({ delegates, committeeName, committeeCode, conferenceName }: {
  delegates: Delegate[];
  committeeName: string;
  committeeCode: string;
  conferenceName?: string | null;
}) {
  const [view, setView] = useState<DeskView>("gsl");
  const [query, setQuery] = useState("");
  const [activeDelegateId, setActiveDelegateId] = useState(delegates[0]?.id ?? "");
  const [queue, setQueue] = useState<string[]>([]);
  const [attendance, setAttendance] = useState<Record<string, Attendance>>(() => Object.fromEntries(delegates.map((delegate) => [delegate.id, "present"])));
  const [speech, setSpeech] = useState<Clock>({ duration: 60, remaining: 60, running: false, finished: false });
  const [caucus, setCaucus] = useState<Clock>({ duration: 600, remaining: 600, running: false, finished: false });
  const [motion, setMotion] = useState("");
  const audioContext = useRef<AudioContext | null>(null);

  const activeDelegate = delegates.find((delegate) => delegate.id === activeDelegateId) ?? delegates[0];
  const visibleDelegates = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return normalizedQuery ? delegates.filter((delegate) => delegate.country.toLowerCase().includes(normalizedQuery)) : delegates;
  }, [delegates, query]);
  const attendanceCounts = useMemo(() => delegates.reduce((counts, delegate) => {
    counts[attendance[delegate.id] ?? "present"] += 1;
    return counts;
  }, { present: 0, voting: 0, absent: 0 } as Record<Attendance, number>), [attendance, delegates]);

  useEffect(() => {
    const interval = window.setInterval(() => {
      let shouldChime = false;
      const tick = (clock: Clock) => {
        if (!clock.running) return clock;
        if (clock.remaining <= 1) {
          shouldChime = true;
          return { ...clock, remaining: 0, running: false, finished: true };
        }
        return { ...clock, remaining: clock.remaining - 1 };
      };
      setSpeech(tick);
      setCaucus(tick);
      if (shouldChime) {
        try {
          audioContext.current ??= new AudioContext();
          const context = audioContext.current;
          const oscillator = context.createOscillator();
          const gain = context.createGain();
          oscillator.frequency.setValueAtTime(740, context.currentTime);
          oscillator.frequency.exponentialRampToValueAtTime(990, context.currentTime + 0.2);
          gain.gain.setValueAtTime(0.001, context.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.1, context.currentTime + 0.03);
          gain.gain.exponentialRampToValueAtTime(0.001, context.currentTime + 0.45);
          oscillator.connect(gain);
          gain.connect(context.destination);
          oscillator.start();
          oscillator.stop(context.currentTime + 0.46);
        } catch {
          // The visible finished state remains available when sound is blocked.
        }
      }
    }, 1000);
    return () => window.clearInterval(interval);
  }, []);

  function setClockDuration(kind: "speech" | "caucus", duration: number) {
    const update = { duration, remaining: duration, running: false, finished: false };
    if (kind === "speech") setSpeech(update);
    else setCaucus(update);
  }

  function toggleClock(kind: "speech" | "caucus") {
    const update = (clock: Clock): Clock => ({ ...clock, remaining: clock.remaining || clock.duration, running: !clock.running, finished: false });
    if (kind === "speech") setSpeech(update);
    else setCaucus(update);
  }

  function resetClock(kind: "speech" | "caucus") {
    const update = (clock: Clock): Clock => ({ ...clock, remaining: clock.duration, running: false, finished: false });
    if (kind === "speech") setSpeech(update);
    else setCaucus(update);
  }

  function addToQueue(delegateId: string) {
    setQueue((current) => current.includes(delegateId) ? current : [...current, delegateId]);
  }

  function callNextSpeaker() {
    setQueue((current) => {
      const [next, ...rest] = current;
      if (next) setActiveDelegateId(next);
      return rest;
    });
    setSpeech((clock) => ({ ...clock, remaining: clock.duration, running: false, finished: false }));
  }

  const queueDelegates = queue.map((delegateId) => delegates.find((delegate) => delegate.id === delegateId)).filter((delegate): delegate is Delegate => Boolean(delegate));

  return (
    <section className="session-cockpit" aria-label="Live committee session desk">
      <header className="session-cockpit-tabs">
        <div className="session-cockpit-wordmark"><span className="session-cockpit-gavel" aria-hidden="true">◆</span><span>MUNlocked <small>DAIS</small></span></div>
        <nav aria-label="Session views">
          {([["roll-call", "Roll Call"], ["gsl", "GSL & Timer"], ["motions", "Motions"]] as const).map(([key, label]) => (
            <button key={key} type="button" className={view === key ? "is-active" : ""} onClick={() => setView(key)}>{label}</button>
          ))}
          <button type="button" onClick={() => document.getElementById("marksheet")?.scrollIntoView({ behavior: "smooth" })}>Marksheet</button>
          <button type="button" onClick={() => document.getElementById("dais-sharing")?.scrollIntoView({ behavior: "smooth" })}>Dais</button>
        </nav>
        <span className="session-live-pill"><i /> Live room</span>
      </header>

      <div className="session-cockpit-body">
        <aside className="session-roster">
          <div className="session-roster-head">
            <span className="session-code">{committeeCode}</span>
            <h2>{committeeName}</h2>
            {conferenceName ? <p>{conferenceName}</p> : null}
            <div className="attendance-summary" aria-label="Attendance totals">
              <span><i className="present" />{attendanceCounts.present} present</span>
              <span><i className="voting" />{attendanceCounts.voting} P+V</span>
              <span><i className="absent" />{attendanceCounts.absent} absent</span>
            </div>
          </div>

          <div className="session-roster-list">
            {visibleDelegates.map((delegate) => {
              const status = attendance[delegate.id] ?? "present";
              const selected = delegate.id === activeDelegate?.id;
              return (
                <div key={delegate.id} className={`session-country${selected ? " is-selected" : ""}${status === "absent" ? " is-absent" : ""}`}>
                  <button type="button" className="session-country-main" onClick={() => setActiveDelegateId(delegate.id)}><span className="country-mark" aria-hidden="true">{countryMark(delegate.country)}</span><span>{delegate.country}</span></button>
                  <button type="button" className={`attendance-toggle ${status}`} aria-label={`Set ${delegate.country} attendance; currently ${status}`} title="Cycle present, present and voting, absent" onClick={() => setAttendance((current) => ({ ...current, [delegate.id]: nextAttendance(status) }))}>{status === "voting" ? "P+V" : status === "present" ? "P" : "A"}</button>
                  <button type="button" className="queue-add" aria-label={`Add ${delegate.country} to speaker queue`} onClick={() => addToQueue(delegate.id)}>+</button>
                </div>
              );
            })}
            {visibleDelegates.length === 0 ? <p className="session-empty-list">No matching portfolio.</p> : null}
          </div>
          <label className="session-roster-search"><span className="sr-only">Search portfolios</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Filter portfolios…" /></label>
        </aside>

        <main className="session-stage">
          {view === "roll-call" ? (
            <div className="roll-call-panel">
              <div className="stage-eyebrow">Room check · {delegates.length} portfolios</div>
              <h2>Roll call, without the paperwork.</h2>
              <p>Tap a status to move between present, present and voting, and absent. Your live roster stays visible beside the session.</p>
              <div className="roll-call-actions">
                <button type="button" onClick={() => setAttendance(Object.fromEntries(delegates.map((delegate) => [delegate.id, "present"])))}>Mark all present</button>
                <button type="button" onClick={() => setAttendance(Object.fromEntries(delegates.map((delegate) => [delegate.id, "absent"])))}>Clear roll call</button>
              </div>
              <div className="roll-call-grid">
                {delegates.map((delegate) => {
                  const status = attendance[delegate.id] ?? "present";
                  return <button key={delegate.id} type="button" onClick={() => setAttendance((current) => ({ ...current, [delegate.id]: nextAttendance(status) }))}><span className="country-mark">{countryMark(delegate.country)}</span><strong>{delegate.country}</strong><em className={status}>{status === "voting" ? "Present + voting" : status}</em></button>;
                })}
              </div>
            </div>
          ) : null}

          {view === "gsl" ? (
            <div className="speaker-stage">
              <div className="stage-eyebrow">General Speakers List</div>
              {activeDelegate ? (
                <>
                  <div className="speaker-identity"><span className="speaker-mark">{countryMark(activeDelegate.country)}</span><strong>{activeDelegate.country}</strong><small>{speech.running ? "Speaking now" : speech.finished ? "Time elapsed" : "Ready to speak"}</small></div>
                  <div className={`speaker-time${speech.finished ? " is-finished" : ""}`}>{display(speech.remaining)}</div>
                  <div className="speaker-progress"><i style={{ width: `${Math.max(0, (speech.remaining / speech.duration) * 100)}%` }} /></div>
                  <div className="speaker-controls">
                    <button type="button" className="secondary-control" onClick={() => resetClock("speech")} aria-label="Reset speaker timer">↻</button>
                    <button type="button" className="primary-control" onClick={() => toggleClock("speech")}>{speech.running ? "Pause" : "▶ Start"}</button>
                    <button type="button" className="secondary-control next-control" onClick={callNextSpeaker} disabled={queue.length === 0}>Next →</button>
                    <button type="button" className="secondary-control" onClick={() => addToQueue(activeDelegate.id)}>+ Queue</button>
                  </div>
                  <button type="button" className="reply-chip" onClick={() => setClockDuration("speech", 30)}>Right to reply · 0:30</button>
                </>
              ) : <div className="no-speaker"><span>◎</span><h2>No portfolio selected</h2><p>Add countries below, then select the first speaker.</p></div>}

              <div className="speaker-dock">
                <div className="duration-row"><span>Time</span>{SPEECH_PRESETS.map((seconds) => <button type="button" key={seconds} className={speech.duration === seconds ? "is-active" : ""} onClick={() => setClockDuration("speech", seconds)}>{seconds}s</button>)}</div>
                <div className="speaker-queue" aria-label="Speaker queue"><span>Next speakers</span>{queueDelegates.length ? queueDelegates.map((delegate, index) => <button type="button" key={delegate.id} onClick={() => setQueue((current) => current.filter((id) => id !== delegate.id))} title="Remove from queue"><b>{index + 1}</b>{delegate.country}<i>×</i></button>) : <em>Select + beside a portfolio to build the queue.</em>}</div>
              </div>
            </div>
          ) : null}

          {view === "motions" ? (
            <div className="motions-panel">
              <div className="stage-eyebrow">Moderated & unmoderated caucus</div>
              <h2>Run the motion. Keep the room moving.</h2>
              <label><span>Motion on the floor</span><input value={motion} onChange={(event) => setMotion(event.target.value)} placeholder="e.g. 10 minutes, 60-second speaking time…" /></label>
              <div className={`caucus-time${caucus.finished ? " is-finished" : ""}`}>{display(caucus.remaining)}</div>
              <div className="speaker-progress caucus-progress"><i style={{ width: `${Math.max(0, (caucus.remaining / caucus.duration) * 100)}%` }} /></div>
              <div className="caucus-presets">{CAUCUS_PRESETS.map((seconds) => <button type="button" key={seconds} className={caucus.duration === seconds ? "is-active" : ""} onClick={() => setClockDuration("caucus", seconds)}>{display(seconds)}</button>)}</div>
              <div className="speaker-controls"><button type="button" className="secondary-control" onClick={() => resetClock("caucus")}>Reset</button><button type="button" className="primary-control" onClick={() => toggleClock("caucus")}>{caucus.running ? "Pause caucus" : "▶ Start caucus"}</button></div>
            </div>
          ) : null}
        </main>
      </div>
    </section>
  );
}
