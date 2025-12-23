import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import Hranolky from './screens/Hranolky'
import Sparovky from './screens/Sparovky'
import { AuthProvider, useAuth } from './contexts/AuthContext';
import LoginScreen from './components/LoginScreen';

function AppRoutes() {
  const location = useLocation();
  const { isAuthenticated, loading } = useAuth();

  useEffect(() => {
    const titles: Record<string, string> = {
      '/hranolky': 'Hranolky',
      '/sparovky': 'Spárovky',
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
        {/* Loading overlay */}
        {loading && (
          <div className="fixed inset-0 bg-[var(--color-bg-05)]/80 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="flex flex-col items-center gap-4">
              {/* Spinning circular progress indicator */}
              <div className="w-12 h-12 border-4 border-[var(--color-primary-light)] border-t-[var(--color-primary)] rounded-full animate-spin" />
              <span className="text-[var(--color-text-01)] text-base">Přihlašování...</span>
            </div>
          </div>
        )}
      </>
    );
  }

  return (
    <>
      <Routes>
        <Route path="/" element={<Navigate to="hranolky" replace />} />
        <Route path="hranolky" element={<Hranolky />} />
        <Route path="sparovky" element={<Sparovky />} />
      </Routes>
      {/* Loading overlay */}
      {loading && (
        <div className="fixed inset-0 bg-[var(--color-bg-05)]/80 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="flex flex-col items-center gap-4">
            {/* Spinning circular progress indicator */}
            <div className="w-12 h-12 border-4 border-[var(--color-primary-light)] border-t-[var(--color-primary)] rounded-full animate-spin" />
            <span className="text-[var(--color-text-01)] text-base">Načítání...</span>
          </div>
        </div>
      )}
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

