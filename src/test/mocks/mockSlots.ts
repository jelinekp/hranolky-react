import { WarehouseSlotClass, SlotType } from 'hranolky-firestore-common'
import { Timestamp } from 'firebase/firestore'

/**
 * Mock warehouse slots covering various quality/dimension combinations
 */
export const mockSlots: WarehouseSlotClass[] = [
  // DUB A/A - various dimensions
  new WarehouseSlotClass('H-DUB-A|A-27-42-1200', {
    quantity: 150,
    type: SlotType.Beam,
    lastModified: Timestamp.fromDate(new Date('2025-01-15'))
  }).parsePropertiesFromProductId(),

  new WarehouseSlotClass('H-DUB-A|A-20-38-600', {
    quantity: 200,
    type: SlotType.Beam,
    lastModified: Timestamp.fromDate(new Date('2025-01-14'))
  }).parsePropertiesFromProductId(),

  // DUB B/B
  new WarehouseSlotClass('H-DUB-B|B-27-42-1800', {
    quantity: 80,
    type: SlotType.Beam,
    lastModified: Timestamp.fromDate(new Date('2025-01-10'))
  }).parsePropertiesFromProductId(),

  new WarehouseSlotClass('H-DUB-B|B-42-50-2400', {
    quantity: 45,
    type: SlotType.Beam,
    lastModified: Timestamp.fromDate(new Date('2025-01-08'))
  }).parsePropertiesFromProductId(),

  // DUB RUSTIK
  new WarehouseSlotClass('H-DUB-RST-27-70-1200', {
    quantity: 120,
    type: SlotType.Beam,
    lastModified: Timestamp.fromDate(new Date('2025-01-12'))
  }).parsePropertiesFromProductId(),

  // ZIRBE
  new WarehouseSlotClass('H-ZIR-ZIR-20-40-900', {
    quantity: 60,
    type: SlotType.Beam,
    lastModified: Timestamp.fromDate(new Date('2025-01-05'))
  }).parsePropertiesFromProductId(),

  // BUK
  new WarehouseSlotClass('H-BUK-BUK-27-42-1500', {
    quantity: 95,
    type: SlotType.Beam,
    lastModified: Timestamp.fromDate(new Date('2025-01-11'))
  }).parsePropertiesFromProductId(),

  // Sparovky (Jointer)
  new WarehouseSlotClass('S-DUB-A|A-27-42-2100', {
    quantity: 75,
    type: SlotType.Jointer,
    lastModified: Timestamp.fromDate(new Date('2025-01-13'))
  }).parsePropertiesFromProductId(),

  new WarehouseSlotClass('S-DUB-B|B-20-38-1800', {
    quantity: 110,
    type: SlotType.Jointer,
    lastModified: Timestamp.fromDate(new Date('2025-01-09'))
  }).parsePropertiesFromProductId(),

  // Edge cases: no lastModified
  new WarehouseSlotClass('H-DUB-A|B-27-42-600', {
    quantity: 30,
    type: SlotType.Beam,
    lastModified: null
  }).parsePropertiesFromProductId(),
]

// Add lastSlotAction and lastSlotQuantityChange for some slots
mockSlots[0].lastSlotAction = 'prijem'
mockSlots[0].lastSlotQuantityChange = 50
mockSlots[1].lastSlotAction = 'vydej'
mockSlots[1].lastSlotQuantityChange = -20
mockSlots[2].lastSlotAction = 'inventura'
mockSlots[2].lastSlotQuantityChange = 0

export const mockEmptySlots: WarehouseSlotClass[] = []

/**
 * Get mock slots filtered by type
 */
export const getMockSlotsByType = (type: SlotType): WarehouseSlotClass[] => {
  return mockSlots.filter(slot => slot.type === type)
}

/**
 * Get Hranolky (Beam) slots only
 */
export const mockHranolkySlots = getMockSlotsByType(SlotType.Beam)

/**
 * Get Sparovky (Jointer) slots only  
 */
export const mockSparovkySlots = getMockSlotsByType(SlotType.Jointer)
