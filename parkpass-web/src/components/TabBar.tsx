"use client";

import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";

const TABS = [
  {
    href: "/",
    key: "parks",
    icon: "M17 14l3 3.3a1 1 0 0 1-.7 1.7H4.7a1 1 0 0 1-.7-1.7L7 14h-.3a1 1 0 0 1-.7-1.7L9 9h-.2A1 1 0 0 1 8 7.3L12 3l4 4.3a1 1 0 0 1-.8 1.7H15l3 3.3a1 1 0 0 1-.7 1.7H17Z M12 22v-3",
  },
  {
    href: "/board",
    key: "board",
    icon: "M12 14a6 6 0 1 0 0-12 6 6 0 0 0 0 12Z M15.5 12.9 17 22l-5-3-5 3 1.5-9.1",
  },
  {
    href: "/you",
    key: "you",
    icon: "M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2 M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z",
  },
] as const;

export function TabBar() {
  const t = useTranslations("tabs");
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-20 flex justify-center">
      <div className="flex w-full max-w-[430px] border-t border-divider bg-neutral-100 px-2.5 pt-1.5 pb-[max(4px,env(safe-area-inset-bottom))]">
        {TABS.map((tab) => {
          const active = pathname === tab.href;
          return (
            <Link
              key={tab.key}
              href={tab.href}
              aria-current={active ? "page" : undefined}
              className={`flex min-h-[52px] flex-1 flex-col items-center gap-[3px] pt-2 pb-1.5 text-[11px] font-bold ${
                active ? "text-accent-700" : "text-neutral-500"
              }`}
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.4"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d={tab.icon} />
              </svg>
              {t(tab.key)}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
