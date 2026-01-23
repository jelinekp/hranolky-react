= System Architecture Comparison

This section presents a visual comparison of the application architecture before and after applying Normalized Systems Theory principles.

== Before Refactoring

The original architecture featured a *flat component structure* with mixed concerns:

#figure(
  table(
    columns: (1fr, 2fr, 1fr),
    inset: 10pt,
    align: left,
    fill: (col, row) => if row == 0 { rgb("#FFB3B3") } else { white },
    [*Component*], [*Mixed Responsibilities*], [*Lines*],
    [`Filters.tsx`], [Filter UI + Export Dialog + Export Logic + Progress Bar], [321],
    [`VolumeInTimeChart.tsx`], [Chart + Animation + Data Transform + Modal + Axis], [482],
    [`SlotsTable.tsx`], [Table Rendering + Sorting Logic + Quality Mapping], [179],
    [`ContentLayoutContainer`], [Layout + Filter State + Sorting State], [111],
    [`AdminPanel.tsx`], [Access Control + Device Table + Edit State], [240],
  ),
  caption: [Original component structure with mixed concerns],
)

#figure(
  image("../diagrams/architecture_before.png", width: 80%),
  caption: [Directory structure before refactoring (master branch) — 35 source files with significant coupling],
)

#pagebreak()

== After Refactoring

The refactored architecture follows NS Theory principles with *modular, single-responsibility components*:

#figure(
  table(
    columns: (1fr, 2fr, 1fr),
    inset: 10pt,
    align: left,
    fill: (col, row) => if row == 0 { rgb("#B3FFB3") } else { white },
    [*Module*], [*Single Responsibility*], [*Principle*],
    [`ExportDialog.tsx`], [Export options modal UI only], [SoC],
    [`ChartOverlay.tsx`], [Chart overlay rendering only], [SoC],
    [`slotSorting.ts`], [Pure sorting functions only], [SoC],
    [`useSlotFiltering.ts`], [Filter state management only], [SoS],
    [`useChartLoadingState.ts`], [Loading state coordination only], [SoS],
    [`ErrorBoundary.tsx`], [Fault isolation wrapper], [SoS],
    [`appConfig.ts`], [Centralized configuration], [DVT],
    [`slotFilterUtils.ts`], [Pure filter operations], [AVT],
  ),
  caption: [Refactored modules with single responsibilities],
)

#figure(
  image("../diagrams/architecture_after.png", width: 100%),
  caption: [Directory structure after refactoring (sea-refactor branch) — 53 source files with clear boundaries],
)

== Architectural Improvements

#table(
  columns: (auto, 1fr, 1fr),
  inset: 8pt,
  align: left,
  [*Metric*], [*Before*], [*After*],
  [Source files], [35], [53 (+51%)],
  [Average component size], [~200 lines], [~60 lines],
  [Largest component], [482 lines], [~150 lines],
  [Test coverage], [0 tests], [146 tests],
  [Directory depth], [Flat], [Organized by concern],
)

The increase in file count reflects the extraction of focused modules from monolithic components. Each module now has a single reason to change, enabling independent evolution as predicted by NS Theory.
