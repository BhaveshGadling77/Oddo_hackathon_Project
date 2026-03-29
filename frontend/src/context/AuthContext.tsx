import React, { createContext, useContext, useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useGetMe } from "@workspace/api-client-react";
import { getAuthHeaders } from "@/lib/auth";
import type { User } from "@workspace/api-client-react/src/generated/api.schemas";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [_, setLocation] = useLocation();
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem("token"));
  
  const { data, isLoading, isError } = useGetMe({
    query: {
      enabled: !!token,
      retry: false,
    },
    request: { headers: getAuthHeaders() }
  });

  useEffect(() => {
    if (data && !isError) {
      setUser(data);
    } else if (isError) {
      localStorage.removeItem("token");
      setToken(null);
      setUser(null);
    }
  }, [data, isError]);

  const login = (newToken: string, newUser: User) => {
    localStorage.setItem("token", newToken);
    setToken(newToken);
    setUser(newUser);
  };

  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
    setLocation("/login");
  };

  return (
    <AuthContext.Provider value={{ user, isLoading: !!token && isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
