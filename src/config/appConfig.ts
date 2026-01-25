/**
 * Application Configuration
 * 
 * Centralized configuration for the application following the Data Version Transparency (DVT)
 * principle from Normalized Systems theory. This allows configuration values to evolve
 * without causing ripple effects throughout the codebase.
 */

import { SlotType } from 'hranolky-firestore-common'

/**
 * List of admin email addresses with elevated permissions
 * These users can access the Admin Panel
 */
export const ADMIN_EMAILS: readonly string[] = [
  'jelinekp6@gmail.com',
  'jelinekv007@gmail.com',
  'r2202.komenda@gmail.com',
  'jelinekd@gmail.com',
  'david.jelinek@jelinek.eu',
] as const

/**
 * Check if an email address belongs to an admin user
 */
export function isAdminUser(email: string | null | undefined): boolean {
  if (!email) return false
  return ADMIN_EMAILS.includes(email)
}

/**
 * Firebase collection names for slot types
 */
export const COLLECTION_NAMES = {
  [SlotType.Beam]: 'Hranolky',
  [SlotType.Jointer]: 'Sparovky',
} as const

/**
 * Get the Firestore collection name for a slot type
 */
export function getCollectionName(slotType: SlotType): string {
  return COLLECTION_NAMES[slotType]
}

/**
 * Weekly report paths in Firestore
 */
export const WEEKLY_REPORTS_PATHS = {
  [SlotType.Beam]: ['WeeklyReports', 'Hranolky', 'WeeklyData'],
  [SlotType.Jointer]: ['WeeklyReports', 'Sparovky', 'WeeklyData'],
} as const

/**
 * Get the Firestore path for weekly reports
 */
export function getWeeklyReportsPath(slotType: SlotType): readonly string[] {
  return WEEKLY_REPORTS_PATHS[slotType]
}

/**
 * Export configuration - starting weeks for weekly reports by slot type
 * Reports started at different times for each slot type
 */
export const EXPORT_START_CONFIG = {
  [SlotType.Beam]: {
    year: 2025,
    week: 27, // Hranolky reporting started week 27, 2025
  },
  [SlotType.Jointer]: {
    year: 2025,
    week: 45, // Sparovky reporting started week 45, 2025
  },
} as const

/**
 * Get the export start configuration for a slot type
 */
export function getExportStartConfig(slotType: SlotType): { year: number; week: number } {
  return EXPORT_START_CONFIG[slotType]
}

/**
 * Length interval definitions for filters (in mm)
 */
export const LENGTH_INTERVALS = [
  { start: 0, end: 599 },
  { start: 600, end: 1199 },
  { start: 1200, end: 1799 },
  { start: 1800, end: 2399 },
  { start: 2400, end: 2999 },
] as const

/**
 * Inventory check weeks (weeks when inventory counts happen)
 */
export const INVENTORY_CHECK_WEEKS = [14, 27, 40, 51] as const
