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

-   [x] Define types for tracked objects, scenarios, telemetry history,
    and alerts.
-   [x] Create at least 10 simulated objects with stable IDs.
-   [x] Generate deterministic initial positions and motion.
-   [x] Implement start, pause, resume, reset, and simulation-speed
    controls.
-   [x] Ensure timers are cleaned up and state does not drift between
    components.
-   [x] Add unit tests for state advancement and reset behavior.

**Exit criteria:** Objects update consistently and all controls work. (COMPLETE)

## Phase 2 --- Tracking Dashboard

-   [x] Build overview cards for tracked objects, risk counts, and
    active alerts.
-   [x] Build a radar-style Canvas or SVG view using simulated
    coordinates.
-   [x] Render object markers, heading indicators, and predicted paths.
-   [x] Make markers selectable.
-   [x] Add a details panel with telemetry and last-updated time.
-   [x] Add responsive behavior for narrow screens.

**Exit criteria:** Selecting an object shows details that match its
marker and telemetry. (COMPLETE)

## Phase 3 --- Prediction

-   [x] Implement a simple constant-velocity position estimate.
-   [x] Make prediction horizon configurable within a short demo range.
-   [x] Display predicted paths distinctly from current positions.
-   [x] Label predictions as estimates and show the prediction horizon.
-   [x] Test zero-speed and boundary cases.

**Exit criteria:** Predicted positions update consistently when the
simulation changes. (COMPLETE)

## Phase 4 --- Explainable Risk Scoring

-   [x] Define a small set of documented, simulation-only risk rules.
-   [x] Calculate a risk score from configured scenario conditions.
-   [x] Convert scores into Low, Medium, and High categories.
-   [x] Show the contributing factors beside each score.
-   [x] Add tests for thresholds and edge cases.
-   [x] Clearly state that the rules are illustrative and not validated
    threat detection.

**Exit criteria:** A reviewer can understand why an object received its
displayed risk level. (COMPLETE)

## Phase 5 --- Alerts and Scenarios

-   [x] Create an alert feed with severity, time, object ID, and
    explanation.
-   [x] Trigger alerts on state transitions rather than every update.
-   [x] Add acknowledgement and clear/reset behavior.
-   [x] Add two or three predefined scenarios with different simulated
    behaviors.
-   [x] Verify that scenario changes visibly affect telemetry,
    predictions, risk, and alerts.

**Exit criteria:** A scenario change produces an understandable
end-to-end effect without flooding the alert feed. (COMPLETE)

## Phase 6 --- Polish and Validation

-   [x] Check desktop and mobile layouts.
-   [x] Ensure color is not the only way risk is communicated.
-   [x] Add loading, empty, and error states where needed.
-   [x] Check keyboard accessibility and visible focus.
-   [x] Verify no required feature depends on an external service.
-   [x] Run tests, lint, and production build.
-   [x] Fix console errors and test every control manually.

**Exit criteria:** The prototype is stable enough for a live
presentation. (COMPLETE)

## Phase 7 --- Submission and Demo

-   [x] Write README setup instructions.
-   [x] Document architecture, simulation assumptions, risk rules, and
    limitations.
-   [ ] Add screenshots only after the UI is functional.
-   [x] Prepare a 2--3 minute demo script.
-   [x] Test the demo from a fresh install or clean checkout.
-   [x] Prepare a fallback scenario in case the live simulation behaves
    unexpectedly.

**Exit criteria:** Project is thoroughly documented, verified, and demo-ready. (COMPLETE)

## Phase 8 --- Bento UI/UX Overhaul & Functional Audit

-   [x] Replace generic AI dark theme with editorial defense-tech Bento Grid.
-   [x] High-contrast architectural light shell (`#f8fafc`) with purposeful dark radar aperture (`#090e17`).
-   [x] Replace repetitive cards with an integrated executive overview bento panel and proportional risk distribution bar.
-   [x] Refactor Radar PPI into prominent centerpiece with compact, non-intrusive toolbar.
-   [x] Redesign Selected Object details with tabular telemetry figures and collapsible factor breakdown.
-   [x] Streamline Alert Feed with single-click target selection and fast acknowledgement.
-   [x] Verify and pass 100% of unit tests, lint checks, and production builds.

**Exit criteria:** A calm, distinctive, hackathon-winning defense-tech interface that fulfills all functional requirements. (COMPLETE)

## Suggested Priority if Time Is Short

**Must-have:** simulation, tracking view, telemetry panel, prediction,
explainable risk scoring, alerts, working controls, responsive layout,
README.

**Nice-to-have:** charts, multiple themes, map tiles, exportable
reports, elaborate animations.

Do not sacrifice working behavior to add decorative features.
