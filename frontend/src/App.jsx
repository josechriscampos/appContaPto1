// frontend/src/App.jsx
import { BrowserRouter, Routes, Route, Navigate, Outlet } from "react-router-dom";

import { AuthProvider } from "./context/AuthProvider";
import { useAuth } from "./context/useAuth";
import { RecordProvider } from "./context/RecordProvider";
import { ChartOfAccountsProvider } from "./context/ChartOfAccountsProvider";
import { ToastProvider } from "./context/useToast";
import { BookProvider } from "./context/BookProvider";

import MainLayout from "./components/MainLayout";
import Landing from "./pages/Landing";           // ← nuevo
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import BookDetail from "./pages/BookDetail";
import JournalEntries from "./pages/JournalEntries";
import TAccounts from "./pages/TAccounts";
import TrialBalance from "./pages/TrialBalance";
import IncomeStatement from "./pages/IncomeStatement";
import FinancialPosition from "./pages/FinancialPosition";
import PendingAccounts from "./pages/PendingAccounts";
import ChartOfAccounts from "./pages/ChartOfAccounts";
import RecordsCalendarView from "./pages/RecordsCalendarView";
import Settings from "./pages/Settings";

// ✅ Ruta pública — redirige al dashboard si ya está autenticado
const PublicRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return null;
  return isAuthenticated ? <Navigate to="/dashboard" replace /> : children;
};

// ✅ Ruta protegida — redirige al login si no está autenticado
const ProtectedRoutes = () => {
  const { isAuthenticated, loading } = useAuth();
  if (loading) {
    return (
      <div style={{ textAlign: "center", marginTop: "50px", fontFamily: "Poppins, sans-serif", color: "#6c757d" }}>
        Cargando aplicación...
      </div>
    );
  }
  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
};

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <Routes>
            {/* ✅ Landing — pública */}
            <Route path="/" element={
              <PublicRoute><Landing /></PublicRoute>
            } />

            {/* ✅ Login — pública */}
            <Route path="/login" element={
              <PublicRoute><Login /></PublicRoute>
            } />

            {/* ✅ Rutas protegidas */}
            <Route element={<ProtectedRoutes />}>
              <Route element={
                <BookProvider>
                  <RecordProvider>
                    <ChartOfAccountsProvider>
                      <MainLayout />
                    </ChartOfAccountsProvider>
                  </RecordProvider>
                </BookProvider>
              }>
                <Route path="/dashboard"             element={<Dashboard />} />
                <Route path="/libros/:id"             element={<BookDetail />} />
                <Route path="/asientos"               element={<JournalEntries />} />
                <Route path="/cuentas-t"              element={<TAccounts />} />
                <Route path="/balance"                element={<TrialBalance />} />
                <Route path="/estado-resultados"      element={<IncomeStatement />} />
                <Route path="/situacion-financiera"   element={<FinancialPosition />} />
                <Route path="/cuentas-pendientes"     element={<PendingAccounts />} />
                <Route path="/catalogo"               element={<ChartOfAccounts />} />
                <Route path="/calendario"             element={<RecordsCalendarView />} />
                <Route path="/configuracion"          element={<Settings />} />
              </Route>
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;