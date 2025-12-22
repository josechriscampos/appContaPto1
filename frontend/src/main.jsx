import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './styles.css'; // Asegúrate de que tus estilos globales se importen aquí

// Ya NO necesitamos BrowserRouter aquí, porque App.jsx ahora lo maneja.
// Al quitarlo, eliminamos el conflicto de tener dos Routers.
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);

