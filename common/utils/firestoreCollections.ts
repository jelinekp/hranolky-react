/**
 * Firestore Collection Utilities
 * 
 * Centralized collection path logic following DRY/DVT principles.
 * Previously duplicated across:
 * - useFetchVolumeHistory.ts
 * - useFetchFilteredVolumeHistory.ts
 * - generateVolumeWeeklyReport.ts
 * - exportToCsv.ts
 * - config/appConfig.ts
 */

import { SlotType } from 'hranolky-firestore-common'

/**
 * Collection names for each slot type
 */
export const SLOT_COLLECTIONS = {
  [SlotType.Beam]: 'Hranolky',
  [SlotType.Jointer]: 'Sparovky',
} as const

/**
 * Get the main Firestore collection name for a slot type.
 * 
 * @param slotType - The slot type
 * @returns Collection name ("Hranolky" or "Sparovky")
 */
export function getSlotCollectionName(slotType: SlotType): string {
  return SLOT_COLLECTIONS[slotType]
}

/**
 * Get the Firestore collection path for aggregated weekly reports.
 * 
 * @param slotType - The slot type
 * @returns Array of path segments like ["WeeklyReports", "Hranolky", "WeeklyData"]
 */
export function getWeeklyReportsPath(slotType: SlotType): string[] {
  return ['WeeklyReports', getSlotCollectionName(slotType), 'WeeklyData']
}

/**
 * Get the Firestore collection path for a slot's weekly reports.
 * 
 * @param slotType - The slot type
 * @param slotId - The slot document ID
 * @returns Array of path segments
 */
export function getSlotWeeklyReportsPath(slotType: SlotType, slotId: string): string[] {
  return [getSlotCollectionName(slotType), slotId, 'SlotWeeklyReport']
}

/**
 * Get the Firestore collection path for a slot's actions.
 * 
 * @param slotType - The slot type
 * @param slotId - The slot document ID
 * @returns Array of path segments
 */
export function getSlotActionsPath(slotType: SlotType, slotId: string): string[] {
  return [getSlotCollectionName(slotType), slotId, 'SlotActions']
}

/**
 * Determine the slot type from a slot ID prefix.
 * 
 * @param slotId - The slot document ID
 * @returns The slot type based on prefix
 */
export function getSlotTypeFromId(slotId: string): SlotType {
  if (slotId.startsWith('S-')) {
    return SlotType.Jointer
  }
  // H- prefix or no prefix defaults to Beam
  return SlotType.Beam
}

/**
 * Determine the collection name from a slot ID.
 * 
 * @param slotId - The slot document ID
 * @returns Collection name based on slot ID prefix
 */
export function getCollectionFromSlotId(slotId: string): string {
  return getSlotCollectionName(getSlotTypeFromId(slotId))
}
