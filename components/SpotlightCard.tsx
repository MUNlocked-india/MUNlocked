"use client";

import { useRef, useState } from "react";

export default function SpotlightCard({
  children,
  className,
  style,
  spotlightColor = "rgba(201, 138, 148, 0.35)",
}: {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  spotlightColor?: string;
}) {
  const divRef = useRef<HTMLDivElement>(null);
  const [opacity, setOpacity] = useState(0);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    const div = divRef.current;
    if (!div) return;
    const rect = div.getBoundingClientRect();
    setPosition({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  }

  return (
    <div
      ref={divRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setOpacity(1)}
      onMouseLeave={() => setOpacity(0)}
      className={className}
      style={{ position: "relative", overflow: "hidden", ...style }}
    >
      <div
        style={{
          pointerEvents: "none",
          position: "absolute",
          inset: 0,
          opacity,
          transition: "opacity 0.4s ease",
          background: `radial-gradient(circle 220px at ${position.x}px ${position.y}px, ${spotlightColor}, transparent 75%)`,
        }}
      />
      <div style={{ position: "relative", zIndex: 1 }}>{children}</div>
    </div>
  );
}
