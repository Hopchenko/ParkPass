"use client";

import { useId } from "react";
import { useLocale, useTranslations } from "next-intl";

/** "24 JUL 2026" — short, uppercase, no trailing period in Swedish. */
function stampDate(iso: string, locale: string): string {
  try {
    return new Date(`${iso}T12:00:00`)
      .toLocaleDateString(locale === "sv" ? "sv-SE" : "en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
      .replace(/\./g, "")
      .toUpperCase();
  } catch {
    return iso;
  }
}

/**
 * A rubber-stamp mark for a visited park — deliberately imperfect: the ink is
 * roughened by a turbulence filter and the whole mark sits slightly askew, so
 * it reads as pressed by hand rather than drawn.
 */
export function VisitStamp({
  iso,
  animate = false,
}: {
  iso: string;
  animate?: boolean;
}) {
  const t = useTranslations("detail");
  const locale = useLocale();
  const roughId = useId();
  const arcId = useId();

  return (
      <svg
        width="164"
        height="164"
        viewBox="0 0 120 120"
        role="img"
        aria-label={t("stampAlt", { date: stampDate(iso, locale) })}
        style={{
          opacity: 0.85,
          transform: "rotate(-15deg)",
          // Delayed so the pin finishes stamping in before the mark lands;
          // eases in so it accelerates into the impact.
          animation: animate
            ? "stampPress .45s .25s cubic-bezier(.6,.04,.98,.335) both"
            : undefined,
        }}
      >
        <defs>
          {/* Uneven ink. Low frequency + small displacement gives a soft wobble
              rather than jitter, so letterforms stay readable. */}
          <filter id={roughId} x="-20%" y="-20%" width="140%" height="140%">
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.42"
              numOctaves="3"
              seed="7"
              result="noise"
            />
            <feDisplacementMap
              in="SourceGraphic"
              in2="noise"
              scale="1.1"
              xChannelSelector="R"
              yChannelSelector="G"
            />
          </filter>
          <path id={arcId} d="M 12,60 A 48,48 0 0 1 108,60" fill="none" />
        </defs>

        <g
          filter={`url(#${roughId})`}
          fill="var(--color-sage-700)"
          stroke="var(--color-sage-700)"
        >
          <circle cx="60" cy="60" r="56" fill="none" strokeWidth="2.6" />
          <circle cx="60" cy="60" r="44" fill="none" strokeWidth="1" />

          <text
            stroke="none"
            fontSize="9.5"
            fontWeight="700"
            letterSpacing="2.6"
            fontFamily="var(--font-body)"
          >
            <textPath href={`#${arcId}`} startOffset="50%" textAnchor="middle">
              PARKPASS
            </textPath>
          </text>

          <text
            x="60"
            y="55"
            stroke="none"
            textAnchor="middle"
            fontSize="13"
            fontWeight="800"
            letterSpacing="2.2"
            fontFamily="var(--font-body)"
          >
            {t("stampVisited")}
          </text>

          <text
            x="60"
            y="71"
            stroke="none"
            textAnchor="middle"
            fontSize="10.5"
            fontWeight="700"
            letterSpacing="0.8"
            fontFamily="var(--font-body)"
          >
            {stampDate(iso, locale)}
          </text>

          <text
            x="60"
            y="86"
            stroke="none"
            textAnchor="middle"
            fontSize="9"
            letterSpacing="3"
          >
            ★★★
          </text>
        </g>
      </svg>
  );
}
