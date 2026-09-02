"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion, useScroll, useSpring, useTransform } from "motion/react";
import { useRef } from "react";
import styles from "./FounderStory.module.css";

const PRINCIPLES = [
  { number: "01", title: "Evidence over influence.", body: "An Executive Board should be trusted because its work is visible—not because its circle is powerful. Public profiles, experience, CVs and community reviews make credibility easier to inspect.", code: "APPOINT FAIRLY" },
  { number: "02", title: "Preparation is a right.", body: "A first committee should not feel like a private language. Free, credited research and committee-specific guidance give every delegate a serious place to begin.", code: "OPEN THE ROOM" },
  { number: "03", title: "Good systems create calm.", body: "Clear conference information, one shared digital dais and direct communication remove the administrative noise that distracts people from debate.", code: "BUILD FOR CLARITY" },
] as const;

const REASONS = [
  ["For the first-timer", "A clear starting point instead of an intimidating first step."],
  ["For the chair", "Better tools to observe, score and lead with consistency."],
  ["For the organiser", "A credible place to be discovered and build the right team."],
] as const;

export default function FounderStory() {
  const pageRef = useRef<HTMLElement>(null);
  const reduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: pageRef, offset: ["start start", "end end"] });
  const progress = useSpring(scrollYProgress, { stiffness: 90, damping: 24, mass: 0.35 });
  const portraitY = useTransform(progress, [0, 0.35], [0, reduceMotion ? 0 : 90]);
  const signatureX = useTransform(progress, [0.12, 0.7], [reduceMotion ? "0%" : "8%", reduceMotion ? "0%" : "-8%"]);

  return (
    <main className={styles.page} ref={pageRef}>
      <section className={styles.hero}>
        <div className={styles.heroAura} aria-hidden />
        <div className={styles.heroIndex} aria-hidden><span>FOUNDER FILE / 001</span><span>NEW DELHI, INDIA</span></div>
        <motion.div className={styles.heroCopy} initial={reduceMotion ? false : { opacity: 0, y: 34 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.85, ease: [0.22, 1, 0.36, 1] }}>
          <p className={styles.eyebrow}>The person behind the platform</p>
          <h1><span>Rishi</span><span>Sahni.</span></h1>
          <div className={styles.heroIntro}>
            <p>Founder of MUNlocked. Building a fairer, clearer circuit for the people who enter the room—and the people trusted to lead it.</p>
            <a href="#origin" aria-label="Continue to Rishi Sahni's story">Discover the why <i>↓</i></a>
          </div>
        </motion.div>
        <motion.figure className={styles.heroPortrait} style={{ y: portraitY }} initial={reduceMotion ? false : { opacity: 0, scale: 1.06, clipPath: "inset(0 0 100% 0 round 28px)" }} animate={{ opacity: 1, scale: 1, clipPath: "inset(0 0 0% 0 round 28px)" }} transition={{ duration: 1.05, delay: 0.12, ease: [0.22, 1, 0.36, 1] }}>
          <Image src="/founder.jpg" alt="Rishi Sahni, founder of MUNlocked" fill sizes="(max-width: 760px) 94vw, 46vw" priority />
          <figcaption><span>RISHI SAHNI</span><span>FOUNDER · MUNLOCKED</span></figcaption>
        </motion.figure>
        <div className={styles.heroRole} aria-hidden><span>FOUNDER</span><i /><span>CHAIRPERSON</span><i /><span>BUILDER</span></div>
      </section>

      <section className={styles.origin} id="origin">
        <motion.div className={styles.originLabel} initial={reduceMotion ? false : { opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true, amount: 0.5 }}>
          <span>01 / THE ORIGIN</span><p>A platform born inside the room.</p>
        </motion.div>
        <motion.div className={styles.originStory} initial={reduceMotion ? false : { opacity: 0, y: 45 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.25 }} transition={{ duration: 0.75 }}>
          <p className={styles.lead}>The idea did not begin with a pitch deck. It began with the same problems showing up in committee after committee.</p>
          <div className={styles.storyColumns}>
            <p>Executive Boards selected through closed circles. Conference details scattered across disappearing posts. First-time delegates expected to understand procedure without being given the tools to learn it.</p>
            <p>Rishi had experienced the circuit from both sides of the dais. MUNlocked became his answer: one connected place where credibility can be checked, preparation stays open and the work of running a committee feels considered.</p>
          </div>
        </motion.div>
      </section>

      <section className={styles.statement} aria-label="Founder's statement">
        <motion.div className={styles.statementWord} style={{ x: signatureX }} aria-hidden>UNLOCK THE ROOM</motion.div>
        <div className={styles.quoteMark} aria-hidden>“</div>
        <motion.blockquote initial={reduceMotion ? false : { opacity: 0, scale: 0.96 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true, amount: 0.45 }} transition={{ duration: 0.8 }}>
          I&apos;m not trying to build another listings site. I&apos;m building the thing that makes bias harder to get away with.
          <footer>Rishi Sahni <span>— Founder, MUNlocked</span></footer>
        </motion.blockquote>
      </section>

      <section className={styles.principles}>
        <header><div><span>02 / THE STANDARD</span><p>Three principles. No fine print.</p></div><h2>What stays true<br />as we grow.</h2></header>
        <div className={styles.principleGrid}>
          {PRINCIPLES.map((principle, index) => (
            <motion.article key={principle.number} initial={reduceMotion ? false : { opacity: 0, y: 38 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.3 }} transition={{ duration: 0.6, delay: index * 0.1 }}>
              <div className={styles.principleTop}><span>{principle.number}</span><i /></div><h3>{principle.title}</h3><p>{principle.body}</p><small>{principle.code}</small>
            </motion.article>
          ))}
        </div>
      </section>

      <section className={styles.perspective}>
        <motion.figure initial={reduceMotion ? false : { opacity: 0, clipPath: "inset(0 0 30% 0 round 26px)" }} whileInView={{ opacity: 1, clipPath: "inset(0 0 0% 0 round 26px)" }} viewport={{ once: true, amount: 0.25 }} transition={{ duration: 0.8 }}>
          <Image src="/founder.jpg" alt="Rishi Sahni in formal attire" fill sizes="(max-width: 800px) 94vw, 42vw" /><div className={styles.portraitWash} /><figcaption>THE VIEW FROM BOTH SIDES OF THE DAIS</figcaption>
        </motion.figure>
        <div className={styles.perspectiveCopy}>
          <span>03 / WHO THIS IS FOR</span><h2>Built around people,<br /><em>not page views.</em></h2>
          <p className={styles.perspectiveLead}>Every product decision returns to one question: does this help someone walk into their next room more prepared, more visible or more confident?</p>
          <div className={styles.reasonList}>{REASONS.map(([title, body], index) => <div key={title}><b>0{index + 1}</b><h3>{title}</h3><p>{body}</p></div>)}</div>
        </div>
      </section>

      <section className={styles.closing}>
        <div className={styles.closingOrbit} aria-hidden><i /><i /><i /></div><span>THE NEXT ROOM STARTS HERE</span>
        <h2>A platform is only useful<br />when people make it theirs.</h2>
        <p>Bring your experience. Share what you know. Find the people and tools that make your next committee better.</p>
        <div className={styles.actions}><Link href="/signup">Join MUNlocked <i>↗</i></Link><Link href="/about">See what we&apos;re building</Link></div>
        <div className={styles.signature}><b>Rishi Sahni</b><small>FOUNDER / MUNLOCKED</small></div>
      </section>
    </main>
  );
}
