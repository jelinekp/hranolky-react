import { describe, it, expect } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useSlotFiltering, getDistinctFilterValues, filterSlots } from './useSlotFiltering'
import { WarehouseSlotClass } from 'hranolky-firestore-common'
import { SlotFiltersClass } from '../model/SlotFilter'

// Mock slot data
const createMockSlot = (id: string, props: Partial<{
  quality: string;
  thickness: number;
  width: number;
  length: number;
  quantity: number;
}> = {}) => {
  const slot = new WarehouseSlotClass(id, {
    quality: props.quality ?? 'DUB-A',
    thickness: props.thickness ?? 40,
    width: props.width ?? 100,
    length: props.length ?? 2000,
    quantity: props.quantity ?? 10
  });
  return slot;
};

describe('useSlotFiltering', () => {
  describe('getDistinctFilterValues', () => {
    it('extracts distinct qualities', () => {
      const slots = [
        createMockSlot('1', { quality: 'DUB-A' }),
        createMockSlot('2', { quality: 'DUB-R' }),
        createMockSlot('3', { quality: 'DUB-A' }) // duplicate
      ];

      const result = getDistinctFilterValues(slots);

      expect(result.qualities.size).toBe(2);
      expect(result.qualities.has('DUB-A')).toBe(true);
      expect(result.qualities.has('DUB-R')).toBe(true);
    });

    it('extracts distinct thicknesses', () => {
      const slots = [
        createMockSlot('1', { thickness: 40 }),
        createMockSlot('2', { thickness: 50 }),
        createMockSlot('3', { thickness: 40 }) // duplicate
      ];

      const result = getDistinctFilterValues(slots);

      expect(result.thicknesses.size).toBe(2);
      expect(result.thicknesses.has(40)).toBe(true);
      expect(result.thicknesses.has(50)).toBe(true);
    });

    it('filters out null/empty values', () => {
      const slots = [
        createMockSlot('1', { quality: '' }),
        createMockSlot('2', { quality: 'DUB-A' })
      ];

      const result = getDistinctFilterValues(slots);

      expect(result.qualities.size).toBe(1);
      expect(result.qualities.has('')).toBe(false);
    });
  });

  describe('filterSlots', () => {
    it('returns all slots when filters are empty', () => {
      const slots = [createMockSlot('1'), createMockSlot('2')];

      const result = filterSlots(slots, SlotFiltersClass.EMPTY);

      expect(result.length).toBe(2);
    });

    it('filters by quality', () => {
      const slots = [
        createMockSlot('1', { quality: 'DUB-A' }),
        createMockSlot('2', { quality: 'DUB-R' })
      ];
      const filters = new SlotFiltersClass(
        new Set(), new Set(['DUB-A']), new Set(), new Set(), new Set(), new Set()
      );

      const result = filterSlots(slots, filters);

      expect(result.length).toBe(1);
      expect(result[0].quality).toBe('DUB-A');
    });
  });

  describe('useSlotFiltering hook', () => {
    it('starts with empty filters', () => {
      const slots = [createMockSlot('1')];
      const { result } = renderHook(() => useSlotFiltering(slots));

      expect(result.current.activeFilters.isEmpty()).toBe(true);
      expect(result.current.hasActiveFilters).toBe(false);
    });

    it('returns all slots when no filters active', () => {
      const slots = [createMockSlot('1'), createMockSlot('2')];
      const { result } = renderHook(() => useSlotFiltering(slots));

      expect(result.current.filteredSlots.length).toBe(2);
    });

    it('updates filtered slots when filters change', () => {
      const slots = [
        createMockSlot('1', { quality: 'DUB-A' }),
        createMockSlot('2', { quality: 'DUB-R' })
      ];
      const { result } = renderHook(() => useSlotFiltering(slots));

      act(() => {
        result.current.setActiveFilters(new SlotFiltersClass(
          new Set(), new Set(['DUB-A']), new Set(), new Set(), new Set(), new Set()
        ));
      });

      expect(result.current.filteredSlots.length).toBe(1);
      expect(result.current.hasActiveFilters).toBe(true);
    });
  });
});
