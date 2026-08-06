import { useId, type CSSProperties } from "react";
import { COLORS, GLYPHS, PIN_ARTWORK, type Glyph } from "@/data/parks";

/** Pointy-top hexagon centred in the 64×64 viewBox, matching the map's hexes. */
function hexPoints(radius: number): string {
  return Array.from({ length: 6 }, (_, i) => {
    const angle = (Math.PI / 180) * (60 * i - 90);
    const x = 32 + radius * Math.cos(angle);
    const y = 32 + radius * Math.sin(angle);
    return `${Math.round(x * 100) / 100},${Math.round(y * 100) / 100}`;
  }).join(" ");
}

const RIM_R = 30;
const ENAMEL_R = 26;

const RIM = hexPoints(RIM_R);
const ENAMEL = hexPoints(ENAMEL_R);

/** Bounding box of the enamel hexagon — artwork is scaled to cover this. */
const ART = {
  x: 32 - ENAMEL_R * Math.cos(Math.PI / 6),
  y: 32 - ENAMEL_R,
  w: 2 * ENAMEL_R * Math.cos(Math.PI / 6),
  h: 2 * ENAMEL_R,
};

type Props = {
  glyph: Glyph;
  color: number;
  size: number;
  /** When this park has final artwork, it replaces the glyph. */
  slug?: string;
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
  slug,
  strokeWidth = 2.5,
  style,
  className,
}: Props) {
  const c = COLORS[color % COLORS.length];
  // Ids must be unique — the pin board renders 31 of these at once.
  const goldId = useId();
  const clipId = useId();
  const hasArt = !!slug && PIN_ARTWORK.has(slug);

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
        {hasArt && (
          <clipPath id={clipId}>
            <polygon points={ENAMEL} />
          </clipPath>
        )}
      </defs>

      <polygon points={RIM} fill={`url(#${goldId})`} />

      {hasArt ? (
        <>
          <image
            href={`/pins/${slug}.webp`}
            x={ART.x}
            y={ART.y}
            width={ART.w}
            height={ART.h}
            preserveAspectRatio="xMidYMid slice"
            clipPath={`url(#${clipId})`}
          />
          <polygon
            points={ENAMEL}
            fill="none"
            stroke="var(--color-gold-700)"
            strokeWidth="0.7"
          />
        </>
      ) : (
        <>
          <polygon
            points={ENAMEL}
            fill={c.light}
            stroke="var(--color-gold-700)"
            strokeWidth="0.7"
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
        </>
      )}
    </svg>
  );
}
