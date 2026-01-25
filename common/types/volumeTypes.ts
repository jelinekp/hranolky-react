/**
 * Shared Types for Volume Reporting
 * 
 * Centralized type definitions following DRY principle.
 * Previously duplicated across:
 * - useFetchVolumeHistory.ts
 * - useFetchFilteredVolumeHistory.ts
 * - generateVolumeWeeklyReport.ts
 * - exportToCsv.ts
 */

/**
 * A data point representing volume for a specific week
 */
export interface VolumeDataPoint {
  /** Week identifier in YY_WW format */
  week: string
  /** Volume in cubic meters (m³) */
  volume: number
}

/**
 * Aggregated weekly report data stored in Firestore
 */
export interface WeeklyReport {
  /** Total quantity of items */
  totalQuantity: number
  /** Total volume in cubic decimeters (dm³) */
  totalVolumeDm: number
}

/**
 * Per-slot weekly report data stored in Firestore
 */
export interface SlotWeeklyReport {
  /** Quantity of items in the slot */
  quantity: number
  /** Volume in cubic decimeters (dm³) */
  volumeDm: number
}

/**
 * Slot action record from Firestore
 */
export interface SlotActionRecord {
  /** Action type description */
  action: string
  /** Quantity after this action */
  newQuantity: number
  /** Change in quantity (positive or negative) */
  quantityChange: number
  /** Timestamp of the action */
  timestamp: import('firebase/firestore').Timestamp
  /** User ID who performed the action */
  userId: string
}

/**
 * Slot data with its action history
 */
export interface SlotWithActions {
  /** The warehouse slot */
  slot: import('hranolky-firestore-common').WarehouseSlotClass
  /** History of actions on this slot */
  actions: SlotActionRecord[]
}
