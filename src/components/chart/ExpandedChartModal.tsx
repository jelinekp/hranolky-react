/**
 * Expanded Chart Modal Component
 * 
 * Provides fullscreen modal functionality for charts following SoC principle.
 * Handles ESC key, backdrop click, and body scroll lock.
 */

import React, { useEffect, useCallback } from 'react';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faExpand, faCompress } from "@fortawesome/free-solid-svg-icons";

interface ExpandedChartModalProps {
  isExpanded: boolean;
  onToggle: () => void;
  title: string;
  children: React.ReactNode;
  loading?: boolean;
  loadingMessage?: string;
}

/**
 * Hook to handle ESC key and body scroll lock for expanded modal
 */
export const useExpandedModal = (isExpanded: boolean, onClose: () => void) => {
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape' && isExpanded) {
      onClose();
    }
  }, [isExpanded, onClose]);

  useEffect(() => {
    if (isExpanded) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isExpanded, handleKeyDown]);
};

/**
 * Backdrop overlay for expanded modal
 */
export const ModalBackdrop: React.FC<{ onClick: () => void }> = ({ onClick }) => (
  <div
    className="fixed inset-0 z-40"
    style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)', backdropFilter: 'blur(4px)' }}
    onClick={onClick}
  />
);

/**
 * Toggle button for expand/collapse
 */
export const ExpandToggleButton: React.FC<{
  isExpanded: boolean;
  onClick: () => void;
}> = ({ isExpanded, onClick }) => (
  <button
    onClick={onClick}
    className="p-2 rounded-lg hover:bg-gray-200 transition-colors border-0 outline-none bg-transparent cursor-pointer focus:outline-none active:outline-none"
    title={isExpanded ? 'Sbalit graf (Esc)' : 'Rozbalit graf'}
  >
    <FontAwesomeIcon
      icon={isExpanded ? faCompress : faExpand}
      className="text-gray-600"
    />
  </button>
);

/**
 * Full expanded chart modal container
 */
export const ExpandedChartModal: React.FC<ExpandedChartModalProps> = ({
  isExpanded,
  onToggle,
  title,
  children,
  loading = false,
  loadingMessage = 'Aktualizuji data...'
}) => {
  useExpandedModal(isExpanded, onToggle);

  return (
    <>
      {isExpanded && <ModalBackdrop onClick={onToggle} />}
      <div
        className={`bg-[var(--color-bg-01)] p-6 md:p-8 rounded-3xl shadow-lg transition-all duration-300 ${isExpanded ? 'fixed inset-6 md:inset-10 lg:inset-14 z-50 flex flex-col overflow-hidden' : ''
          }`}
      >
        <div className="flex justify-between items-center mb-4 flex-none">
          <h3 className="text-lg font-bold">{title}</h3>
          <div className="flex items-center gap-3">
            {loading && (
              <span className="text-sm text-gray-500 italic animate-pulse">
                {loadingMessage}
              </span>
            )}
            <ExpandToggleButton isExpanded={isExpanded} onClick={onToggle} />
          </div>
        </div>
        <div className={`relative ${isExpanded ? 'flex-1 min-h-0' : 'h-[400px]'}`}>
          {children}
        </div>
      </div>
    </>
  );
};

export default ExpandedChartModal;
