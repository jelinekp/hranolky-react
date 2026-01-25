import { describe, it, expect } from 'vitest'
import {
  getWeekNumber,
  getEndOfWeek,
  formatWeekId,
  parseWeekId,
  getCurrentWeekLabel,
  compareWeekIds,
  getWeekValue,
  hasWeek53
} from './weekUtils'

describe('weekUtils', () => {
  describe('getWeekNumber', () => {
    it('returns correct week for mid-year date', () => {
      // July 1, 2025 is in week 27
      const result = getWeekNumber(new Date(2025, 6, 1))
      expect(result.year).toBe(2025)
      expect(result.week).toBe(27)
    })

    it('returns correct week for year start', () => {
      // Jan 6, 2025 is in week 2
      const result = getWeekNumber(new Date(2025, 0, 6))
      expect(result.year).toBe(2025)
      expect(result.week).toBe(2)
    })

    it('returns correct week for year end', () => {
      // Dec 31, 2025 should be week 1 of 2026 or week 53 of 2025
      const result = getWeekNumber(new Date(2025, 11, 31))
      expect(result.week).toBeGreaterThan(0)
      expect(result.week).toBeLessThanOrEqual(53)
    })
  })

  describe('formatWeekId', () => {
    it('formats full year correctly', () => {
      expect(formatWeekId(2025, 27)).toBe('25_27')
    })

    it('formats 2-digit year correctly', () => {
      expect(formatWeekId(25, 27)).toBe('25_27')
    })

    it('pads single digit week', () => {
      expect(formatWeekId(2025, 5)).toBe('25_05')
    })
  })

  describe('parseWeekId', () => {
    it('parses valid week ID', () => {
      const result = parseWeekId('25_27')
      expect(result).toEqual({ year: 25, week: 27 })
    })

    it('returns null for invalid format', () => {
      expect(parseWeekId('invalid')).toBeNull()
      expect(parseWeekId('25')).toBeNull()
      expect(parseWeekId('')).toBeNull()
    })
  })

  describe('getCurrentWeekLabel', () => {
    it('returns week in correct format', () => {
      const label = getCurrentWeekLabel()
      expect(label).toMatch(/^\d{2}_\d{2}$/)
    })
  })

  describe('compareWeekIds', () => {
    it('orders weeks chronologically', () => {
      expect(compareWeekIds('25_01', '25_02')).toBeLessThan(0)
      expect(compareWeekIds('25_52', '26_01')).toBeLessThan(0)
      expect(compareWeekIds('25_10', '25_10')).toBe(0)
    })
  })

  describe('getWeekValue', () => {
    it('converts week ID to numeric value', () => {
      expect(getWeekValue('25_27')).toBe(2527)
      expect(getWeekValue('26_01')).toBe(2601)
    })

    it('returns 0 for invalid week ID', () => {
      expect(getWeekValue('invalid')).toBe(0)
    })
  })

  describe('getEndOfWeek', () => {
    it('returns Sunday for given week', () => {
      const endOfWeek = getEndOfWeek(2025, 27)
      expect(endOfWeek.getUTCDay()).toBe(0) // Sunday
      expect(endOfWeek.getUTCHours()).toBe(23)
      expect(endOfWeek.getUTCMinutes()).toBe(59)
    })
  })

  describe('hasWeek53', () => {
    it('detects years with week 53', () => {
      // 2020 had week 53 (Dec 31 was Thursday)
      expect(hasWeek53(2020)).toBe(true)
      expect(hasWeek53(20)).toBe(true)
    })

    it('detects years without week 53', () => {
      // 2025 doesn't have week 53 (Dec 31 is Wednesday)
      expect(hasWeek53(2025)).toBe(false)
    })
  })
})
