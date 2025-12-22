import { createContext, useContext } from 'react';

// 1. Creamos y exportamos el contexto.
// Estará vacío aquí, el Provider le dará valor.
export const ChartOfAccountsContext = createContext();

// 2. Creamos y exportamos el hook personalizado.
// Este es el que usarán los componentes para acceder a los datos.
export const useChartOfAccounts = () => {
    const context = useContext(ChartOfAccountsContext);
    if (!context) {
        throw new Error("useChartOfAccounts debe usarse dentro de un ChartOfAccountsProvider");
    }
    return context;
};
