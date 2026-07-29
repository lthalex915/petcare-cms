import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { LoginResponse, User } from "../types";
import api from "../services/api";

interface AuthContextValue {
  user: User | null;
  token: string | null;
  adminMode: boolean;
  loading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  setAdminMode: (enabled: boolean) => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [adminMode, setAdminModeState] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedToken = localStorage.getItem("petcare_token");
    const savedUser = localStorage.getItem("petcare_user");
    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
    }
    setAdminModeState(localStorage.getItem("petcare_admin_mode") === "true");
    setLoading(false);
  }, []);

  function setAdminMode(enabled: boolean) {
    setAdminModeState(enabled);
    localStorage.setItem("petcare_admin_mode", String(enabled));
  }

  async function login(username: string, password: string) {
    const response = await api.post<LoginResponse>("/auth/login", { username, password });
    const nextToken = response.data.token;
    const nextUser = response.data.user;
    localStorage.setItem("petcare_token", nextToken);
    localStorage.setItem("petcare_user", JSON.stringify(nextUser));
    setToken(nextToken);
    setUser(nextUser);
  }

  async function logout() {
    try {
      await api.post("/auth/logout");
    } finally {
      localStorage.removeItem("petcare_token");
      localStorage.removeItem("petcare_user");
      localStorage.removeItem("petcare_admin_mode");
      setToken(null);
      setUser(null);
      setAdminModeState(false);
    }
  }

  const value = useMemo(
    () => ({ user, token, adminMode, loading, login, logout, setAdminMode }),
    [user, token, adminMode, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
}
