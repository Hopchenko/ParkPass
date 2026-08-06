import type { MetadataRoute } from "next";
import { PARKS } from "@/data/parks";
import { SITE_URL } from "@/lib/site";

/**
 * Locale URLs follow next-intl's localePrefix "as-needed": Swedish (default)
 * is unprefixed, English lives under /en. Both variants are listed, each
 * carrying its alternates.
 */
const PATHS = [
  "/",
  "/map",
  "/board",
  "/you",
  ...PARKS.map((p) => `/park/${p.slug}`),
];

function url(path: string, locale: "sv" | "en"): string {
  const prefix = locale === "en" ? "/en" : "";
  return `${SITE_URL}${prefix}${path === "/" ? "" : path}`;
}

export default function sitemap(): MetadataRoute.Sitemap {
  return PATHS.flatMap((path) => {
    const alternates = {
      languages: { sv: url(path, "sv"), en: url(path, "en") },
    };
    return (["sv", "en"] as const).map((locale) => ({
      url: url(path, locale),
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      alternates,
    }));
  });
}
