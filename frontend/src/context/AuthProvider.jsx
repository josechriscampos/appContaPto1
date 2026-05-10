// frontend/src/context/AuthProvider.jsx
import { useState, useEffect } from "react";
import { AuthContext } from "./useAuth";
import API, { initCSRF } from "../api/axios";

export const AuthProvider = ({ children }) => {
  const [user, setUser]                   = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading]             = useState(true);
  const [csrfReady, setCsrfReady]         = useState(false);

  useEffect(() => {
    const initialize = async () => {
      // ✅ Paso 1 — CSRF primero, antes de cualquier otra cosa
      try {
        await initCSRF();
      } catch {
        // Si falla, reintentamos una vez más
        try {
          await initCSRF();
        } catch {
          if (import.meta.env.DEV) console.error("No se pudo inicializar CSRF");
        }
      } finally {
        setCsrfReady(true); // ✅ Ya se puede interactuar con formularios
      }

      // ✅ Paso 2 — Verificar sesión existente
      try {
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

    initialize();
  }, []);

  const login = async (email, password) => {
    // ✅ Garantiza CSRF fresco antes de login
    if (!csrfReady) await initCSRF();
    const res = await API.post("/login", { email, password });
    setUser(res.data);
    setIsAuthenticated(true);
  };

  const register = async (username, email, password) => {
    // ✅ Garantiza CSRF fresco antes de registro
    if (!csrfReady) await initCSRF();
    const res = await API.post("/register", { username, email, password });
    setUser(res.data);
    setIsAuthenticated(true);
  };

  const logout = async () => {
    try {
      await API.post("/logout");
    } catch (error) {
      if (import.meta.env.DEV) console.error("Error en logout:", error);
    } finally {
      localStorage.removeItem("activeRecordId");
      setUser(null);
      setIsAuthenticated(false);
      // ✅ Renueva CSRF después del logout para la siguiente sesión
      try { await initCSRF(); } catch { /* silencioso */ }
    }
  };

  // ✅ Bloquea el render hasta que CSRF esté listo
  if (!csrfReady) {
    return (
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        fontFamily: "Poppins, sans-serif",
        color: "#6c757d",
        fontSize: "0.95rem",
      }}>
        Iniciando aplicación...
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{
      user, isAuthenticated, loading,
      login, logout, register,
    }}>
      {children}
    </AuthContext.Provider>
  );
};