"use client";

import { AnimatePresence, motion } from "motion/react";
import { useState, type CSSProperties } from "react";
import CommitteeGraphic from "@/components/CommitteeGraphic";
import type { CommitteeProfile } from "@/lib/committee-data";
import type { CommitteeUpdate } from "@/lib/committee-updates";
import styles from "./CommitteeCarousel.module.css";

const dateFormatter = new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short", year: "numeric" });

function formatPublishedAt(value: string) {
  const timestamp = Date.parse(value);
  return Number.isFinite(timestamp) ? dateFormatter.format(timestamp) : "Live source";
}

function feedLabel(committee: CommitteeProfile) {
  if (committee.feedGroups.includes("india")) return "Digital Sansad + PIB signals · refreshed hourly";
  if (committee.feedGroups.includes("who")) return "WHO + UN official feeds · refreshed hourly";
  return "UN official feeds · refreshed hourly";
}

export default function CommitteeCarousel({ committees, updates }: { committees: CommitteeProfile[]; updates: Record<string, CommitteeUpdate[]> }) {
  const [active, setActive] = useState(0);
  const committee = committees[active];
  const move = (direction: number) => setActive((current) => (current + direction + committees.length) % committees.length);
  return <div className={styles.experience}>
    <section className={styles.carousel} aria-roledescription="carousel" aria-label="Committee covers" onKeyDown={(event) => { if (event.key === "ArrowLeft") move(-1); if (event.key === "ArrowRight") move(1); }} tabIndex={0}>
      <button className={`${styles.arrow} ${styles.arrowLeft}`} onClick={() => move(-1)} aria-label="Previous committee">←</button>
      <div className={styles.stage}>{committees.map((item, index) => {
        let distance = index - active;
        if (distance > committees.length / 2) distance -= committees.length;
        if (distance < -committees.length / 2) distance += committees.length;
        const visible = Math.abs(distance) <= 2;
        return <motion.button key={item.code} className={styles.cover} aria-label={`Open ${item.name}`} aria-current={index === active} onClick={() => setActive(index)} animate={{ x: `${distance * 59}%`, scale: distance === 0 ? 1 : Math.abs(distance) === 1 ? .82 : .67, rotateY: distance * -14, zIndex: 10 - Math.abs(distance), opacity: visible ? distance === 0 ? 1 : .45 : 0, filter: distance === 0 ? "blur(0px)" : "blur(2px)" }} transition={{ type: "spring", stiffness: 220, damping: 26 }} style={{ pointerEvents: visible ? "auto" : "none", "--committee-accent": item.accent } as CSSProperties}>
          <div className={styles.coverGrain} /><CommitteeGraphic committee={item} /><small className={styles.coverNumber}>{String(index + 1).padStart(2, "0")} / {String(committees.length).padStart(2, "0")}</small>
        </motion.button>;
      })}</div>
      <button className={`${styles.arrow} ${styles.arrowRight}`} onClick={() => move(1)} aria-label="Next committee">→</button>
      <div className={styles.dots}>{committees.map((item, index) => <button key={item.code} onClick={() => setActive(index)} aria-label={`Show ${item.code}`} className={index === active ? styles.dotActive : ""} />)}</div>
    </section>
    <p className={styles.identityNote}>Official emblems are shown for identification. MUNlocked is an independent educational platform and is not affiliated with the UN or Government of India.</p>
    <AnimatePresence mode="wait"><motion.section key={committee.code} className={styles.briefing} initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }} transition={{ duration: .38, ease: [0.22, 1, 0.36, 1] }}>
      <div className={styles.briefHead}><div><span className={styles.eyebrow}>{committee.code} · DIGITAL BRIEFING</span><h2>{committee.name}</h2></div><a href={committee.officialUrl} target="_blank" rel="noreferrer">Open official source <span>↗</span></a></div>
      {committee.simulation && <p className={styles.simulationNote}><b>Simulation note:</b> this is not an official UN organ. Always follow the mandate and procedure issued by your conference.</p>}
      <div className={styles.briefGrid}><article><span>01 / THE MANDATE</span><h3>Why this body exists</h3><p>{committee.mandate}</p></article><article><span>02 / SCOPE OF POWER</span><h3>What it can—and cannot—do</h3><p>{committee.authority}</p></article><article><span>03 / PREPARATION LENS</span><h3>Know the working terrain</h3><div className={styles.focus}>{committee.focus.map((focus) => <i key={focus}>{focus}</i>)}</div></article></div>
      <div className={styles.newsDesk}><div className={styles.newsHead}><div><span className={styles.liveDot} /> OFFICIAL SIGNAL DESK</div><p>{feedLabel(committee)}</p></div><div className={styles.newsGrid}>{(updates[committee.code] ?? []).length ? updates[committee.code].map((item, index) => <a href={item.url} target="_blank" rel="noreferrer" key={`${item.url}-${index}`}><span>{item.direct ? `${committee.code} MATCH` : "LATEST OFFICIAL UPDATE"}</span><h3>{item.title}</h3><p>{item.source} · {formatPublishedAt(item.publishedAt)}</p><b>Read official update ↗</b></a>) : <div className={styles.newsEmpty}><p>The official feed is between updates. The committee source remains available live.</p><a href={committee.updatesUrl} target="_blank" rel="noreferrer">Open the official news desk ↗</a></div>}</div><a className={styles.allNews} href={committee.updatesUrl} target="_blank" rel="noreferrer">Visit {committee.code}&apos;s official updates page ↗</a></div>
    </motion.section></AnimatePresence>
  </div>;
}
