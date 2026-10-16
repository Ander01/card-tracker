# Proposal

## Why

Card Tracker currently requires collectors to type every card into the collection form. A camera-assisted workflow can make card entry faster on both desktop webcams and phones while preserving manual control until recognition and grading models are ready.

This change establishes the camera experience and its future analysis boundaries now, so model work can be added later without redesigning capture, review, or collection registration.

## What Changes

- Add a dedicated scanner experience reachable from the collection view.
- Request and manage browser camera access for webcams and phone cameras opened directly in the app.
- Show a card-shaped placement guide and accessible instructions during live preview.
- Capture an ephemeral still image with retake, cancel, and review actions.
- Allow the user to enter or edit card metadata manually after capture.
- Save the reviewed card through the existing collection validation and local persistence flow.
- Define replaceable recognition and centering-analysis result boundaries that report unavailable until future model work is implemented.
- Keep captured images out of persistent collection storage.
- Preserve the existing manual add-card workflow and offline/local-only behavior.

## Capabilities

### New Capabilities

- `camera-card-scanning`: Provides camera permission handling, guided preview, ephemeral capture, review, manual fallback, and future analysis boundaries.

### Modified Capabilities

- `collection-management`: Extends card creation so a reviewed camera capture can be registered through the same required-name, quantity validation, display, and local persistence behavior as a manually entered card.

## Impact

- The React app shell and collection view in `src/App.tsx` will gain scanner navigation and workflow composition.
- New camera/scanner modules and focused tests will own media-stream lifecycle, capture state, and future analysis contracts.
- Existing card validation and storage remain the persistence boundary; no database, account, remote API, or image-storage dependency is introduced.
- Browser permissions and secure-context requirements become part of the scanner's user-facing error states.
- The implementation should work with the current React, TypeScript, Vite, and Vitest setup without adding a computer-vision or recognition dependency.
