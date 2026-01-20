= Theory

This section introduces Normalized Systems (NS) Theory and its four core theorems that guided the refactoring process.

== Normalized Systems Theory

Normalized Systems Theory, developed by Herwig Mannaert at the University of Antwerp, provides a theoretical framework for building evolvable software systems. The theory identifies *combinatorial effects*—situations where a single change propagates to multiple locations in the codebase—as the primary obstacle to software evolvability @mannaert2016normalized.

NS Theory defines four fundamental theorems that, when followed, eliminate these combinatorial effects and enable linear scalability of maintenance effort.

== Four Core Theorems

=== Separation of Concerns (SoC)

The SoC theorem states that each software element should address exactly one concern. When a component mixes multiple concerns (e.g., UI rendering and business logic), changes to one concern require modifications to the entire component.

*Violation example in hranolky-react:*
```typescript
// SlotsTable.tsx - mixing presentation with sorting logic
{warehouseSlots.sort((a, b) => {
  if (sortingBy === SortingBy.quality) {
    return a.quality.localeCompare(b.quality);
  } else if (sortingBy === SortingBy.thickness) {
    return a.thickness - b.thickness;
  }
  // ... 50 lines of sorting logic
}).map(slot => <TableRow />)}
```

=== Data Version Transparency (DVT)

The DVT theorem requires that data structures can evolve without causing ripple effects. Hardcoded values and tight coupling to specific data shapes violate this principle.

*Violation example:*
```typescript
// Hardcoded admin emails in component
{['jelinekp6@gmail.com', 'jelinekv007@gmail.com']
  .includes(user.email) && <AdminButton />}
```

=== Action Version Transparency (AVT)

The AVT theorem ensures that actions (operations, functions) can evolve independently. When business logic is embedded directly in UI components, changes to the logic require modifying presentation code.

=== Separation of States (SoS)

The SoS theorem requires that state changes are isolated to prevent unintended side effects. Global state mutations that affect multiple unrelated areas violate this principle.

== Application to Frontend Development

While NS Theory was originally developed for enterprise systems, its principles apply directly to React applications:

#table(
  columns: (auto, auto),
  inset: 8pt,
  align: left,
  [*NS Theorem*], [*React Application*],
  [SoC], [Separate components for UI, hooks for logic],
  [DVT], [Configuration modules, typed interfaces],
  [AVT], [Pure utility functions, custom hooks],
  [SoS], [Isolated state management, context boundaries],
)
