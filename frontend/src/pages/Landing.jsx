// frontend/src/pages/Landing.jsx
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";

const FEATURES = [
  {
    icon: "📒",
    title: "Libros Contables",
    desc: "Organiza la contabilidad de múltiples empresas cliente en libros separados. Cada libro contiene sus propios registros mensuales.",
  },
  {
    icon: "⚖️",
    title: "Asientos de Diario",
    desc: "Registra débitos y créditos con validación automática de balance. Cálculo automático de IVA, intereses y comisiones con solo escribir el porcentaje.",
  },
  {
    icon: "📊",
    title: "Reportes Financieros",
    desc: "Genera automáticamente Cuentas T, Balanza de Comprobación, Estado de Resultados y Estado de Situación Financiera.",
  },
  {
    icon: "⚠️",
    title: "Cuentas Pendientes",
    desc: "Identifica de forma inmediata cuentas por pagar, por cobrar e impuestos pendientes de declarar.",
  },
  {
    icon: "🔒",
    title: "Seguridad Avanzada",
    desc: "Protección CSRF, tokens JWT, rate limiting y aislamiento total de datos entre usuarios. Tu información siempre segura.",
  },
  {
    icon: "🖨️",
    title: "Exportar a PDF",
    desc: "Imprime o exporta cualquier reporte a PDF con encabezado formal, nombre de empresa y fecha de generación.",
  },
];

const SCREENSHOTS = [
  {
    label: "Dashboard",
    desc: "Vista general de tus libros contables con resumen financiero y alertas de cuentas pendientes.",
    emoji: "🏠",
  },
  {
    label: "Asientos de Diario",
    desc: "Interfaz intuitiva para registrar asientos con auto-balance, cálculo de IVA y guardado automático.",
    emoji: "📝",
  },
  {
    label: "Estado de Resultados",
    desc: "Reporte profesional con ingresos, costos y utilidad neta del período.",
    emoji: "📈",
  },
];

const STATS = [
  { value: "100%", label: "Datos aislados por usuario" },
  { value: "∞",    label: "Asientos sin límite de tamaño" },
  { value: "4",    label: "Reportes financieros automáticos" },
  { value: "13%",  label: "IVA calculado automáticamente" },
];

const TAGS = [
  "Libros por empresa",
  "Reportes automáticos",
  "Sin límite de asientos",
  "100% seguro",
];

function FeatureCard({ icon, title, desc }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: "white",
        borderRadius: "16px",
        padding: "28px",
        boxShadow: hovered ? "0 12px 30px rgba(0,105,62,0.12)" : "0 4px 20px rgba(0,0,0,0.06)",
        border: hovered ? "1px solid #00875A" : "1px solid #e9ecef",
        transform: hovered ? "translateY(-4px)" : "translateY(0)",
        transition: "all 0.3s ease",
        cursor: "default",
      }}
    >
      <div style={{ fontSize: "2.2rem", marginBottom: "14px" }}>{icon}</div>
      <h3 style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: "10px", color: "#1a1a2e" }}>
        {title}
      </h3>
      <p style={{ color: "#6c757d", fontSize: "0.9rem", lineHeight: 1.7, margin: 0 }}>
        {desc}
      </p>
    </div>
  );
}

function HeroButton({ onClick, children, variant }) {
  const [hovered, setHovered] = useState(false);
  const isPrimary = variant === "primary";
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: isPrimary ? "white" : "transparent",
        color: isPrimary ? "#00693E" : "white",
        border: isPrimary ? "none" : "2px solid rgba(255,255,255,0.4)",
        borderRadius: "12px",
        padding: "14px 32px",
        fontWeight: isPrimary ? 700 : 600,
        fontSize: "1rem",
        cursor: "pointer",
        transition: "all 0.2s ease",
        boxShadow: isPrimary
          ? hovered ? "0 12px 30px rgba(0,0,0,0.2)" : "0 8px 25px rgba(0,0,0,0.15)"
          : "none",
        transform: hovered ? "translateY(-3px)" : "translateY(0)",
        // eslint-disable-next-line no-dupe-keys
        background: isPrimary ? "white" : hovered ? "rgba(255,255,255,0.1)" : "transparent",
      }}
    >
      {children}
    </button>
  );
}

