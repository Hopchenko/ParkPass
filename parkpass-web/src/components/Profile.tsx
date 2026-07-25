"use client";

import { useState, type FormEvent } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { PARK_COUNT } from "@/data/parks";
import { useAuth } from "@/lib/auth";
import type { Locale } from "@/i18n/routing";
import { useVisited } from "@/lib/visited";

const OFFICIAL_CHECKLIST_URL =
  "https://www.sverigesnationalparker.se/inspiration-och-kunskap/krysslista";

function SyncCard() {
  const t = useTranslations("you");
  const locale = useLocale() as Locale;
  const { session, loading, signInWithGoogle, signInWithMagicLink, signOut } =
    useAuth();
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  if (loading) {
    return (
      <div className="flex flex-col gap-2.5 rounded-[32px] bg-surface px-5 py-[18px]">
        <div className="h-4 w-40 animate-pulse rounded-full bg-neutral-300" />
        <div className="h-3 w-full animate-pulse rounded-full bg-neutral-300" />
      </div>
    );
  }

  if (session) {
    return (
      <div className="flex flex-col gap-2.5 rounded-[32px] bg-surface px-5 py-[18px]">
        <div className="text-[15px] font-extrabold">{t("syncTitle")}</div>
        <div className="text-[13.5px] leading-[1.5] text-neutral-700">
          {t("signedInAs", { email: session.user.email ?? "" })}
        </div>
        <button
          onClick={() => signOut()}
          className="mt-1 flex min-h-[48px] w-full cursor-pointer items-center justify-center rounded-full border border-divider font-heading text-[14px] text-ink"
        >
          {t("signOut")}
        </button>
      </div>
    );
  }

  async function handleGoogle() {
    setError(null);
    const { error } = await signInWithGoogle(locale);
    if (error) setError(error);
  }

  async function handleMagicLink(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const { error } = await signInWithMagicLink(email, locale);
    setBusy(false);
    if (error) setError(error);
    else setSent(true);
  }

  return (
    <div className="flex flex-col gap-2.5 rounded-[32px] bg-surface px-5 py-[18px]">
      <div className="text-[15px] font-extrabold">{t("syncTitle")}</div>
      <div className="text-[13.5px] leading-[1.5] text-neutral-700">
        {t("syncBody")}
      </div>
      <button
        onClick={handleGoogle}
        className="mt-1 flex min-h-[48px] w-full cursor-pointer items-center justify-center rounded-full bg-accent font-heading text-[14px] text-ground hover:bg-accent-600 active:bg-accent-700"
      >
        {t("signInGoogle")}
      </button>
      {sent ? (
        <div className="text-[13px] text-sage-700">{t("magicLinkSent")}</div>
      ) : (
        <form onSubmit={handleMagicLink} className="flex flex-col gap-2">
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={t("emailPlaceholder")}
            className="min-h-[44px] w-full rounded-full border border-divider bg-ground px-4 text-[14px] caret-accent placeholder:text-neutral-500 focus-visible:border-accent focus-visible:outline-offset-0"
          />
          <button
            type="submit"
            disabled={busy}
            className="flex min-h-[44px] w-full cursor-pointer items-center justify-center rounded-full border border-divider font-heading text-[14px] text-ink disabled:cursor-not-allowed disabled:opacity-50"
          >
            {t("signInEmail")}
          </button>
        </form>
      )}
      {error && <div className="text-[12.5px] text-accent-700">{error}</div>}
    </div>
  );
}

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

      <SyncCard />

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
