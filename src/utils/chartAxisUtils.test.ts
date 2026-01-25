import { describe, it, expect } from 'vitest';
import { calculateYAxisConfig, filterInventoryCheckWeeks, isInventoryCheckWeek } from './chartAxisUtils';

describe('chartAxisUtils', () => {
  describe('calculateYAxisConfig', () => {
    it('returns default config for empty data', () => {
      const result = calculateYAxisConfig([]);
      expect(result.yDomain).toEqual([0, 100]);
      expect(result.yTicks).toEqual([0, 25, 50, 75, 100]);
    });

    it('calculates config for small values', () => {
      const data = [{ week: '2026_01', volume: 5 }, { week: '2026_02', volume: 8 }];
      const result = calculateYAxisConfig(data);
      expect(result.yDomain[0]).toBe(0);
      expect(result.yDomain[1]).toBeGreaterThanOrEqual(8);
    });

    it('uses adaptive step for large values', () => {
      const data = [{ week: '2026_01', volume: 150 }];
      const result = calculateYAxisConfig(data);
      expect(result.yTicks[1] - result.yTicks[0]).toBe(25); // Step of 25 for values > 100
    });
  });

  describe('isInventoryCheckWeek', () => {
    it('returns true for inventory check weeks', () => {
      expect(isInventoryCheckWeek('2026_14', [14, 27, 40, 51])).toBe(true);
      expect(isInventoryCheckWeek('2026_27', [14, 27, 40, 51])).toBe(true);
    });

    it('returns false for non-inventory weeks', () => {
      expect(isInventoryCheckWeek('2026_15', [14, 27, 40, 51])).toBe(false);
    });
  });

  describe('filterInventoryCheckWeeks', () => {
    it('filters to only inventory check weeks', () => {
      const data = [
        { week: '2026_13', volume: 10 },
        { week: '2026_14', volume: 20 },
        { week: '2026_15', volume: 30 },
      ];
      const result = filterInventoryCheckWeeks(data, [14, 27, 40, 51]);
      expect(result).toEqual(['2026_14']);
    });
  });
});
