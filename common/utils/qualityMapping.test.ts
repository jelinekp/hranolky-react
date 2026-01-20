import { describe, it, expect } from 'vitest'
import {
  getFullQualityName,
  getQualityCodes,
  getQualityDisplayNames,
  hasQualityMapping,
  QUALITY_MAPPINGS
} from './qualityMapping'

describe('qualityMapping', () => {
  describe('getFullQualityName', () => {
    it('maps DUB-A|A to DUB A/A', () => {
      expect(getFullQualityName('DUB-A|A')).toBe('DUB A/A')
    })

    it('maps DUB-A|B to DUB A/B', () => {
      expect(getFullQualityName('DUB-A|B')).toBe('DUB A/B')
    })

    it('maps DUB-B|B to DUB B/B', () => {
      expect(getFullQualityName('DUB-B|B')).toBe('DUB B/B')
    })

    it('maps DUB-RST to DUB RUSTIK', () => {
      expect(getFullQualityName('DUB-RST')).toBe('DUB RUSTIK')
    })

    it('maps ZIR-ZIR to ZIRBE', () => {
      expect(getFullQualityName('ZIR-ZIR')).toBe('ZIRBE')
    })

    it('maps BUK-BUK to BUK', () => {
      expect(getFullQualityName('BUK-BUK')).toBe('BUK')
    })

    it('maps JSN-JSN to JASAN', () => {
      expect(getFullQualityName('JSN-JSN')).toBe('JASAN')
    })

    it('maps KŠT-KŠT to KAŠTAN', () => {
      expect(getFullQualityName('KŠT-KŠT')).toBe('KAŠTAN')
    })

    it('returns original code for unknown quality', () => {
      expect(getFullQualityName('UNKNOWN-QTY')).toBe('UNKNOWN-QTY')
    })

    it('returns empty string for null', () => {
      expect(getFullQualityName(null)).toBe('')
    })
  })

  describe('getQualityCodes', () => {
    it('returns all quality codes', () => {
      const codes = getQualityCodes()

      expect(codes).toContain('DUB-A|A')
      expect(codes).toContain('ZIR-ZIR')
      expect(codes).toContain('BUK-BUK')
      expect(codes.length).toBe(Object.keys(QUALITY_MAPPINGS).length)
    })
  })

  describe('getQualityDisplayNames', () => {
    it('returns all display names', () => {
      const names = getQualityDisplayNames()

      expect(names).toContain('DUB A/A')
      expect(names).toContain('ZIRBE')
      expect(names).toContain('BUK')
      expect(names.length).toBe(Object.values(QUALITY_MAPPINGS).length)
    })
  })

  describe('hasQualityMapping', () => {
    it('returns true for known codes', () => {
      expect(hasQualityMapping('DUB-A|A')).toBe(true)
      expect(hasQualityMapping('ZIR-ZIR')).toBe(true)
    })

    it('returns false for unknown codes', () => {
      expect(hasQualityMapping('UNKNOWN')).toBe(false)
      expect(hasQualityMapping('')).toBe(false)
    })
  })
})
