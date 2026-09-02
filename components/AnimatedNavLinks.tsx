"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
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
  const pathname = usePathname();

  const isActive = (href: string) => href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="site-nav-links mono"
    >
      {LINKS.map((l) => (
        <motion.div variants={item} key={l.href} className="nav-link-shell">
          <Link href={l.href} className={`munlocked-nav-link${isActive(l.href) ? " is-active" : ""}`} aria-current={isActive(l.href) ? "page" : undefined}>
            {isActive(l.href) && <motion.span layoutId="nav-active-pill" className="nav-active-pill" transition={{ type: "spring", stiffness: 420, damping: 34 }} />}
            {l.label}
          </Link>
        </motion.div>
      ))}
      {isLoggedIn && (
        <motion.div variants={item}>
          <Link href="/inbox" className={`munlocked-nav-link nav-accent${isActive("/inbox") ? " is-active" : ""}`} aria-current={isActive("/inbox") ? "page" : undefined}>
            {isActive("/inbox") && <motion.span layoutId="nav-active-pill" className="nav-active-pill" />}
            Inbox
          </Link>
        </motion.div>
      )}
      {isLoggedIn && (
        <motion.form variants={item} action={signOutAction}>
          <button type="submit" className="munlocked-nav-link mono nav-button">
            Sign out
          </button>
        </motion.form>
      )}
      <motion.div variants={item}>
        <Link
          href={isLoggedIn ? "/conferences/submit" : "/login"}
          className="nav-primary"
        >
          {isLoggedIn ? "List your MUN" : "Sign In"}
        </Link>
      </motion.div>
    </motion.div>
  );
}
