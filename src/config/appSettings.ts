/**
 * Application Settings (External Configuration)
 * 
 * Type definitions and fallback defaults for external configuration
 * stored in Firestore at AppConfig/settings.
 * 
 * Following the Data Version Transparency (DVT) principle from Normalized Systems theory,
 * these settings can be updated at runtime without redeploying the application.
 */

/**
 * Quality code to display name mappings
 * Used for translating internal quality codes to human-readable labels
 */
export type QualityMappings = Record<string, string>

/**
 * Dimension adjustments for specific thickness values
 * Maps nominal thickness (mm) to adjusted thickness
 */
export type DimensionAdjustments = Record<string, number>

/**
 * Firestore collection name references
 */
export interface CollectionNames {
  beam: string
  jointer: string
  slotActions: string
  weeklyReport: string
}

/**
 * Complete application settings structure
 * Matches the Firestore AppConfig/settings document
 */
export interface AppSettings {
  qualityMappings: QualityMappings
  dimensionAdjustments: DimensionAdjustments
  inventoryCheckPeriodDays: number
  collections: CollectionNames
  /** Settings schema version, auto-incremented on each save */
  version: number
  /** ISO timestamp of last settings update */
  lastUpdated: string
}

/**
 * Fallback defaults used when Firestore settings cannot be loaded.
 * These values mirror the original hardcoded configuration.
 */
export const DEFAULT_APP_SETTINGS: AppSettings = {
  qualityMappings: {
    'DUB-A|A': 'DUB A/A',
    'DUB-A|B': 'DUB A/B',
    'DUB-B|B': 'DUB B/B',
    'DUB-B|A': 'DUB B/A',
    'DUB-ABP': 'DUB A/B-P',
    'DUB-RST': 'DUB RUSTIK',
    'DUB-CNK': 'DUB CINK',
    'DUB-RSC': 'DUB RUSTIK CINK',
    'ZIR-ZIR': 'ZIRBE',
    'ZIR-BMS': 'ZIRBE MS',
    'ZIR-CNK': 'ZIRBE CINK',
    'ZBD-BDC': 'ZIRBE+BUK/DUB/BUK CINK/DUB CINK',
    'ZBD-CNK': 'ZIRBE CINK+BUK/DUB/BUK CINK/DUB CINK',
    'BUK-BUK': 'BUK',
    'BUK-CNK': 'BUK CINK',
    'JSN-JSN': 'JASAN',
    'KŠT-KŠT': 'KAŠTAN',
  },
  dimensionAdjustments: {
    '27.0': 27.4,
    '42.0': 42.4,
  },
  inventoryCheckPeriodDays: 75,
  collections: {
    beam: 'Hranolky',
    jointer: 'Sparovky',
    slotActions: 'SlotActions',
    weeklyReport: 'SlotWeeklyReport',
  },
  version: 1,
  lastUpdated: '2025-01-15T00:00:00Z',
}

/**
 * Merge partial settings with defaults to ensure all required fields are present
 */
export function mergeWithDefaults(partial: Partial<AppSettings>): AppSettings {
  return {
    qualityMappings: partial.qualityMappings ?? DEFAULT_APP_SETTINGS.qualityMappings,
    dimensionAdjustments: partial.dimensionAdjustments ?? DEFAULT_APP_SETTINGS.dimensionAdjustments,
    inventoryCheckPeriodDays: partial.inventoryCheckPeriodDays ?? DEFAULT_APP_SETTINGS.inventoryCheckPeriodDays,
    collections: partial.collections ?? DEFAULT_APP_SETTINGS.collections,
    version: partial.version ?? DEFAULT_APP_SETTINGS.version,
    lastUpdated: partial.lastUpdated ?? DEFAULT_APP_SETTINGS.lastUpdated,
  }
}
