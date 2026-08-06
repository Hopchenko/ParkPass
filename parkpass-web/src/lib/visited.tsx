"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import { PARKS } from "@/data/parks";

const STORAGE_KEY = "parkpass-visited";

/** slug → ISO date (yyyy-mm-dd) of the visit. */
export type VisitedMap = Record<string, string>;

const EMPTY: VisitedMap = {};
let cache: VisitedMap | null = null;
const listeners = new Set<() => void>();

function load(): VisitedMap {
  if (cache) return cache;
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "null");
    cache =
      parsed && typeof parsed === "object" && !Array.isArray(parsed)
        ? (parsed as VisitedMap)
        : {};
  } catch {
    // Corrupt value or storage unavailable — start fresh.
    cache = {};
  }
  return cache;
}

function write(next: VisitedMap) {
  cache = next;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // Storage unavailable (private mode etc.) — progress won't survive reloads.
  }
  listeners.forEach((listener) => listener());
}

let storageBound = false;

function subscribe(listener: () => void) {
  // Another tab (or devtools) writing the key would otherwise go unseen —
  // this cache would then clobber it on the next mark/unmark here.
  if (!storageBound) {
    storageBound = true;
    window.addEventListener("storage", (e) => {
      if (e.key !== STORAGE_KEY && e.key !== null) return;
      cache = null;
      listeners.forEach((l) => l());
    });
  }
  listeners.add(listener);
  return () => listeners.delete(listener);
}

const getSnapshot = () => load();
const getServerSnapshot = () => EMPTY;

type VisitedContextValue = {
  visited: VisitedMap;
  count: number;
  mark: (slug: string) => void;
  unmark: (slug: string) => void;
};

const VisitedContext = createContext<VisitedContextValue | null>(null);

export function VisitedProvider({ children }: { children: ReactNode }) {
  const visited = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const mark = useCallback((slug: string) => {
    // Local date, not toISOString() — that is UTC, which would stamp
    // "yesterday" for a pin made before 01:00/02:00 Swedish time.
    // sv-SE happens to format as YYYY-MM-DD.
    write({ ...load(), [slug]: new Date().toLocaleDateString("sv-SE") });
  }, []);

  const unmark = useCallback((slug: string) => {
    const next = { ...load() };
    delete next[slug];
    write(next);
  }, []);

  const count = useMemo(
    () => PARKS.reduce((n, p) => n + (visited[p.slug] ? 1 : 0), 0),
    [visited],
  );

  const value = useMemo(
    () => ({ visited, count, mark, unmark }),
    [visited, count, mark, unmark],
  );

  return (
    <VisitedContext.Provider value={value}>{children}</VisitedContext.Provider>
  );
}

export function useVisited(): VisitedContextValue {
  const ctx = useContext(VisitedContext);
  if (!ctx) throw new Error("useVisited must be used within VisitedProvider");
  return ctx;
}

export function formatVisitDate(iso: string, locale: string): string {
  try {
    return new Date(`${iso}T12:00:00`).toLocaleDateString(
      locale === "sv" ? "sv-SE" : "en-GB",
      { day: "numeric", month: "short", year: "numeric" },
    );
  } catch {
    return iso;
  }
}
