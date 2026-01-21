= Refactored System

This section documents the systematic changes made to address the identified NS Theory violations. Each refactoring follows the principle of extracting focused, testable modules that can evolve independently.

== Test-Driven Approach

Before refactoring, I established a comprehensive test suite as a safety net. According to @mannaert2016normalized, tests serve as executable specifications that ensure behavior preservation during restructuring.

#table(
  columns: (auto, auto, auto),
  inset: 8pt,
  align: left,
  [*Test Category*], [*Files*], [*Tests*],
  [Unit Tests], [`SlotFilter.test.ts`, `slotSorting.test.ts`, `qualityMapping.test.ts`, `weekUtils.test.ts`], [45],
  [Component Tests],
  [`SlotsTable.test.tsx`, `ExportDialog.test.tsx`, `VolumeInTimeChart.test.tsx`, `AccessDenied.test.tsx`, `ChartOverlay.test.tsx`],
  [40],

  [Hook Tests], [`useSlotFiltering.test.ts`, `useChartLoadingState.test.ts`], [14],
  [Integration Tests], [`FilteringFlow.test.tsx`], [5],
  [*Total*], [13 files], [*112 tests*],
)

== Data Version Transparency (DVT) Resolution

DVT requires that configuration values are isolated so they can evolve without ripple effects. The solution centralizes all configurable values in a single module.

=== Configuration Module (`config/appConfig.ts`)

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

*DVT Benefit:* Adding a new admin or slot type now requires a single-line change in one file. All consuming code automatically receives the update.

== Separation of Concerns (SoC) Resolution

SoC requires each module to have a single, well-defined responsibility. The following extractions eliminate combinatorial effects by isolating concerns.

=== Sorting Logic (`utils/slotSorting.ts`)

Extracted comparison logic as a pure utility function:

```typescript
// After: Pure, testable utility function
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

*SoC Benefit:* Sorting logic can now be unit tested in isolation. Changes to the algorithm don't require touching UI code.

=== Export Dialog (`components/ExportDialog.tsx`)

Created a standalone, reusable dialog component:

```typescript
// After: Dedicated component with clear interface
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

*SoC Benefit:* The dialog can be reused in other contexts. Export functionality changes don't affect filter logic.

=== Quality Mapping (`common/utils/qualityMapping.ts`)

Replaced procedural switch statement with data-driven approach:

