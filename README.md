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

## Repository guide

- [Contributing guide](CONTRIBUTING.md) - local workflow, feature branches, OpenSpec SDD, and pull requests.
- [Architecture guide](docs/architecture.md) - application data flow, feature ownership, tests, and agent navigation.
- [OpenSpec capabilities](openspec/specs/) - durable product requirements and scenarios.
- [Graphify report](graphify-out/GRAPH_REPORT.md) - generated repository architecture report.
- [Interactive Graphify graph](graphify-out/graph.html) - generated visual graph.

For the shortest path to a change, read the [contributing guide](CONTRIBUTING.md) before editing code.
