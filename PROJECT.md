# Counter-Drone Monitoring & Airspace Security

## Project Overview

Build a browser-based dashboard that monitors **simulated aerial
objects** in real time. It displays their telemetry, estimates
short-term movement, assigns explainable risk levels, and alerts an
operator when a simulated object approaches a configured restricted
zone.

This is a decision-support prototype for a hackathon. It does not
connect to real sensors, identify real drones, or provide interception
or engagement capabilities.

## Problem

Monitoring multiple aerial objects can be difficult when telemetry,
movement, and alerts are scattered across separate views. Operators need
one interface to understand what the simulation is showing, what may
happen next, and why an object has been flagged.

## Goals

-   Show multiple simulated objects moving in a live dashboard.
-   Display each object's ID, position, altitude, speed, heading, and
    risk level.
-   Predict short-term positions using a transparent constant-velocity
    model.
-   Calculate an explainable risk score from simulated conditions.
-   Show alerts and let users inspect an object's details.
-   Provide controls to pause, resume, reset, and adjust the simulation
    speed.
-   Work responsively on desktop and mobile.
-   Include a README with setup instructions, limitations, and a demo
    script.

## Non-Goals

-   No real drone, radar, camera, radio, or external sensor integration.
-   No weapon, jamming, interception, or targeting functionality.
-   No claims that a risk score establishes hostile intent.
-   No dependence on live operational or classified data.

## Main User Flow

1.  The user opens the dashboard and starts the simulation.
2.  Simulated objects update at a regular interval.
3.  The user selects an object to inspect its telemetry and predicted
    path.
4.  The dashboard explains the object's current risk score and
    contributing factors.
5.  If a configured simulated condition is met, an alert appears in the
    alert feed.
6.  The user pauses, resumes, resets, or changes simulation settings.

## Core Features

### 1. Overview

-   Total tracked objects.
-   Counts by risk category.
-   Active alerts.
-   Simulation status and elapsed time.

### 2. Live Tracking

-   Radar-style visualization and/or a simple local map.
-   Distinct markers for simulated objects.
-   Heading indicators and short predicted paths.
-   Selecting a marker opens its details.

### 3. Telemetry

-   Object ID.
-   X/Y coordinates in a clearly labelled **simulated coordinate
    space**.
-   Altitude, speed, and heading.
-   Last update time.
-   Current risk score and explanation.

### 4. Trajectory Prediction

Use a simple constant-velocity model over a short horizon. Clearly label
predictions as estimates, not guarantees. Keep the algorithm
deterministic and easy to explain.

### 5. Explainable Risk Scoring

Calculate a configurable score from simulation-only factors, such as
proximity to a mock restricted zone, rate of approach, and uncertainty
in the track. Show the factors that contributed to the score. Use
thresholds labelled Low, Medium, and High, and make it clear these are
demo rules rather than validated threat assessments.

### 6. Alerts

-   Add an alert when a simulated rule crosses its threshold.
-   Include timestamp, object ID, severity, and reason.
-   Avoid creating duplicate alerts every update; use state transitions
    or a cooldown.
-   Allow an alert to be acknowledged.

### 7. Simulation Controls

-   Start / pause / resume.
-   Reset to initial scenario.
-   Adjust simulation speed.
-   Toggle a small set of predefined scenarios.
-   Display a clear "SIMULATION MODE --- NOT LIVE SENSOR DATA"
    indicator.

## Success Criteria

-   At least 10 simulated objects can update without the interface
    becoming unusable.
-   Telemetry and visual markers remain in sync.
-   Pause, resume, reset, and scenario selection work reliably.
-   Predicted paths update when object motion changes.
-   Every risk label has a visible explanation.
-   Alerts are generated from documented rules and do not flood the
    feed.
-   Layout works at common desktop and mobile widths.
-   A fresh clone can be run by following the README.

## Demo Script

1.  Open the dashboard and point out the simulation-only indicator.
2.  Start the simulation and show objects moving.
3.  Select one object and explain its telemetry.
4.  Show its predicted path and explain the simple motion model.
5.  Switch to a predefined scenario that causes a risk score to rise.
6.  Open the alert feed and explain why the alert appeared.
7.  Pause and reset the simulation.
8.  Explain the limitations and what would be required for real-world
    deployment.

## Limitations

All data is generated locally for demonstration. Coordinates, object
behavior, thresholds, predictions, and alerts are synthetic. This
prototype is not a certified airspace safety system and must not be used
for real-world operational decisions.
