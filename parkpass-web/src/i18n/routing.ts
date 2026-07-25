import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["sv", "en"],
  defaultLocale: "sv",
  localePrefix: "as-needed",
  // Always serve Swedish at "/" — no Accept-Language sniffing. English stays
  // reachable via the /en prefix and the language toggle on the You tab.
  localeDetection: false,
});

export type Locale = (typeof routing.locales)[number];
