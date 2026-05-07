// frontend/src/context/useRecords.jsx
import { createContext, useContext } from "react";

export const RecordContext = createContext();

export const useRecords = () => {
  const context = useContext(RecordContext);
  if (!context) {
    throw new Error("useRecords debe usarse dentro de un RecordProvider");
  }
  return context;
};