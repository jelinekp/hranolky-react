/**
 * Quality Name Mapping Utility
 * 
 * Extracted from WarehouseSlotClass following the Separation of Concerns (SoC) 
 * principle from Normalized Systems theory. This utility handles quality code 
 * to display name translations, separating display logic from data modeling.
 */

/**
 * Mapping of raw quality codes to human-readable display names
 * Data structure allows easy addition of new quality types without code changes
 */
export const QUALITY_MAPPINGS: Record<string, string> = {
  // DUB (Oak) variants
  'DUB-A|A': 'DUB A/A',
  'DUB-A|B': 'DUB A/B',
  'DUB-B|B': 'DUB B/B',
  'DUB-ABP': 'DUB A/B-P',
  'DUB-RST': 'DUB RUSTIK',
  'DUB-CNK': 'DUB CINK',
  'DUB-RSC': 'DUB RUSTIK CINK',

  // ZIR (Zirbe/Stone Pine) variants
  'ZIR-ZIR': 'ZIRBE',
  'ZIR-BMS': 'ZIRBE MS',
  'ZIR-CNK': 'ZIRBE CINK',

  // Mixed variants
  'ZBD-BDC': 'ZIRBE+BUK/DUB/BUK CINK/DUB CINK',
  'ZBD-CNK': 'ZIRBE CINK+BUK/DUB/BUK CINK/DUB CINK',

  // BUK (Beech) variants
  'BUK-BUK': 'BUK',
  'BUK-CNK': 'BUK CINK',

  // Other wood types
  'JSN-JSN': 'JASAN',
  'KŠT-KŠT': 'KAŠTAN',
} as const

/**
 * Get human-readable quality name from raw quality code.
 * Returns the original code if no mapping exists.
 * 
 * @param parsedQuality - Raw quality code from product ID
 * @returns Human-readable quality name
 */
export function getFullQualityName(parsedQuality: string | null): string {
  if (parsedQuality === null) {
    return ''
  }

  return QUALITY_MAPPINGS[parsedQuality] ?? parsedQuality
}

/**
 * Get all available quality codes
 */
export function getQualityCodes(): string[] {
  return Object.keys(QUALITY_MAPPINGS)
}

/**
 * Get all available quality display names
 */
export function getQualityDisplayNames(): string[] {
  return Object.values(QUALITY_MAPPINGS)
}

/**
 * Check if a quality code has a known mapping
 */
export function hasQualityMapping(qualityCode: string): boolean {
  return qualityCode in QUALITY_MAPPINGS
}
