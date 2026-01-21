/**
 * Loading Overlay Component
 * 
 * Extracted from App.tsx following DRY principle.
 * Previously duplicated in authenticated and unauthenticated states.
 */

import React from 'react';

interface LoadingOverlayProps {
  message?: string;
  isVisible: boolean;
}

const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
  message = 'Načítání...',
  isVisible
}) => {
  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-[var(--color-bg-05)]/80 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-[var(--color-primary-light)] border-t-[var(--color-primary)] rounded-full animate-spin" />
        <span className="text-[var(--color-text-01)] text-base">{message}</span>
      </div>
    </div>
  );
};

export default LoadingOverlay;
