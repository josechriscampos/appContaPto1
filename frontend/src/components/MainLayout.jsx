// frontend/src/components/MainLayout.jsx
import { useState, useEffect } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";

const THEMES = [
  { id: "light",  label: "☀️ Claro"   },
  { id: "dark",   label: "🌙 Oscuro"  },
  { id: "slate",  label: "🌊 Pizarra" },
  { id: "forest", label: "🌿 Bosque"  },
];

function MainLayout() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const [theme, setTheme] = useState(
    () => localStorage.getItem("app-theme") || "light"
  );
  const [showThemeMenu, setShowThemeMenu] = useState(false);

  useEffect(() => {
    if (theme === "light") {
      document.documentElement.removeAttribute("data-theme");
    } else {
      document.documentElement.setAttribute("data-theme", theme);
    }
    localStorage.setItem("app-theme", theme);
  }, [theme]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest(".theme-selector")) {
        setShowThemeMenu(false);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate("/login", { replace: true });
  };

  const currentTheme = THEMES.find((t) => t.id === theme);

  return (
    <>
      <nav className="main-nav">
        <div className="nav-links">
          <NavLink to="/" end>Inicio</NavLink>
          <NavLink to="/calendario">Calendario</NavLink>
          <NavLink to="/catalogo">Catálogo</NavLink>
          <NavLink to="/asientos">Asientos</NavLink>
          <NavLink to="/cuentas-t">Cuentas T</NavLink>
          <NavLink to="/balance">Balance</NavLink>
          <NavLink to="/estado-resultados">Resultados</NavLink>
          <NavLink to="/situacion-financiera">Situación</NavLink>
          <NavLink to="/cuentas-pendientes">Pendientes</NavLink>
        </div>

        <div className="nav-actions">
          <div className="theme-selector">
            <button
              className="theme-toggle-btn"
              onClick={(e) => {
                e.stopPropagation();
                setShowThemeMenu((prev) => !prev);
              }}
              title="Cambiar tema"
            >
              {currentTheme?.label}
            </button>

            {showThemeMenu && (
              <div className="theme-menu">
                {THEMES.map((t) => (
                  <button
                    key={t.id}
                    className={`theme-option ${theme === t.id ? "active" : ""}`}
                    onClick={() => {
                      setTheme(t.id);
                      setShowThemeMenu(false);
                    }}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          <button onClick={handleLogout} className="logout-button">
            Cerrar Sesión
          </button>
        </div>
      </nav>

      <main>
        <Outlet />
      </main>
    </>
  );
}

export default MainLayout;