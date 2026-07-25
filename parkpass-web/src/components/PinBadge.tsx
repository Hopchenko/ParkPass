import type { CSSProperties } from "react";
import { COLORS, GLYPHS, type Glyph } from "@/data/parks";

type Props = {
  glyph: Glyph;
  color: number;
  size: number;
  strokeWidth?: number;
  style?: CSSProperties;
  className?: string;
};

/**
 * Placeholder enamel-pin artwork. Final per-park pin SVGs replace this 1:1
 * (same slot sizes: 46 / 74 / 156 px).
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
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      style={style}
      className={className}
      aria-hidden="true"
    >
      <circle cx="32" cy="32" r="30" fill={c.main} />
      <circle cx="32" cy="32" r="25" fill={c.light} stroke={c.dark} strokeWidth="1.5" />
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
        cy="17"
        rx="11"
        ry="5"
        fill="rgba(255,255,255,.38)"
        transform="rotate(-28 23 17)"
      />
    </svg>
  );
}
