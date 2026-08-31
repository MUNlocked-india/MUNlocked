"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { signOutAction } from "@/lib/actions";

const LINKS = [
  { href: "/", label: "Home" },
  { href: "/conferences", label: "Conferences" },
  { href: "/topics", label: "Committees" },
  { href: "/research", label: "Research Library" },
  { href: "/hire-eb", label: "Hire an EB" },
  { href: "/committees", label: "Marksheet" },
  { href: "/founder", label: "Founder" },
  { href: "/about", label: "About" },
];

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.05 } },
};
const item = {
  hidden: { opacity: 0, y: -6 },
  show: { opacity: 1, y: 0 },
};

export default function AnimatedNavLinks({ isLoggedIn }: { isLoggedIn: boolean }) {
  return (
    <motion.div
      className="mono"
      variants={container}
      initial="hidden"
      animate="show"
      style={{ display: "flex", gap: 20, alignItems: "center", fontSize: 11.5, letterSpacing: 0.4, textTransform: "uppercase", flexWrap: "wrap" }}
    >
      {LINKS.map((l) => (
        <motion.div variants={item} key={l.href}>
          <Link href={l.href} className="munlocked-nav-link" style={{ color: "var(--text)", textDecoration: "none", opacity: 0.7 }}>
            {l.label}
          </Link>
        </motion.div>
      ))}
      {isLoggedIn && (
        <motion.form variants={item} action={signOutAction}>
          <button type="submit" className="munlocked-nav-link mono" style={{ color: "var(--text)", opacity: 0.7, background: "none", border: "none", cursor: "pointer", padding: 0, font: "inherit" }}>
            Sign out
          </button>
        </motion.form>
      )}
      <motion.div variants={item}>
        <Link
          href={isLoggedIn ? "/conferences/submit" : "/login"}
          style={{ background: "var(--paper)", color: "var(--ink)", padding: "8px 16px", borderRadius: 20, textDecoration: "none", fontWeight: 700, whiteSpace: "nowrap" }}
        >
          {isLoggedIn ? "List your MUN" : "Sign In"}
        </Link>
      </motion.div>
    </motion.div>
  );
}
