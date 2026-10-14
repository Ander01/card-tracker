# Proposal

## Why

Card collectors need a focused way to record their Pokemon card collections and turn a theme or collecting goal into a useful binder layout. This change establishes the first usable app foundation now, so the product direction and core collection workflow can be validated before adding accounts, synchronization, or advanced recommendation logic.

## What Changes

- Create the initial web application shell for Card Tracker, including an introduction to the product and a clear path into the collection experience.
- Add a single-user collection workflow for adding, viewing, searching, and filtering Pokemon cards.
- Add a first binder-order suggestion experience based on simple themes or collection groupings.
- Establish the frontend project structure, local development workflow, and initial visual language for future features.
- Prepare the repository workflow around `main`, `develop`, and `feature/feature01-greenfield`; repository hosting and branch creation remain delivery setup rather than application behavior.
- Keep the first release local-first and avoid authentication, remote synchronization, and production backend requirements.

## Capabilities

### New Capabilities

- `collection-management`: Users can maintain and browse a local Pokemon card collection with basic card metadata, search, and filtering.
- `binder-order-suggestions`: Users can choose or describe a collection theme and receive an initial ordered binder layout suggestion.
- `card-tracker-app-shell`: Users can understand the app's purpose and navigate the initial collection and suggestion experiences.

### Modified Capabilities

- None.

## Impact

- New frontend application code and supporting configuration will be introduced; the repository currently contains only OpenSpec configuration and workflow skills.
- The first implementation will introduce a React-based client application, with TypeScript and Vite recommended for the greenfield setup.
- Data will initially be stored locally in the browser, allowing the app to work without a remote API or account system.
- Future work may replace or extend local storage with a backend without changing the core user-facing collection concepts.
