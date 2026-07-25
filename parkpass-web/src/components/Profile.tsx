"use client";

import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { PARK_COUNT } from "@/data/parks";
import { useVisited } from "@/lib/visited";

const OFFICIAL_CHECKLIST_URL =
  "https://www.sverigesnationalparker.se/inspiration-och-kunskap/krysslista";

export function Profile() {
  const t = useTranslations("you");
  const locale = useLocale();
  const { count } = useVisited();

  const pct = Math.round((count / PARK_COUNT) * 100);
  const remaining = PARK_COUNT - count;

  return (
    <div className="flex flex-col gap-4 px-5 pt-4 pb-6">
      <h1 className="font-heading text-[27px]">{t("title")}</h1>

      <div className="flex flex-col gap-3 rounded-[32px] bg-surface p-5">
        <div className="flex items-baseline gap-2">
          <span className="font-heading text-[44px] text-accent-700">{count}</span>
          <span className="text-[17px] font-bold text-neutral-600">{t("of31")}</span>
        </div>
        <div className="h-3.5 overflow-hidden rounded-full bg-neutral-300">
          <div
            className="h-full rounded-full bg-accent transition-[width] duration-500 ease-out"
            style={{ width: `${pct}%` }}
          />
        </div>
        <div className="text-[13.5px] text-neutral-700">
          {count === PARK_COUNT ? t("done") : t("toGo", { count: remaining })}
        </div>
      </div>

      <div className="flex flex-col gap-2 rounded-[32px] bg-sage-200 px-5 py-[18px]">
        <div className="text-[15px] font-extrabold text-sage-900">
          {t("diplomaTitle")}
        </div>
        <div className="text-[13.5px] leading-[1.5] text-sage-800">
          {t("diplomaBody")}
        </div>
        <a
          href={OFFICIAL_CHECKLIST_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[13.5px] font-bold text-sage-700"
        >
          {t("diplomaLink")}
        </a>
      </div>

      <div className="flex flex-col gap-2.5 rounded-[32px] bg-surface px-5 py-[18px]">
        <div className="text-[15px] font-extrabold">{t("syncTitle")}</div>
        <div className="text-[13.5px] leading-[1.5] text-neutral-700">
          {t("syncBody")}
        </div>
        <button
          disabled
          className="mt-1 flex min-h-[48px] w-full items-center justify-center rounded-full border border-divider font-heading text-[14px] text-ink opacity-60"
        >
          {t("signIn")}
        </button>
      </div>

      <div className="flex items-center justify-center gap-2 text-[12.5px] text-neutral-600">
        <span>{t("language")}:</span>
        <Link
          href="/you"
          locale="sv"
          className={locale === "sv" ? "font-bold text-accent-700" : "underline"}
        >
          Svenska
        </Link>
        ·
        <Link
          href="/you"
          locale="en"
          className={locale === "en" ? "font-bold text-accent-700" : "underline"}
        >
          English
        </Link>
      </div>

      <p className="text-center text-[11.5px] text-neutral-500">{t("honor")}</p>
    </div>
  );
}
