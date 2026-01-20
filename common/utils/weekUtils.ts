/**
 * Week Utilities
 * 
 * Centralized week calculation and formatting following DRY principle.
 * Previously duplicated across:
 * - VolumeInTimeChart.tsx (getCurrentWeekLabel)
 * - generateVolumeWeeklyReport.ts (getWeekNumber, getEndOfWeek)
 * - useFetchFilteredVolumeHistory.ts (fillHistoricalGaps)
 * - exportToCsv.ts (getWeekNumber, generateWeekId)
 */

/**
 * Week information with year and week number
 */
export interface WeekInfo {
  /** Full year (e.g., 2025) */
  year: number
  /** Week number (1-53) */
  week: number
}

/**
 * Get ISO week number from a date.
 * Uses ISO 8601 standard where week 1 is the week containing Jan 4th.
 * 
 * @param date - Date to get week number for
 * @returns Object with year and week number
 */
export function getWeekNumber(date: Date): WeekInfo {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))
  const dayNum = d.getUTCDay() || 7
  d.setUTCDate(d.getUTCDate() + 4 - dayNum)
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1))
  const weekNo = Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7)
  return { year: d.getUTCFullYear(), week: weekNo }
}

/**
 * Get end of week (Sunday 23:59:59 UTC) for a given year and week.
 * 
 * @param year - Full year
 * @param week - Week number
 * @returns Date object for end of week
 */
export function getEndOfWeek(year: number, week: number): Date {
  const jan4 = new Date(Date.UTC(year, 0, 4))
  const monday = new Date(jan4.getTime() + ((week - 1) * 7 - (jan4.getUTCDay() || 7) + 1) * 86400000)
  const sunday = new Date(monday.getTime() + 6 * 86400000)
  sunday.setUTCHours(23, 59, 59, 999)
  return sunday
}

/**
 * Format week as YY_WW string (e.g., "25_27" for week 27 of 2025).
 * 
 * @param year - Full year (e.g., 2025) or 2-digit year (e.g., 25)
 * @param week - Week number
 * @returns Formatted string like "25_27"
 */
export function formatWeekId(year: number, week: number): string {
  const year2 = year > 99 ? year % 100 : year
  return `${year2.toString().padStart(2, '0')}_${week.toString().padStart(2, '0')}`
}

/**
 * Parse a week ID string (YY_WW) into year and week components.
 * 
 * @param weekId - Week ID string like "25_27"
 * @returns Object with year (2-digit) and week, or null if invalid
 */
export function parseWeekId(weekId: string): { year: number; week: number } | null {
  const parts = weekId.split('_')
  if (parts.length !== 2) return null

  const year = parseInt(parts[0], 10)
  const week = parseInt(parts[1], 10)

  if (isNaN(year) || isNaN(week)) return null
  return { year, week }
}

/**
 * Get the current week label in YY_WW format.
 * 
 * @returns Current week formatted as "YY_WW"
 */
export function getCurrentWeekLabel(): string {
  const now = new Date()
  const { year, week } = getWeekNumber(now)

  // Apply the rule: a year always has exactly 52 weeks for display
  let displayWeek = week
  let displayYear = year
  if (displayWeek > 52) {
    displayWeek = 1
    displayYear++
  }

  return formatWeekId(displayYear, displayWeek)
}

/**
 * Compare two week IDs for sorting.
 * 
 * @returns Negative if a < b, positive if a > b, 0 if equal
 */
export function compareWeekIds(a: string, b: string): number {
  return a.localeCompare(b)
}

/**
 * Get a numeric value for a week ID for comparison purposes.
 * 
 * @param weekId - Week ID in YY_WW format
 * @returns Numeric value (year * 100 + week)
 */
export function getWeekValue(weekId: string): number {
  const parsed = parseWeekId(weekId)
  if (!parsed) return 0
  return parsed.year * 100 + parsed.week
}

/**
 * Check if a year has week 53 (for proper week rollover logic).
 * 
 * @param year - 2-digit or full year
 * @returns True if the year has 53 weeks
 */
export function hasWeek53(year: number): boolean {
  const fullYear = year < 100 ? 2000 + year : year
  const dec31 = new Date(Date.UTC(fullYear, 11, 31))
  const dayNum = dec31.getUTCDay() || 7
  // If Dec 31 is Thu, Fri, Sat or Sun, there's a week 53
  return dayNum >= 4
}
