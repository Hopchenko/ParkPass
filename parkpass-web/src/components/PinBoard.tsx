"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { PARKS } from "@/data/parks";
import { useVisited } from "@/lib/visited";
import { PinBadge } from "./PinBadge";

export function PinBoard() {
  const t = useTranslations("board");
  const { visited, count } = useVisited();

  return (
    <div>
      <div className="flex items-center justify-between gap-2.5 px-[18px] pt-4 pb-3">
        <h1 className="font-heading text-[27px]">{t("title")}</h1>
        <span className="rounded-full bg-accent-100 px-2.5 py-[3px] text-[11px] tracking-[0.02em] text-accent-800">
          {t("count", { count })}
        </span>
      </div>

      <div className="px-3.5 pt-1 pb-5">
        {/* Wooden frame */}
        <div
          className="rounded-[26px] p-2.5"
          style={{
            background:
              "linear-gradient(135deg, rgba(255,255,255,.14), rgba(0,0,0,.16)), repeating-linear-gradient(92deg, #8c5a2e 0px, #7a4c24 7px, #96632f 14px, #82522a 22px, #8f5d2d 30px)",
            boxShadow:
              "var(--shadow-md), inset 0 1px 2px rgba(255,255,255,.3), inset 0 -2px 4px rgba(0,0,0,.3)",
          }}
        >
          {/* Fabric surface */}
          <div
            className="rounded-md px-3 pt-5 pb-[22px]"
            style={{
              background:
                "url('/pinboard-fabric.avif') center / 280px repeat, #3a4a28",
              boxShadow:
                "inset 0 3px 12px rgba(0,0,0,.5), inset 0 -1px 3px rgba(255,255,255,.08)",
            }}
          >
            <div className="grid grid-cols-3 gap-x-2.5 gap-y-[18px]">
              {PARKS.map((p) => {
                const isVisited = !!visited[p.slug];
                return (
                  <Link
                    key={p.slug}
                    href={`/park/${p.slug}`}
                    className="flex flex-col items-center gap-[7px] px-0.5 py-1.5"
                  >
                    <PinBadge
                      glyph={p.glyph}
                      color={p.color}
                      size={74}
                      className="flex-none"
                      style={{
                        filter: isVisited
                          ? "drop-shadow(0 3px 3px rgba(0,0,0,.4))"
                          : "grayscale(1) opacity(.32) brightness(1.25)",
                      }}
                    />
                    <div
                      className="text-center text-[10.5px] font-bold leading-[1.25]"
                      style={{
                        color: isVisited ? "#f5ead8" : "rgba(245,234,216,.45)",
                        textShadow: "0 1px 2px rgba(0,0,0,.4)",
                      }}
                    >
                      {p.name}
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
