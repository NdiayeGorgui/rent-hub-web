"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { getToken, saveToken, logout as logoutFn } from "@/lib/auth";
import { getCurrentUser } from "@/services/authService";

type AuthContextType = {
  user: any;
  loading: boolean;
  login: (token: string) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: any) => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      const token = getToken();

      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const userData = await getCurrentUser();
        setUser(userData);
      } catch {
        logoutFn();
      } finally {
        setLoading(false);
      }
    };

    init();
  }, []);

  const login = async (token: string) => {
    saveToken(token);
    const userData = await getCurrentUser();
    setUser(userData);
  };

  const logout = () => {
    logoutFn();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext)!;
};