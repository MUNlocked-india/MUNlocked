"use client";

import { useEffect, useState } from "react";

export default function AboutRace({ children }: { children: React.ReactNode }) {
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    const update = () => {
      const max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      setProgress(Math.min(1, Math.max(0, window.scrollY / max)));
    };
    update(); window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, []);
  return <div style={{ position:"relative" }}><div aria-hidden style={{ position:"fixed", left:`calc(4% + ${progress * 88}%)`, top:94, zIndex:4, fontSize:28, transition:"left .12s linear", pointerEvents:"none" }}>🏎️</div>{children}</div>;
}
