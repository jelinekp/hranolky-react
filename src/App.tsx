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

  // Show loading spinner while checking auth state
  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
        color: '#ffffff',
        fontSize: '1.25rem'
      }}>
        Načítání...
      </div>
    );
  }

  // Show login screen if not authenticated
  if (!isAuthenticated) {
    return <LoginScreen />;
  }

  return (
    <Routes>
      <Route path="/" element={<Navigate to="hranolky" replace />} />
      <Route path="hranolky" element={<Hranolky />} />
      <Route path="sparovky" element={<Sparovky />} />
    </Routes>
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

