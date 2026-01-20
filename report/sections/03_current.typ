= Current System Analysis

This section analyzes the original codebase structure and identifies specific NS theory violations.

== System Architecture

The hranolky-react application is a single-page React application with the following architecture:

#table(
  columns: (auto, auto),
  inset: 8pt,
  align: left,
  [*Layer*], [*Technology*],
  [Frontend], [React 19, TypeScript, Vite],
  [UI Framework], [Tailwind CSS, MUI, Actify],
  [State], [React Context, Local State],
  [Data], [Firebase Firestore],
  [Charts], [Recharts],
)

The application manages warehouse inventory for two product types: *Hranolky* (beams) and *Sparovky* (jointers), allowing filtering, sorting, and exporting of slot data.

== Identified Violations

=== Filters.tsx (321 lines)

This component exhibited the most severe SoC violation, combining:
- Filter chip UI rendering
- Export dialog modal
- Export progress tracking
- CSV generation coordination

```typescript
// Original: Export dialog embedded in filter component
{showExportDialog && (
  <div className="fixed inset-0 ...">
    <div className="bg-[var(--color-bg-01)] ...">
      <h3>Exportovat historii stavů</h3>
      <button onClick={handleExport}>...</button>
      <button onClick={handleCopyToClipboard}>...</button>
    </div>
  </div>
)}
```

=== SlotsTable.tsx (179 lines)

Mixed presentation with complex sorting logic:

```typescript
// Original: 50+ lines of inline sorting
{warehouseSlots.sort((a, b) => {
  if (sortingBy === SortingBy.quality) {
    return b.quality.localeCompare(a.quality);
  } else if (sortingBy === SortingBy.thickness) {
    return (a.thickness ?? 0) - (b.thickness ?? 0);
  }
  // ... more sorting cases
}).flatMap(slot => <TableRow />)}
```

=== WarehouseSlotClass (187 lines)

Data model class mixed with display formatting:

```typescript
// Original: 40-line switch statement in data class
private getFullQualityName(quality: string): string {
  switch (quality) {
    case "DUB-A|A": return "DUB A/A";
    case "DUB-B|B": return "DUB B/B";
    // ... 15+ more cases
  }
}
```

=== WarehouseScreen.tsx (116 lines)

Hardcoded configuration values (DVT violation):

```typescript
// Original: Hardcoded admin emails
{['jelinekp6@gmail.com', 'jelinekv007@gmail.com']
  .includes(user.email || '') && (
    <button onClick={() => navigate('/admin')}>Admin</button>
)}
```

== Metrics Summary

#table(
  columns: (auto, auto, auto),
  inset: 8pt,
  align: left,
  [*File*], [*Lines*], [*Violations*],
  [`Filters.tsx`], [321], [SoC: UI + Dialog + Export],
  [`SlotsTable.tsx`], [179], [SoC: Presentation + Sorting],
  [`VolumeInTimeChart.tsx`], [482], [SoC: Animation + Data + UI],
  [`WarehouseSlotClass`], [187], [SoC: Data + Display],
  [`WarehouseScreen.tsx`], [116], [DVT: Hardcoded config],
)
