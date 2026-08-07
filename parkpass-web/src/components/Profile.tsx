"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { PARK_COUNT } from "@/data/parks";
import { decodeVisits, encodeVisits, type DecodeError } from "@/lib/passcode";
import { useVisited } from "@/lib/visited";

const OFFICIAL_CHECKLIST_URL =
  "https://www.sverigesnationalparker.se/inspiration-och-kunskap/krysslista";

const ERROR_KEY: Record<DecodeError, string> = {
  empty: "errorEmpty",
  charset: "errorCharset",
  length: "errorLength",
  checksum: "errorChecksum",
  version: "errorVersion",
};

export function Profile() {
  const t = useTranslations("you");
  const locale = useLocale();
  const { count, visited, merge } = useVisited();

  const [draft, setDraft] = useState("");
  const [copied, setCopied] = useState(false);
  const [status, setStatus] = useState<{ ok: boolean; text: string } | null>(
    null,
  );
  const copyTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (copyTimer.current) clearTimeout(copyTimer.current);
    };
  }, []);

  // No pins yet means no code worth showing — an empty one transfers nothing.
  const code = useMemo(
    () => (count > 0 ? encodeVisits(visited) : null),
    [count, visited],
  );

  const handleCopy = async () => {
    if (!code) return;
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      if (copyTimer.current) clearTimeout(copyTimer.current);
      copyTimer.current = setTimeout(() => setCopied(false), 2000);
    } catch {
      // Denied permission or a non-secure origin — the code is selectable.
      setStatus({ ok: false, text: t("copyFailed") });
    }
  };

  const handleImport = () => {
    const result = decodeVisits(draft);
    if (!result.ok) {
      setStatus({ ok: false, text: t(ERROR_KEY[result.error]) });
      return;
    }
    const { added, updated } = merge(result.visits);
    const parts: string[] = [];
    if (added) parts.push(t("importedPins", { count: added }));
    if (updated) parts.push(t("importedDates", { count: updated }));
    setStatus({
      ok: true,
      text: parts.length ? parts.join(" ") : t("importedNothing"),
    });
    setDraft("");
  };

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
        <div className="text-[15px] font-extrabold">{t("transferTitle")}</div>
        <div className="text-[13.5px] leading-[1.5] text-neutral-700">
          {t("transferBody")}
        </div>

        {code ? (
          <>
            <div className="mt-1 text-[11.5px] font-bold tracking-[0.06em] text-neutral-600 uppercase">
              {t("yourCode")}
            </div>
            <code className="rounded-md bg-neutral-100 px-3 py-2.5 font-mono text-[12.5px] leading-[1.6] break-words text-neutral-800 select-all">
              {code}
            </code>
            <button
              onClick={handleCopy}
              className="flex min-h-[48px] w-full cursor-pointer items-center justify-center rounded-full border border-divider font-heading text-[14px] text-ink hover:bg-accent/10 active:bg-accent/18"
            >
              {copied ? t("copied") : t("copy")}
            </button>
          </>
        ) : (
          <div className="mt-1 text-[13px] text-neutral-600">{t("noCode")}</div>
        )}

        <div className="mt-1.5 h-px bg-divider" />

        <label
          htmlFor="transfer-code"
          className="mt-0.5 text-[11.5px] font-bold tracking-[0.06em] text-neutral-600 uppercase"
        >
          {t("importLabel")}
        </label>
        <textarea
          id="transfer-code"
          rows={2}
          value={draft}
          onChange={(e) => {
            setDraft(e.target.value);
            setStatus(null);
          }}
          placeholder={t("importPlaceholder")}
          spellCheck={false}
          autoCapitalize="characters"
          autoCorrect="off"
          className="resize-none rounded-md border border-divider bg-neutral-100 px-3 py-2.5 font-mono text-[12.5px] leading-[1.6] break-words text-neutral-800 placeholder:text-neutral-500"
        />
        <button
          onClick={handleImport}
          className="flex min-h-[48px] w-full cursor-pointer items-center justify-center rounded-full bg-accent font-heading text-[14px] text-ground hover:bg-accent-600 active:bg-accent-700"
        >
          {t("import")}
        </button>
        {status && (
          <div
            role="status"
            className={`text-[13px] leading-[1.5] ${status.ok ? "text-sage-800" : "text-accent-700"}`}
          >
            {status.text}
          </div>
        )}
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
