# Card Tracker

Card Tracker is a local-first web app for managing a Pokemon card collection and exploring themed binder layouts.

## Quick start

Prerequisites:

- Node.js with npm
- A browser with local storage enabled

Install dependencies and start the Vite development server:

```bash
npm install
npm run dev
```

The collection is stored in the browser's local storage. No account, backend, or remote service is required for the core experience.

## Useful commands

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the Vite development server |
| `npm test` | Run the Vitest suite once |
| `npm run test:watch` | Run Vitest in watch mode |
| `npm run typecheck` | Run TypeScript without emitting files |
| `npm run lint` | Run the repository's TypeScript-based lint check |
| `npm run build` | Type-check and create a production build |
| `npm run preview` | Serve the production build locally |

## Supported card fields

- Card name (required)
- Set
- Type
- Rarity
- Quantity
- Notes
- Elemental typing (including multiple types; separate from card kind)
- Pokemon generation (not a card's release region or set year)
- Independent manual EUR value for each physical copy, or Unknown

## Organizing physical copies

Every newly added copy, including reviewed scanner entries, starts in **Bulk /
Unsorted** with an unknown value. Unsorted is automatic: it appears while copies
need sorting, disappears once the last copy moves out, and reappears for incoming
or returned copies. It cannot be renamed or deleted.

Bulk categories are flat, manual divider sections, like markers inside one real
box, not nested folders or automatic searches. Create a category, select specific
copies, and choose **Move selected** to assign destinations. Four identical cards
can be split between bulk dividers and binder pockets while remaining four owned
copies. Category names are unique and Unsorted is reserved. Confirmed category or
binder deletion returns copies to Unsorted; it never deletes owned cards or values.

Create a named binder with a cover color, page count, and rows/columns per page
(defaults: 20 pages, 3 x 3 pockets). One copy occupies one explicit pocket; gaps
remain empty. Capacity never grows automatically: edit the binder to add pages or
free a pocket. Removed trailing pages must be empty, and changing the pocket grid
requires an empty binder. Previous/next controls and direct page selection work
with keyboard or pointer (enter a page number and choose **Go to page**);
reduced-motion preferences disable the page-turn effect.
Collection location links open the saved page and highlight its pocket.

Filters for name, set, card kind, rarity, elemental typing, generation, and inclusive
EUR value bounds narrow All cards, the whole bulk box, or a divider without moving
anything. Missing metadata stays Unknown. Clear filters to include unknown values;
active price bounds exclude unpriced copies. Binder pages retain all physical slots.

Edit each copy's EUR value independently. Blank means **Unknown**, not EUR 0.00;
values must be nonnegative and have at most two decimal places. Condition or grading
can inform the amount you enter, but structured condition/grade fields, automatic
valuation, live pricing, and currency conversion are not implemented.

**Binder ideas** remains a read-only theme preview, not a saved binder arrangement.
It does not reserve pockets or move copies.

Existing local quantity-based collections migrate automatically into Unsorted.
The original payload is retained at `card-tracker.collection.legacy-backup`; new
organization is saved as a validated versioned snapshot at the original key.
Storage failures are displayed rather than silently resetting the collection.
See the [architecture guide](docs/architecture.md) before attempting recovery.

## Repository guide

- [Contributing guide](CONTRIBUTING.md) - local workflow, feature branches, OpenSpec SDD, and pull requests.
- [Architecture guide](docs/architecture.md) - application data flow, feature ownership, tests, and agent navigation.
- [OpenSpec capabilities](openspec/specs/) - durable product requirements and scenarios.
- [Graphify report](graphify-out/GRAPH_REPORT.md) - generated repository architecture report.
- [Interactive Graphify graph](graphify-out/graph.html) - generated visual graph.

For the shortest path to a change, read the [contributing guide](CONTRIBUTING.md) before editing code.
