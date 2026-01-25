import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { useEffect, Suspense, lazy } from 'react'
import { AuthProvider, useAuth } from './contexts/AuthContext';
import LoginScreen from './components/LoginScreen';
import LoadingOverlay from './components/LoadingOverlay';
import ErrorBoundary from './components/ErrorBoundary';
import AccessDenied from './components/admin/AccessDenied';

// Lazy load routes for code splitting (SoC - module boundaries)
const Hranolky = lazy(() => import('./screens/Hranolky'));
const Sparovky = lazy(() => import('./screens/Sparovky'));
const AdminPanel = lazy(() => import('./screens/AdminPanel'));

function AppRoutes() {
  const location = useLocation();
  const { isAuthenticated, loading, isAllowed, signOut } = useAuth();

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

  // Show generic loading while permissions are being determined for an authenticated user
  if (loading) {
    return <LoadingOverlay isVisible={true} message="Zjišťování oprávnění..." />;
  }

  // Show access denied if not allowed
  if (!isAllowed) {
    return (
      <AccessDenied
        title="Přístup odepřen"
        message="Nemáte práva pro zobrazení. Pro získání přístupu kontaktujte Pavla Jelínka na pavel.jelinek@jelinek.eu"
        backLabel="Zkusit znovu"
        backPath={location.pathname}
        secondaryAction={signOut}
        secondaryLabel="Odhlásit se"
      />
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
