/**
 * Quality Name Mapping Utility
 * 
 * Extracted from WarehouseSlotClass following the Separation of Concerns (SoC) 
 * principle from Normalized Systems theory. This utility handles quality code 
 * to display name translations, separating display logic from data modeling.
 */

import { QualityMappings } from '../types/settingsTypes'

/**
 * Default mapping of raw quality codes to human-readable display names
 * Used as fallback when custom mappings are not provided
 */
export const DEFAULT_QUALITY_MAPPINGS: QualityMappings = {
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
}

/** @deprecated Use DEFAULT_QUALITY_MAPPINGS instead */
export const QUALITY_MAPPINGS = DEFAULT_QUALITY_MAPPINGS

/**
 * Get human-readable quality name from raw quality code.
 * Returns the original code if no mapping exists.
 * 
 * @param parsedQuality - Raw quality code from product ID
 * @param customMappings - Optional custom mappings from Firestore settings
 * @returns Human-readable quality name
 */
export function getFullQualityName(
  parsedQuality: string | null,
  customMappings?: QualityMappings
): string {
  if (parsedQuality === null) {
    return ''
  }

  const mappings = customMappings ?? DEFAULT_QUALITY_MAPPINGS
  return mappings[parsedQuality] ?? parsedQuality
}

/**
 * Get all available quality codes
 */
export function getQualityCodes(customMappings?: QualityMappings): string[] {
  const mappings = customMappings ?? DEFAULT_QUALITY_MAPPINGS
  return Object.keys(mappings)
}

/**
 * Get all available quality display names
 */
export function getQualityDisplayNames(customMappings?: QualityMappings): string[] {
  const mappings = customMappings ?? DEFAULT_QUALITY_MAPPINGS
  return Object.values(mappings)
}

/**
 * Check if a quality code has a known mapping
 */
export function hasQualityMapping(qualityCode: string, customMappings?: QualityMappings): boolean {
  const mappings = customMappings ?? DEFAULT_QUALITY_MAPPINGS
  return qualityCode in mappings
}

