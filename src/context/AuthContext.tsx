import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { Session, User } from "@supabase/supabase-js";

import { authErrorMessage } from "@/lib/auth/authErrors";
import { MIN_PASSWORD_LENGTH, SIGNUP_APP, parseUserRole, type UserRole } from "@/lib/auth/constants";
import { createSupabaseClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/env";

export type AppUserProfile = {
  id: string;
  email: string | null;
  role: UserRole;
  displayName: string | null;
  createdAt: string | null;
};

type AuthStatus = "loading" | "authenticated" | "unauthenticated" | "unconfigured";

export type ProfileLoadState = "idle" | "loading" | "ready";

type AuthResult = { ok: true } | { ok: false; message: string };

type AuthContextValue = {
  status: AuthStatus;
  user: User | null;
  session: Session | null;
  profile: AppUserProfile | null;
  profileLoadState: ProfileLoadState;
  signIn: (email: string, password: string) => Promise<AuthResult>;
  signUp: (nickname: string, email: string, password: string) => Promise<AuthResult>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

function mapRowToProfile(
  user: User,
  row: { role: string | null; display_name: string | null; created_at: string | null } | null,
): AppUserProfile {
  return {
    id: user.id,
    email: user.email ?? null,
    role: parseUserRole(row?.role),
    displayName: row?.display_name ?? null,
    createdAt: row?.created_at ?? null,
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const supabase = useMemo(() => createSupabaseClient(), []);
  const configured = isSupabaseConfigured();

  const [status, setStatus] = useState<AuthStatus>(() => (configured ? "loading" : "unconfigured"));
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<AppUserProfile | null>(null);
  const [profileLoadState, setProfileLoadState] = useState<ProfileLoadState>("idle");

  const clearLocalAuth = useCallback(() => {
    setUser(null);
    setSession(null);
    setProfile(null);
    setProfileLoadState("idle");
    setStatus(configured ? "unauthenticated" : "unconfigured");
  }, [configured]);

  const loadProfileForUser = useCallback(
    async (u: User) => {
      if (!supabase) return;
      setProfileLoadState("loading");
      setProfile(mapRowToProfile(u, null));
      setStatus("authenticated");

      const { data, error } = await supabase
        .from("profiles")
        .select("role, display_name, created_at")
        .eq("id", u.id)
        .single();

      if (!error && data) {
        setProfile(mapRowToProfile(u, data));
      } else {
        setProfile(mapRowToProfile(u, null));
      }
      setProfileLoadState("ready");
    },
    [supabase],
  );

  const refreshProfile = useCallback(async () => {
    if (!supabase) return;
    const {
      data: { user: u },
    } = await supabase.auth.getUser();
    if (!u) {
      clearLocalAuth();
      return;
    }
    await loadProfileForUser(u);
  }, [clearLocalAuth, loadProfileForUser, supabase]);

  const signIn = useCallback(
    async (email: string, password: string): Promise<AuthResult> => {
      if (!supabase) return { ok: false, message: "Auth não configurado." };
      const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
      if (error) return { ok: false, message: authErrorMessage(error.message) };
      return { ok: true };
    },
    [supabase],
  );

  const signUp = useCallback(
    async (nickname: string, email: string, password: string): Promise<AuthResult> => {
      if (!supabase) return { ok: false, message: "Auth não configurado." };
      const trimmedNickname = nickname.trim();
      if (!trimmedNickname) {
        return { ok: false, message: "Informe um nickname." };
      }
      if (password.length < MIN_PASSWORD_LENGTH) {
        return {
          ok: false,
          message: `A senha deve ter pelo menos ${MIN_PASSWORD_LENGTH} caracteres.`,
        };
      }
      const { error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: {
            display_name: trimmedNickname,
            signup_app: SIGNUP_APP,
          },
        },
      });
      if (error) return { ok: false, message: authErrorMessage(error.message) };
      return { ok: true };
    },
    [supabase],
  );

  const signOut = useCallback(async () => {
    if (supabase) await supabase.auth.signOut();
    clearLocalAuth();
  }, [clearLocalAuth, supabase]);

  useEffect(() => {
    if (!supabase) return;

    let cancelled = false;

    async function applySession(s: Session | null) {
      if (!s?.user) {
        clearLocalAuth();
        return;
      }
      setUser(s.user);
      setSession(s);
      await loadProfileForUser(s.user);
    }

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, sess) => {
      if (cancelled) return;
      await applySession(sess);
    });

    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
  }, [clearLocalAuth, loadProfileForUser, supabase]);

  const value = useMemo<AuthContextValue>(
    () => ({
      status,
      user,
      session,
      profile,
      profileLoadState,
      signIn,
      signUp,
      signOut,
      refreshProfile,
    }),
    [profile, profileLoadState, refreshProfile, session, signIn, signOut, signUp, status, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
}
