/**
 * Settings Types for Common Library
 * 
 * Shared type definitions for app settings that can be passed
 * to parsing functions in the common library.
 */

/**
 * Dimension adjustments map - maps raw dimension to adjusted value
 * Example: { "27.0": 27.4, "42.0": 42.4 }
 */
export interface DimensionAdjustments {
  [key: string]: number
}

/**
 * Quality code to display name mappings
 * Example: { "DUB-A|A": "DUB A/A" }
 */
export interface QualityMappings {
  [key: string]: string
}

/**
 * Settings object passed to parsing functions
 */
export interface ParseSettings {
  dimensionAdjustments?: DimensionAdjustments
  qualityMappings?: QualityMappings
}
