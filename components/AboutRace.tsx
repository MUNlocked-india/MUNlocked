"use client";

import Link from "next/link";
import { useRef, useState, type CSSProperties } from "react";
import {
  motion,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from "motion/react";
import styles from "./AboutRace.module.css";

const STATIONS = [
  {
    number: "01",
    short: "EB profiles",
    label: "The credibility grid",
    problem: "EB appointments can depend on closed circles, incomplete information, or reputation that nobody can verify.",
    title: "Put evidence ahead of influence.",
    solution: "Every EB can publish a formal photograph, public CV, conference experience, expertise and community reviews. Organisers compare real records and contact candidates through MUNlocked chat—not a private network.",
    outcome: "Fairer appointments · professional accountability",
    href: "/hire-eb",
    cta: "Explore EB profiles",
    accent: "#e2a0af",
    code: "TRUST / 01",
  },
  {
    number: "02",
    short: "Conferences",
    label: "The discovery straight",
    problem: "Dates, fees, committees and registration links are scattered across posts, forms and disappearing stories.",
    title: "See the whole conference before you enter.",
    solution: "Conference profiles bring the official logo, dates, venue, committees, fees and registration path into one readable listing. Delegates discover rooms with context; organisers reach people beyond their existing following.",
    outcome: "Clear discovery · stronger attendance",
    href: "/conferences",
    cta: "Browse conferences",
    accent: "#d9bd7a",
    code: "ACCESS / 02",
  },
  {
    number: "03",
    short: "Open research",
    label: "The knowledge sector",
    problem: "Good preparation is often trapped in private drives, paid resources, or senior-only circles—making first committees unnecessarily unequal.",
    title: "Preparation should never begin behind a paywall.",
    solution: "Signed-in members can publish background guides and articles for everyone to use for free. Work stays credited, searchable and organised by committee and agenda, so every delegate gets a serious starting grid.",
    outcome: "Free access · credited contributors",
    href: "/research",
    cta: "Open the library",
    accent: "#b9a8e8",
    code: "PREP / 03",
  },
  {
    number: "04",
    short: "MUNlocked AI",
    label: "The strategy corner",
    problem: "Procedure feels intimidating in the moment, and generic writing tools rarely understand motions, POIs, caucuses or committee pressure.",
    title: "A co-pilot built for the room you are in.",
    solution: "MUNlocked answers by text or voice, explains procedure, pressure-tests arguments and helps craft speeches in your own direction. It is always available, while reminding delegates to follow their conference Rules of Procedure.",
    outcome: "Live guidance · stronger delegate voice",
    href: "/",
    cta: "Meet MUNlocked",
    accent: "#83b996",
    code: "PACE / 04",
  },
  {
    number: "05",
    short: "Digital dais",
    label: "The control tower",
    problem: "Chairs lose attention to disconnected spreadsheets, manual calculations, separate timers and files that cannot stay in sync.",
    title: "Run committee from one source of truth.",
    solution: "The Digital Dais combines portfolios, scoring columns, award calculations, shared access and side-by-side speech timers. The Executive Board spends less time managing files and more time observing delegates.",
    outcome: "Shared scoring · calmer committee rooms",
    href: "/committees",
    cta: "Launch the Digital Dais",
    accent: "#8fb6df",
    code: "CONTROL / 05",
  },
] as const;

function RaceCar() {
  return (
    <div className={styles.carShell}>
      <svg viewBox="0 0 92 178" role="img" aria-label="MUNlocked Formula race car">
        <defs>
          <linearGradient id="carBody" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#f4dce5" />
            <stop offset="0.46" stopColor="#e2a0af" />
            <stop offset="1" stopColor="#7f4b63" />
          </linearGradient>
          <linearGradient id="visor" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#d9bd7a" />
            <stop offset="1" stopColor="#302818" />
          </linearGradient>
        </defs>
        <rect x="10" y="31" width="13" height="39" rx="5" fill="#050505" />
        <rect x="69" y="31" width="13" height="39" rx="5" fill="#050505" />
        <rect x="9" y="113" width="14" height="43" rx="5" fill="#050505" />
        <rect x="69" y="113" width="14" height="43" rx="5" fill="#050505" />
        <path d="M19 18h54l8 10-3 10H14l-3-10 8-10Z" fill="#c7889d" />
        <path d="M38 8h16l6 21 9 22-8 87-15 31-15-31-8-87 9-22 6-21Z" fill="url(#carBody)" />
        <path d="M31 76 18 91v22l19-7h18l19 7V91L61 76Z" fill="#b97990" />
        <ellipse cx="46" cy="61" rx="13" ry="17" fill="url(#visor)" stroke="#f1dbe3" strokeWidth="2" />
        <path d="M37 110h18l-3 30H40l-3-30Z" fill="#251820" opacity=".65" />
        <path d="M15 151h62l5 12-7 8H17l-7-8 5-12Z" fill="#c7889d" />
        <circle cx="46" cy="29" r="8" fill="#100c0e" />
        <text x="46" y="33" textAnchor="middle" fontSize="8" fontWeight="900" fill="#f4edf0">M</text>
      </svg>
      <span className={styles.carGlow} />
    </div>
  );
}

export default function AboutRace() {
  const trackRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const reduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: trackRef,
    offset: ["start center", "end center"],
  });
  const progress = useSpring(scrollYProgress, { stiffness: 92, damping: 24, mass: 0.35 });
  const carTop = useTransform(progress, (value) => `${Math.min(95, Math.max(0, value * 95))}%`);
  const carX = useTransform(progress, [0, 0.24, 0.5, 0.76, 1], [-7, 8, -8, 7, 0]);
  const carRotate = useTransform(progress, [0, 0.24, 0.5, 0.76, 1], [-2, 2, -2, 2, 0]);
  const lineScale = reduceMotion ? scrollYProgress : progress;

  useMotionValueEvent(progress, "change", (value) => {
    const next = Math.min(STATIONS.length - 1, Math.max(0, Math.round(value * (STATIONS.length - 1))));
    setActive((current) => current === next ? current : next);
  });

  const pageStyle = { "--race-accent": STATIONS[active].accent } as CSSProperties;

  return (
    <main className={styles.page} style={pageStyle}>
      <section className={styles.hero}>
        <div className={styles.heroGrid} aria-hidden />
        <motion.div
          className={styles.heroCopy}
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
        >
          <span className={styles.eyebrow}>MUNlocked Grand Prix · Our reason to race</span>
          <h1>Five stops.<br /><em>One better circuit.</em></h1>
          <p>Scroll the track. At every station, one persistent MUN problem meets the system designed to remove it.</p>
          <a href="#race-start" className={styles.startButton}>Start the story <span>↓</span></a>
        </motion.div>
        <div className={styles.heroTelemetry} aria-hidden>
          <span>MODE</span><strong>SCROLL TO DRIVE</strong><i />
          <span>STATIONS</span><strong>05</strong><i />
          <span>MISSION</span><strong>BETTER ROOMS</strong>
        </div>
        <div className={styles.startLine} aria-hidden><span>START</span></div>
      </section>

      <section className={styles.raceIntro} id="race-start">
        <span>THE CIRCUIT / 01—05</span>
        <h2>Progress should feel<br />like forward motion.</h2>
        <p>Each lap is a product. Each product exists because something in the MUN experience can be made fairer, clearer or calmer.</p>
      </section>

      <div className={styles.raceLayout} ref={trackRef}>
        <aside className={styles.telemetry} aria-label="Race progress">
          <span>LIVE POSITION</span>
          <strong>{STATIONS[active].number}<small>/05</small></strong>
          <p>{STATIONS[active].short}</p>
          <div className={styles.telemetryBar}><motion.i style={{ scaleX: lineScale }} /></div>
        </aside>

        <div className={styles.road} aria-hidden>
          <div className={styles.roadEdge} />
          <motion.div className={styles.completedTrack} style={{ scaleY: lineScale }} />
          <div className={styles.centerLine} />
          <motion.div
            className={styles.car}
            style={{ top: carTop, x: reduceMotion ? 0 : carX, rotate: reduceMotion ? 0 : carRotate }}
          >
            <RaceCar />
          </motion.div>
        </div>

        <div className={styles.stations}>
          {STATIONS.map((station, index) => (
            <section
              className={`${styles.station} ${index === active ? styles.activeStation : ""}`}
              key={station.number}
              style={{ "--station-accent": station.accent } as CSSProperties}
            >
              <motion.article
                className={styles.stationCard}
                initial={reduceMotion ? false : { opacity: 0, y: 50, scale: 0.97 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true, amount: 0.35 }}
                transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
              >
                <header>
                  <span>{station.code}</span>
                  <span>{station.label}</span>
                </header>
                <div className={styles.stationNumber}>{station.number}</div>
                <div className={styles.problemBlock}>
                  <span>The friction</span>
                  <p>{station.problem}</p>
                </div>
                <h3>{station.title}</h3>
                <p className={styles.solution}>{station.solution}</p>
                <div className={styles.outcome}>{station.outcome}</div>
                <Link href={station.href}>{station.cta} <span>↗</span></Link>
              </motion.article>
              <div className={styles.pitMarker} aria-hidden>
                <span>{station.number}</span><i />
              </div>
            </section>
          ))}
        </div>
      </div>

      <section className={styles.finish}>
        <div className={styles.chequered} aria-hidden />
        <span className={styles.eyebrow}>Finish line · The mission</span>
        <h2>Better systems.<br /><em>Better rooms.</em></h2>
        <p>MUNlocked is not adding noise to the circuit. It is building the infrastructure that lets credible people, useful knowledge and well-run committees move faster.</p>
        <div className={styles.finishActions}>
          <Link href="/signup">Join the circuit <span>↗</span></Link>
          <Link href="/conferences">Find your next committee</Link>
        </div>
      </section>
    </main>
  );
}
