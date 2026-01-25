import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { useEffect, Suspense, lazy } from 'react'
import { AuthProvider, useAuth } from './contexts/AuthContext';
import LoginScreen from './components/LoginScreen';
import LoadingOverlay from './components/LoadingOverlay';
import ErrorBoundary from './components/ErrorBoundary';

// Lazy load routes for code splitting (SoC - module boundaries)
const Hranolky = lazy(() => import('./screens/Hranolky'));
const Sparovky = lazy(() => import('./screens/Sparovky'));
const AdminPanel = lazy(() => import('./screens/AdminPanel'));

function AppRoutes() {
  const location = useLocation();
  const { isAuthenticated, loading, isAllowed } = useAuth();

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

  // Show access denied if not allowed
  if (!isAllowed) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        padding: '2rem',
        textAlign: 'center',
        flexDirection: 'column',
        gap: '1rem'
      }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>Přístup odepřen</h2>
        <p>Nemáte práva pro zobrazení, kontaktujte Pavla Jelínka na <a href="mailto:pavel.jelinek@jelinek.eu" style={{ textDecoration: 'underline' }}>pavel.jelinek@jelinek.eu</a></p>
        <button
          onClick={() => window.location.reload()}
          style={{
            marginTop: '1rem',
            padding: '0.5rem 1rem',
            backgroundColor: '#555',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Zkusit znovu
        </button>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <Suspense fallback={<LoadingOverlay isVisible={true} message="Načítání stránky..." />}>
        <Routes>
          <Route path="/" element={<Navigate to="hranolky" replace />} />
          <Route path="hranolky" element={<Hranolky />} />
          <Route path="sparovky" element={<Sparovky />} />
          <Route path="admin" element={<AdminPanel />} />
        </Routes>
      </Suspense>
      <LoadingOverlay isVisible={loading} message="Načítání..." />
    </ErrorBoundary>
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
