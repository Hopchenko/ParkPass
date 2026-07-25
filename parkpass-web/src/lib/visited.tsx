"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import { PARKS } from "@/data/parks";
import { useAuth } from "./auth";
import { createClient } from "./supabase/client";

const STORAGE_KEY = "parkpass-visited";

/** slug → ISO date (yyyy-mm-dd) of the visit. */
export type VisitedMap = Record<string, string>;

/* Local (anonymous) store — localStorage behind useSyncExternalStore so SSR
   hydrates cleanly: server renders EMPTY, client re-renders with real data. */
const EMPTY: VisitedMap = {};
let localCache: VisitedMap | null = null;
const listeners = new Set<() => void>();

function readLocal(): VisitedMap {
  if (localCache) return localCache;
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "null");
    localCache =
      parsed && typeof parsed === "object" && !Array.isArray(parsed)
        ? (parsed as VisitedMap)
        : {};
  } catch {
    localCache = {};
  }
  return localCache;
}

function writeLocal(next: VisitedMap) {
  localCache = next;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // Storage unavailable (private mode etc.) — progress won't survive reloads.
  }
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

const getLocalSnapshot = () => readLocal();
const getServerSnapshot = () => EMPTY;

type VisitedContextValue = {
  visited: VisitedMap;
  count: number;
  mark: (slug: string) => void;
  unmark: (slug: string) => void;
};

const VisitedContext = createContext<VisitedContextValue | null>(null);

export function VisitedProvider({ children }: { children: ReactNode }) {
  const { session, loading: authLoading } = useAuth();
  const localVisited = useSyncExternalStore(
    subscribe,
    getLocalSnapshot,
    getServerSnapshot,
  );
  // Remote snapshot — the source of truth once signed in. Ignored while signed out.
  const [remoteVisited, setRemoteVisited] = useState<VisitedMap>(EMPTY);
  // Guards the local→remote merge to run exactly once per signed-in user.
  const mergedFor = useRef<string | null>(null);

  useEffect(() => {
    if (authLoading || !session) return;

    let cancelled = false;
    const supabase = createClient();

    (async () => {
      const { data } = await supabase
        .from("visits")
        .select("park_slug, visited_at")
        .eq("user_id", session.user.id);

      const remote: VisitedMap = {};
      for (const row of data ?? []) remote[row.park_slug] = row.visited_at;

      if (mergedFor.current !== session.user.id) {
        mergedFor.current = session.user.id;
        const local = readLocal();
        const toUpload = Object.entries(local).filter(([slug]) => !(slug in remote));
        if (toUpload.length > 0) {
          await supabase.from("visits").upsert(
            toUpload.map(([park_slug, visited_at]) => ({
              user_id: session.user.id,
              park_slug,
              visited_at,
            })),
          );
          toUpload.forEach(([slug, date]) => (remote[slug] = date));
        }
        writeLocal({});
      }

      if (!cancelled) setRemoteVisited(remote);
    })();

    return () => {
      cancelled = true;
    };
  }, [session, authLoading]);

  const mark = useCallback(
    (slug: string) => {
      const date = new Date().toISOString().slice(0, 10);
      if (session) {
        setRemoteVisited((prev) => ({ ...prev, [slug]: date }));
        createClient()
          .from("visits")
          .upsert({ user_id: session.user.id, park_slug: slug, visited_at: date })
          .then(({ error }) => error && console.error(error));
      } else {
        writeLocal({ ...readLocal(), [slug]: date });
      }
    },
    [session],
  );

  const unmark = useCallback(
    (slug: string) => {
      if (session) {
        setRemoteVisited((prev) => {
          const next = { ...prev };
          delete next[slug];
          return next;
        });
        createClient()
          .from("visits")
          .delete()
          .eq("user_id", session.user.id)
          .eq("park_slug", slug)
          .then(({ error }) => error && console.error(error));
      } else {
        const next = { ...readLocal() };
        delete next[slug];
        writeLocal(next);
      }
    },
    [session],
  );

  const visited = session ? remoteVisited : localVisited;

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
