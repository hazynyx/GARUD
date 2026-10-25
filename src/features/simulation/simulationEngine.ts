import { SimulationState, TrackedObject } from './types';
import { SCENARIOS } from './scenarios';
import { calculateRisk } from '../risk/riskScoring';
import { createAlerts } from '../alerts/alertRules';

const RADAR_BOUND_M = 4800;
const MAX_HISTORY_POINTS = 30;

export function initializeSimulation(scenarioId: string = 'standard-perimeter'): SimulationState {
  const scenario = SCENARIOS.find((s) => s.id === scenarioId) || SCENARIOS[0];

  // Deep clone initial objects to avoid mutation
  const objects: TrackedObject[] = scenario.initialObjects.map((obj) => ({
    ...obj,
    riskFactors: [...obj.riskFactors],
    telemetryHistory: [...obj.telemetryHistory],
  }));

  return {
    isRunning: true,
    simTimeSec: 0,
    speedMultiplier: 1.0,
    selectedScenarioId: scenario.id,
    selectedObjectId: objects[0]?.id ?? null,
    objects,
    zones: scenario.zones,
    alerts: [],
    predictionHorizonSec: 30,
  };
}

export function resetSimulation(state: SimulationState): SimulationState {
  const initialized = initializeSimulation(state.selectedScenarioId);
  return {
    ...initialized,
    speedMultiplier: state.speedMultiplier,
    predictionHorizonSec: state.predictionHorizonSec,
    selectedObjectId: state.selectedObjectId,
  };
}

export function setSimulationRunning(state: SimulationState, isRunning: boolean): SimulationState {
  return {
    ...state,
    isRunning,
  };
}

export function setSimulationSpeed(state: SimulationState, speedMultiplier: number): SimulationState {
  const safeMultiplier = Math.max(0.25, Math.min(10, speedMultiplier));
  return {
    ...state,
    speedMultiplier: safeMultiplier,
  };
}

export function selectScenario(state: SimulationState, scenarioId: string): SimulationState {
  const scenario = SCENARIOS.find((s) => s.id === scenarioId) || SCENARIOS[0];
  const fresh = initializeSimulation(scenario.id);
  return {
    ...fresh,
    isRunning: state.isRunning,
    speedMultiplier: state.speedMultiplier,
    predictionHorizonSec: state.predictionHorizonSec,
  };
}

export function selectObject(state: SimulationState, objectId: string | null): SimulationState {
  return {
    ...state,
    selectedObjectId: objectId,
  };
}

export function acknowledgeAlert(state: SimulationState, alertId: string): SimulationState {
  return {
    ...state,
    alerts: state.alerts.map((alert) =>
      alert.id === alertId
        ? { ...alert, acknowledged: true, acknowledgedAt: state.simTimeSec }
        : alert
    ),
  };
}

export function clearAlerts(state: SimulationState): SimulationState {
  return {
    ...state,
    alerts: [],
  };
}

export function setPredictionHorizon(state: SimulationState, horizonSec: number): SimulationState {
  const safeHorizon = Math.max(5, Math.min(120, horizonSec));
  return {
    ...state,
    predictionHorizonSec: safeHorizon,
  };
}

/**
 * Pure state advancement function.
 * Moves all objects by kinematic equations based on deltaSeconds * speedMultiplier,
 * updates boundary reflection, recalculates risk explanations, and triggers state alerts.
 */
export function stepSimulation(state: SimulationState, rawDeltaSeconds: number): SimulationState {
  if (!state.isRunning || rawDeltaSeconds <= 0) {
    return state;
  }

  const dt = Math.max(0, Math.min(10.0, rawDeltaSeconds)) * state.speedMultiplier;
  const nextSimTime = Math.round((state.simTimeSec + dt) * 10) / 10;

  const previousObjectMap = new Map<string, TrackedObject>();
  for (const obj of state.objects) {
    previousObjectMap.set(obj.id, obj);
  }

  const updatedObjects: TrackedObject[] = state.objects.map((obj) => {
    // 1. Advance Heading
    let newHeading = ((obj.headingDeg + obj.turnRateDegPs * dt) % 360 + 360) % 360;

    // 2. Compute Velocity components
    const headingRad = (newHeading * Math.PI) / 180;
    const vx = obj.speedMps * Math.sin(headingRad);
    const vy = obj.speedMps * Math.cos(headingRad);

    let newX = obj.x + vx * dt;
    let newY = obj.y + vy * dt;

    // Radar boundary check: steer inward if reaching edge
    if (Math.abs(newX) > RADAR_BOUND_M) {
      newX = Math.sign(newX) * RADAR_BOUND_M;
      newHeading = (360 - newHeading) % 360; // Reflect horizontally
    }
    if (Math.abs(newY) > RADAR_BOUND_M) {
      newY = Math.sign(newY) * RADAR_BOUND_M;
      newHeading = (180 - newHeading + 360) % 360; // Reflect vertically
    }

    // 3. Advance Altitude
    let newClimbRate = obj.climbRateMps;
    let newAlt = obj.altitudeM + obj.climbRateMps * dt;
    if (newAlt > 1200) {
      newAlt = 1200;
      newClimbRate = -Math.abs(newClimbRate || 0.5);
    } else if (newAlt < 30) {
      newAlt = 30;
      newClimbRate = Math.abs(newClimbRate || 0.5);
    }

    // 4. Update Telemetry History (sampled roughly every 1.5 seconds)
    const lastHistory = obj.telemetryHistory[obj.telemetryHistory.length - 1];
    let newHistory = obj.telemetryHistory;
    if (!lastHistory || (nextSimTime - lastHistory.timestamp >= 1.0)) {
      newHistory = [
        ...obj.telemetryHistory,
        {
          timestamp: nextSimTime,
          x: Math.round(newX),
          y: Math.round(newY),
          altitudeM: Math.round(newAlt),
          speedMps: obj.speedMps,
          headingDeg: Math.round(newHeading),
        },
      ];
      if (newHistory.length > MAX_HISTORY_POINTS) {
        newHistory = newHistory.slice(newHistory.length - MAX_HISTORY_POINTS);
      }
    }

    const candidateObj: TrackedObject = {
      ...obj,
      x: Math.round(newX * 10) / 10,
      y: Math.round(newY * 10) / 10,
      altitudeM: Math.round(newAlt * 10) / 10,
      headingDeg: Math.round(newHeading * 10) / 10,
      climbRateMps: newClimbRate,
      updatedAt: nextSimTime,
      telemetryHistory: newHistory,
    };

    // 5. Evaluate explainable risk factors
    const riskEval = calculateRisk(candidateObj, state.zones);
    candidateObj.riskScore = riskEval.score;
    candidateObj.riskLevel = riskEval.level;
    candidateObj.riskFactors = riskEval.factors;

    return candidateObj;
  });

  // 6. Generate state-transition alerts
  const nextAlerts = createAlerts(
    previousObjectMap,
    updatedObjects,
    state.zones,
    nextSimTime,
    state.alerts
  );

  return {
    ...state,
    simTimeSec: nextSimTime,
    objects: updatedObjects,
    alerts: nextAlerts,
  };
}
