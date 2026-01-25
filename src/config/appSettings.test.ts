import { describe, it, expect } from 'vitest'
import {
  AppSettings,
  DEFAULT_APP_SETTINGS,
  mergeWithDefaults,
} from './appSettings'

describe('appSettings', () => {
  describe('DEFAULT_APP_SETTINGS', () => {
    it('contains all required fields', () => {
      expect(DEFAULT_APP_SETTINGS.qualityMappings).toBeDefined()
      expect(DEFAULT_APP_SETTINGS.dimensionAdjustments).toBeDefined()
      expect(DEFAULT_APP_SETTINGS.inventoryCheckPeriodDays).toBeDefined()
      expect(DEFAULT_APP_SETTINGS.collections).toBeDefined()
      expect(DEFAULT_APP_SETTINGS.version).toBeDefined()
      expect(DEFAULT_APP_SETTINGS.lastUpdated).toBeDefined()
    })

    it('has expected quality mappings', () => {
      expect(DEFAULT_APP_SETTINGS.qualityMappings['DUB-A|A']).toBe('DUB A/A')
      expect(DEFAULT_APP_SETTINGS.qualityMappings['ZIR-ZIR']).toBe('ZIRBE')
      expect(DEFAULT_APP_SETTINGS.qualityMappings['BUK-BUK']).toBe('BUK')
    })

    it('has expected dimension adjustments', () => {
      expect(DEFAULT_APP_SETTINGS.dimensionAdjustments['27.0']).toBe(27.4)
      expect(DEFAULT_APP_SETTINGS.dimensionAdjustments['42.0']).toBe(42.4)
    })

    it('has expected collection names', () => {
      expect(DEFAULT_APP_SETTINGS.collections.beam).toBe('Hranolky')
      expect(DEFAULT_APP_SETTINGS.collections.jointer).toBe('Sparovky')
      expect(DEFAULT_APP_SETTINGS.collections.slotActions).toBe('SlotActions')
      expect(DEFAULT_APP_SETTINGS.collections.weeklyReport).toBe('SlotWeeklyReport')
    })

    it('has expected inventory check period', () => {
      expect(DEFAULT_APP_SETTINGS.inventoryCheckPeriodDays).toBe(75)
    })
  })

  describe('mergeWithDefaults', () => {
    it('returns defaults when given empty object', () => {
      const result = mergeWithDefaults({})
      expect(result).toEqual(DEFAULT_APP_SETTINGS)
    })

    it('merges partial settings with defaults', () => {
      const partial: Partial<AppSettings> = {
        inventoryCheckPeriodDays: 90,
        version: 5,
      }

      const result = mergeWithDefaults(partial)

      expect(result.inventoryCheckPeriodDays).toBe(90)
      expect(result.version).toBe(5)
      expect(result.qualityMappings).toEqual(DEFAULT_APP_SETTINGS.qualityMappings)
      expect(result.dimensionAdjustments).toEqual(DEFAULT_APP_SETTINGS.dimensionAdjustments)
    })

    it('overrides quality mappings when provided', () => {
      const customMappings = { 'CUSTOM-001': 'Custom' }
      const result = mergeWithDefaults({ qualityMappings: customMappings })

      expect(result.qualityMappings).toEqual(customMappings)
    })

    it('overrides dimension adjustments when provided', () => {
      const customAdjustments = { '30.0': 30.5 }
      const result = mergeWithDefaults({ dimensionAdjustments: customAdjustments })

      expect(result.dimensionAdjustments).toEqual(customAdjustments)
    })

    it('overrides collections when provided', () => {
      const customCollections = {
        beam: 'CustomBeams',
        jointer: 'CustomJointers',
        slotActions: 'CustomActions',
        weeklyReport: 'CustomReports',
      }
      const result = mergeWithDefaults({ collections: customCollections })

      expect(result.collections).toEqual(customCollections)
    })
  })
})
