"use client";

import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { PARKS } from "@/data/parks";
import { hexPoints, LAND_HEXES, MAP_VIEWBOX, PARK_HEXES } from "@/data/mapHexes";
import type { Locale } from "@/i18n/routing";
import { useVisited } from "@/lib/visited";

export function SwedenMap() {
  const t = useTranslations("map");
  const locale = useLocale() as Locale;
  const router = useRouter();
  const { visited, count } = useVisited();

  const parkBySlug = new Map(PARKS.map((p) => [p.slug, p]));

  return (
    <div>
      <div className="flex items-center justify-between gap-2.5 px-[18px] pt-4 pb-3">
        <h1 className="font-heading text-[27px]">{t("title")}</h1>
        <span className="rounded-full bg-accent-100 px-2.5 py-[3px] text-[11px] tracking-[0.02em] text-accent-800">
          {t("count", { count })}
        </span>
      </div>

      <div className="px-8 pb-4">
        <svg
          viewBox={MAP_VIEWBOX}
          className="h-auto w-full"
          overflow="visible"
          role="img"
          aria-label={t("mapLabel")}
        >
          <g fill="var(--color-neutral-300)" stroke="none">
            {LAND_HEXES.map(([x, y]) => (
              <polygon key={`${x}-${y}`} points={hexPoints(x, y)} />
            ))}
          </g>
          <g stroke="none">
            {PARK_HEXES.map(({ slug, x, y }) => {
              const park = parkBySlug.get(slug);
              if (!park) return null;
              const isVisited = !!visited[slug];
              return (
                <polygon
                  key={slug}
                  points={hexPoints(x, y)}
                  fill={
                    isVisited ? "var(--color-accent)" : "var(--color-sage-400)"
                  }
                  role="link"
                  tabIndex={0}
                  aria-label={park.name}
                  className="cursor-pointer transition-[fill-opacity] hover:fill-opacity-80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent"
                  onClick={() => router.push(`/park/${slug}`)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      router.push(`/park/${slug}`);
                    }
                  }}
                >
                  <title>{`${park.name} · ${park.region[locale]}`}</title>
                </polygon>
              );
            })}
          </g>
        </svg>
      </div>

      <div className="flex items-center justify-center gap-5 pb-5 text-[12.5px] text-neutral-700">
        <span className="flex items-center gap-1.5">
          <span
            className="inline-block h-3 w-3 rounded-full"
            style={{ background: "var(--color-accent)" }}
          />
          {t("legendVisited")}
        </span>
        <span className="flex items-center gap-1.5">
          <span
            className="inline-block h-3 w-3 rounded-full"
            style={{ background: "var(--color-sage-400)" }}
          />
          {t("legendTodo")}
        </span>
      </div>
    </div>
  );
}
