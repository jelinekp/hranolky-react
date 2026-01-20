import { describe, it, expect } from 'vitest'
import { SlotFiltersClass, IntervalMmClass } from './SlotFilter'
import { SlotType } from 'hranolky-firestore-common'

describe('IntervalMmClass', () => {
  describe('contains', () => {
    it('returns true when value is within range', () => {
      const interval = new IntervalMmClass(600, 1199)

      expect(interval.contains(600)).toBe(true)
      expect(interval.contains(900)).toBe(true)
      expect(interval.contains(1199)).toBe(true)
    })

    it('returns false when value is outside range', () => {
      const interval = new IntervalMmClass(600, 1199)

      expect(interval.contains(599)).toBe(false)
      expect(interval.contains(1200)).toBe(false)
    })

    it('returns false for null value', () => {
      const interval = new IntervalMmClass(600, 1199)

      expect(interval.contains(null)).toBe(false)
    })
  })

  describe('toString', () => {
    it('formats interval correctly', () => {
      const interval = new IntervalMmClass(600, 1199)

      expect(interval.toString()).toBe('600 - 1199')
    })
  })
})

describe('SlotFiltersClass', () => {
  describe('isEmpty', () => {
    it('returns true for empty filters', () => {
      const filters = SlotFiltersClass.EMPTY

      expect(filters.isEmpty()).toBe(true)
    })

    it('returns false when quality filter is set', () => {
      const filters = new SlotFiltersClass(
        new Set(),
        new Set(['DUB A/A']),
        new Set(),
        new Set(),
        new Set(),
        new Set()
      )

      expect(filters.isEmpty()).toBe(false)
    })

    it('returns false when thickness filter is set', () => {
      const filters = new SlotFiltersClass(
        new Set(),
        new Set(),
        new Set([27]),
        new Set(),
        new Set(),
        new Set()
      )

      expect(filters.isEmpty()).toBe(false)
    })

    it('returns false when width filter is set', () => {
      const filters = new SlotFiltersClass(
        new Set(),
        new Set(),
        new Set(),
        new Set([42]),
        new Set(),
        new Set()
      )

      expect(filters.isEmpty()).toBe(false)
    })

    it('returns false when length interval filter is set', () => {
      const filters = new SlotFiltersClass(
        new Set(),
        new Set(),
        new Set(),
        new Set(),
        new Set([{ start: 600, end: 1199 }]),
        new Set()
      )

      expect(filters.isEmpty()).toBe(false)
    })
  })

  describe('hasQualityFilters', () => {
    it('returns true when quality filters exist', () => {
      const filters = new SlotFiltersClass(
        new Set(),
        new Set(['DUB A/A', 'DUB B/B']),
        new Set(),
        new Set(),
        new Set(),
        new Set()
      )

      expect(filters.hasQualityFilters()).toBe(true)
    })

    it('returns false when no quality filters', () => {
      const filters = SlotFiltersClass.EMPTY

      expect(filters.hasQualityFilters()).toBe(false)
    })
  })

  describe('getNumberOfActiveFilters', () => {
    it('returns 0 for empty filters', () => {
      const filters = SlotFiltersClass.EMPTY

      expect(filters.getNumberOfActiveFilters()).toBe(0)
    })

    it('counts all filter types correctly', () => {
      const filters = new SlotFiltersClass(
        new Set([SlotType.Beam]),
        new Set(['DUB A/A', 'DUB B/B']), // 2 quality filters
        new Set([20, 27]), // 2 thickness filters
        new Set([42]), // 1 width filter
        new Set([{ start: 600, end: 1199 }]), // 1 length interval
        new Set([1200, 1500]) // 2 all length filters
      )

      // 2 + 2 + 1 + 1 + 2 = 8
      expect(filters.getNumberOfActiveFilters()).toBe(8)
    })
  })
})
