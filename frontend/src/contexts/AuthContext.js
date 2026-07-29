import { jsx as _jsx } from "react/jsx-runtime";
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import api from "../services/api";
const AuthContext = createContext(undefined);
export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);
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
    function setAdminMode(enabled) {
        setAdminModeState(enabled);
        localStorage.setItem("petcare_admin_mode", String(enabled));
    }
    async function login(username, password) {
        const response = await api.post("/auth/login", { username, password });
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
        }
        finally {
            localStorage.removeItem("petcare_token");
            localStorage.removeItem("petcare_user");
            localStorage.removeItem("petcare_admin_mode");
            setToken(null);
            setUser(null);
            setAdminModeState(false);
        }
    }
    const value = useMemo(() => ({ user, token, adminMode, loading, login, logout, setAdminMode }), [user, token, adminMode, loading]);
    return _jsx(AuthContext.Provider, { value: value, children: children });
}
export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) {
        throw new Error("useAuth must be used within AuthProvider");
    }
    return ctx;
}
