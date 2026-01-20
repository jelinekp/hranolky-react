= Refactored System

This section documents the changes made to address the identified NS theory violations.

== Test-Driven Approach

Before refactoring, we established a comprehensive test suite as a safety net:

#table(
  columns: (auto, auto, auto),
  inset: 8pt,
  align: left,
  [*Test Category*], [*Files*], [*Tests*],
  [Unit Tests], [`SlotFilter.test.ts`, `slotSorting.test.ts`, `qualityMapping.test.ts`], [35],
  [Component Tests], [`SlotsTable.test.tsx`, `ExportDialog.test.tsx`, `VolumeInTimeChart.test.tsx`], [28],
  [Integration Tests], [`FilteringFlow.test.tsx`], [5],
  [*Total*], [8 files], [*72 tests*],
)

== Configuration Module (DVT)

Created `config/appConfig.ts` to centralize hardcoded values:

```typescript
// After: Centralized configuration
export const ADMIN_EMAILS = [
  'jelinekp6@gmail.com',
  'jelinekv007@gmail.com',
] as const

export function isAdminUser(email: string | null): boolean {
  if (!email) return false
  return ADMIN_EMAILS.includes(email)
}

export const COLLECTION_NAMES = {
  [SlotType.Beam]: 'Hranolky',
  [SlotType.Jointer]: 'Sparovky',
} as const
```

*Impact:* Admin check now requires one-line change to update permissions.

== Sorting Logic Extraction (SoC)

Created `utils/slotSorting.ts` extracting comparison logic:

```typescript
// After: Pure utility function
export function sortSlots(
  slots: WarehouseSlotClass[],
  sortingBy: SortingBy,
  sortingOrder: SortingOrder
): WarehouseSlotClass[] {
  const ascending = sortingOrder === SortingOrder.asc
  const comparator = getComparator(sortingBy, ascending)
  return [...slots].sort(comparator)
}
```

*Before:* 50 lines inline in component
*After:* Single function call: `sortSlots(warehouseSlots, sortingBy, sortingOrder)`

== Export Dialog Extraction (SoC)

Created `components/ExportDialog.tsx` as a standalone component:

```typescript
// After: Dedicated component with clear props
interface ExportDialogProps {
  isOpen: boolean
  onClose: () => void
  onExportCsv: () => void
  onCopyToClipboard: () => void
  isExporting: boolean
  isCopying: boolean
  itemCount: number
}
```

*Before:* 70 lines embedded in Filters.tsx
*After:* 10-line component usage

== Quality Mapping Extraction (SoC)

Created `common/utils/qualityMapping.ts` with data-driven approach:

```typescript
// After: Data structure instead of switch
export const QUALITY_MAPPINGS: Record<string, string> = {
  'DUB-A|A': 'DUB A/A',
  'DUB-B|B': 'DUB B/B',
  'ZIR-ZIR': 'ZIRBE',
  // ... more mappings
}

export function getFullQualityName(code: string | null): string {
  if (!code) return ''
  return QUALITY_MAPPINGS[code] ?? code
}
```

*Impact:* Adding new quality types requires only adding to the data structure.

== Chart Decomposition (SoC)

Extracted animation and rendering logic from VolumeInTimeChart:

- `hooks/useChartAnimation.ts` - Pulsing/goofy loading animation
- `components/chart/ChartTooltip.tsx` - Tooltip rendering
- `components/chart/ChartXAxisTick.tsx` - Custom X-axis with year grouping

== Summary of Changes

#table(
  columns: (auto, auto, auto, auto),
  inset: 8pt,
  align: left,
  [*Original File*], [*Extracted To*], [*Lines Moved*], [*Theorem*],
  [`WarehouseScreen`], [`appConfig.ts`], [~30], [DVT],
  [`SlotsTable`], [`slotSorting.ts`], [50], [SoC],
  [`Filters`], [`ExportDialog.tsx`], [70], [SoC],
  [`WarehouseSlot`], [`qualityMapping.ts`], [40], [SoC],
  [`VolumeInTimeChart`], [`useChartAnimation.ts`], [30], [SoC],
)

Total lines extracted: *~220 lines* moved into focused, testable modules.
