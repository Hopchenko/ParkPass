import type { CSSProperties } from "react";

const COLORS = ["#c67139", "#7a8a5e", "#f6a06b", "#aebf92", "#8c491a", "#e1eecc"];

const DOTS = Array.from({ length: 16 }, (_, i) => {
  const angle = (i / 16) * Math.PI * 2 + (i % 3) * 0.21;
  const dist = 78 + (i % 5) * 14;
  return {
    size: 6 + (i % 4) * 2,
    radius: i % 2 ? "50%" : "3px",
    background: COLORS[i % 6],
    dx: Math.round(Math.cos(angle) * dist),
    dy: Math.round(Math.sin(angle) * dist - 24),
    duration: (0.65 + (i % 4) * 0.09).toFixed(2),
    delay: ((i % 5) * 0.03).toFixed(2),
  };
});

/** 16 particles radiating from the pin on the "stamp" moment. Parent must be `relative`. */
export function ConfettiBurst() {
  return (
    <>
      {DOTS.map((d, i) => (
        <span
          key={i}
          className="pointer-events-none absolute left-1/2 top-[45%]"
          style={
            {
              width: d.size,
              height: d.size,
              borderRadius: d.radius,
              background: d.background,
              "--dx": `${d.dx}px`,
              "--dy": `${d.dy}px`,
              animation: `popDot ${d.duration}s ease-out ${d.delay}s both`,
            } as CSSProperties
          }
        />
      ))}
    </>
  );
}
