# GARUD 🦅 — Counter-Drone Monitoring & Airspace Security

> Tactical C2 Decision-Support Dashboard for Simulated Aerial Object Tracking & Airspace Risk Assessment.

---

> [!WARNING]
> **SIMULATION MODE — NOT LIVE SENSOR DATA**  
> All coordinates, tracks, telemetry metrics, risk scores, and alerts displayed by GARUD are strictly synthetic and generated locally for decision-support demonstration purposes. GARUD does not connect to physical radars, cameras, RF sensors, or operational military/civil airspace feeds, nor does it provide kinetic targeting, interception, electronic jamming, or effector control capabilities.

---

## 1. Project Overview & Problem Statement

Airspace monitoring against unauthorized unmanned aerial systems (UAS / drones) is increasingly critical for protecting sensitive infrastructure, airports, public events, and sovereign perimeters. When dealing with dense air corridors, operators are often overwhelmed by fragmented radar streams, raw coordinates, and disconnected alert logs.

**GARUD** provides an integrated Command and Control (C2) monitoring interface that:
1. Synthesizes multi-object simulated aerial tracks into a coherent tactical radar display.
2. Projects short-term deterministic trajectory estimates.
3. Computes transparent, explainable risk categorizations (Low, Medium, High) with explicit causal factor breakdowns.
4. Alerts watchstanders to geofence breaches, high-speed vector anomalies, and critical zone incursions with intelligent deduplication and acknowledgement workflows.
5. Operates 100% locally and offline without external API or cloud map dependencies.

---

## 2. Currently Implemented Features

- **Phase 0 Baseline Complete:**
  - Fast, modular React 18 + Vite + TypeScript application shell.
  - Tactical military C2 dark-theme styling with design token hierarchy (`src/styles/tokens.css`).
  - Persistent, prominent simulation mode warning banner (`SIMULATION MODE — NOT LIVE SENSOR DATA`).
  - Automated testing environment configured with Vitest and React Testing Library.
  - Strict TypeScript configuration and ESLint 9 code linting.
  - Production build pipeline verified and functional.

- **Phase 1 Simulation Engine & Domain Logic Complete:**
  - Deterministic simulation engine with pure immutable state stepping (`src/features/simulation/simulationEngine.ts`).
  - Stable tracked object models with ID persistence, callsigns, coordinate tracking, altitude, speed, heading, and RSSI telemetry.
  - Three distinct operational scenarios:
    1. *Standard Sector Surveillance*: 12 mixed commercial, friendly, and uncooperative aerial tracks.
    2. *Critical Perimeter Incursion*: High-speed swarm intruder scenario testing high-risk escalations.
    3. *Dense Urban Approach Corridor*: 14 tracks evaluating multi-altitude separation and corridor congestion.
  - Transparent constant-velocity kinematic projection (`src/features/tracking/prediction.ts`) with synthetic uncertainty expansion.
  - Multi-factor explainable risk evaluation (`src/features/risk/riskScoring.ts`) assessing zone proximity, approach rate vector, RemoteID status, and flight anomalies.
  - State-transition alert detection (`src/features/alerts/alertRules.ts`) with anti-spam cooldown and acknowledgement handling.
  - Full automated unit test suite covering kinematics, edge cases, pause/resume, and reset behaviors.

---

## 3. Technology Stack

- **Framework:** [React 18](https://react.dev/) + [Vite 6](https://vite.dev/)
- **Language:** [TypeScript 5.7](https://www.typescriptlang.org/) (Strict mode, zero-any policy)
- **Styling:** Modular CSS with CSS Custom Properties / Design Tokens (`tokens.css`, `global.css`)
- **Icons:** [Lucide React](https://lucide.dev/)
- **Charts & Telemetry:** [Recharts 2](https://recharts.org/)
- **Visualization:** High-performance HTML5 Canvas radar display with vector overlays
- **Testing:** [Vitest 3](https://vitest.dev/) + [@testing-library/react](https://testing-library.com/)
- **Linting:** [ESLint 9](https://eslint.org/)

---

## 4. Architecture & Module Structure

```text
src/
├── app/                  # Application root & high-level layout
│   └── App.tsx           # Dashboard shell & persistent warning banner
├── components/           # Presentation & tactical display components
│   ├── OverviewCards.tsx # Summary metrics (active tracks, risk levels, alerts)
│   ├── RadarView.tsx     # Canvas radar PPI with rings, sweep, & selectable markers
│   ├── ObjectDetails.tsx # Real-time telemetry inspector & causal risk breakdown
│   ├── TelemetryCharts.tsx # Speed & altitude timeseries trends
│   ├── AlertFeed.tsx     # Tactical alert notifications & acknowledgements
│   └── SimulationControls.tsx # Clock, Play/Pause/Resume/Reset, scenarios
├── features/             # Decoupled domain & simulation logic
│   ├── simulation/       # Engine, scenario presets, state tick, & types
│   ├── tracking/         # Constant-velocity kinematic trajectory projections
│   ├── risk/             # Explainable multi-factor risk evaluator
│   └── alerts/           # Alert transition detector & deduplication
├── styles/               # Design tokens, tactical dark palette, & global styles
└── test/                 # Test setup & unit test suites
```

---

## 5. Getting Started & Commands

### Prerequisites
- Node.js (v18.0.0 or higher; tested on v24.13.0)
- npm (v9.0.0 or higher; tested on v11.8.0)

### Installation
```bash
# Clone the repository
git clone https://github.com/Ayush/fallingson.git
cd fallingson

# Install project dependencies
npm install
```

### Development Server
```bash
npm run dev
# The dashboard runs at http://localhost:5173/
```

### Run Unit Tests
```bash
npm run test
```

### Run Linter
```bash
npm run lint
```

### Build for Production
```bash
npm run build
```

### Preview Production Build
```bash
npm run preview
```

---

## 6. Simulation Assumptions & Safety Notice

1. **Synthetic Coordinate Space:** Objects move within a bounded Cartesian 2D coordinate system centered at `(0, 0)` spanning from `-5000m` to `+5000m` (10 km tactical coverage aperture), mapped to radar range rings.
2. **Motion Model:** Kinematic constant-velocity vector model with configurable perturbations, turn rates, and altitudes (0 to 1,500m AGL).
3. **No Kinetic or Interception Capabilities:** GARUD strictly implements passive airspace situational awareness and decision assistance.

---

## 7. Development Roadmap

- [x] **Phase 0: Project Setup & Baseline Shell**
- [x] **Phase 1: Simulation Engine & Core Data Models**
- [ ] **Phase 2: Tactical Radar PPI & Telemetry Inspection**
- [ ] **Phase 3: Trajectory Prediction & Kinematic Horizons**
- [ ] **Phase 4: Explainable Risk Scoring Engine**
- [ ] **Phase 5: Alert Lifecycle & Multi-Scenario Presets**
- [ ] **Phase 6: Polish, Telemetry Charts & Verification**
- [ ] **Phase 7: Final Documentation, Verification & Demo Delivery**
