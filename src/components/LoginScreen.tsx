import React from 'react';
import { useAuth } from '../contexts/AuthContext';

const LoginScreen: React.FC = () => {
  const { signIn, loading, error } = useAuth();

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-[var(--color-bg-05)]">
      {/* Main container */}
      <div className="w-full max-w-md flex flex-col items-center gap-12">
        {/* Logo and branding */}
        <div className="flex flex-col items-center gap-6">
          <img
            src="src/assets/logo_jelinek.svg"
            alt="Logo Jelínek"
            className="w-64 md:w-80"
          />
          <p className="text-[var(--color-primary-dark)] text-xl font-semibold tracking-wide">
            Hranolky a Spárovky
          </p>
        </div>

        {/* Sign in section */}
        <div className="w-full flex flex-col items-center gap-6">
          <button
            onClick={signIn}
            disabled={loading}
            className="w-full max-w-xs flex items-center justify-center gap-3 px-6 py-4 
                       bg-white border border-[var(--color-text-04)]/30 rounded-xl
                       text-[var(--color-text-01)] font-medium text-base
                       shadow-sm hover:shadow-md hover:border-[var(--color-primary)]
                       transition-all duration-200 ease-out
                       disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            <span>{loading ? 'Přihlašování...' : 'Přihlásit se pomocí Google'}</span>
          </button>

          {error && (
            <div className="w-full max-w-xs px-4 py-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600 text-sm text-center">
                Chyba přihlášení: {error.message}
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <p className="text-[var(--color-text-04)] text-sm">
          Nedaří se přihlásit? Kontaktuj Pavla Jelínka
        </p>
      </div>
    </div>
  );
};

export default LoginScreen;
