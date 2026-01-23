import { describe, it, expect } from 'vitest'
import { WarehouseSlotClass, SlotType, DEFAULT_DIMENSION_ADJUSTMENTS } from 'hranolky-firestore-common'

describe('WarehouseSlotClass', () => {
  describe('parsePropertiesFromProductId', () => {
    it('parses beam product ID correctly with default settings', () => {
      const slot = new WarehouseSlotClass('H-DUB-A|A-27-42-1500', { quantity: 100 })
      const parsed = slot.parsePropertiesFromProductId()

      expect(parsed.type).toBe(SlotType.Beam)
      expect(parsed.quality).toBe('DUB A/A')
      expect(parsed.thickness).toBe(27.4) // 27 → 27.4 default adjustment
      expect(parsed.width).toBe(42.4) // 42 → 42.4 default adjustment
      expect(parsed.length).toBe(1500)
    })

    it('parses jointer product ID correctly', () => {
      const slot = new WarehouseSlotClass('S-ZIR-ZIR-20-50-2000', { quantity: 50 })
      const parsed = slot.parsePropertiesFromProductId()

      expect(parsed.type).toBe(SlotType.Jointer)
      expect(parsed.quality).toBe('ZIRBE')
      expect(parsed.thickness).toBe(20) // 20 stays 20 (no adjustment)
      expect(parsed.width).toBe(50) // 50 stays 50 (no adjustment)
      expect(parsed.length).toBe(2000)
    })

    it('applies custom dimension adjustments when provided', () => {
      const customDimensionAdjustments = {
        '27.0': 28.0,
        '42.0': 43.0,
        '50.0': 51.5,
      }

      const slot = new WarehouseSlotClass('H-DUB-A|A-27-50-1500', { quantity: 100 })
      const parsed = slot.parsePropertiesFromProductId({
        dimensionAdjustments: customDimensionAdjustments,
      })

      expect(parsed.thickness).toBe(28.0) // Custom: 27 → 28
      expect(parsed.width).toBe(51.5) // Custom: 50 → 51.5
    })

    it('applies custom quality mappings when provided', () => {
      const customQualityMappings = {
        'DUB-A|A': 'CUSTOM OAK A/A',
      }

      const slot = new WarehouseSlotClass('H-DUB-A|A-27-42-1500', { quantity: 100 })
      const parsed = slot.parsePropertiesFromProductId({
        qualityMappings: customQualityMappings,
      })

      expect(parsed.quality).toBe('CUSTOM OAK A/A')
    })

    it('uses default when dimension has no adjustment', () => {
      const slot = new WarehouseSlotClass('H-DUB-A|A-35-60-1500', { quantity: 100 })
      const parsed = slot.parsePropertiesFromProductId()

      expect(parsed.thickness).toBe(35) // No adjustment for 35
      expect(parsed.width).toBe(60) // No adjustment for 60
    })

    it('handles product ID without prefix', () => {
      const slot = new WarehouseSlotClass('DUB-A|A-27-42-1500', { quantity: 100 })
      const parsed = slot.parsePropertiesFromProductId()

      expect(parsed.type).toBe(SlotType.Beam) // Default type
      expect(parsed.quality).toBe('DUB A/A')
      expect(parsed.thickness).toBe(27.4)
    })

    it('returns self for invalid product ID with too few parts', () => {
      const slot = new WarehouseSlotClass('H-INVALID-ID', { quantity: 100 })
      const parsed = slot.parsePropertiesFromProductId()

      expect(parsed).toBe(slot)
      expect(parsed.quality).toBeNull()
    })
  })

  describe('DEFAULT_DIMENSION_ADJUSTMENTS', () => {
    it('contains expected default adjustments', () => {
      expect(DEFAULT_DIMENSION_ADJUSTMENTS['27.0']).toBe(27.4)
      expect(DEFAULT_DIMENSION_ADJUSTMENTS['42.0']).toBe(42.4)
    })
  })

  describe('getVolume', () => {
    it('calculates volume correctly in cubic meters', () => {
      const slot = new WarehouseSlotClass('test', {
        quantity: 10,
        thickness: 27.4,
        width: 42.4,
        length: 1500,
      })

      // Volume = (10 * 27.4 * 42.4 * 1500) / 1,000,000,000
      const expectedVolume = (10 * 27.4 * 42.4 * 1500) / 1_000_000_000
      expect(slot.getVolume()).toBeCloseTo(expectedVolume, 6)
    })

    it('returns null when dimensions are missing', () => {
      const slot = new WarehouseSlotClass('test', { quantity: 10 })
      expect(slot.getVolume()).toBeNull()
    })
  })
})
