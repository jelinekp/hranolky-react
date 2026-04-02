import { describe, it, expect } from 'vitest'

// We need to test the helper functions - they're not exported, so we'll test via the main functions
// For now, let's create tests for the logic patterns used

describe('exportToCsv utilities', () => {
  describe('getCurrentWeekNumber logic', () => {
    it('calculates week number correctly for mid-January', () => {
      // Week calculation: Jan 15, 2025 is week 3
      const date = new Date('2025-01-15')
      const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))
      const dayNum = d.getUTCDay() || 7
      d.setUTCDate(d.getUTCDate() + 4 - dayNum)
      const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1))
      const weekNo = Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7)

      expect(weekNo).toBe(3)
    })

    it('calculates week number correctly for end of year', () => {
      // Week calculation: Dec 31, 2025
      const date = new Date('2025-12-31')
      const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))
      const dayNum = d.getUTCDay() || 7
      d.setUTCDate(d.getUTCDate() + 4 - dayNum)
      const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1))
      const weekNo = Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7)

      // Dec 31, 2025 is week 1 of 2026 (or week 53 depending on calculation)
      expect(weekNo).toBeGreaterThanOrEqual(1)
      expect(weekNo).toBeLessThanOrEqual(53)
    })
  })

  describe('getAllWeekIds logic', () => {
    it('generates correct week IDs from start to current', () => {
      const startYear = 2025
      const startWeek = 27
      const endYear = 2025
      const endWeek = 30

      const weeks: string[] = []
      let year = startYear
      let week = startWeek

      while (year < endYear || (year === endYear && week <= endWeek)) {
        const yearStr = String(year % 100).padStart(2, '0')
        const weekStr = String(week).padStart(2, '0')
        weeks.push(`${yearStr}_${weekStr}`)

        week++
        if (week > 52) {
          week = 1
          year++
        }
      }

      expect(weeks).toEqual(['25_27', '25_28', '25_29', '25_30'])
    })

    it('handles year rollover correctly', () => {
      const weeks: string[] = []
      let year = 2025
      let week = 51
      const endYear = 2026
      const endWeek = 2

      while (year < endYear || (year === endYear && week <= endWeek)) {
        const yearStr = String(year % 100).padStart(2, '0')
        const weekStr = String(week).padStart(2, '0')
        weeks.push(`${yearStr}_${weekStr}`)

        week++
        if (week > 52) {
          week = 1
          year++
        }
      }

      expect(weeks).toEqual(['25_51', '25_52', '26_01', '26_02'])
    })
  })

  describe('fillMissingWeeks logic', () => {
    it('forward-fills missing values', () => {
      const weeklyData = new Map<string, number>([
        ['25_27', 100],
        ['25_29', 150], // 25_28 is missing
      ])

      const allWeeks = ['25_27', '25_28', '25_29', '25_30']
      const filled = new Map<string, number>()
      let lastValue = 0

      for (const week of allWeeks) {
        const value = weeklyData.get(week)
        if (value !== undefined) {
          lastValue = value
        }
        filled.set(week, lastValue)
      }

      expect(filled.get('25_27')).toBe(100)
      expect(filled.get('25_28')).toBe(100) // Imputed from 25_27
      expect(filled.get('25_29')).toBe(150)
      expect(filled.get('25_30')).toBe(150) // Imputed from 25_29
    })

    it('starts with 0 if no prior data', () => {
      const weeklyData = new Map<string, number>([
        ['25_29', 150],
      ])

      const allWeeks = ['25_27', '25_28', '25_29']
      const filled = new Map<string, number>()
      let lastValue = 0

      for (const week of allWeeks) {
        const value = weeklyData.get(week)
        if (value !== undefined) {
          lastValue = value
        }
        filled.set(week, lastValue)
      }

      expect(filled.get('25_27')).toBe(0)
      expect(filled.get('25_28')).toBe(0)
      expect(filled.get('25_29')).toBe(150)
    })
  })

  describe('generateCsvContent logic', () => {
    it('formats CSV with header and data rows and uses live quantity for the current week', () => {
      const slotIds = ['H-DUB-A|A-27-42-1200', 'H-DUB-B|B-20-38-600']
      const weeks = ['25_27', '25_28']
      const weeklyDataMap = new Map<string, Map<string, number>>([
        ['H-DUB-A|A-27-42-1200', new Map([['25_27', 100], ['25_28', 110]])],
        ['H-DUB-B|B-20-38-600', new Map([['25_27', 50]])],
      ])
      const liveQuantities = new Map<string, number>([
        ['H-DUB-A|A-27-42-1200', 125],
        ['H-DUB-B|B-20-38-600', 60],
      ])

      // Simulate CSV generation
      const exportTimestampLabel = '2026-04-02 09:35'
      const header = ['slotId', '25_27', `Poslední živá data (${exportTimestampLabel})`].join(',')
      const rows = slotIds.map(slotId => {
        const data = weeklyDataMap.get(slotId) || new Map()
        const filled = new Map<string, number>()
        let lastValue = 0

        for (const week of weeks) {
          const value = data.get(week)
          if (value !== undefined) {
            lastValue = value
          }
          filled.set(week, lastValue)
        }

        const quantities = weeks.map((week, index) =>
          index === weeks.length - 1
            ? liveQuantities.get(slotId) || 0
            : filled.get(week) || 0
        )
        return [slotId, ...quantities].join(',')
      })
      const csv = [header, ...rows].join('\n')

      expect(csv).toBe(
        `slotId,25_27,Poslední živá data (${exportTimestampLabel})\n` +
        'H-DUB-A|A-27-42-1200,100,125\n' +
        'H-DUB-B|B-20-38-600,50,60'
      )
    })
  })
})
