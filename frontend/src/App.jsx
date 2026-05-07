// frontend/src/App.jsx
import { BrowserRouter, Routes, Route, Navigate, Outlet } from "react-router-dom";

import { AuthProvider } from "./context/AuthProvider";
import { useAuth } from "./context/useAuth";
import { RecordProvider } from "./context/RecordProvider";
import { ChartOfAccountsProvider } from "./context/ChartOfAccountsProvider";
import { ToastProvider } from "./context/useToast";
import { BookProvider } from "./context/BookProvider"; // ← nuevo

import MainLayout from "./components/MainLayout";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import BookDetail from "./pages/BookDetail";        // ← nuevo
import CreateRecord from "./pages/CreateRecord";
import JournalEntries from "./pages/JournalEntries";
import TAccounts from "./pages/TAccounts";
import TrialBalance from "./pages/TrialBalance";
import IncomeStatement from "./pages/IncomeStatement";
import FinancialPosition from "./pages/FinancialPosition";
import PendingAccounts from "./pages/PendingAccounts";
import ChartOfAccounts from "./pages/ChartOfAccounts";
import RecordsCalendarView from "./pages/RecordsCalendarView";


const ProtectedRoutes = () => {
  const { isAuthenticated, loading } = useAuth();
  if (loading) {
    return <div style={{ textAlign: "center", marginTop: "50px" }}>Cargando aplicación...</div>;
  }
  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
};

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route element={<ProtectedRoutes />}>
              <Route
                element={
                  <BookProvider>      {/* ← nuevo */}
                    <RecordProvider>
                      <ChartOfAccountsProvider>
                        <MainLayout />
                      </ChartOfAccountsProvider>
                    </RecordProvider>
                  </BookProvider>
                }
              >
                <Route path="/"                     element={<Dashboard />} />
                <Route path="/libros/:id"            element={<BookDetail />} />  {/* ← nuevo */}
                <Route path="/crear-registro"        element={<CreateRecord />} />
                <Route path="/asientos"              element={<JournalEntries />} />
                <Route path="/cuentas-t"             element={<TAccounts />} />
                <Route path="/balance"               element={<TrialBalance />} />
                <Route path="/estado-resultados"     element={<IncomeStatement />} />
                <Route path="/situacion-financiera"  element={<FinancialPosition />} />
                <Route path="/cuentas-pendientes"    element={<PendingAccounts />} />
                <Route path="/catalogo"              element={<ChartOfAccounts />} />
                <Route path="/calendario"            element={<RecordsCalendarView />} />
                
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