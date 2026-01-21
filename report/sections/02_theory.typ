= Theory

This section introduces Normalized Systems (NS) Theory and its four core theorems that guided the refactoring process.

== Normalized Systems Theory

Normalized Systems Theory, developed by Herwig Mannaert at the University of Antwerp, provides a theoretical framework for building evolvable software systems. The theory identifies *combinatorial effects*—situations where a single change propagates to multiple locations in the codebase—as the primary obstacle to software evolvability @mannaert2016normalized.

In traditional software development, small functional changes often require modifications across multiple files and components. This phenomenon, sometimes called "ripple effects" or "shotgun surgery," leads to:

- *Increased maintenance cost:* Developers spend more time locating and modifying code
- *Higher defect rates:* Each additional change point increases the probability of introducing bugs
- *Reduced developer confidence:* Fear of unintended side effects discourages refactoring
- *Technical debt accumulation:* Teams avoid changes that should be made

NS Theory addresses these issues by defining four fundamental theorems that, when followed, eliminate combinatorial effects and enable *linear scalability* of maintenance effort—meaning that the effort to implement a change grows linearly with the size of the change itself, not exponentially with the system's complexity.

== Four Core Theorems

=== Separation of Concerns (SoC)

The SoC theorem states that each software element should address exactly one concern. When a component mixes multiple concerns (e.g., UI rendering and business logic), changes to one concern require modifications to the entire component, creating unnecessary coupling.

*In React applications:* A component that contains both presentation logic (JSX rendering) and business logic (sorting algorithms, data transformations) violates SoC. Changes to the sorting algorithm require modifying presentation code, even though the visual output remains unchanged.

*Key insight:* Each extracted module should be independently testable and deployable. If you cannot write a unit test for a piece of functionality without rendering an entire component, SoC is likely violated.

*Violation example in hranolky-react:*
```typescript
// SlotsTable.tsx - mixing presentation with sorting logic
{warehouseSlots.sort((a, b) => {
  if (sortingBy === SortingBy.quality) {
    return a.quality.localeCompare(b.quality);
  } else if (sortingBy === SortingBy.thickness) {
    return a.thickness - b.thickness;
  }
  // ... 50 lines of sorting logic embedded in render
}).map(slot => <TableRow />)}
```

=== Data Version Transparency (DVT)

The DVT theorem requires that data structures and configuration values can evolve without causing ripple effects throughout the codebase. Instead of hardcoding values directly in components, configuration should be centralized in dedicated modules.

*In React applications:* DVT violations often appear as:
- Hardcoded admin emails or user lists in components
- API endpoints duplicated across multiple files
- Collection names repeated as string literals
- Magic numbers without named constants

*Key insight:* If adding a new admin user or changing a database collection name requires editing multiple files, DVT is violated.

*Violation example:*
```typescript
// Hardcoded admin emails scattered in multiple components
{['jelinekp6@gmail.com', 'jelinekv007@gmail.com']
  .includes(user.email) && <AdminButton />}
```

=== Action Version Transparency (AVT)

The AVT theorem ensures that actions (operations, functions, algorithms) can evolve independently of their consumers. When business logic is embedded directly in UI components, changes to the logic require modifying presentation code.

*In React applications:* AVT is achieved by extracting pure utility functions and custom hooks that encapsulate specific behaviors. These functions should:
- Have no side effects (pure functions)
- Be independently unit-testable
- Accept typed parameters and return typed results
- Not depend on React component lifecycle

*Key insight:* If changing a calculation or algorithm requires modifying a React component, AVT is violated. The algorithm should be extracted to a pure function.

=== Separation of States (SoS)

The SoS theorem requires that state changes are isolated to prevent unintended side effects. When multiple unrelated pieces of state are managed together, changes to one state can inadvertently affect others.

*In React applications:* SoS violations manifest as:
- Multiple `useState` hooks managing unrelated concerns in a single component
- State that should be derived being stored redundantly
- Global state mutations affecting unrelated areas
- Side effects triggered by state changes in unrelated contexts

*Key insight:* Related state should be encapsulated in custom hooks. If a component has more than 3-4 `useState` calls, consider whether some state belongs in separate hooks.

*Violation example:*
```typescript
// 6 useState hooks mixing animation, data, UI, and modal concerns
const [pulseOpacity, setPulseOpacity] = useState(1);        // Animation
const [displayData, setDisplayData] = useState(...);        // Data
const [goofyOffsets, setGoofyOffsets] = useState([]);       // Animation
const [manualLoadRequested, setManualLoadRequested] = useState(false); // UI
const [isExpanded, setIsExpanded] = useState(false);        // Modal
```

== Application to Frontend Development

While NS Theory was originally developed for enterprise Java systems, its principles translate directly to React applications:

#table(
  columns: (auto, auto, auto),
  inset: 8pt,
  align: left,
  [*NS Theorem*], [*React Pattern*], [*Example*],
  [SoC], [Component/hook separation], [Extract `sortSlots()` from `SlotsTable`],
  [DVT], [Configuration modules], [Centralize admin emails in `appConfig.ts`],
  [AVT], [Pure utility functions], [Extract `getWeekNumber()` to `weekUtils.ts`],
  [SoS], [Custom hooks for state], [Extract `useSlotFiltering()` hook],
)

== Benefits of NS-Compliant Architecture

Systems that follow NS Theory principles exhibit:

1. *Linear maintenance scalability:* The effort to implement a change is proportional to the change's inherent complexity, not the system's size
2. *Improved testability:* Focused modules can be unit tested in isolation
3. *Reduced fear of change:* Developers can confidently make modifications knowing the impact is contained
4. *Better code comprehension:* Each module has a single, clear purpose

The following sections demonstrate how these principles were applied to identify violations in the current system and systematically resolve them through targeted refactoring.
