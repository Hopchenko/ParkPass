/**
 * Canonical site origin for absolute URLs (metadataBase, sitemap, robots).
 * Set NEXT_PUBLIC_SITE_URL once a custom domain exists; until then Vercel's
 * production URL is used, and localhost keeps local builds sane.
 */
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : "http://localhost:3000");
