// src/App.jsx
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';

import { AuthProvider } from './context/AuthProvider';
import { useAuth } from './context/useAuth';
import { RecordProvider } from './context/RecordProvider';
import { ChartOfAccountsProvider } from './context/ChartOfAccountsProvider';

import MainLayout from './components/MainLayout';
import Login from './pages/Login';
import CreateRecord from './pages/CreateRecord';
import JournalEntries from './pages/JournalEntries';
import TAccounts from './pages/TAccounts';
import TrialBalance from './pages/TrialBalance';
import IncomeStatement from './pages/IncomeStatement';
import ChartOfAccounts from './pages/ChartOfAccounts';
import RecordsCalendarView from './pages/RecordsCalendarView';

const ProtectedRoutes = () => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ textAlign: 'center', marginTop: '50px' }}>
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
        <RecordProvider>
          <ChartOfAccountsProvider>
            <Routes>
              <Route path="/login" element={<Login />} />

              <Route element={<ProtectedRoutes />}>
                <Route element={<MainLayout />}>
                  <Route path="/" element={<CreateRecord />} />
                  <Route path="/asientos" element={<JournalEntries />} />
                  <Route path="/cuentas-t" element={<TAccounts />} />
                  <Route path="/balance" element={<TrialBalance />} />
                  <Route path="/estado-resultados" element={<IncomeStatement />} />
                  <Route path="/catalogo" element={<ChartOfAccounts />} />
                  <Route path="/calendario" element={<RecordsCalendarView />} />
                </Route>
              </Route>

              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </ChartOfAccountsProvider>
        </RecordProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
