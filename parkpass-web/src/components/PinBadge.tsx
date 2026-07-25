import { useId, type CSSProperties } from "react";
import { COLORS, GLYPHS, type Glyph } from "@/data/parks";

/** Pointy-top hexagon centred in the 64×64 viewBox, matching the map's hexes. */
function hexPoints(radius: number): string {
  return Array.from({ length: 6 }, (_, i) => {
    const angle = (Math.PI / 180) * (60 * i - 90);
    const x = 32 + radius * Math.cos(angle);
    const y = 32 + radius * Math.sin(angle);
    return `${Math.round(x * 100) / 100},${Math.round(y * 100) / 100}`;
  }).join(" ");
}

const RIM = hexPoints(30);
const ENAMEL = hexPoints(24);

type Props = {
  glyph: Glyph;
  color: number;
  size: number;
  strokeWidth?: number;
  style?: CSSProperties;
  className?: string;
};

/**
 * Placeholder enamel-pin artwork: a gold hexagonal rim around a coloured
 * enamel field. Final per-park pin SVGs replace this 1:1 (same slot sizes:
 * 46 / 74 / 156 px).
 */
export function PinBadge({
  glyph,
  color,
  size,
  strokeWidth = 2.5,
  style,
  className,
}: Props) {
  const c = COLORS[color % COLORS.length];
  // Gradient ids must be unique — the pin board renders 31 of these at once.
  const goldId = useId();

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      style={style}
      className={className}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={goldId} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="var(--color-gold-100)" />
          <stop offset="28%" stopColor="var(--color-gold-300)" />
          <stop offset="55%" stopColor="var(--color-gold-500)" />
          <stop offset="80%" stopColor="var(--color-gold-600)" />
          <stop offset="100%" stopColor="var(--color-gold-800)" />
        </linearGradient>
      </defs>

      <polygon points={RIM} fill={`url(#${goldId})`} />
      <polygon
        points={ENAMEL}
        fill={c.light}
        stroke="var(--color-gold-700)"
        strokeWidth="1"
      />
      <path
        d={GLYPHS[glyph]}
        transform="translate(17.5,17.5) scale(1.2)"
        fill="none"
        stroke={c.dark}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <ellipse
        cx="23"
        cy="16"
        rx="10"
        ry="4.5"
        fill="rgba(255,255,255,.4)"
        transform="rotate(-28 23 16)"
      />
    </svg>
  );
}
