# GARUD 🦅 — Counter-Drone Monitoring & Airspace Security

> **Tactical C2 Decision-Support Dashboard for Simulated Aerial Object Tracking, Kinematic Trajectory Prediction & Explainable Airspace Risk Assessment.**

---

> [!WARNING]
> **SIMULATION MODE — NOT LIVE SENSOR DATA**  
> All coordinates, tracks, telemetry metrics, risk scores, and alerts displayed by GARUD are strictly synthetic and generated locally for decision-support demonstration purposes. GARUD does not connect to physical radars, cameras, RF sensors, or operational military/civil airspace feeds, nor does it provide kinetic targeting, interception, electronic jamming, or effector control capabilities.

---

## 1. Executive Summary & Problem Statement

Unmanned Aerial Systems (UAS / drones) represent an asymmetric challenge in modern airspace defense. Operators tasked with securing critical infrastructure, airports, military bases, and VIP perimeters face an overwhelming volume of conflicting sensory data: fragmented tracks, inconsistent coordinate systems, and sudden risk escalations.

**GARUD** provides an integrated Command and Control (C2) situational awareness dashboard designed with an **editorial Bento-grid architecture** inspired by contemporary aviation systems and high-precision defense technology:
1. **Unify Sector Situational Awareness:** Monitor 10+ simultaneous simulated aerial tracks with high-fidelity telemetry in real-time.
2. **Project Short-Term Kinematics:** Forecast deterministic constant-velocity trajectories over configurable 15s, 30s, and 60s prediction horizons with expanding uncertainty bounds.
3. **Deliver Explainable Risk Scoring:** Demystify risk classification into clear **Low**, **Medium**, and **High** tiers, providing watchstanders with an explicit breakdown of causal factors (perimeter breach, closing approach velocity, RemoteID absence, low-altitude terrain masking).
4. **Prevent Alert Fatigue:** Filter alerts through state-transition logic, debouncing repeat notifications while preserving urgent critical perimeter incursions and enabling rapid acknowledgement.
5. **Restrained, Intelligent Visual Identity:** A light, architectural shell with crisp typography, tabular figures, and a purposeful dark-aperture radar display, eliminating generic AI dashboard tropes (neon cyan outlines, fake gauges, and walls of shouting uppercase).
6. **Operate 100% Offline:** Rely on local HTML5 Canvas and mathematical models without requiring external map tile providers, remote APIs, or network connectivity.

---

## 2. Implemented Features

### 📡 Tactical Plan Position Indicator (PPI) Radar Display
- **Simulated Cartesian Space:** Centered at `(0, 0)` with a 10 km operational aperture (`-5,000m` to `+5,000m`).
- **Concentric Range Rings:** 1 km, 2 km, 3 km, 4 km, and 5 km distance markers with clean monospace labels.
- **Azimuth Crosshairs:** 30° radial bearing lines with cardinal compass references (`N`, `030°`, `060°`, `E`, `120°`, `150°`, `S`, `210°`, `240°`, `W`, `300°`, `330°`).
- **Realistic Phosphor Sweep:** Animated rotating sweep beam simulating 4 Hz tactical radar refresh.
- **Geofence Overlays:** Dotted boundaries for core prohibited zones (`Sector 4 High-Security Perimeter`, `Tactical Helipad & Substation`) and outer warning buffers.
- **Interactive Track Markers:** Distinct directional chevrons showing orientation, velocity vector leader lines, callsign badges, and target acquisition reticles on click.
- **Canvas View Controls:** Dynamic Zoom In (`+`), Zoom Out (`-`), View Reset (`1x`), Path Toggle, and Geofence Toggle.

### 🧭 Constant-Velocity Trajectory Projection
- Kinematic position estimation using deterministic vector equations ($v_x = v \cdot \sin\theta$, $v_y = v \cdot \cos\theta$).
- Configurable prediction horizon buttons (`+15s`, `+30s`, `+60s`).
- Dashed future waypoints with terminal uncertainty circles illustrating drift margin.

