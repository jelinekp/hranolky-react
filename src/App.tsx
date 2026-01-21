import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import Hranolky from './screens/Hranolky'
import Sparovky from './screens/Sparovky'
import AdminPanel from './screens/AdminPanel'
import { AuthProvider, useAuth } from './contexts/AuthContext';
import LoginScreen from './components/LoginScreen';
import LoadingOverlay from './components/LoadingOverlay';

function AppRoutes() {
  const location = useLocation();
  const { isAuthenticated, loading } = useAuth();

  useEffect(() => {
    const titles: Record<string, string> = {
      '/hranolky': 'Hranolky',
      '/sparovky': 'Spárovky',
      '/admin': 'Administrace',
    };

    const baseTitle = 'JELÍNEK - nábytek a matrace';
    const pageTitle = titles[location.pathname] || 'Hranolky';
    document.title = `${pageTitle} | ${baseTitle}`;
  }, [location.pathname]);

  // Show login screen if not authenticated
  if (!isAuthenticated) {
    return (
      <>
        <LoginScreen />
        <LoadingOverlay isVisible={loading} message="Přihlašování..." />
      </>
    );
  }

  return (
    <>
      <Routes>
        <Route path="/" element={<Navigate to="hranolky" replace />} />
        <Route path="hranolky" element={<Hranolky />} />
        <Route path="sparovky" element={<Sparovky />} />
        <Route path="admin" element={<AdminPanel />} />
      </Routes>
      <LoadingOverlay isVisible={loading} message="Načítání..." />
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter basename="/app">
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}


