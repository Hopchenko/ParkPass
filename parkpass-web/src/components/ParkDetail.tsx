"use client";

import { useEffect, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { officialUrl, type Park } from "@/data/parks";
import type { Locale } from "@/i18n/routing";
import { formatVisitDate, useVisited } from "@/lib/visited";
import { BackLink } from "./BackLink";
import { ConfettiBurst } from "./ConfettiBurst";
import { PinBadge } from "./PinBadge";
import { VisitStamp } from "./VisitStamp";

export function ParkDetail({ park }: { park: Park }) {
  const t = useTranslations("detail");
  const locale = useLocale() as Locale;
  const { visited, mark, unmark } = useVisited();
  const [stamped, setStamped] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);

  const visitedDate = visited[park.slug];

  const handleMark = () => {
    mark(park.slug);
    setStamped(true);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setStamped(false), 1300);
  };

  const handleUnmark = () => {
    if (timer.current) clearTimeout(timer.current);
    setStamped(false);
    unmark(park.slug);
  };

  const fmt = new Intl.NumberFormat(locale === "sv" ? "sv-SE" : "en-GB");

  return (
    <div className="flex flex-1 flex-col">
      <div className="px-2.5 pt-1.5">
        <BackLink />
      </div>

      <div className="flex flex-1 flex-col px-6 pb-7">
        <div className="relative flex justify-center pt-2 pb-1">
          <div
            style={{
              filter: visitedDate ? undefined : "grayscale(.85) opacity(.5)",
              animation: stamped
                ? "stampIn .55s cubic-bezier(.2,1.4,.4,1) both"
                : undefined,
            }}
          >
            <PinBadge
              glyph={park.glyph}
              color={park.color}
              slug={park.slug}
              size={210}
              strokeWidth={2.4}
            />
          </div>
          {stamped && <ConfettiBurst />}
        </div>

        <h1 className="mt-3 mb-0.5 text-center font-heading text-[29px] leading-[1.15]">
          {park.name}
        </h1>
        {park.sami && (
          <div className="text-center text-[14px] italic text-neutral-600">
            {park.sami}
          </div>
        )}

        <div className="my-4 mb-[18px] flex flex-wrap justify-center gap-2">
          <span className="rounded-full bg-sage-100 px-2.5 py-[3px] text-[11px] tracking-[0.02em] text-sage-800">
            {park.region[locale]}
          </span>
          <span className="rounded-full bg-neutral-100 px-2.5 py-[3px] text-[11px] tracking-[0.02em] text-neutral-800">
            {t("est", { year: String(park.year) })}
          </span>
          <span className="rounded-full bg-neutral-100 px-2.5 py-[3px] text-[11px] tracking-[0.02em] text-neutral-800">
            {t("area", { area: fmt.format(park.area) })}
          </span>
        </div>

        <p className="mb-[22px] text-center text-[15px] leading-[1.55] text-neutral-800 [text-wrap:pretty]">
          {park.description[locale]}
        </p>

        {/* One fixed-height slot shared by both states: the pin button and the
            pinned card have different natural heights, so letting either size
            the container would jump the page on every toggle. */}
        <div className="mb-3 flex h-[60px]">
          {visitedDate ? (
            <div className="flex w-full items-center justify-center gap-2.5 rounded-md bg-sage-200 px-4">
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="var(--color-sage-700)"
              strokeWidth="2.75"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M20 6 9 17l-5-5" />
            </svg>
            <div className="text-[15px] font-bold text-sage-800">
              {t("pinned", { date: formatVisitDate(visitedDate, locale) })}
            </div>
            <button
              onClick={handleUnmark}
              className="min-h-[44px] cursor-pointer p-2 text-[13px] font-semibold text-sage-700 underline underline-offset-[3px]"
            >
              {t("undo")}
            </button>
            </div>
          ) : (
            <button
              onClick={handleMark}
              className="flex w-full cursor-pointer items-center justify-center rounded-full bg-accent px-4 font-heading text-[16px] text-ground hover:bg-accent-600 active:bg-accent-700"
            >
              {t("pinIt")}
            </button>
          )}
        </div>

        <a
          href={officialUrl(park.slug, locale)}
          target="_blank"
          rel="noopener noreferrer"
          className="flex min-h-[48px] w-full items-center justify-center rounded-full px-1 font-heading text-[14px] text-accent no-underline hover:bg-accent/10 active:bg-accent/18"
        >
          {t("official")}
        </a>

        {/* Height is reserved whether or not the park is stamped, so marking a
            visit never shifts the page. overflow-x-clip stops the animation's
            overshoot from widening the page (clip, not hidden — it must not
            become a scroll container). */}
        <div className="flex h-[172px] items-center justify-end overflow-x-clip pr-1">
          {visitedDate && <VisitStamp iso={visitedDate} animate={stamped} />}
        </div>

        {/* mt-auto pins this to the bottom of the page, clear of the stamp's
            animation so it isn't painted over mid-press. */}
        <p className="mt-auto pt-8 text-center text-[11.5px] text-neutral-500">
          {t("disclaimer")}
        </p>
      </div>
    </div>
  );
}
