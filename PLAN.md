# Implementation Plan

## Phase 0 --- Project Setup

-   [x] Create a React + TypeScript + Vite project.
-   [x] Add linting and a test runner.
-   [x] Create the initial responsive dashboard shell.
-   [x] Add a persistent "SIMULATION MODE --- NOT LIVE SENSOR DATA"
    label.
-   [x] Confirm `npm run dev` and `npm run build` work.

**Exit criteria:** The app starts cleanly and displays the dashboard
shell. (COMPLETE)

## Phase 1 --- Simulation Engine

-   [ ] Define types for tracked objects, scenarios, telemetry history,
    and alerts.
-   [ ] Create at least 10 simulated objects with stable IDs.
-   [ ] Generate deterministic initial positions and motion.
-   [ ] Implement start, pause, resume, reset, and simulation-speed
    controls.
-   [ ] Ensure timers are cleaned up and state does not drift between
    components.
-   [ ] Add unit tests for state advancement and reset behavior.

**Exit criteria:** Objects update consistently and all controls work.

## Phase 2 --- Tracking Dashboard

-   [ ] Build overview cards for tracked objects, risk counts, and
    active alerts.
-   [ ] Build a radar-style Canvas or SVG view using simulated
    coordinates.
-   [ ] Render object markers, heading indicators, and predicted paths.
-   [ ] Make markers selectable.
-   [ ] Add a details panel with telemetry and last-updated time.
-   [ ] Add responsive behavior for narrow screens.

**Exit criteria:** Selecting an object shows details that match its
marker and telemetry.

## Phase 3 --- Prediction

-   [ ] Implement a simple constant-velocity position estimate.
-   [ ] Make prediction horizon configurable within a short demo range.
-   [ ] Display predicted paths distinctly from current positions.
-   [ ] Label predictions as estimates and show the prediction horizon.
-   [ ] Test zero-speed and boundary cases.

**Exit criteria:** Predicted positions update consistently when the
simulation changes.

## Phase 4 --- Explainable Risk Scoring

-   [ ] Define a small set of documented, simulation-only risk rules.
-   [ ] Calculate a risk score from configured scenario conditions.
-   [ ] Convert scores into Low, Medium, and High categories.
-   [ ] Show the contributing factors beside each score.
-   [ ] Add tests for thresholds and edge cases.
-   [ ] Clearly state that the rules are illustrative and not validated
    threat detection.

**Exit criteria:** A reviewer can understand why an object received its
displayed risk level.

## Phase 5 --- Alerts and Scenarios

-   [ ] Create an alert feed with severity, time, object ID, and
    explanation.
-   [ ] Trigger alerts on state transitions rather than every update.
-   [ ] Add acknowledgement and clear/reset behavior.
-   [ ] Add two or three predefined scenarios with different simulated
    behaviors.
-   [ ] Verify that scenario changes visibly affect telemetry,
    predictions, risk, and alerts.

**Exit criteria:** A scenario change produces an understandable
end-to-end effect without flooding the alert feed.

## Phase 6 --- Polish and Validation

-   [ ] Check desktop and mobile layouts.
-   [ ] Ensure color is not the only way risk is communicated.
-   [ ] Add loading, empty, and error states where needed.
-   [ ] Check keyboard accessibility and visible focus.
-   [ ] Verify no required feature depends on an external service.
-   [ ] Run tests, lint, and production build.
-   [ ] Fix console errors and test every control manually.

**Exit criteria:** The prototype is stable enough for a live
presentation.

## Phase 7 --- Submission and Demo

-   [ ] Write README setup instructions.
-   [ ] Document architecture, simulation assumptions, risk rules, and
    limitations.
-   [ ] Add screenshots only after the UI is functional.
-   [ ] Prepare a 2--3 minute demo script.
-   [ ] Test the demo from a fresh install or clean checkout.
-   [ ] Prepare a fallback scenario in case the live simulation behaves
    unexpectedly.

## Suggested Priority if Time Is Short

**Must-have:** simulation, tracking view, telemetry panel, prediction,
explainable risk scoring, alerts, working controls, responsive layout,
README.

**Nice-to-have:** charts, multiple themes, map tiles, exportable
reports, elaborate animations.

Do not sacrifice working behavior to add decorative features.
