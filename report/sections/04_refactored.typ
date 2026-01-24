= Refactored System

This section documents the systematic changes made to address the identified NS Theory violations. Each refactoring follows the principle of extracting focused, testable modules that can evolve independently.

== Test-Driven Approach

Before refactoring, I established a comprehensive test suite as a safety net. According to @mannaert2016normalized, tests serve as executable specifications that ensure behavior preservation during restructuring.

#table(
  columns: (auto, auto, auto),
  inset: 8pt,
  align: left,
  [*Test Category*], [*Files*], [*Tests*],
  [Unit Tests],
  [`slotSorting.test.ts`, `slotFilterUtils.test.ts`, `weekUtils.test.ts`, `qualityMapping.test.ts`, `exportToCsv.test.ts`, `chartAxisUtils.test.ts`, `WarehouseSlot.test.ts`, `appSettings.test.ts`, `SlotFilter.test.ts`],
  [101],

  [Component Tests],
  [`SlotsTable.test.tsx`, `ExportDialog.test.tsx`, `VolumeInTimeChart.test.tsx`, `AccessDenied.test.tsx`, `ChartOverlay.test.tsx`, `ErrorBoundary.test.tsx`, `LoadingOverlay.test.tsx`, `AppSettingsCard.test.tsx`],
  [52],

  [Hook Tests], [`useSlotFiltering.test.ts`, `useChartLoadingState.test.ts`, `useAppSettings.test.ts`], [20],
  [Integration & E2E],
  [`FilteringFlow.test.tsx`, `AdminFlow.test.tsx`, `ExportFlow.test.tsx`, `warehouse.spec.ts`, `admin.spec.ts`],
  [23],

  [*Total*], [26 files], [*196 tests*],
)

== Data Version Transparency (DVT) Resolution

DVT requires that configuration values are isolated so they can evolve without ripple effects. The solution centralizes all configurable values in a single module.

=== Configuration Module (`config/appConfig.ts`)

```typescript
// After: Centralized configuration
export const ADMIN_EMAILS = [
  'abc@xyz.com',
  'def@xyz.com',
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
  [Modal], [`useExpandedModal.ts`], [35 lines extracted], [SoS],
  [UI], [`LoadingOverlay.tsx`], [Eliminated dual overlay], [DRY],
  [Filtering], [`slotFilterUtils.ts`], [Pure filter operations], [AVT],
  [Errors], [`ErrorBoundary.tsx`], [Fault isolation wrapper], [SoS],
  [Chart], [`chartAxisUtils.ts`], [Pure axis calculations], [SoC],
  [Chart], [`useChartDataTransform.ts`], [Animation state hook], [SoS],
)

== Code Splitting (SoC)

Following the Separation of Concerns principle at the module level, route components are now lazy-loaded:

```typescript
// App.tsx - Lazy loading for code splitting
const Hranolky = lazy(() => import('./screens/Hranolky'));
const Sparovky = lazy(() => import('./screens/Sparovky'));
const AdminPanel = lazy(() => import('./screens/AdminPanel'));
```

*SoC Benefit:* Each route loads only when needed, reducing initial bundle size and enforcing clear module boundaries.

== Error Boundary (SoS - Fault Isolation)

Following the Separation of States principle for fault isolation, errors in one component don't crash the entire application:

```typescript
// ErrorBoundary.tsx - Catches JavaScript errors anywhere in child tree
<ErrorBoundary>
  <Suspense fallback={<LoadingOverlay />}>
    <Routes>...</Routes>
  </Suspense>
</ErrorBoundary>
```

*SoS Benefit:* Runtime errors are contained. Users see a friendly error message with retry option instead of a white screen.

== E2E Test Infrastructure

Playwright end-to-end tests with mocked Google OAuth:

- `warehouse.spec.ts` - Tests login screen, navigation
- `admin.spec.ts` - Tests admin panel access

Mock fixtures provide consistent test data without Firestore writes.

== Quantitative Results

*Total: ~700 lines* moved into 20 focused, testable modules.

*196 automated tests* ensure correctness (unit + integration + E2E).

=== Git Statistics (master vs sea-refactor)

#table(
  columns: (auto, auto, auto, auto),
  inset: 8pt,
  align: left,
  [*Category*], [*Files*], [*Insertions*], [*Deletions*],
  [Tests], [26], [2,381], [0],
  [App Logic (.ts/tsx)], [66], [3,169], [682],
  [Other (Config/Docs)], [28], [1,361], [331],
  [*Total*], [*120*], [*6,911*], [*1,013*],
)
_Note: "Other" includes documentation, configuration files, and assets. The significant insertions in App Logic reflect the introduction of new modules and strong typing._

*Lines of code per violation addressed:*
- SoC: 11 modules, ~400 lines extracted
- SoS: 5 hooks/components for state and fault isolation
- DVT: Config module with inventory weeks constant
- DRY: 4 utility modules, eliminating ~250 lines of duplication
- AVT: Pure filter utilities enable composable operations

The refactored codebase now exhibits linear scalability of maintenance effort as predicted by NS Theory.


