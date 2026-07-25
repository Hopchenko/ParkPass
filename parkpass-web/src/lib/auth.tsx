"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import type { Session } from "@supabase/supabase-js";
import { getPathname } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { createClient } from "./supabase/client";

type AuthContextValue = {
  session: Session | null;
  loading: boolean;
  signInWithGoogle: (locale: Locale) => Promise<{ error?: string }>;
  signInWithMagicLink: (
    email: string,
    locale: Locale,
  ) => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

const supabaseConfigured = Boolean(
  process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
);

function callbackUrl(locale: Locale) {
  const next = getPathname({ href: "/you", locale });
  return `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  // Nothing to await when Supabase isn't configured yet — start "not loading".
  const [loading, setLoading] = useState(supabaseConfigured);

  useEffect(() => {
    if (!supabaseConfigured) return;
    const supabase = createClient();

    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_event, next) => {
      setSession(next);
    });

    return () => sub.subscription.unsubscribe();
  }, []);

  async function signInWithGoogle(locale: Locale) {
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo: callbackUrl(locale) },
      });
      return { error: error?.message };
    } catch {
      return { error: "Sign-in is not configured yet." };
    }
  }

  async function signInWithMagicLink(email: string, locale: Locale) {
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: { emailRedirectTo: callbackUrl(locale) },
      });
      return { error: error?.message };
    } catch {
      return { error: "Sign-in is not configured yet." };
    }
  }

  async function signOut() {
    try {
      await createClient().auth.signOut();
    } catch {
      // Not configured — nothing to sign out of.
    }
  }

  return (
    <AuthContext.Provider
      value={{ session, loading, signInWithGoogle, signInWithMagicLink, signOut }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
