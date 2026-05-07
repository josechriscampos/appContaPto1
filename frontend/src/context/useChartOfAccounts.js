// frontend/src/context/useChartOfAccounts.js
import { createContext, useContext } from "react";

export const ChartOfAccountsContext = createContext();

export const useChartOfAccounts = () => {
  const context = useContext(ChartOfAccountsContext);
  if (!context) {
    throw new Error("useChartOfAccounts debe usarse dentro de un ChartOfAccountsProvider");
  }
  return context;
};