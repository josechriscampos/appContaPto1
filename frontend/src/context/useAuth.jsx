    import { createContext, useContext } from 'react';

    // 1. Creamos y exportamos el contexto de autenticación
    export const AuthContext = createContext();

    // 2. Creamos y exportamos el "hook" para usar el contexto
    export const useAuth = () => {
      const context = useContext(AuthContext);
      if (!context) {
        throw new Error("useAuth debe usarse dentro de un AuthProvider");
      }
      return context;
    };
    
