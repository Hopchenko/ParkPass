"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { PARKS } from "@/data/parks";
import type { Locale } from "@/i18n/routing";
import { formatVisitDate, useVisited } from "@/lib/visited";
import { PinBadge } from "./PinBadge";

type Chip = "all" | "visited" | "todo";

export function ParkList() {
  const t = useTranslations("parks");
  const tDetail = useTranslations("detail");
  const locale = useLocale() as Locale;
  const { visited, count } = useVisited();
  const [query, setQuery] = useState("");
  const [chip, setChip] = useState<Chip>("all");
  const [stuck, setStuck] = useState(false);
  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;
    const observer = new IntersectionObserver(
      ([entry]) => setStuck(!entry.isIntersecting),
      { threshold: 0 },
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, []);

  const parks = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = PARKS.filter(
      (p) =>
        !q ||
        `${p.name} ${p.sami ?? ""} ${p.region[locale]}`.toLowerCase().includes(q),
    );
    if (chip === "visited") list = list.filter((p) => visited[p.slug]);
    if (chip === "todo") list = list.filter((p) => !visited[p.slug]);
    return list;
  }, [query, chip, visited, locale]);

  const chips: { id: Chip; label: string }[] = [
    { id: "all", label: t("chipAll") },
    { id: "visited", label: t("chipPinned") },
    { id: "todo", label: t("chipTodo") },
  ];

  const fmt = new Intl.NumberFormat(locale === "sv" ? "sv-SE" : "en-GB");

  return (
    <div>
      <div className="px-[18px] pt-4 pb-1.5">
        <div className="flex items-center justify-between gap-2.5">
          <h1 className="flex items-center gap-2 font-heading text-[27px]">
            {t("title")}
            <span className="text-[21px]" aria-hidden="true">
              🇸🇪
            </span>
          </h1>
          <span className="rounded-full bg-accent-100 px-2.5 py-[3px] text-[11px] tracking-[0.02em] text-accent-800">
            {t("pinnedCount", { count })}
          </span>
        </div>
        <p className="text-[13.5px] leading-tight text-neutral-600">
          {t("subtitle")}
        </p>
      </div>

      <div ref={sentinelRef} aria-hidden="true" />
      <div
        className={`sticky top-0 z-10 flex flex-col gap-3 bg-ground px-[18px] py-2.5 transition-shadow duration-200 ${
          stuck ? "shadow-md" : "shadow-none"
        }`}
      >
        <input
          className="min-h-[44px] w-full rounded-full border border-divider bg-surface px-4 text-[15px] caret-accent placeholder:text-neutral-500 hover:border-neutral-500 focus-visible:border-accent focus-visible:outline-offset-0"
          placeholder={t("searchPlaceholder")}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <div className="flex gap-2">
          {chips.map((c) => {
            const active = chip === c.id;
            return (
              <button
                key={c.id}
                onClick={() => setChip(c.id)}
                className={`cursor-pointer rounded-full border-[1.5px] px-[15px] py-[9px] text-[13px] font-bold ${
                  active
                    ? "border-accent bg-accent text-white"
                    : "border-neutral-400 bg-transparent text-neutral-700"
                }`}
              >
                {c.label}
              </button>
            );
          })}
        </div>
      </div>

      <div>
        {parks.map((p) => {
          const visitedDate = visited[p.slug];
          return (
            <Link
              key={p.slug}
              href={`/park/${p.slug}`}
              className="flex items-center gap-4 border-b border-divider px-[18px] py-3 hover:bg-neutral-100"
            >
              <PinBadge
                glyph={p.glyph}
                color={p.color}
                slug={p.slug}
                size={100}
                strokeWidth={2.6}
                className="flex-none"
                style={visitedDate ? undefined : { filter: "grayscale(1) opacity(.38)" }}
              />
              <div className="min-w-0 flex-1">
                <div className="text-[18px] font-bold leading-tight">{p.name}</div>
                {p.sami && (
                  <div className="mt-0.5 text-[13px] italic text-neutral-500">
                    {p.sami}
                  </div>
                )}
                <div className="mt-1 text-[13px] leading-snug text-neutral-600">
                  {t("meta", {
                    region: p.region[locale],
                    year: String(p.year),
                    area: fmt.format(p.area),
                  })}
                </div>
                {visitedDate && (
                  <div className="mt-1.5 flex items-center gap-1 text-[12.5px] font-semibold text-sage-700">
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M20 6 9 17l-5-5" />
                    </svg>
                    {tDetail("pinned", {
                      date: formatVisitDate(visitedDate, locale),
                    })}
                  </div>
                )}
              </div>
            </Link>
          );
        })}
        {parks.length === 0 && (
          <div className="px-6 py-10 text-center text-[14px] text-neutral-600">
            {t("noResults")}
          </div>
        )}
      </div>
    </div>
  );
}
