/**
 * useSlotFiltering Hook
 * 
 * Centralizes slot filtering logic following Separation of States (SoS) principle.
 * Previously inline in ContentLayoutContainer.tsx
 */

import { useState, useMemo } from 'react';
import { WarehouseSlotClass } from 'hranolky-firestore-common';
import { SlotFiltersClass, IntervalMmClass } from '../model/SlotFilter';

export interface DistinctFilterValues {
  qualities: Set<string>;
  thicknesses: Set<number>;
  widths: Set<number>;
  lengths: Set<number>;
}

export interface SlotFilteringResult {
  activeFilters: SlotFiltersClass;
  setActiveFilters: React.Dispatch<React.SetStateAction<SlotFiltersClass>>;
  filteredSlots: WarehouseSlotClass[];
  volumeSum: number;
  distinctValues: DistinctFilterValues;
  hasActiveFilters: boolean;
}

/**
 * Extract distinct filter values from slots
 */
function getDistinctFilterValues(slots: WarehouseSlotClass[]): DistinctFilterValues {
  return {
    qualities: new Set(slots.map(slot => slot.quality ?? "").filter(q => q !== "")),
    thicknesses: new Set(slots.map(slot => slot.thickness ?? 0).filter(t => t !== 0)),
    widths: new Set(slots.map(slot => slot.width ?? 0).filter(w => w !== 0)),
    lengths: new Set(slots.map(slot => slot.length ?? 0).filter(l => l !== 0))
  };
}

/**
 * Filter slots based on active filters
 */
function filterSlots(
  slots: WarehouseSlotClass[],
  filters: SlotFiltersClass
): WarehouseSlotClass[] {
  if (filters.isEmpty()) {
    return slots;
  }

  return slots.filter((slot) => {
    const matchesQuality = filters.qualityFilters.size === 0 ||
      filters.qualityFilters.has(slot.quality ?? "");
    const matchesThickness = filters.thicknessFilters.size === 0 ||
      filters.thicknessFilters.has(slot.thickness ?? 0);
    const matchesWidth = filters.widthFilters.size === 0 ||
      filters.widthFilters.has(slot.width ?? 0);
    const matchesLength = filters.lengthIntervalFilters.size === 0 ||
      Array.from(filters.lengthIntervalFilters).some(
        (interval: IntervalMmClass) => interval.contains(slot.length ?? 0)
      );
    const matchesAllLength = filters.allLengthFilters.size === 0 ||
      filters.allLengthFilters.has(slot.length ?? 0);

    return matchesQuality && matchesThickness && matchesWidth && matchesLength && matchesAllLength;
  });
}

/**
 * Calculate total volume of slots
 */
function calculateVolume(slots: WarehouseSlotClass[]): number {
  return slots.reduce((sum, slot) => sum + (slot.getVolume() ?? 0), 0);
}

/**
 * Hook for slot filtering state management
 * Separates filter state from UI concerns (SoS)
 */
export const useSlotFiltering = (slots: WarehouseSlotClass[]): SlotFilteringResult => {
  const [activeFilters, setActiveFilters] = useState<SlotFiltersClass>(SlotFiltersClass.EMPTY);

  // Compute distinct values from all slots
  const distinctValues = useMemo(() => getDistinctFilterValues(slots), [slots]);

  // Compute filtered slots and volume
  const { filteredSlots, volumeSum } = useMemo(() => {
    const filtered = filterSlots(slots, activeFilters);
    const volume = calculateVolume(filtered);
    return { filteredSlots: filtered, volumeSum: volume };
  }, [slots, activeFilters]);

  return {
    activeFilters,
    setActiveFilters,
    filteredSlots,
    volumeSum,
    distinctValues,
    hasActiveFilters: !activeFilters.isEmpty()
  };
};

// Export pure functions for testing
export { getDistinctFilterValues, filterSlots, calculateVolume };
