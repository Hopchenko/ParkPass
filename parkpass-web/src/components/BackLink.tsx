"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

/** Tabs a park can be opened from; the key doubles as the `tabs` message key. */
const ORIGINS = { map: "/map", board: "/board" } as const;

type Origin = keyof typeof ORIGINS;

function isOrigin(value: string | null): value is Origin {
  return value === "map" || value === "board";
}

function BackLinkInner() {
  const t = useTranslations("tabs");
  const from = useSearchParams().get("from");
  const origin = isOrigin(from) ? from : null;

  return (
    <Link
      href={origin ? ORIGINS[origin] : "/"}
      className="flex min-h-[44px] w-fit items-center gap-0.5 px-2 py-2.5 text-[15px] font-bold text-accent-700"
    >
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="m15 18-6-6 6-6" />
      </svg>
      {t(origin ?? "parks")}
    </Link>
  );
}

/**
 * Returns to whichever tab the park was opened from (`?from=map|board`),
 * falling back to the parks list. Suspense keeps the park page static —
 * the origin is read on the client.
 */
export function BackLink() {
  return (
    <Suspense fallback={<div className="min-h-[44px]" />}>
      <BackLinkInner />
    </Suspense>
  );
}
