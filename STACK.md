# Technology Stack

## Recommended Stack

Keep the stack small so the prototype is easy for an AI coding assistant
to generate, run, and debug.

-   **Framework:** React with Vite
-   **Language:** TypeScript
-   **Styling:** CSS Modules or plain CSS with design tokens
-   **Charts:** Recharts, only where charts add useful information
-   **Visualization:** HTML Canvas or SVG for the radar-style view
-   **Mapping:** Optional Leaflet if a map genuinely improves the demo;
    otherwise use a local coordinate grid to avoid map-tile/network
    dependencies
-   **Icons:** Lucide React
-   **Testing:** Vitest and React Testing Library for core logic
-   **Linting:** ESLint
-   **Package manager:** npm

## Why This Stack

React makes dashboard components and interactive state manageable. Vite
provides a fast development server and straightforward production
builds. TypeScript helps catch errors in telemetry and simulation state.
A Canvas/SVG radar view avoids needing real maps, external tiles, or
network access during the demo.

## Architecture

### UI Layer

-   `DashboardPage`: overall layout and responsive shell.
-   `OverviewCards`: counts and summary metrics.
-   `RadarView`: simulated object markers and predicted paths.
-   `ObjectDetails`: selected object's telemetry and risk explanation.
-   `TelemetryCharts`: optional speed/altitude history.
-   `AlertFeed`: active and acknowledged alerts.
-   `SimulationControls`: start, pause, reset, speed, and scenario
    selection.

### Simulation Layer

-   Generates seeded initial objects and scenario configurations.
-   Advances object state on a controlled tick.
-   Produces telemetry history for display.
-   Can pause, resume, reset, and change scenario.
-   Uses a fixed or configurable update interval and cleans up timers
    correctly.

### Domain Logic

Keep pure functions separate from React components: -
`predictPosition(object, seconds)` - `calculateRisk(object, scenario)` -
`classifyRisk(score)` - `createAlerts(previousState, nextState)` -
`stepSimulation(state, deltaSeconds)`

Pure functions should be deterministic and unit-tested.

## Data Model

A simulated object should have fields similar to:

``` ts
type TrackedObject = {
  id: string;
  x: number;
  y: number;
  altitudeM: number;
  speedMps: number;
  headingDeg: number;
  riskScore: number;
  riskLevel: "low" | "medium" | "high";
  updatedAt: number;
};
```

Use a separate alert model:

``` ts
type SimulatedAlert = {
  id: string;
  objectId: string;
  createdAt: number;
  severity: "low" | "medium" | "high";
  title: string;
  reason: string;
  acknowledged: boolean;
};
```

These are illustrative frontend types; adapt them as implementation
requires. Use a clearly labelled simulated coordinate system for x/y
values.

## Data Flow

1.  Simulation engine advances the state.
2.  Domain functions calculate predicted positions and risk
    explanations.
3.  React state receives the next simulation snapshot.
4.  Dashboard components render the same snapshot.
5.  Alert logic compares state transitions and adds alerts when
    documented conditions are met.

## Persistence

No backend is required for the first version. Keep the simulation in
browser memory. If persisting user preferences is useful, use
`localStorage` only for non-sensitive settings such as selected scenario
or theme. Do not persist large telemetry histories indefinitely.

## Offline and Reliability

The dashboard should still run without external data services. Avoid
external APIs and remote map tiles in the required demo path. If Leaflet
is used, include a fallback local grid so the main simulation remains
usable offline.

## Scripts

Expected scripts:

-   `npm run dev` --- start local development server.
-   `npm run build` --- type-check and build production assets.
-   `npm run preview` --- preview production build.
-   `npm run test` --- run unit tests.
-   `npm run lint` --- run linting.

The exact scripts must match the final `package.json`.
