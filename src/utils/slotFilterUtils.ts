/**
 * Slot Filter Utilities
 * 
 * Pure functions for filtering operations following Action Version Transparency (AVT).
 * Replaces class-based SlotFiltersClass methods with pure, testable functions.
 */

import { WarehouseSlotClass } from 'hranolky-firestore-common';
import { SlotFiltersClass, IntervalMmClass } from '../model/SlotFilter';

/**
 * Check if a slot matches the given filters
 */
export function matchesFilters(slot: WarehouseSlotClass, filters: SlotFiltersClass): boolean {
  if (filters.isEmpty()) {
    return true;
  }

  const matchesQuality = filters.qualityFilters.size === 0 ||
    filters.qualityFilters.has(slot.quality ?? "");

  const matchesThickness = filters.thicknessFilters.size === 0 ||
    filters.thicknessFilters.has(slot.thickness ?? 0);

  const matchesWidth = filters.widthFilters.size === 0 ||
    filters.widthFilters.has(slot.width ?? 0);

  const matchesLengthInterval = filters.lengthIntervalFilters.size === 0 ||
    Array.from(filters.lengthIntervalFilters).some(
      (interval: IntervalMmClass) => interval.contains(slot.length ?? 0)
    );

  const matchesAllLength = filters.allLengthFilters.size === 0 ||
    filters.allLengthFilters.has(slot.length ?? 0);

  return matchesQuality && matchesThickness && matchesWidth && matchesLengthInterval && matchesAllLength;
}

/**
 * Filter slots by given filters (pure function)
 */
export function filterSlotsByFilters(
  slots: WarehouseSlotClass[],
  filters: SlotFiltersClass
): WarehouseSlotClass[] {
  return slots.filter(slot => matchesFilters(slot, filters));
}

/**
 * Calculate total volume of slots (pure function)
 */
export function calculateTotalVolume(slots: WarehouseSlotClass[]): number {
  return slots.reduce((sum, slot) => sum + (slot.getVolume() ?? 0), 0);
}

/**
 * Extract distinct filter values from slots (pure function)
 */
export function extractDistinctValues(slots: WarehouseSlotClass[]) {
  return {
    qualities: new Set(slots.map(s => s.quality ?? "").filter(q => q !== "")),
    thicknesses: new Set(slots.map(s => s.thickness ?? 0).filter(t => t !== 0)),
    widths: new Set(slots.map(s => s.width ?? 0).filter(w => w !== 0)),
    lengths: new Set(slots.map(s => s.length ?? 0).filter(l => l !== 0))
  };
}

/**
 * Count active filters (pure function)
 */
export function countActiveFilters(filters: SlotFiltersClass): number {
  return filters.getNumberOfActiveFilters();
}

/**
 * Create a filter with one quality added
 */
export function addQualityFilter(
  filters: SlotFiltersClass,
  quality: string
): SlotFiltersClass {
  const newQualities = new Set(filters.qualityFilters);
  newQualities.add(quality);
  return new SlotFiltersClass(
    filters.typeFilters,
    newQualities,
    filters.thicknessFilters,
    filters.widthFilters,
    filters.lengthIntervalFilters,
    filters.allLengthFilters
  );
}

/**
 * Create a filter with one quality removed
 */
export function removeQualityFilter(
  filters: SlotFiltersClass,
  quality: string
): SlotFiltersClass {
  const newQualities = new Set(filters.qualityFilters);
  newQualities.delete(quality);
  return new SlotFiltersClass(
    filters.typeFilters,
    newQualities,
    filters.thicknessFilters,
    filters.widthFilters,
    filters.lengthIntervalFilters,
    filters.allLengthFilters
  );
}

/**
 * Toggle a filter value (pure function)
 */
export function toggleFilter<T>(set: Set<T>, value: T): Set<T> {
  const newSet = new Set(set);
  if (newSet.has(value)) {
    newSet.delete(value);
  } else {
    newSet.add(value);
  }
  return newSet;
}
