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
  secondaryAction?: () => void;
  secondaryLabel?: string;
}

const AccessDenied: React.FC<AccessDeniedProps> = ({
  title = 'Přístup odepřen',
  message = 'Tato část je určena pouze pro administrátory.',
  backPath = '/hranolky',
  backLabel = 'Zpět na sklad',
  secondaryAction,
  secondaryLabel
}) => {
  const navigate = useNavigate();

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-[var(--color-bg-05)] p-4">
      <div className="bg-[var(--color-bg-01)] p-8 rounded-3xl shadow-xl text-center">
        <h2 className="text-2xl font-bold text-red-500 mb-4">{title}</h2>
        <p>{message}</p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center mt-6">
          <button
            onClick={() => navigate(backPath)}
            className="px-6 py-3 bg-white text-black font-semibold rounded-xl hover:bg-[var(--color-primary)] transition-colors border border-gray-200"
          >
            {backLabel}
          </button>

          {secondaryAction && (
            <button
              onClick={secondaryAction}
              className="px-6 py-3 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition-colors"
            >
              {secondaryLabel || 'Odhlásit se'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default AccessDenied;
