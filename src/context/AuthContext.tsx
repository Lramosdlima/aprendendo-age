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

import {
  AOMSTATS_UNSYNC_DB_UPDATE,
  aomStatsSyncPayloadToDbUpdate,
  profileRowToAomStatsFields,
  type AomStatsProfileSyncPayload,
} from "@/lib/aomstatsProfileSync";
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
  aomstatsId: string | null;
  logoPath: string | null;
  aomstatsAlias: string | null;
  aomstatsRr: number | null;
  aomstatsWins: number | null;
  aomstatsLosses: number | null;
  aomstatsWinRate: string | null;
  aomstatsRank: string | null;
  aomstatsSnapshotAt: string | null;
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
  syncAomStats: (payload: AomStatsProfileSyncPayload) => Promise<AuthResult>;
  unsyncAomStats: () => Promise<AuthResult>;
  refreshProfile: () => Promise<void>;
};

const PROFILE_SELECT =
  "role, display_name, created_at, aomstats_id, logo_path, aomstats_alias, aomstats_rr, aomstats_wins, aomstats_losses, aomstats_win_rate, aomstats_rank, aomstats_snapshot_at";

const AuthContext = createContext<AuthContextValue | null>(null);

/** GoTrue mantém lock durante onAuthStateChange — adiar evita deadlock ao consultar profiles. */
function deferAuthSideEffect(fn: () => void): void {
  window.setTimeout(fn, 0);
}

function mapRowToProfile(
  user: User,
  row: {
    role: string | null;
    display_name: string | null;
    created_at: string | null;
    aomstats_id: string | null;
    logo_path: string | null;
    aomstats_alias: string | null;
    aomstats_rr: number | null;
    aomstats_wins: number | null;
    aomstats_losses: number | null;
    aomstats_win_rate: string | null;
    aomstats_rank: string | null;
    aomstats_snapshot_at: string | null;
  } | null,
): AppUserProfile {
  const aom = row
    ? profileRowToAomStatsFields(row)
    : {
        aomstatsId: null,
        logoPath: null,
        aomstatsAlias: null,
        aomstatsRr: null,
        aomstatsWins: null,
        aomstatsLosses: null,
        aomstatsWinRate: null,
        aomstatsRank: null,
        aomstatsSnapshotAt: null,
      };

  return {
    id: user.id,
    email: user.email ?? null,
    role: parseUserRole(row?.role),
    displayName: row?.display_name ?? null,
    createdAt: row?.created_at ?? null,
    ...aom,
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
      if (!supabase) {
        setProfileLoadState("ready");
        return;
      }
      setProfileLoadState("loading");
      setProfile(mapRowToProfile(u, null));
      setStatus("authenticated");

      try {
        const { data, error } = await supabase.from("profiles").select(PROFILE_SELECT).eq("id", u.id).single();

        if (!error && data) {
          setProfile(mapRowToProfile(u, data));
        } else {
          setProfile(mapRowToProfile(u, null));
        }
      } catch {
        setProfile(mapRowToProfile(u, null));
      } finally {
        setProfileLoadState("ready");
      }
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

  const syncAomStats = useCallback(
    async (payload: AomStatsProfileSyncPayload): Promise<AuthResult> => {
      if (!supabase) return { ok: false, message: "Auth não configurado." };
      const {
        data: { user: u },
      } = await supabase.auth.getUser();
      if (!u) return { ok: false, message: "Sessão inválida." };

      const { error } = await supabase
        .from("profiles")
        .update(aomStatsSyncPayloadToDbUpdate(payload))
        .eq("id", u.id);

      if (error) return { ok: false, message: error.message };
      await loadProfileForUser(u);
      return { ok: true };
    },
    [loadProfileForUser, supabase],
  );

  const unsyncAomStats = useCallback(async (): Promise<AuthResult> => {
    if (!supabase) return { ok: false, message: "Auth não configurado." };
    const {
      data: { user: u },
    } = await supabase.auth.getUser();
    if (!u) return { ok: false, message: "Sessão inválida." };

    const { error } = await supabase.from("profiles").update(AOMSTATS_UNSYNC_DB_UPDATE).eq("id", u.id);
    if (error) return { ok: false, message: error.message };
    await loadProfileForUser(u);
    return { ok: true };
  }, [loadProfileForUser, supabase]);

  const signOut = useCallback(async () => {
    if (supabase) await supabase.auth.signOut();
    clearLocalAuth();
  }, [clearLocalAuth, supabase]);

  useEffect(() => {
    if (!supabase) return;

    let cancelled = false;

    function scheduleProfileLoad(u: User) {
      deferAuthSideEffect(() => {
        if (cancelled) return;
        void loadProfileForUser(u);
      });
    }

    function applySession(s: Session | null) {
      if (!s?.user) {
        clearLocalAuth();
        return;
      }
      setUser(s.user);
      setSession(s);
      scheduleProfileLoad(s.user);
    }

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, sess) => {
      if (cancelled) return;

      if (event === "TOKEN_REFRESHED" && sess?.user) {
        setUser(sess.user);
        setSession(sess);
        return;
      }

      applySession(sess);
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
      syncAomStats,
      unsyncAomStats,
      refreshProfile,
    }),
    [profile, profileLoadState, refreshProfile, session, signIn, signOut, signUp, status, syncAomStats, unsyncAomStats, user],
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
