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
import { supabase } from "@/integrations/supabase/client";
import type { AppRole } from "@/lib/admin-types";
import { queryTable } from "@/lib/supabase-admin";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  role: AppRole | null;
  loading: boolean;
  isAdmin: boolean;
  isEditor: boolean;
  canEdit: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: Error | null }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const ROLE_PRIORITY: AppRole[] = ["admin", "editor", "viewer"];

function pickHighestRole(roles: AppRole[]): AppRole | null {
  for (const role of ROLE_PRIORITY) {
    if (roles.includes(role)) return role;
  }
  return null;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [role, setRole] = useState<AppRole | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchRole = useCallback(async (userId: string) => {
    try {
      const { data, error } = await queryTable("user_roles")
        .select("role")
        .eq("user_id", userId);

      if (error) {
        console.error("Error fetching role:", error);
        setRole(null);
        return;
      }

      const roles = ((data ?? []) as { role: AppRole }[]).map((r) => r.role);
      setRole(pickHighestRole(roles));
    } catch {
      setRole(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let mounted = true;

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      if (!mounted) return;
      setSession(nextSession);
      setUser(nextSession?.user ?? null);
      if (nextSession?.user) {
        void fetchRole(nextSession.user.id);
      } else {
        setRole(null);
        setLoading(false);
      }
    });

    supabase.auth.getSession().then(({ data: { session: current } }) => {
      if (!mounted) return;
      setSession(current);
      setUser(current?.user ?? null);
      if (current?.user) {
        void fetchRole(current.user.id);
      } else {
        setLoading(false);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [fetchRole]);

  const signIn = useCallback(async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error: error as Error | null };
  }, []);

  const signUp = useCallback(async (email: string, password: string) => {
    const redirectUrl = `${window.location.origin}/admin/dashboard`;
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: redirectUrl },
    });
    return { error: error as Error | null };
  }, []);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setRole(null);
  }, []);

  const resetPassword = useCallback(async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/admin`,
    });
    return { error: error as Error | null };
  }, []);

  const value = useMemo<AuthContextType>(
    () => ({
      user,
      session,
      role,
      loading,
      isAdmin: role === "admin",
      isEditor: role === "editor",
      canEdit: role === "admin" || role === "editor",
      signIn,
      signUp,
      signOut,
      resetPassword,
    }),
    [user, session, role, loading, signIn, signUp, signOut, resetPassword]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
