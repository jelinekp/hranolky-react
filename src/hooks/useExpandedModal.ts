/**
 * useExpandedModal Hook
 * 
 * Manages fullscreen modal state with ESC key handling and body scroll lock.
 * Extracted from VolumeInTimeChart following SoS principle.
 */

import { useState, useEffect, useCallback } from 'react';

export interface ExpandedModalState {
  isExpanded: boolean;
  setIsExpanded: (value: boolean) => void;
  toggleExpanded: () => void;
}

/**
 * Hook for managing expanded/fullscreen modal state
 * Handles ESC key to close and body scroll lock
 */
export const useExpandedModal = (initialExpanded = false): ExpandedModalState => {
  const [isExpanded, setIsExpanded] = useState(initialExpanded);

  const toggleExpanded = useCallback(() => {
    setIsExpanded(prev => !prev);
  }, []);

  // ESC key handler
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape' && isExpanded) {
      setIsExpanded(false);
    }
  }, [isExpanded]);

  // Manage event listener and body scroll
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

  return {
    isExpanded,
    setIsExpanded,
    toggleExpanded
  };
};

export default useExpandedModal;
