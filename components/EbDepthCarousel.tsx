"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

export type EbShowcaseItem = {
  id: string;
  name: string;
  experience: string;
  expertise: string[];
  photoUrl: string | null;
};

function relativeIndex(index: number, active: number, length: number) {
  let difference = index - active;
  if (difference > length / 2) difference -= length;
  if (difference < -length / 2) difference += length;
  return difference;
}

export default function EbDepthCarousel({ items }: { items: EbShowcaseItem[] }) {
  const [active, setActive] = useState(0);

  useEffect(() => {
    if (items.length < 2) return;
    const timer = window.setInterval(() => setActive((current) => (current + 1) % items.length), 4600);
    return () => window.clearInterval(timer);
  }, [items.length]);

  if (!items.length) return null;

  return (
    <div style={{ position: "relative" }} aria-roledescription="carousel" aria-label="Featured Executive Board members">
      <div style={{ height: 322, position: "relative", perspective: 1100, overflow: "hidden", borderRadius: 18 }}>
        {items.map((item, index) => {
          const offset = relativeIndex(index, active, items.length);
          const visible = Math.abs(offset) <= 2;
          return (
            <article
              key={item.id}
              aria-hidden={!visible}
              style={{
                position: "absolute", left: "50%", top: 10, width: "min(245px, 68vw)", height: 286,
                transform: `translateX(-50%) translateX(${offset * 142}px) translateZ(${-Math.abs(offset) * 105}px) rotateY(${offset * -18}deg) scale(${1 - Math.abs(offset) * 0.09})`,
                opacity: visible ? 1 - Math.abs(offset) * 0.26 : 0,
                zIndex: 10 - Math.abs(offset), transition: "transform 600ms cubic-bezier(.2,.8,.2,1), opacity 450ms ease",
                borderRadius: 16, overflow: "hidden", background: "linear-gradient(145deg, #2c1d25, #101010)", border: offset === 0 ? "1px solid rgba(201,138,148,.72)" : "1px solid rgba(234,217,222,.12)", boxShadow: offset === 0 ? "0 20px 40px rgba(0,0,0,.42)" : "0 12px 28px rgba(0,0,0,.25)",
              }}
            >
              {item.photoUrl ? <Image src={item.photoUrl} alt={`Formal photo of ${item.name}`} fill sizes="245px" unoptimized style={{ objectFit: "cover", opacity: offset === 0 ? 0.9 : 0.56 }} /> : <div style={{ position: "absolute", inset: 0, background: "radial-gradient(circle at 50% 25%, rgba(201,138,148,.85), transparent 42%), linear-gradient(145deg,#2e2430,#080808)" }} />}
              <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, transparent 27%, rgba(8,8,8,.93) 92%)" }} />
              <div style={{ position: "absolute", left: 18, right: 18, bottom: 17 }}>
                <div className="mono" style={{ fontSize: 9.5, color: "var(--coral)", letterSpacing: 1.3, textTransform: "uppercase", marginBottom: 6 }}>Verified EB</div>
                <h4 style={{ fontFamily: "Georgia, serif", fontSize: 20, margin: 0, color: "var(--text)" }}>{item.name}</h4>
                <p className="mono" style={{ color: "rgba(234,217,222,.65)", fontSize: 10.5, margin: "7px 0 0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.expertise.slice(0, 2).join(" · ") || item.experience}</p>
              </div>
            </article>
          );
        })}
      </div>
      {items.length > 1 && <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, marginTop: 10 }}>
        <button type="button" onClick={() => setActive((active - 1 + items.length) % items.length)} aria-label="Previous featured EB" style={controlStyle}>←</button>
        <span className="mono" style={{ fontSize: 10, color: "rgba(234,217,222,.55)" }}>{String(active + 1).padStart(2, "0")} / {String(items.length).padStart(2, "0")}</span>
        <button type="button" onClick={() => setActive((active + 1) % items.length)} aria-label="Next featured EB" style={controlStyle}>→</button>
      </div>}
    </div>
  );
}

const controlStyle: React.CSSProperties = { width: 28, height: 28, borderRadius: "50%", border: "1px solid rgba(234,217,222,.24)", background: "transparent", color: "var(--text)", cursor: "pointer" };
