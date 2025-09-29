import React, { useState } from 'react';
import axios from 'axios'; // Importamos axios

// --- CONFIGURACIÓN DE LA API ---
// La URL base de tu backend. Cámbiala si tu puerto es diferente.
const API_URL = 'http://localhost:5003/api';


// --- Componente de Estilos (Con añadidos para la nueva página) ---
const LoginStyles = () => (
  <style>{`
    /* Estilos Generales y Contenedor Principal */
    .login-page {
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      background-color: #f3f4f6; /* bg-gray-100 */
      font-family: 'Inter', sans-serif;
    }

    .login-container {
      position: relative;
      display: flex;
      flex-direction: column;
      margin: 1.5rem;
      background-color: #ffffff;
      box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04); /* shadow-2xl */
      border-radius: 1rem;
    }

    /* Panel Izquierdo (Branding) */
    .left-panel {
      position: relative;
      display: none; /* Oculto en móvil por defecto */
      background-color: #166534; /* Fondo verde directo con CSS */
      width: 400px;
      border-top-left-radius: 1rem;
      border-bottom-left-radius: 1rem;
    }

    .image-overlay {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      display: none; /* Oculto en móvil por defecto */
      flex-direction: column;
      justify-content: center;
      align-items: center;
      color: #ffffff;
      text-align: center;
      padding: 2rem;
    }

    .overlay-title {
      font-size: 1.875rem; /* text-3xl */
      font-weight: 700;
    }

    .overlay-subtitle {
      margin-top: 0.5rem;
      font-size: 0.875rem; /* text-sm */
    }

    /* Panel Derecho (Formulario) */
    .right-panel {
      display: flex;
      flex-direction: column;
      justify-content: center;
      padding: 2rem;
      width: 100%;
      max-width: 450px;
      box-sizing: border-box;
    }

    .form-title {
      margin-bottom: 0.75rem;
      font-size: 2.25rem; /* text-4xl */
      font-weight: 700;
      color: #1f2937; /* text-gray-800 */
    }

    .form-subtitle {
      font-weight: 300; /* font-light */
      color: #9ca3af; /* text-gray-400 */
      margin-bottom: 2rem;
    }

    /* Grupos de Inputs y Labels */
    .input-group {
      padding-top: 1rem;
      padding-bottom: 1rem;
    }

    .input-label {
      display: block;
      margin-bottom: 0.5rem;
      font-size: 0.875rem; /* text-md */
      color: #4b5563; /* text-gray-600 */
    }

    .input-wrapper {
      position: relative;
    }

    .input-icon {
      position: absolute;
      left: 0.75rem;
      top: 50%;
      transform: translateY(-50%);
      color: #9ca3af; /* text-gray-400 */
    }

    .input-field {
      width: 100%;
      border: 1px solid #d1d5db; /* border-gray-300 */
      border-radius: 0.375rem;
      padding: 0.5rem 1rem 0.5rem 2.5rem;
      box-sizing: border-box; /* Asegura que el padding no afecte el ancho total */
    }

    .input-field:focus {
      outline: none;
      box-shadow: 0 0 0 2px #10b981; /* focus:ring-2 focus:ring-green-500 */
    }

    /* Mensaje de Error */
    .error-message {
      color: #ef4444; /* text-red-500 */
      font-size: 0.875rem; /* text-sm */
      margin-top: 0.5rem;
      text-align: center;
      padding-bottom: 1rem;
    }

    /* Opciones del Formulario (Recordarme, Olvidaste contraseña) */
    .form-options {
      display: flex;
      justify-content: space-between;
      width: 100%;
      padding-top: 1rem;
      padding-bottom: 1rem;
      font-size: 0.875rem;
      align-items: center;
    }

    .remember-me {
      display: flex;
      align-items: center;
      color: #4b5563;
    }
    .remember-me input {
      margin-right: 0.5rem;
    }

    .forgot-password {
      font-weight: 700;
      color: #059669; /* text-green-600 */
      cursor: pointer;
    }
    .forgot-password:hover {
      text-decoration: underline;
    }

    /* Botón de Submit */
    .submit-button {
      width: 100%;
      background-color: #059669; /* bg-green-600 */
      color: #ffffff;
      padding: 0.75rem;
      border: none;
      border-radius: 0.5rem;
      margin-bottom: 1.5rem;
      cursor: pointer;
      transition: all 0.2s ease-in-out;
    }

    .submit-button:hover {
      background-color: #047857; /* hover:bg-green-700 */
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06); /* hover:shadow-lg */
    }

    /* Enlace de Registro */
    .signup-link {
      text-align: center;
      color: #9ca3af; /* text-gray-400 */
    }

    .signup-link span {
      font-weight: 700;
      color: #059669; /* text-green-600 */
      margin-left: 0.5rem;
      cursor: pointer;
    }
    .signup-link span:hover {
      text-decoration: underline;
    }
    
    /* Estilos para la página "En Desarrollo" */
    .dev-page {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      background-color: #f3f4f6;
      font-family: 'Inter', sans-serif;
      color: #1f2937;
    }

    .dev-icon {
      color: #059669;
      margin-bottom: 1.5rem;
    }

    .dev-title {
      font-size: 3rem;
      font-weight: 700;
      margin-bottom: 1rem;
    }

    .dev-subtitle {
      font-size: 1.25rem;
      color: #6b7280;
    }


    /* Media Query para responsividad (diseño de 2 columnas en pantallas grandes) */
    @media (min-width: 768px) {
      .login-container {
        flex-direction: row;
      }
      .left-panel {
        display: block; /* Muestra el panel verde en pantallas grandes */
      }
      .image-overlay {
        display: flex; /* Muestra y centra el texto del overlay */
      }
      .right-panel {
        padding: 3.5rem;
      }
    }
  `}</style>
);


