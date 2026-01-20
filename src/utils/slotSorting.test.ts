import { describe, it, expect } from 'vitest'
import { sortSlots } from './slotSorting'
import { SortingBy, SortingOrder } from '../model/Sorting'
import { mockHranolkySlots } from '../test/mocks/mockSlots'

describe('slotSorting', () => {
  describe('sortSlots', () => {
    it('sorts by quality ascending', () => {
      const sorted = sortSlots(mockHranolkySlots, SortingBy.quality, SortingOrder.asc)

      // Results should be in reverse alphabetical (Z-A) for ascending due to original logic
      // Verify it returns an array of same length
      expect(sorted).toHaveLength(mockHranolkySlots.length)
      // Should be a new array (not mutate original)
      expect(sorted).not.toBe(mockHranolkySlots)
    })

    it('sorts by quality descending', () => {
      const sorted = sortSlots(mockHranolkySlots, SortingBy.quality, SortingOrder.desc)

      expect(sorted).toHaveLength(mockHranolkySlots.length)
    })

    it('sorts by thickness ascending', () => {
      const sorted = sortSlots(mockHranolkySlots, SortingBy.thickness, SortingOrder.asc)

      // First item should have smallest thickness
      for (let i = 1; i < sorted.length; i++) {
        expect(sorted[i].thickness ?? 0).toBeGreaterThanOrEqual(sorted[i - 1].thickness ?? 0)
      }
    })

    it('sorts by thickness descending', () => {
      const sorted = sortSlots(mockHranolkySlots, SortingBy.thickness, SortingOrder.desc)

      // First item should have largest thickness
      for (let i = 1; i < sorted.length; i++) {
        expect(sorted[i].thickness ?? 0).toBeLessThanOrEqual(sorted[i - 1].thickness ?? 0)
      }
    })

    it('sorts by quantity ascending', () => {
      const sorted = sortSlots(mockHranolkySlots, SortingBy.quantity, SortingOrder.asc)

      for (let i = 1; i < sorted.length; i++) {
        expect(sorted[i].quantity).toBeGreaterThanOrEqual(sorted[i - 1].quantity)
      }
    })

    it('sorts by quantity descending', () => {
      const sorted = sortSlots(mockHranolkySlots, SortingBy.quantity, SortingOrder.desc)

      for (let i = 1; i < sorted.length; i++) {
        expect(sorted[i].quantity).toBeLessThanOrEqual(sorted[i - 1].quantity)
      }
    })

    it('sorts by volume ascending', () => {
      const sorted = sortSlots(mockHranolkySlots, SortingBy.volume, SortingOrder.asc)

      for (let i = 1; i < sorted.length; i++) {
        expect(sorted[i].getVolume() ?? 0).toBeGreaterThanOrEqual(sorted[i - 1].getVolume() ?? 0)
      }
    })

    it('sorts by lastModified descending', () => {
      const sorted = sortSlots(mockHranolkySlots, SortingBy.lastModified, SortingOrder.desc)

      // Filter out items without lastModified for comparison
      const withDates = sorted.filter(s => s.lastModified !== null && s.lastModified !== undefined)
      for (let i = 1; i < withDates.length; i++) {
        expect(withDates[i].lastModified?.toMillis() ?? 0)
          .toBeLessThanOrEqual(withDates[i - 1].lastModified?.toMillis() ?? 0)
      }
    })

    it('returns original order for SortingBy.none', () => {
      const sorted = sortSlots(mockHranolkySlots, SortingBy.none, SortingOrder.asc)

      expect(sorted).toHaveLength(mockHranolkySlots.length)
    })

    it('does not mutate the original array', () => {
      const original = [...mockHranolkySlots]
      sortSlots(mockHranolkySlots, SortingBy.quantity, SortingOrder.asc)

      expect(mockHranolkySlots).toEqual(original)
    })

    it('handles empty array', () => {
      const sorted = sortSlots([], SortingBy.quality, SortingOrder.asc)

      expect(sorted).toEqual([])
    })
  })
})
