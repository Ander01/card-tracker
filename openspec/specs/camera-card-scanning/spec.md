# camera-card-scanning Specification

## Purpose

Provides a guided browser-camera workflow for capturing a trading card and reviewing it before registration, while leaving automated identification and grading analysis replaceable for a future model feature.

## Requirements

### Requirement: Start a camera scanning session

The application SHALL provide a scanner entry point from the collection experience and SHALL request camera access only when the user starts scanning.

#### Scenario: User starts scanning

- **WHEN** the user chooses â€œScan a cardâ€ from the collection experience
- **THEN** the application requests camera access and enters a live preview or an explicit camera error state

#### Scenario: Camera access is denied

- **WHEN** the user denies camera permission
- **THEN** the application explains that access is required for scanning, provides a way to retry, and preserves the manual add-card workflow

#### Scenario: Camera is unavailable

- **WHEN** no usable camera exists or the browser cannot provide camera access
- **THEN** the application explains that scanning is unavailable and provides a way to return to manual entry

### Requirement: Guide card placement in the live preview

The application SHALL show a visible card-shaped placement guide and text instructions that help the user place one card inside the capture area.

#### Scenario: Live preview is active

- **WHEN** the camera stream is running
- **THEN** the user sees the live video, a card-proportioned guide, and instructions to align one card within the guide

#### Scenario: Phone camera is used

- **WHEN** the application runs on a phone with a rear-facing camera
- **THEN** the application prefers the rear-facing camera while allowing the browser to select an available camera when that preference cannot be honored

### Requirement: Capture and review a card image

The application SHALL allow the user to capture a still image from the live preview and SHALL provide preview, retake, confirm, and cancel actions.

#### Scenario: User captures a card

- **WHEN** the user activates capture while the preview is live
- **THEN** the application freezes a still image for review and offers retake, confirm, and cancel actions

#### Scenario: User retakes a capture

- **WHEN** the user chooses retake
- **THEN** the application returns to the live preview without registering a card

#### Scenario: User cancels scanning

- **WHEN** the user cancels from the live preview or captured-image review
- **THEN** the application stops the active camera stream, discards the ephemeral image, and returns to the collection experience without changing the collection

### Requirement: Review a capture without automated analysis

The application SHALL allow the user to enter or edit card metadata after capture and SHALL explicitly identify recognition and grading-centering analysis as unavailable until a future model capability is provided.

#### Scenario: User confirms a capture

- **WHEN** the user confirms a captured image
- **THEN** the application presents an editable card metadata review form and does not claim that the card has been identified automatically

#### Scenario: Analysis is not implemented

- **WHEN** the user reviews a captured image before recognition or centering analysis exists
- **THEN** the application displays an unavailable or not-analyzed state rather than fabricated card identity, confidence, or centering score

### Requirement: Release camera resources

The application SHALL stop all active camera tracks and release the temporary capture image when scanning ends.

#### Scenario: User leaves the scanner

- **WHEN** the user saves, cancels, retakes, navigates away, or the scanner is unmounted
- **THEN** the application stops the camera tracks and releases the temporary image resources
