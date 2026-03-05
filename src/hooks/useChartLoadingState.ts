/**
 * useChartLoadingState Hook
 * 
 * Manages chart loading state for manual load triggers.
 * Extracted from VolumeInTimeChart following SoS principle.
 */

import { useState, useEffect } from 'react';

export interface ChartLoadingState {
  manualLoadRequested: boolean;
  setManualLoadRequested: (value: boolean) => void;
  shouldWaitForManualLoad: boolean;
  shouldFetchData: boolean;
}

const MANUAL_LOAD_THRESHOLD = 10;

/**
 * Hook for managing chart loading state
 * Separates loading logic from animation and rendering (SoS)
 */
export const useChartLoadingState = (
  hasActiveFilters: boolean,
  slotCount: number
): ChartLoadingState => {
  const [manualLoadRequested, setManualLoadRequested] = useState(false);

  // Should require manual load when filters are active with many slots
  const shouldWaitForManualLoad = hasActiveFilters && slotCount > MANUAL_LOAD_THRESHOLD;
  const shouldFetchData = !shouldWaitForManualLoad || manualLoadRequested;

  // Reset manual load request when filter state changes
  useEffect(() => {
    if (shouldWaitForManualLoad) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setManualLoadRequested(false);
    } else {
      setManualLoadRequested(true);
    }
  }, [hasActiveFilters, slotCount, shouldWaitForManualLoad]);

  return {
    manualLoadRequested,
    setManualLoadRequested,
    shouldWaitForManualLoad,
    shouldFetchData
  };
};

export { MANUAL_LOAD_THRESHOLD };
