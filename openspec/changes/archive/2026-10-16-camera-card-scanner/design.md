# Design

## Context

The current app is a React and TypeScript single-page application whose top-level composition and view navigation live in `src/App.tsx`. Card validation, the `NewCard` shape, and browser `localStorage` persistence live in `src/domain/collection.ts`. The existing product is local-only and has no remote service or image store.

See `proposal.md` for motivation and the capability delta files for observable behavior.

## Goals / Non-Goals

**Goals:**

- Add a dedicated scanner view without disrupting manual collection entry.
- Keep camera lifecycle and capture state isolated from collection persistence.
- Make the captured image available during review only.
- Provide explicit seams for future recognition and grading-centering analysis.
- Keep the first implementation compatible with the existing dependency set and offline/local-only architecture.

**Non-Goals:**

- Implementing card recognition, metadata extraction, or centering measurement.
- Persisting captured images.
- Pairing a phone with a separate desktop browser.
- Adding a backend, account system, computer-vision library, or model runtime.

## Decisions

### Use browser `getUserMedia` in the scanner view

The scanner will request video through the browser media API only after the user enters the scanner. On phones, the constraints will prefer the rear-facing camera; on desktops, the browser will select an available webcam.

This keeps the feature usable on both target device classes without a service or pairing protocol. A native bridge, upload-only file input, and cross-device WebRTC pairing were considered, but each either narrows the experience or introduces infrastructure outside this feature.

### Model scanner behavior as explicit lifecycle states

The scanner will distinguish idle, permission/requesting, live preview, captured review, metadata review, error, and closed states. State transitions will own stream creation, capture, retake, confirmation, cancellation, and cleanup.

Explicit states prevent permission failures and abandoned streams from appearing as successful scans. A single boolean such as `isScanning` was considered but cannot represent the required error and review transitions reliably.

### Use a fixed card-ratio placement guide

The live preview will display a responsive guide based on the project’s current Pokémon-card scope and provide text instructions alongside the visual overlay. The guide improves capture consistency but is not a centering grade.

Computer-vision edge detection was considered for this feature, but it would create a misleading score before the model capability exists and would add a new dependency. The guide remains presentation-only for now.

### Keep capture images ephemeral

Capture will produce a temporary preview for the current workflow. Confirming a scan transfers only reviewed metadata into the existing `Card`/`NewCard` flow; saving, canceling, retaking, navigation, and unmounting release the image and stop every media track.

Embedding images in the current JSON `localStorage` record was rejected because browser quotas and serialization costs are unsuitable for camera media. IndexedDB remains a possible future storage boundary if image history becomes a requirement.

### Reuse collection validation and registration

The scanner’s metadata review will submit through the same validation and persistence behavior as the manual add-card form. The scanner will not create a second card schema or persistence path.

Duplicating validation was considered but would allow scanner and manual behavior to diverge. The scanner should supply a `NewCard` draft and reuse the established collection boundary.

### Represent future analysis as unavailable results

Recognition and centering analysis will have typed result boundaries capable of representing unavailable, successful, and failed analysis, but the first implementation will report unavailable. The review UI will show that state rather than a fake identity, confidence, or centering score.

Mocked successful results were rejected because they could be mistaken for production behavior and would make later model integration harder to reason about.

## Risks / Trade-offs

- [Camera access requires HTTPS or localhost] -> Show an explicit unsupported-context error and preserve manual entry.
- [Browser and device camera constraints vary] -> Treat rear-camera selection as a preference, handle fallback streams, and expose retry/error states.
- [A stream may remain active after navigation] -> Centralize cleanup and test that all tracks are stopped for every terminal transition.
- [A still image can consume significant memory] -> Keep it temporary, revoke object URLs, and avoid storing it in collection JSON.
- [The placement guide does not guarantee a usable recognition image] -> Label it as guidance only and leave quality/recognition analysis to the future model capability.
- [The monolithic app shell may become harder to maintain] -> Keep camera lifecycle, analysis contracts, and scanner presentation in focused modules while retaining `App.tsx` as the composition point.

## Migration Plan

1. Add the scanner capability and its navigation entry point.
2. Implement camera lifecycle, capture review, and manual metadata handoff behind the existing collection boundary.
3. Verify the existing manual flow remains available and unchanged.
4. Deploy as a client-only feature; no data migration is required.
5. Roll back by removing the scanner entry point and scanner modules; existing collection data remains compatible because captured images are never persisted.

## Open Questions

None that would change the current requirements or implementation approach. Future model work can define the concrete recognition and centering algorithms behind the result boundaries.
