import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { authAPI } from "../services/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null);
  const [loading, setLoading] = useState(true);

  // On mount — restore session via GET /api/auth/me
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) { setLoading(false); return; }
    authAPI.getMe()
      .then((data) => setUser(data.user || data))
      .catch(() => localStorage.removeItem("token"))
      .finally(() => setLoading(false));
  }, []);

  // POST /api/auth/login
  const login = useCallback(async (email, password) => {
    const data = await authAPI.login({ email, password });
    const token = data.token || data.data?.token;
    const user = data.user || data.data?.user;
    if (token) localStorage.setItem("token", token);
    setUser(user);
    return data;
  }, []);

  // POST /api/auth/signup
  const signup = useCallback(async (form) => {
    const data = await authAPI.signup(form);
    const token = data.token || data.data?.token;
    const user = data.user || data.data?.user;
    if (token) localStorage.setItem("token", token);
    setUser(user);
    return data;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("token");
    setUser(null);
  }, []);

  const isAdmin   = user?.role === "admin";
  const isManager = user?.role === "manager" || user?.role === "admin";

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout, isAdmin, isManager }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
