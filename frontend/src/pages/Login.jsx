// frontend/src/pages/Login.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../context/useAuth";
import API from "../api/axios";

const containerVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
};

const leftPanelVariants = {
  hidden: { opacity: 0, x: -30 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.7, ease: "easeOut", delay: 0.1 } },
};

const formVariants = {
  hidden: { opacity: 0, x: 25 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.45, ease: "easeOut" } },
  exit: { opacity: 0, x: -25, transition: { duration: 0.35, ease: "easeIn" } },
};

const UserIcon = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
    fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

const MailIcon = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
    fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <rect width="20" height="16" x="2" y="4" rx="2" />
    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
  </svg>
);

const LockIcon = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
    fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);

function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [isRegister, setIsRegister] = useState(false);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setSubmitting(true);

    try {
      if (isRegister) {
        await API.post("/register", { username, email, password });
        setSuccess("¡Registro exitoso! Ahora inicia sesión.");
        setIsRegister(false);
        setPassword("");
      } else {
        await login(email, password);
        navigate("/");
      }
    } catch (err) {
      if (import.meta.env.DEV) {
        console.error("Error en login/registro:", err);
      }
      setError(
        err.response?.data?.message || "Ocurrió un error. Intenta de nuevo."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const toggleForm = () => {
    setIsRegister((prev) => !prev);
    setError("");
    setSuccess("");
    setUsername("");
    setEmail("");
    setPassword("");
  };

  return (
    <div className="login-page">
      <motion.div className="login-container" variants={containerVariants} initial="hidden" animate="visible">

        {/* PANEL IZQUIERDO */}
        <motion.div className="left-panel" variants={leftPanelVariants} initial="hidden" animate="visible">
          <div className="image-overlay">
            <h2 className="overlay-title">Bienvenido de Nuevo</h2>
            <p className="overlay-subtitle">
              Filipenses 4:19: &quot;Mi Dios, pues, suplirá todo lo que os
              falta conforme a sus riquezas en gloria en Cristo Jesús&quot;.
            </p>
          </div>
        </motion.div>

        {/* PANEL DERECHO */}
        <AnimatePresence mode="wait">
          <motion.div
            key={isRegister ? "register" : "login"}
            className="right-panel"
            variants={formVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <h1 className="form-title">
              {isRegister ? "Crear Cuenta" : "Iniciar Sesión"}
            </h1>
            <p className="form-subtitle">
              {isRegister
                ? "Ingresa tus datos para registrarte"
                : "Ingresa tus credenciales para acceder"}
            </p>

            <form onSubmit={handleSubmit}>

              {/* CAMPO USERNAME — solo en registro */}
              {isRegister && (
                <div className="input-group">
                  <label htmlFor="username" className="input-label">
                    Nombre de Usuario
                  </label>
                  <div className="input-wrapper">
                    <UserIcon className="input-icon" />
                    <input
                      type="text"
                      id="username"
                      className="input-field"
                      placeholder="Ej: christian_campos"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      required
                      disabled={submitting}
                    />
                  </div>
                  {/* ✅ Mensaje de ayuda visible desde el inicio */}
                  <p className="input-hint">
                    Sin espacios. Puedes usar letras, números, guiones ( - ) y guiones bajos ( _ ).
                  </p>
                </div>
              )}

              {/* CAMPO EMAIL */}
              <div className="input-group">
                <label htmlFor="email" className="input-label">
                  Correo Electrónico
                </label>
                <div className="input-wrapper">
                  <MailIcon className="input-icon" />
                  <input
                    type="email"
                    id="email"
                    className="input-field"
                    placeholder="tucorreo@ejemplo.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={submitting}
                  />
                </div>
              </div>

              {/* CAMPO CONTRASEÑA */}
              <div className="input-group">
                <label htmlFor="password" className="input-label">
                  Contraseña
                </label>
                <div className="input-wrapper">
                  <LockIcon className="input-icon" />
                  <input
                    type="password"
                    id="password"
                    className="input-field"
                    placeholder="Ingresa tu contraseña"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={submitting}
                  />
                </div>
                {/* ✅ Mensaje de ayuda para contraseña — solo en registro */}
                {isRegister && (
                  <p className="input-hint">
                    Mínimo 8 caracteres, una mayúscula, una minúscula y un número.
                  </p>
                )}
              </div>

              {error && <p className="error-message">{error}</p>}
              {success && <p className="success-message">{success}</p>}

              <button
                type="submit"
                className="submit-button"
                disabled={submitting}
              >
                {submitting
                  ? "Procesando..."
                  : isRegister
                  ? "Registrarse"
                  : "Iniciar Sesión"}
              </button>
            </form>

            <div className="signup-link">
              {isRegister ? "¿Ya tienes una cuenta?" : "¿No tienes una cuenta?"}
              <span onClick={toggleForm}>
                {isRegister ? " Inicia sesión aquí" : " Regístrate aquí"}
              </span>
            </div>
          </motion.div>
        </AnimatePresence>
      </motion.div>
    </div>
  );
}

export default Login;