function NavButton({ onClick, children }) {
  const [hovered, setHovered] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: "linear-gradient(135deg, #00693E, #00875A)",
        color: "white",
        border: "none",
        borderRadius: "8px",
        padding: "8px 20px",
        fontWeight: 600,
        fontSize: "0.9rem",
        cursor: "pointer",
        transform: hovered ? "translateY(-2px)" : "translateY(0)",
        transition: "transform 0.2s ease",
      }}
    >
      {children}
    </button>
  );
}

function CTAButton({ onClick, children }) {
  const [hovered, setHovered] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: "linear-gradient(135deg, #00693E, #00875A)",
        color: "white",
        border: "none",
        borderRadius: "12px",
        padding: "16px 40px",
        fontWeight: 700,
        fontSize: "1.1rem",
        cursor: "pointer",
        transition: "all 0.2s ease",
        boxShadow: hovered
          ? "0 12px 30px rgba(0,105,62,0.4)"
          : "0 8px 25px rgba(0,105,62,0.3)",
        transform: hovered ? "translateY(-3px)" : "translateY(0)",
      }}
    >
      {children}
    </button>
  );
}

function Landing() {
  const navigate = useNavigate();
  const [activeScreenshot, setActiveScreenshot] = useState(0);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveScreenshot((prev) => (prev + 1) % SCREENSHOTS.length);
    }, 3500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{ fontFamily: "'Poppins', sans-serif", color: "#1a1a2e", overflowX: "hidden" }}>

      {/* ── NAVBAR ── */}
      <nav style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
        padding: "14px 40px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        background: scrolled ? "rgba(255,255,255,0.95)" : "transparent",
        backdropFilter: scrolled ? "blur(10px)" : "none",
        boxShadow: scrolled ? "0 2px 20px rgba(0,0,0,0.08)" : "none",
        transition: "all 0.3s ease",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div style={{
            width: 36, height: 36, borderRadius: "10px",
            background: "linear-gradient(135deg, #00693E, #00875A)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "18px",
          }}>
            📒
          </div>
          <span style={{ fontWeight: 700, fontSize: "1.2rem", color: "#00693E" }}>
            AppContable
          </span>
        </div>
        <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
          <a
            href="#features"
            style={{ color: "#6c757d", textDecoration: "none", fontWeight: 500, fontSize: "0.9rem" }}
          >
            Características
          </a>
          <a
            href="#about"
            style={{ color: "#6c757d", textDecoration: "none", fontWeight: 500, fontSize: "0.9rem" }}
          >
            Acerca de
          </a>
          <NavButton onClick={() => navigate("/login")}>Iniciar Sesión</NavButton>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #00693E 0%, #004d2e 50%, #00875A 100%)",
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        textAlign: "center", padding: "80px 20px 60px",
        position: "relative", overflow: "hidden",
      }}>
        <div style={{
          position: "absolute", width: 400, height: 400, borderRadius: "50%",
          background: "rgba(255,255,255,0.05)", top: -100, right: -100,
        }} />
        <div style={{
          position: "absolute", width: 250, height: 250, borderRadius: "50%",
          background: "rgba(255,255,255,0.05)", bottom: -50, left: -50,
        }} />

        <div style={{
          display: "inline-flex", alignItems: "center", gap: "8px",
          background: "rgba(255,255,255,0.15)", borderRadius: "50px",
          padding: "6px 16px", marginBottom: "24px", fontSize: "0.85rem", color: "white",
        }}>
          ✨ Contabilidad profesional para contadores modernos
        </div>

        <h1 style={{
          fontSize: "clamp(2.5rem, 6vw, 4rem)", fontWeight: 800,
          color: "white", lineHeight: 1.15, marginBottom: "20px", maxWidth: 750,
        }}>
          La contabilidad de tus clientes,{" "}
          <span style={{ color: "#a7f3d0" }}>organizada y segura</span>
        </h1>

        <p style={{
          fontSize: "clamp(1rem, 2vw, 1.2rem)", color: "rgba(255,255,255,0.85)",
          maxWidth: 600, lineHeight: 1.7, marginBottom: "40px",
        }}>
          AppContable te permite gestionar los registros contables de múltiples empresas
          desde un solo lugar. Asientos, reportes y estados financieros en segundos.
        </p>

        <div style={{ display: "flex", gap: "16px", flexWrap: "wrap", justifyContent: "center" }}>
          <HeroButton onClick={() => navigate("/login")} variant="primary">
            Comenzar ahora →
          </HeroButton>
          <HeroButton onClick={() => {}} variant="secondary">
            <a href="#features" style={{ color: "white", textDecoration: "none" }}>
              Ver características
            </a>
          </HeroButton>
        </div>

        <div style={{
          display: "flex", gap: "40px", marginTop: "70px",
          flexWrap: "wrap", justifyContent: "center",
        }}>
          {STATS.map((stat) => (
            <div key={stat.label} style={{ textAlign: "center" }}>
              <div style={{ fontSize: "2rem", fontWeight: 800, color: "#a7f3d0" }}>{stat.value}</div>
              <div style={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.7)", marginTop: "4px" }}>
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── CARACTERÍSTICAS ── */}
      <section id="features" style={{ padding: "100px 40px", background: "#f8f9fa" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "60px" }}>
            <span style={{
              background: "#d1fae5", color: "#00693E", borderRadius: "50px",
              padding: "6px 16px", fontSize: "0.85rem", fontWeight: 600,
            }}>
              Características
            </span>
            <h2 style={{ fontSize: "2.2rem", fontWeight: 700, marginTop: "16px", marginBottom: "12px" }}>
              Todo lo que necesita un contador profesional
            </h2>
            <p style={{ color: "#6c757d", fontSize: "1rem", maxWidth: 500, margin: "0 auto" }}>
              Diseñado específicamente para contadores que manejan múltiples empresas cliente.
            </p>
          </div>

          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
            gap: "24px",
          }}>
            {FEATURES.map((feature) => (
              <FeatureCard key={feature.title} {...feature} />
            ))}
          </div>
        </div>
      </section>

      {/* ── APP EN ACCIÓN ── */}
      <section id="about" style={{ padding: "100px 40px", background: "white" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "60px" }}>
            <span style={{
              background: "#d1fae5", color: "#00693E", borderRadius: "50px",
              padding: "6px 16px", fontSize: "0.85rem", fontWeight: 600,
            }}>
              La app en acción
            </span>
            <h2 style={{ fontSize: "2.2rem", fontWeight: 700, marginTop: "16px", marginBottom: "12px" }}>
              Diseñada para ser intuitiva
            </h2>
            <p style={{ color: "#6c757d", fontSize: "1rem", maxWidth: 500, margin: "0 auto" }}>
              Cada pantalla fue pensada para que el flujo contable sea rápido y sin errores.
            </p>
          </div>

          <div style={{ display: "flex", justifyContent: "center", gap: "12px", marginBottom: "32px", flexWrap: "wrap" }}>
            {SCREENSHOTS.map((s, i) => (
              <button
                key={s.label}
                onClick={() => setActiveScreenshot(i)}
                style={{
                  padding: "8px 20px", borderRadius: "50px",
                  border: "2px solid",
                  borderColor: activeScreenshot === i ? "#00693E" : "#dee2e6",
                  background: activeScreenshot === i ? "#00693E" : "white",
                  color: activeScreenshot === i ? "white" : "#6c757d",
                  fontWeight: 600, fontSize: "0.9rem", cursor: "pointer",
                  transition: "all 0.2s ease",
                }}
              >
                {s.label}
              </button>
            ))}
          </div>

          <div style={{
            background: "#f0fdf4",
            borderRadius: "20px", padding: "60px 40px",
            textAlign: "center", border: "1px solid #e9ecef",
            transition: "all 0.3s ease", minHeight: 280,
            display: "flex", flexDirection: "column",
            alignItems: "center", justifyContent: "center",
          }}>
            <div style={{ fontSize: "5rem", marginBottom: "20px" }}>
              {SCREENSHOTS[activeScreenshot].emoji}
            </div>
            <h3 style={{ fontSize: "1.4rem", fontWeight: 700, marginBottom: "12px", color: "#1a1a2e" }}>
              {SCREENSHOTS[activeScreenshot].label}
            </h3>
            <p style={{ color: "#6c757d", fontSize: "1rem", maxWidth: 500, lineHeight: 1.7 }}>
              {SCREENSHOTS[activeScreenshot].desc}
            </p>
          </div>

          <div style={{ display: "flex", justifyContent: "center", gap: "8px", marginTop: "20px" }}>
            {SCREENSHOTS.map((_, i) => (
              <div
                key={i}
                onClick={() => setActiveScreenshot(i)}
                style={{
                  width: activeScreenshot === i ? 24 : 8, height: 8,
                  borderRadius: "50px", cursor: "pointer",
                  background: activeScreenshot === i ? "#00693E" : "#dee2e6",
                  transition: "all 0.3s ease",
                }}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ── PROPÓSITO ── */}
      <section style={{
        padding: "100px 40px",
        background: "linear-gradient(135deg, #1a1a2e, #00693E)",
      }}>
        <div style={{ maxWidth: 800, margin: "0 auto", textAlign: "center" }}>
          <div style={{ fontSize: "3rem", marginBottom: "24px" }}>🎯</div>
          <h2 style={{ fontSize: "2.2rem", fontWeight: 700, color: "white", marginBottom: "20px" }}>
            Nuestro propósito
          </h2>
          <p style={{ color: "rgba(255,255,255,0.85)", fontSize: "1.1rem", lineHeight: 1.8, marginBottom: "20px" }}>
            AppContable nació para simplificar el trabajo diario de los contadores que
            gestionan múltiples empresas cliente. Creemos que las herramientas contables
            deben ser{" "}
            <strong style={{ color: "#a7f3d0" }}>accesibles, seguras y eficientes</strong>.
          </p>
          <p style={{ color: "rgba(255,255,255,0.7)", fontSize: "1rem", lineHeight: 1.8, marginBottom: "40px" }}>
            Desde el registro de asientos hasta los estados financieros finales,
            AppContable automatiza el flujo contable completo sin sacrificar la
            precisión ni la seguridad de los datos.
          </p>
          <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" }}>
            {TAGS.map((tag) => (
              <span key={tag} style={{
                background: "rgba(255,255,255,0.1)", color: "white",
                borderRadius: "50px", padding: "8px 18px",
                fontSize: "0.85rem", fontWeight: 500,
                border: "1px solid rgba(255,255,255,0.2)",
              }}>
                ✓ {tag}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA FINAL ── */}
      <section style={{ padding: "100px 40px", background: "#f8f9fa", textAlign: "center" }}>
        <div style={{ maxWidth: 600, margin: "0 auto" }}>
          <h2 style={{ fontSize: "2.2rem", fontWeight: 700, marginBottom: "16px" }}>
            ¿Listo para comenzar?
          </h2>
          <p style={{ color: "#6c757d", fontSize: "1rem", marginBottom: "36px", lineHeight: 1.7 }}>
            Crea tu cuenta gratis y empieza a organizar la contabilidad
            de tus clientes de forma profesional.
          </p>
          <CTAButton onClick={() => navigate("/login")}>
            Crear cuenta gratuita →
          </CTAButton>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{
        background: "#1a1a2e", color: "rgba(255,255,255,0.5)",
        padding: "30px 40px", textAlign: "center", fontSize: "0.85rem",
      }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", marginBottom: "8px" }}>
          <span style={{ fontSize: "1.2rem" }}>📒</span>
          <span style={{ color: "white", fontWeight: 700 }}>AppContable</span>
        </div>
        <p style={{ margin: 0 }}>
          © {new Date().getFullYear()} AppContable — Todos los derechos reservados
        </p>
      </footer>
    </div>
  );
}

export default Landing;