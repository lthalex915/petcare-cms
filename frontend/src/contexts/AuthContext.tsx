import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { LoginResponse, User } from "../types";
import api from "../services/api";

interface AuthContextValue {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedToken = localStorage.getItem("petcare_token");
    const savedUser = localStorage.getItem("petcare_user");
    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

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
      setToken(null);
      setUser(null);
    }
  }

  const value = useMemo(
    () => ({ user, token, loading, login, logout }),
    [user, token, loading]
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
