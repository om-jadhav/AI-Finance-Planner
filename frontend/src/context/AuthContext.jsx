import { createContext, useContext, useState, useEffect, useCallback } from "react";
import api, { setAccessToken } from "../api/client";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // On app load, the access token is gone from memory (page refreshed),
  // but the httpOnly refresh cookie is still valid — so silently trade it
  // for a fresh access token instead of forcing a re-login every reload.
  useEffect(() => {
    async function tryRestoreSession() {
      try {
        const { data } = await api.post("/auth/refresh");
        setAccessToken(data.accessToken);
        const meRes = await api.get("/auth/me");
        setUser(meRes.data.user);
      } catch {
        setUser(null);
      } finally {
        setLoading(false);
      }
    }
    tryRestoreSession();
  }, []);

  const register = useCallback(async (name, email, password) => {
    const { data } = await api.post("/auth/register", { name, email, password });
    setAccessToken(data.accessToken);
    setUser(data.user);
  }, []);

  const login = useCallback(async (email, password) => {
    const { data } = await api.post("/auth/login", { email, password });
    setAccessToken(data.accessToken);
    setUser(data.user);
  }, []);

  const logout = useCallback(async () => {
    await api.post("/auth/logout").catch(() => {});
    setAccessToken(null);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, register, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
