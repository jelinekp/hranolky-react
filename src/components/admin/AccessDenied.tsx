/**
 * Access Denied Component
 * 
 * Shows access denied message for non-admin users.
 * Extracted from AdminPanel.tsx following SoC principle.
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';

interface AccessDeniedProps {
  title?: string;
  message?: string;
  backPath?: string;
  backLabel?: string;
}

const AccessDenied: React.FC<AccessDeniedProps> = ({
  title = 'Přístup odepřen',
  message = 'Tato část je určena pouze pro administrátory.',
  backPath = '/hranolky',
  backLabel = 'Zpět na sklad'
}) => {
  const navigate = useNavigate();

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="bg-[var(--color-bg-01)] p-8 rounded-3xl shadow-xl text-center">
        <h2 className="text-2xl font-bold text-red-500 mb-4">{title}</h2>
        <p>{message}</p>
        <button
          onClick={() => navigate(backPath)}
          className="inline-block mt-4 px-6 py-3 bg-white text-black font-semibold rounded-xl hover:bg-[var(--color-primary)] transition-colors"
        >
          {backLabel}
        </button>
      </div>
    </div>
  );
};

export default AccessDenied;
