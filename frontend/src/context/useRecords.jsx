import { createContext, useContext } from 'react';

// 1. Creamos el contexto. Esta es la "pizarra mágica" en sí.
export const RecordContext = createContext();

// 2. Creamos una herramienta simple para poder usar la pizarra en otras páginas.
export const useRecords = () => {
  return useContext(RecordContext);
};

