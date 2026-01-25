import { describe, it, expect } from 'vitest'
import {
  getFullQualityName,
  getQualityCodes,
  getQualityDisplayNames,
  hasQualityMapping,
  DEFAULT_QUALITY_MAPPINGS
} from 'hranolky-firestore-common'

describe('qualityMapping', () => {
  describe('getFullQualityName', () => {
    it('returns empty string for null quality', () => {
      expect(getFullQualityName(null)).toBe('')
    })

    it('returns mapped name for known quality code with default mappings', () => {
      expect(getFullQualityName('DUB-A|A')).toBe('DUB A/A')
      expect(getFullQualityName('ZIR-ZIR')).toBe('ZIRBE')
      expect(getFullQualityName('BUK-BUK')).toBe('BUK')
    })

    it('returns original code for unknown quality', () => {
      expect(getFullQualityName('UNKNOWN-CODE')).toBe('UNKNOWN-CODE')
    })

    it('uses custom mappings when provided', () => {
      const customMappings = {
        'CUSTOM-001': 'Custom Quality One',
        'CUSTOM-002': 'Custom Quality Two',
      }

      expect(getFullQualityName('CUSTOM-001', customMappings)).toBe('Custom Quality One')
      expect(getFullQualityName('CUSTOM-002', customMappings)).toBe('Custom Quality Two')
    })

    it('returns original code when not found in custom mappings', () => {
      const customMappings = {
        'CUSTOM-001': 'Custom Quality One',
      }

      expect(getFullQualityName('NOT-IN-CUSTOM', customMappings)).toBe('NOT-IN-CUSTOM')
    })

    it('custom mappings override default mappings', () => {
      const customMappings = {
        'DUB-A|A': 'CUSTOM DUB A/A',
      }

      expect(getFullQualityName('DUB-A|A', customMappings)).toBe('CUSTOM DUB A/A')
    })
  })

  describe('getQualityCodes', () => {
    it('returns all default quality codes when no custom mappings provided', () => {
      const codes = getQualityCodes()
      expect(codes).toContain('DUB-A|A')
      expect(codes).toContain('ZIR-ZIR')
      expect(codes).toContain('BUK-BUK')
      expect(codes.length).toBe(Object.keys(DEFAULT_QUALITY_MAPPINGS).length)
    })

    it('returns custom quality codes when provided', () => {
      const customMappings = {
        'CUSTOM-001': 'Custom One',
        'CUSTOM-002': 'Custom Two',
      }

      const codes = getQualityCodes(customMappings)
      expect(codes).toEqual(['CUSTOM-001', 'CUSTOM-002'])
    })
  })

  describe('getQualityDisplayNames', () => {
    it('returns all default display names when no custom mappings provided', () => {
      const names = getQualityDisplayNames()
      expect(names).toContain('DUB A/A')
      expect(names).toContain('ZIRBE')
      expect(names).toContain('BUK')
    })

    it('returns custom display names when provided', () => {
      const customMappings = {
        'CUSTOM-001': 'Custom One',
        'CUSTOM-002': 'Custom Two',
      }

      const names = getQualityDisplayNames(customMappings)
      expect(names).toEqual(['Custom One', 'Custom Two'])
    })
  })

  describe('hasQualityMapping', () => {
    it('returns true for known quality codes', () => {
      expect(hasQualityMapping('DUB-A|A')).toBe(true)
      expect(hasQualityMapping('ZIR-ZIR')).toBe(true)
    })

    it('returns false for unknown quality codes', () => {
      expect(hasQualityMapping('UNKNOWN-CODE')).toBe(false)
    })

    it('checks custom mappings when provided', () => {
      const customMappings = {
        'CUSTOM-001': 'Custom One',
      }

      expect(hasQualityMapping('CUSTOM-001', customMappings)).toBe(true)
      expect(hasQualityMapping('DUB-A|A', customMappings)).toBe(false)
    })
  })
})
