/**
 * Slot Sorting Utility
 * 
 * Extracted from SlotsTable.tsx following the Separation of Concerns (SoC) 
 * principle from Normalized Systems theory. This utility handles all slot 
 * sorting logic, allowing the table component to focus purely on presentation.
 */

import { WarehouseSlotClass } from 'hranolky-firestore-common'
import { SortingBy, SortingOrder } from '../model/Sorting'

/**
 * Compare two nullable numbers for sorting
 */
function compareNumbers(
  a: number | null | undefined,
  b: number | null | undefined,
  ascending: boolean
): number {
  const valA = a ?? 0
  const valB = b ?? 0
  return ascending ? valA - valB : valB - valA
}

/**
 * Compare two nullable strings for sorting
 */
function compareStrings(
  a: string | null | undefined,
  b: string | null | undefined,
  ascending: boolean
): number {
  const valA = a ?? ''
  const valB = b ?? ''
  if (!valA.localeCompare || !valB.localeCompare) return 0
  // Note: localeCompare in ascending means A-Z, but original code had reversed logic
  return ascending ? valB.localeCompare(valA) : valA.localeCompare(valB)
}

/**
 * Get the sorting comparator for a specific field
 */
function getComparator(
  sortingBy: SortingBy,
  ascending: boolean
): (a: WarehouseSlotClass, b: WarehouseSlotClass) => number {
  switch (sortingBy) {
    case SortingBy.quality:
      return (a, b) => compareStrings(a.quality, b.quality, ascending)

    case SortingBy.thickness:
      return (a, b) => compareNumbers(a.thickness, b.thickness, ascending)

    case SortingBy.width:
      return (a, b) => compareNumbers(a.width, b.width, ascending)

    case SortingBy.length:
      return (a, b) => compareNumbers(a.length, b.length, ascending)

    case SortingBy.quantity:
      return (a, b) => compareNumbers(a.quantity, b.quantity, ascending)

    case SortingBy.volume:
      return (a, b) => compareNumbers(a.getVolume(), b.getVolume(), ascending)

    case SortingBy.lastModified:
      return (a, b) => compareNumbers(
        a.lastModified?.toMillis(),
        b.lastModified?.toMillis(),
        ascending
      )

    case SortingBy.lastAction:
      return (a, b) => compareStrings(a.lastSlotAction, b.lastSlotAction, ascending)

    case SortingBy.lastChange:
      return (a, b) => compareNumbers(
        a.lastSlotQuantityChange,
        b.lastSlotQuantityChange,
        ascending
      )

    case SortingBy.none:
    default:
      return () => 0
  }
}

/**
 * Sort an array of warehouse slots based on sorting configuration.
 * Returns a new sorted array, does not mutate the original.
 * 
 * @param slots - Array of slots to sort
 * @param sortingBy - Field to sort by
 * @param sortingOrder - Ascending or descending order
 * @returns New sorted array of slots
 */
export function sortSlots(
  slots: WarehouseSlotClass[],
  sortingBy: SortingBy,
  sortingOrder: SortingOrder
): WarehouseSlotClass[] {
  const ascending = sortingOrder === SortingOrder.asc
  const comparator = getComparator(sortingBy, ascending)

  // Create a copy to avoid mutating the original array
  return [...slots].sort(comparator)
}