### 🛡️ Explainable Multi-Factor Risk Engine
- **Transparent 0–100 Scoring Scale:**
  - **Low Risk (0–39):** Routine flight within civil corridors or authenticated friendly patrols.
  - **Medium Risk (40–69):** Approaching warning buffer or exceeding speed advisories.
  - **High Risk (70–100):** Prohibited perimeter breach or non-cooperative high-speed vectoring.
- **Causal Factor Breakdown:** Every score displays its component point contributions:
  - *Zone Incursion:* +50 pts (inside prohibited core radius).
  - *Buffer Warning:* +30 pts (inside caution buffer zone).
  - *High-Rate Closing Vector:* +20 pts (approach rate $> 15\text{ m/s}$).
  - *No RemoteID Broadcast:* +20 pts (unidentified or non-cooperative transponder).
  - *Low-Altitude Masking Risk:* +10 pts (speed $> 10\text{ m/s}$ below $35\text{m AGL}$).
  - *Authorized Friendly Discount:* -15 pts (cryptographically verified friendly track).
- Real-time Euclidean distance and approach rate relative to the nearest protected zone.

### 🚨 Tactical Security Alert Stream
- Real-time event notifications categorized by severity (High, Medium, Low).
- State-transition triggers prevent spamming duplicate alerts on continuous frames.
- Single-click operator acknowledgement (`Ack`) and alert clearance.
- Interactive target link: clicking a target tag centers and inspects that aerial track.
- Stream filters: **All**, **Pending Unacknowledged**, and **Critical**.

### ⏱️ C2 Simulation Playback & Scenario Presets
- Master Controls: **Pause**, **Resume**, **Reset**, and **Speed Multiplier** (`0.5x`, `1x`, `2x`, `5x`).
- Keyboard Shortcuts: `Spacebar` for Pause/Resume, `R` for Reset.
- Three Predefined Operational Scenarios:
  1. **Standard Sector Surveillance:** 12 tracks featuring mixed delivery routes, friendly perimeter patrols, and one uncooperative drone loitering near the outer buffer.
  2. **Critical Perimeter Incursion:** 12 tracks with a coordinated multi-axis intruder swarm testing immediate high-risk alerts and rapid response workflows.
  3. **Dense Urban Approach Corridor:** 14 tracks evaluating simultaneous multi-altitude tracking and corridor congestion near approach paths.

### 📊 Real-Time Telemetry Profiles
- Dual timeseries sparklines showing historical **Airspeed (m/s)** and **Altitude (m AGL)** for the selected track.
- Cached rolling telemetry window (last 30 samples).

---

## 3. Technology Stack

