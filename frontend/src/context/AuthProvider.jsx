// frontend/src/context/AuthProvider.jsx
import { useState, useEffect } from "react";
import { AuthContext } from "./useAuth";
import API, { initCSRF } from "../api/axios";

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const verifySession = async () => {
      try {
        await initCSRF();
        const res = await API.get("/me");
        setUser(res.data);
        setIsAuthenticated(true);
      } catch {
        setUser(null);
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };

    verifySession();
  }, []);

  const login = async (email, password) => {
    const res = await API.post("/login", { email, password });
    setUser(res.data);
    setIsAuthenticated(true);
  };

  const logout = async () => {
    try {
      await API.post("/logout");
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error("Error en logout:", error);
      }
    } finally {
      // ✅ Limpiar localStorage al cerrar sesión
      localStorage.removeItem("activeRecordId");
      setUser(null);
      setIsAuthenticated(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};