"use client";

import { useState, useEffect, createContext, useContext, useMemo, type ReactNode } from "react";
import { createClientSupabaseClient } from "@/lib/supabase/client";
import type { User, Session, SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

import React from "react";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function checkAdmin(supabase: any, userId: string): Promise<boolean> {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase as any).rpc("has_role", {
      _user_id: userId,
      _role: "admin",
    });
    if (error) {
      console.error("[checkAdmin] RPC error:", error.message);
      return false;
    }
    return !!data;
  } catch (e) {
    console.error("[checkAdmin] exception:", e);
    return false;
  }
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  isAdmin: boolean;
  signIn: (email: string, password: string) => ReturnType<SupabaseClient<Database>["auth"]["signInWithPassword"]>;
  signOut: () => ReturnType<SupabaseClient<Database>["auth"]["signOut"]>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const supabase = useMemo(() => createClientSupabaseClient(), []);
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const timeout = setTimeout(() => {
      if (isMounted) setLoading(false);
    }, 5000);

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, newSession) => {
        if (!isMounted) return;
        setSession(newSession);
        setUser(newSession?.user ?? null);
        if (!newSession?.user) {
          setIsAdmin(false);
          setLoading(false);
          return;
        }
        setTimeout(async () => {
          if (!isMounted) return;
          const admin = await checkAdmin(supabase, newSession.user.id);
          if (isMounted) {
            setIsAdmin(admin);
            setLoading(false);
          }
        }, 0);
      }
    );

    supabase.auth.getSession().then(async ({ data: { session: s } }) => {
      if (!isMounted) return;
      setSession(s);
      setUser(s?.user ?? null);
      if (s?.user) {
        const admin = await checkAdmin(supabase, s.user.id);
        if (isMounted) setIsAdmin(admin);
      }
      if (isMounted) setLoading(false);
    }).catch(() => {
      if (isMounted) setLoading(false);
    });

    return () => {
      isMounted = false;
      clearTimeout(timeout);
      subscription.unsubscribe();
    };
  }, [supabase]);

  const signIn = (email: string, password: string) =>
    supabase.auth.signInWithPassword({ email, password });

  const signOut = () => supabase.auth.signOut();

  return React.createElement(AuthContext.Provider, {
    value: { user, session, loading, isAdmin, signIn, signOut },
    children,
  });
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
