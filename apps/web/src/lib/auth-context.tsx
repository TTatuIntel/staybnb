"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { AuthUser, LoginInput, RegisterInput } from "@staybnb/shared";
import { api } from "./api";
import { resetSocket } from "./socket";

interface AuthState {
  user: AuthUser | null;
  /** true until the first /auth/me round-trip finishes */
  loading: boolean;
  login: (input: LoginInput) => Promise<AuthUser>;
  register: (input: RegisterInput) => Promise<AuthUser>;
  logout: () => Promise<void>;
  becomeHost: () => Promise<AuthUser>;
  refresh: () => Promise<void>;
}

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const { user } = await api<{ user: AuthUser }>("/auth/me");
      setUser(user);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  // Restore the session from the auth cookie once, on mount. The API call is an
  // external subscription: state is only set from its callback, never synchronously.
  useEffect(() => {
    let cancelled = false;
    api<{ user: AuthUser }>("/auth/me")
      .then(({ user }) => {
        if (!cancelled) {
          setUser(user);
          setLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setUser(null);
          setLoading(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const login = useCallback(async (input: LoginInput) => {
    const { user } = await api<{ user: AuthUser }>("/auth/login", { method: "POST", body: input });
    setUser(user);
    resetSocket();
    return user;
  }, []);

  const register = useCallback(async (input: RegisterInput) => {
    const { user } = await api<{ user: AuthUser }>("/auth/register", { method: "POST", body: input });
    setUser(user);
    resetSocket();
    return user;
  }, []);

  const logout = useCallback(async () => {
    await api("/auth/logout", { method: "POST" });
    setUser(null);
    resetSocket();
  }, []);

  const becomeHost = useCallback(async () => {
    const { user } = await api<{ user: AuthUser }>("/auth/become-host", { method: "POST" });
    setUser(user);
    return user;
  }, []);

  const value = useMemo(
    () => ({ user, loading, login, register, logout, becomeHost, refresh }),
    [user, loading, login, register, logout, becomeHost, refresh],
  );
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
