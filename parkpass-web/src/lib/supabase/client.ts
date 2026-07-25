import { createBrowserClient } from "@supabase/ssr";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

/** Throws if env vars are missing — callers decide how to degrade (see lib/auth.tsx). */
export function createClient() {
  if (!url || !anonKey) {
    throw new Error("Supabase env vars are not configured");
  }
  return createBrowserClient(url, anonKey);
}