| Layer | Technology | Rationale |
|---|---|---|
| **Framework** | [React 18.3](https://react.dev/) + [Vite 6](https://vite.dev/) | High-performance reactive UI with rapid build and HMR |
| **Language** | [TypeScript 5.7](https://www.typescriptlang.org/) | Strict type safety across kinematics and simulation models |
| **Radar Display** | HTML5 Canvas (2D Context) | Hardware-accelerated 60fps rendering, high-DPI scaling, zero external map dependencies |
| **Charts** | [Recharts 2.15](https://recharts.org/) | Responsive timeseries telemetry sparklines |
| **Icons** | [Lucide React](https://lucide.dev/) | Clean, accessible iconography |
| **Styles** | Modular CSS + CSS Custom Properties | Modern Bento-grid design system with warm neutral background, clean white surfaces, deep tactical emerald accent, tabular numerals, and purposeful dark radar viewport |
| **Testing** | [Vitest 3](https://vitest.dev/) + [React Testing Library](https://testing-library.com/) | Fast unit testing for pure mathematical domain models and components |
| **Linting** | [ESLint 9](https://eslint.org/) | Enforces code quality, clean architecture, and type standards |

---

## 4. Architecture & Module Structure

```text
src/
├── App.tsx                     # Top-level C2 dashboard shell & state coordinator
├── App.module.css              # Grid layout, responsive media queries, simulation banner
├── main.tsx                    # React DOM entry point
├── components/
│   ├── SimulationControls.tsx  # Playback buttons, speed multipliers, scenario selector
│   ├── OverviewCards.tsx       # Sector summary metrics (Total, Low, Medium, High, Pending)
│   ├── RadarView.tsx           # Canvas PPI radar with range rings, sweep, & vector markers
│   ├── ObjectDetails.tsx       # Live telemetry inspector & causal factor breakdown
│   ├── AlertFeed.tsx           # Alert event notifications with debounce & acknowledgement
│   └── TelemetryCharts.tsx     # Airspeed and altitude history charts
├── features/
│   ├── simulation/
│   │   ├── types.ts            # Canonical data types for tracks, alerts, zones, and state
│   │   ├── scenarios.ts        # Pre-seeded operational scenarios (Standard, Incursion, Dense)
│   │   └── simulationEngine.ts # Pure state tick stepSimulation(), reset, and playback actions
│   ├── tracking/
│   │   └── prediction.ts       # Constant-velocity kinematic model & uncertainty expansion
│   ├── risk/
│   │   └── riskScoring.ts      # Multi-factor explainable risk evaluation & distance math
│   └── alerts/
│       └── alertRules.ts       # State transition detection and cooldown alert rules
├── styles/
│   ├── tokens.css              # Design tokens (colors, radii, fonts, radar palette)
│   └── global.css              # CSS resets, accessibility focus rings, custom scrollbars
└── test/
    └── setup.ts                # Test environment mocks (ResizeObserver, Canvas context)
```

---

## 5. Getting Started & Commands

### Prerequisites
- Node.js (v18.0.0 or higher; tested with Node v24.13.0)
- npm (v9.0.0 or higher; tested with npm 11.8.0)

### Installation
```bash
# Clone the repository
git clone https://github.com/Ayush/fallingson.git
cd fallingson

# Install dependencies
npm install
```

### Local Development Server
```bash
npm run dev
# Dashboard launches at http://localhost:5173/
```

### Run Automated Unit Tests
```bash
npm run test
# Executes 26 tests across 7 suites covering kinematics, risk rules, and UI
```

### Run Linter
```bash
npm run lint
```

### Production Build & Preview
```bash
npm run build
npm run preview
```

---

## 6. Simulation Algorithms & Mathematical Models

### Kinematic Motion Model
Tracks advance according to standard 2D vector kinematics:
$$\theta_{\text{rad}} = \left(\theta \pmod{360}\right) \times \frac{\pi}{180}$$
$$v_x = v \cdot \sin(\theta_{\text{rad}}), \quad v_y = v \cdot \cos(\theta_{\text{rad}})$$
$$x(t + \Delta t) = x(t) + v_x \cdot \Delta t$$
$$y(t + \Delta t) = y(t) + v_y \cdot \Delta t$$
Altitude is clamped between $20\text{m}$ and $1,500\text{m}$ with vertical climb rate vectoring.

### Trajectory Projection & Uncertainty Expansion
Future positions are sampled at 5-second intervals over the chosen horizon $T \in \{15\text{s}, 30\text{s}, 60\text{s}\}$:
$$x_p(t) = x_0 + v_x \cdot t, \quad y_p(t) = y_0 + v_y \cdot t$$
Uncertainty radius $r_{\text{unc}}$ expands linearly with time and velocity to represent real-world wind/sensor uncertainty:
$$r_{\text{unc}}(t) = 5.0 + 0.8 \cdot t + 0.05 \cdot v \cdot t \quad (\text{meters})$$

### Rate of Approach (Closing Velocity)
Given a track position $\mathbf{p} = (x, y)$, velocity $\mathbf{v} = (v_x, v_y)$, and protected zone center $\mathbf{c} = (c_x, c_y)$:
$$\mathbf{u} = \frac{\mathbf{c} - \mathbf{p}}{\|\mathbf{c} - \mathbf{p}\|}$$
$$v_{\text{approach}} = \mathbf{v} \cdot \mathbf{u}$$
A positive value signifies active vectoring toward the protected area.

---

## 7. Operational Demo Script (3-Minute Presentation Walkthrough)

1. **Highlight Simulation Mode:**
   - Point out the prominent top warning banner: `SIMULATION MODE — NOT LIVE SENSOR DATA`.
   - Explain that all telemetry is synthetically generated for operator decision-support demonstration.
2. **Review Sector Overview:**
   - Direct attention to the top **Overview Cards**: 12 Active Tracks, broken down into Low, Medium, and High Risk, plus pending unacknowledged alerts.
3. **Explore the PPI Radar:**
   - Show the rotating sweep beam, the 10km tactical coordinate grid, and the concentric range rings.
   - Point out the two red restricted zones (`Sector 4 High-Security Perimeter` and `Tactical Helipad & Substation`) and their amber warning buffers.
4. **Inspect an Aerial Track:**
   - Click on track `UAS-04` or `UAS-01` on the radar.
   - Show the targeting reticle lock on the track.
   - In the right-hand **Object Details** panel, explain the live coordinates, altitude, airspeed, heading, and RemoteID status.
5. **Explain the Risk Score:**
   - Walk through the **Explainable Risk Rationale**: demonstrate how the score (e.g., 75/100) is mathematically composed of *Approach Proximity*, *Closing Vector*, and *No RemoteID Broadcast*.
6. **Trigger an Incursion Scenario:**
   - In the playback bar, switch the **Tactical Scenario** dropdown to `Scenario 2: Critical Perimeter Incursion & Swarm Vector`.
   - Observe the swarm of unauthorized drones (`INTRUDER-ALPHA`, `BRAVO`, `CHARLIE`) rushing toward the central compound.
   - Point to the **Security Alert Stream** as high-severity alerts populate with clear operational reasons.
   - Click `Ack` to acknowledge an alert.
7. **Demonstrate Trajectory Forecasting:**
   - Click the `+60s` horizon button on the radar toolbar to reveal extended projected flight paths and uncertainty cones.
8. **Demonstrate Controls & Pause:**
   - Press the `Spacebar` to freeze the simulation tick. Show that telemetry and markers hold state without drifting.
   - Press `Reset` to return the scenario to its initial conditions.

---

## 8. Limitations & Scope

- **Synthetic Data Only:** GARUD operates entirely on synthetic data. It does not integrate physical RF SDRs, optical cameras, acoustic sensors, or radar hardware.
- **2D Kinematic Simplification:** The constant-velocity motion model assumes linear short-term trajectories and does not account for complex non-linear aerodynamic maneuvers or terrain elevation profiles.
- **Illustrative Security Rules:** Risk classifications are heuristic demonstration models designed to showcase explainability, not certified threat detection algorithms.
- **Decision Support Only:** In accordance with ethical airspace safety principles, GARUD provides situational monitoring and human-in-the-loop decision support only. It contains no kinetic interception, jamming, or automated weapon controls.

---

## 9. Future Enhancements

- **3D Airspace Visualization:** Optional Three.js / WebGL tactical volumetric perspective for complex multi-altitude stacking.
- **Radio Frequency (RF) Spectrum Heatmap:** Visualizing simulated RF signal propagation and jamming interference patterns.
- **RemoteID Protocol Parser:** Integration of mock ASTM F3411-22a Remote ID broadcast decoders.
- **Multi-Operator Collaboration:** WebSocket sync for coordinated watchstanding teams.

---

## 10. Visual Identity & Bento-Grid Design System

GARUD adheres to a defense-grade editorial design language:
- **Calm, High-Contrast Light Shell:** Clean off-white app canvas (`#f8fafc`) with crisp white surface panels and subtle borders (`#e2e8f0`).
- **Tactical Dark Radar Centerpiece:** Embedded high-contrast dark PPI aperture (`#090e17`) dedicated specifically to radar visualization where black backgrounds maximize phosphor target visibility.
- **Tabular Figures:** Telemetry metrics use `tabular-nums` for rock-solid stability during continuous 4 Hz updates.
- **Restrained Color Hierarchy:** Color is used exclusively for functional operational communication (tactical emerald for authenticated friendlies and low risk, muted amber for caution buffers, and controlled crimson for prohibited perimeter incursions).
- **Asymmetric Bento Overview:** Replaces repetitive identical metric cards with an executive overview panel incorporating proportional risk distribution bars and alert readiness states.
