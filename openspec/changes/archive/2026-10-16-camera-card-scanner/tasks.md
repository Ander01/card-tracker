# Tasks

## 1. Camera session foundation

- [x] 1.1 Create focused scanner types for lifecycle state, capture data, analysis availability, and camera errors, and verify the TypeScript typecheck passes without adding recognition or computer-vision dependencies.
- [x] 1.2 Implement browser camera session setup with rear-camera preference, secure-context and permission error mapping, and complete media-track cleanup; verify unit tests cover successful startup, denied permission, unavailable camera, and cleanup.
- [x] 1.3 Implement ephemeral still-image capture and release behavior, including object URL or canvas resource cleanup; verify tests cover capture, retake, cancel, and terminal-state disposal.

## 2. Scanner experience

- [x] 2.1 Add a dedicated scanner view and collection entry action while preserving the existing manual add-card action; verify app tests can navigate from collection to scanner and back.
- [x] 2.2 Build the live preview with a responsive Pokémon-card-ratio placement guide, textual placement instructions, capture control, and explicit requesting/error states; verify component tests cover live, permission-error, and unavailable-camera rendering.
- [x] 2.3 Build captured-image review with preview, retake, confirm, and cancel actions, and ensure the UI communicates that recognition and grading-centering analysis are unavailable; verify tests reject fabricated identity, confidence, and centering values.

## 3. Collection registration

- [x] 3.1 Connect confirmed scanner metadata to the existing `NewCard` validation and local collection save boundary without creating a second card schema or persistence path; verify a valid reviewed capture is displayed and persisted like a manually entered card.
- [x] 3.2 Verify invalid or abandoned reviewed captures do not change the collection and that manual add-card behavior remains intact through focused app and storage tests.

## 4. Accessibility and project documentation

- [x] 4.1 Add accessible names, status/error announcements, keyboard-operable controls, and non-visual instructions for the scanner; verify the accessibility test suite passes for the scanner states.
- [x] 4.2 Update `docs/architecture.md` with the scanner view, camera lifecycle boundary, ephemeral-image rule, and future analysis seams; verify the documented runtime flow matches the implemented modules.

## 5. Integration verification

- [x] 5.1 Run the focused scanner, collection, accessibility, and storage tests plus the TypeScript build; verify existing collection and binder-suggestion tests remain green.
- [x] 5.2 Manually verify the scanner on a localhost desktop webcam and a phone browser, including permission denial, rear-camera preference, capture/retake, save, cancel, and navigation-away cleanup.
