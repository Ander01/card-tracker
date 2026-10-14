# Tasks

## 1. Repository and application foundation

- [ ] 1.1 Create the private GitHub repository under `Ander01` and establish `main` and `develop`; verify the repository is private and both branches exist.
- [ ] 1.2 Create `feature/feature01-greenfield` from `develop`; verify the feature branch points to the develop baseline.
- [ ] 1.3 Scaffold the React, Vite, and TypeScript application with development and production scripts; verify dependency installation and the development build complete successfully.
- [ ] 1.4 Establish the feature-oriented source structure, shared styling primitives, and accessible application layout; verify the app starts and the introductory view renders.

## 2. Collection domain and persistence

- [ ] 2.1 Define the typed card and collection models, validation rules, and storage boundary; verify unit tests reject missing names and invalid quantities.
- [ ] 2.2 Implement local browser persistence and collection add/load operations; verify a saved card is restored after a reload or storage reinitialization.
- [ ] 2.3 Build the add-card form with required and optional metadata, validation feedback, and success state; verify component tests cover valid submission and rejected incomplete submission.
- [ ] 2.4 Build the collection view with populated and empty states; verify component tests display saved metadata and the empty-state guidance.
- [ ] 2.5 Add name search and set/type/rarity filtering without mutating saved data; verify tests cover matching, combined filters, and clearing filters.
- [ ] 2.6 Document the local-first collection behavior and supported card fields in the project README; verify the documented development command works from a clean checkout.

## 3. Binder suggestion experience

- [ ] 3.1 Define deterministic theme/grouping rules and stable ordering behavior; verify unit tests produce the same ordered result for the same collection and theme.
- [ ] 3.2 Implement suggestion generation from the shared collection state, including no-theme, no-match, and incomplete-metadata outcomes; verify tests cover each outcome without changing saved cards.
- [ ] 3.3 Build the binder suggestion view with theme selection/input, ordered cards, rationale, and explicit unclassified or excluded states; verify component tests render matching and no-match results.
- [ ] 3.4 Add navigation between the app shell, collection view, and suggestion view while preserving local collection context; verify an end-to-end browser check can complete the core flow without authentication.

## 4. Integration and delivery checks

- [ ] 4.1 Add responsive and keyboard-accessible behavior for the core forms, filters, navigation, and suggestion output; verify automated accessibility checks and keyboard navigation pass.
- [ ] 4.2 Run the full test suite, type-check, lint, and production build; verify all commands pass on `feature/feature01-greenfield`.
- [ ] 4.3 Review the initial app against the three capability specs and record any deferred behavior in the project documentation; verify the acceptance checklist is complete before merging into `develop`.
