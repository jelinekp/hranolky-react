import { describe, it, expect } from 'vitest'
import {
  matchesFilters,
  filterSlotsByFilters,
  extractDistinctValues,
  toggleFilter
} from './slotFilterUtils'
import { WarehouseSlotClass } from 'hranolky-firestore-common'
import { SlotFiltersClass } from '../model/SlotFilter'

const createMockSlot = (id: string, props: Partial<{
  quality: string;
  thickness: number;
  width: number;
  length: number;
}> = {}) => {
  return new WarehouseSlotClass(id, {
    quality: props.quality ?? 'DUB-A',
    thickness: props.thickness ?? 40,
    width: props.width ?? 100,
    length: props.length ?? 2000,
    quantity: 10
  });
};

describe('slotFilterUtils', () => {
  describe('matchesFilters', () => {
    it('returns true for empty filters', () => {
      const slot = createMockSlot('1');
      expect(matchesFilters(slot, SlotFiltersClass.EMPTY)).toBe(true);
    });

    it('filters by quality', () => {
      const slot = createMockSlot('1', { quality: 'DUB-A' });
      const filters = new SlotFiltersClass(
        new Set(), new Set(['DUB-R']), new Set(), new Set(), new Set(), new Set()
      );
      expect(matchesFilters(slot, filters)).toBe(false);
    });
  });

  describe('filterSlotsByFilters', () => {
    it('returns all slots for empty filters', () => {
      const slots = [createMockSlot('1'), createMockSlot('2')];
      const result = filterSlotsByFilters(slots, SlotFiltersClass.EMPTY);
      expect(result.length).toBe(2);
    });
  });

  describe('extractDistinctValues', () => {
    it('extracts unique values', () => {
      const slots = [
        createMockSlot('1', { quality: 'DUB-A' }),
        createMockSlot('2', { quality: 'DUB-R' }),
        createMockSlot('3', { quality: 'DUB-A' })
      ];
      const result = extractDistinctValues(slots);
      expect(result.qualities.size).toBe(2);
    });
  });

  describe('toggleFilter', () => {
    it('adds value if not present', () => {
      const set = new Set([1, 2]);
      const result = toggleFilter(set, 3);
      expect(result.has(3)).toBe(true);
    });

    it('removes value if present', () => {
      const set = new Set([1, 2, 3]);
      const result = toggleFilter(set, 2);
      expect(result.has(2)).toBe(false);
    });

    it('does not mutate original set', () => {
      const original = new Set([1, 2]);
      toggleFilter(original, 3);
      expect(original.has(3)).toBe(false);
    });
  });
});