// --- Icon Components (inline SVG for simplicity) ---
const UserIcon = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
        <circle cx="12" cy="7" r="4"></circle>
    </svg>
);
const MailIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect width="20" height="16" x="2" y="4" rx="2" />
    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
  </svg>
);
const LockIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);
const WrenchIcon = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"></path>
    </svg>
);

// --- Página de "En Desarrollo" ---
const DevelopmentPage = () => (
    <div className="dev-page">
        <WrenchIcon className="dev-icon" />
        <h1 className="dev-title">App en Desarrollo</h1>
        <p className="dev-subtitle">¡Estamos construyendo algo increíble para ti!</p>
    </div>
);


// --- Main App Component ---
export default function App() {
  const [isRegister, setIsRegister] = useState(false);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false); // Estado para saber si el usuario está logueado

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
        if (isRegister) {
            // Lógica de Registro
            const res = await axios.post(`${API_URL}/register`, { username, email, password });
            console.log("Registro exitoso:", res.data);
            alert("¡Registro exitoso! Ahora inicia sesión.");
            setIsRegister(false);
        } else {
            // Lógica de Login
            const res = await axios.post(`${API_URL}/login`, { email, password });
            console.log("Login exitoso:", res.data);
            setIsAuthenticated(true); // <--- CAMBIO CLAVE: Actualiza el estado en lugar del alert
        }
    } catch (err) {
        console.error("Error de autenticación:", err.response);
        setError(err.response?.data?.message || "Ocurrió un error.");
    }
  };

  const toggleForm = () => {
      setIsRegister(!isRegister);
      setError('');
  }

  // Si el usuario está autenticado, muestra la página de "En Desarrollo"
  if (isAuthenticated) {
      return <DevelopmentPage />;
  }

  // Si no, muestra el formulario de login/registro
  return (
    <>
      <LoginStyles />
      <div className="login-page">
        <div className="login-container">
          
          <div className="left-panel">
            <div className="image-overlay">
                  <h2 className="overlay-title">Bienvenido de Nuevo</h2>
                  <p className="overlay-subtitle">Filipenses 4:19: "Mi Dios, pues, suplirá todo lo que os falta conforme a sus riquezas en gloria en Cristo Jesús".</p>
            </div>
          </div>

          <div className="right-panel">
            <h1 className="form-title">{isRegister ? 'Crear Cuenta' : 'Iniciar Sesión'}</h1>
            <p className="form-subtitle">
              {isRegister ? 'Ingresa tus datos para registrarte' : 'Ingresa tus credenciales para acceder'}
            </p>
            
            <form onSubmit={handleSubmit}>
              {isRegister && (
                <div className="input-group">
                  <label htmlFor="username" className="input-label">Nombre de Usuario</label>
                  <div className="input-wrapper">
                    <UserIcon className="input-icon" />
                    <input
                        type="text"
                        id="username"
                        className="input-field"
                        placeholder="Elige un nombre de usuario"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                    />
                  </div>
                </div>
              )}

              <div className="input-group">
                <label htmlFor="email" className="input-label">Correo Electrónico</label>
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
                  />
                </div>
              </div>

              <div className="input-group">
                <label htmlFor="password" className="input-label">Contraseña</label>
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
                  />
                </div>
              </div>

              {error && <p className="error-message">{error}</p>}
              
              {!isRegister && (
                  <div className="form-options">
                    <div className="remember-me">
                      <input type="checkbox" name="ch" id="ch" />
                      <label htmlFor="ch">Recordarme</label>
                    </div>
                    <span className="forgot-password">
                      ¿Olvidaste tu contraseña?
                    </span>
                  </div>
              )}

              <button type="submit" className="submit-button">
                {isRegister ? 'Registrarse' : 'Iniciar Sesión'}
              </button>
            </form>

            <div className="signup-link">
              {isRegister ? '¿Ya tienes una cuenta?' : '¿No tienes una cuenta?'}
              <span onClick={toggleForm}>
                {isRegister ? 'Inicia sesión aquí' : 'Regístrate aquí'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