```typescript
// After: Data structure instead of code
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

*SoC Benefit:* Adding new quality types requires only data changes, not code changes. The mapping can be loaded from external configuration if needed.

=== Chart Components

Decomposed the 482-line VolumeInTimeChart into focused modules:

- `hooks/useChartAnimation.ts` - Pulsing/goofy loading animation logic
- `components/chart/ChartTooltip.tsx` - Tooltip rendering
- `components/chart/ChartXAxisTick.tsx` - Custom X-axis with year grouping
- `components/chart/ChartOverlay.tsx` - Reusable "No matches" and "Manual load" overlays
- `components/chart/ExpandedChartModal.tsx` - Fullscreen modal with ESC handling

*SoC Benefit:* Each component has a single responsibility. Animation can evolve independently from data logic.

=== Admin Components

Extracted focused components from AdminPanel:

- `components/admin/AccessDenied.tsx` - Reusable access denied screen
- `components/admin/DeviceRow.tsx` - Single table row with edit capabilities

*SoC Benefit:* The access denied screen can be reused across protected routes.

== Separation of States (SoS) Resolution

SoS requires that state changes are isolated to prevent unintended side effects. Custom hooks encapsulate related state and logic.

=== Filter State (`hooks/useSlotFiltering.ts`)

Extracted all filtering concerns into a dedicated hook:

```typescript
// After: Encapsulated filter state and logic
export const useSlotFiltering = (slots: WarehouseSlotClass[]) => {
  const [activeFilters, setActiveFilters] = useState(SlotFiltersClass.EMPTY);

  const filteredSlots = useMemo(() => filterSlots(slots, activeFilters), [...]);
  const distinctValues = useMemo(() => getDistinctFilterValues(slots), [slots]);

  return {
    activeFilters,
    setActiveFilters,
    filteredSlots,
    volumeSum: calculateVolume(filteredSlots),
    distinctValues,
    hasActiveFilters: !activeFilters.isEmpty()
  };
};
```

*SoS Benefit:* Filter state is completely isolated. The hook can be tested independently and reused in other contexts.

=== Chart Loading State (`hooks/useChartLoadingState.ts`)

Isolated manual load coordination logic:

```typescript
// After: Encapsulated loading state
export const useChartLoadingState = (hasActiveFilters: boolean, slotCount: number) => {
  const [manualLoadRequested, setManualLoadRequested] = useState(false);

  const shouldWaitForManualLoad = hasActiveFilters && slotCount > MANUAL_LOAD_THRESHOLD;
  const shouldFetchData = !shouldWaitForManualLoad || manualLoadRequested;

  return { manualLoadRequested, setManualLoadRequested, shouldFetchData };
};
```

*SoS Benefit:* Loading logic is now testable in isolation with clear, deterministic behavior.

== DRY Resolution for Evolvability

Created shared utility modules to eliminate code duplication:

=== Week Utilities (`common/utils/weekUtils.ts`)

Consolidated 10 week-related functions into a single source of truth:

```typescript
export function getWeekNumber(date: Date): WeekInfo { ... }
export function formatWeekId(year: number, week: number): string { ... }
export function parseWeekId(weekId: string): { year, week } | null { ... }
export function getCurrentWeekLabel(): string { ... }
```

*DRY Benefit:* Week calculation logic exists in one place. Bug fixes automatically propagate to all consumers.

=== Shared Types (`common/types/volumeTypes.ts`)

Centralized interface definitions:

```typescript
export interface VolumeDataPoint { week: string; volume: number }
export interface WeeklyReport { totalQuantity: number; totalVolumeDm: number }
export interface SlotWeeklyReport { quantity: number; volumeDm: number }
```

*DRY Benefit:* Type definitions are consistent across the codebase.

=== Collection Utilities (`common/utils/firestoreCollections.ts`)

Unified Firestore path generation:

```typescript
export function getSlotCollectionName(slotType: SlotType): string
export function getWeeklyReportsPath(slotType: SlotType): string[]
export function getSlotWeeklyReportsPath(slotType: SlotType, slotId: string): string[]
```

*DRY Benefit:* Adding a new slot type requires updating only this module.

== Summary of Changes

#table(
  columns: (auto, auto, auto, auto),
  inset: 8pt,
  align: left,
  [*Category*], [*Module*], [*Impact*], [*Principle*],
  [Config], [`appConfig.ts`], [Centralized admin/collections], [DVT],
  [Sorting], [`slotSorting.ts`], [50 lines extracted], [SoC],
  [Dialog], [`ExportDialog.tsx`], [70 lines extracted], [SoC],
  [Mapping], [`qualityMapping.ts`], [40 lines extracted], [SoC],
  [Chart], [`useChartAnimation.ts`], [30 lines extracted], [SoC],
  [Weeks], [`weekUtils.ts`], [Eliminated 3× duplication], [DRY],
  [Types], [`volumeTypes.ts`], [Eliminated 4× duplication], [DRY],
  [Paths], [`firestoreCollections.ts`], [Eliminated 5× duplication], [DRY],
  [Overlay], [`ChartOverlay.tsx`], [Reusable chart overlays], [SoC],
  [Modal], [`ExpandedChartModal.tsx`], [Fullscreen chart logic], [SoC],
  [Admin], [`AccessDenied.tsx`], [Reusable access control], [SoC],
  [Admin], [`DeviceRow.tsx`], [Table row component], [SoC],
  [Filtering], [`useSlotFiltering.ts`], [100 lines extracted], [SoS],
  [Loading], [`useChartLoadingState.ts`], [50 lines extracted], [SoS],
)

== Quantitative Results

*Total: ~500 lines* moved into 14 focused, testable modules.

*112 automated tests* ensure correctness and enable confident future modifications.

*Lines of code per violation addressed:*
- SoC: 9 modules, ~350 lines extracted
- SoS: 2 hooks, ~150 lines extracted
- DVT: 1 config module, ~50 lines
- DRY: 3 utility modules, eliminating ~200 lines of duplication

The refactored codebase now exhibits linear scalability of maintenance effort as predicted by NS Theory.
