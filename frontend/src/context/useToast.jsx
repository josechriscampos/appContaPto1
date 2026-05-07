// frontend/src/context/useToast.jsx
import { createContext, useContext, useState, useCallback } from "react";

const ToastContext = createContext();

// ✅ Provider y hook en el mismo archivo pero export correcto
export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((message, type = "success", duration = 3000) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, duration);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="toast-container">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`toast toast--${toast.type}`}
            onClick={() => removeToast(toast.id)}
          >
            <span className="toast-icon">
              {toast.type === "success" && "✅"}
              {toast.type === "error"   && "❌"}
              {toast.type === "warning" && "⚠️"}
              {toast.type === "info"    && "ℹ️"}
            </span>
            <span className="toast-message">{toast.message}</span>  {/* ← aquí */}
            <button
              className="toast-close"
              onClick={(e) => { e.stopPropagation(); removeToast(toast.id); }}
            >
              ×
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast debe usarse dentro de un ToastProvider");
  }
  return context;
}