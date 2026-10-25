# Project Conventions

## General Principles

-   Prefer a working, understandable prototype over unnecessary
    complexity.
-   Keep all telemetry and scenarios explicitly simulated.
-   Never label generated data as real sensor data.
-   Keep risk scoring explainable; show the reason for every risk label.
-   Do not add real-world targeting, interception, jamming, or
    engagement features.
-   Avoid adding a backend unless the frontend prototype has a clear
    need for one.

## Code Structure

Suggested structure:

``` text
src/
  app/
  components/
    OverviewCards.tsx
    RadarView.tsx
    ObjectDetails.tsx
    TelemetryCharts.tsx
    AlertFeed.tsx
    SimulationControls.tsx
  features/
    simulation/
      simulationEngine.ts
      scenarios.ts
      types.ts
    tracking/
      prediction.ts
    risk/
      riskScoring.ts
      riskRules.ts
    alerts/
      alertRules.ts
  styles/
    tokens.css
    global.css
  test/
```

The structure may be adjusted if the project is small, but keep
simulation logic separate from presentation components.

## Naming

-   React components and TypeScript types: `PascalCase`.
-   Functions and variables: `camelCase`.
-   Constants: `UPPER_SNAKE_CASE` for true module-level constants.
-   Files: use descriptive names; React component files may use
    `PascalCase.tsx`, utility files `camelCase.ts`.
-   Risk levels must use the consistent values `low`, `medium`, and
    `high`.

## TypeScript

-   Avoid `any`; define types for telemetry, scenarios, alerts, and
    simulation state.
-   Handle missing or invalid values gracefully.
-   Keep units in field names where useful, such as `altitudeM` and
    `speedMps`.
-   Store headings in degrees and normalize them to the range 0--359.
-   Label simulated coordinates and their units clearly.

## Simulation Rules

-   Use a deterministic seed or fixed scenarios so the demo is
    repeatable.
-   Separate simulation time from wall-clock time where practical.
-   Pause must stop simulation updates; reset must restore the initial
    state.
-   Do not create a new interval on every render.
-   Clean up timers when components unmount.
-   Avoid mutating shared state in place.
-   Keep object IDs stable across updates.

## Prediction and Risk

-   Keep prediction and risk scoring in pure functions.
-   Document assumptions and units.
-   Display the prediction horizon and uncertainty/limitations in the
    UI.
-   Risk scores are demonstration heuristics, not validated security
    assessments.
-   Explain contributing factors in plain language.
-   Test edge cases such as zero speed, boundary positions, and missing
    telemetry.

## UI and Accessibility

-   Use a responsive layout that works on desktop and mobile.
-   Keep the simulation-only banner visible.
-   Use text and icons in addition to color to convey risk level.
-   Ensure controls have labels and visible keyboard focus.
-   Provide empty states and readable error states.
-   Avoid excessive flashing, motion, and alert animations.
-   Support reduced-motion preferences.
-   Make dense telemetry readable on smaller screens.

## Dependencies and Changes

-   Prefer stable, widely used dependencies.
-   Do not add a dependency for a feature that can be implemented simply
    without it.
-   Keep the lockfile committed.
-   Do not silently remove working features while fixing a bug.
-   After a change, run the relevant tests and production build.

## Definition of Done

A feature is done when: 1. It works in the browser. 2. It handles its
expected edge cases. 3. It has clear labels and useful feedback. 4. It
does not misrepresent simulated information as real. 5. The production
build succeeds. 6. The README or in-app help is updated if behavior
changed.
