import { TrackedObject } from '../simulation/types';

export interface PredictedWaypoint {
  secondsAhead: number;
  x: number;
  y: number;
  altitudeM: number;
  uncertaintyRadiusM: number;
}

/**
 * Predicts the position of a tracked aerial object at a specific future second
 * using a transparent constant-velocity kinematic model.
 * 
 * Heading convention: 0 deg = North (+Y), 90 deg = East (+X), 180 deg = South (-Y), 270 deg = West (-X).
 */
export function predictPosition(
  object: Pick<TrackedObject, 'x' | 'y' | 'altitudeM' | 'speedMps' | 'headingDeg' | 'climbRateMps'>,
  secondsAhead: number
): { x: number; y: number; altitudeM: number } {
  if (secondsAhead <= 0 || !Number.isFinite(secondsAhead)) {
    return { x: object.x, y: object.y, altitudeM: object.altitudeM };
  }

  const speed = Math.max(0, Number.isFinite(object.speedMps) ? object.speedMps : 0);
  const headingNorm = ((object.headingDeg % 360) + 360) % 360;
  const headingRad = (headingNorm * Math.PI) / 180;

  // North is +Y, East is +X
  const vx = speed * Math.sin(headingRad);
  const vy = speed * Math.cos(headingRad);

  const predictedX = object.x + vx * secondsAhead;
  const predictedY = object.y + vy * secondsAhead;
  const predictedAlt = Math.max(0, Math.min(3000, object.altitudeM + (object.climbRateMps || 0) * secondsAhead));

  return {
    x: Math.round(predictedX * 10) / 10,
    y: Math.round(predictedY * 10) / 10,
    altitudeM: Math.round(predictedAlt * 10) / 10,
  };
}

/**
 * Generates a sampled trajectory path over a given prediction horizon.
 * Includes synthetic uncertainty bounds (expanding cone of uncertainty).
 */
export function predictTrajectory(
  object: TrackedObject,
  horizonSec: number = 30,
  stepSec: number = 5
): PredictedWaypoint[] {
  const safeHorizon = Math.max(5, Math.min(120, horizonSec));
  const safeStep = Math.max(1, stepSec);
  const waypoints: PredictedWaypoint[] = [];

  for (let t = safeStep; t <= safeHorizon; t += safeStep) {
    const pos = predictPosition(object, t);
    // Synthetic uncertainty: base 5m + 1.2% per second of flight * speed factor
    const uncertainty = Math.round((5 + t * 0.8 + (object.speedMps * 0.05 * t)) * 10) / 10;

    waypoints.push({
      secondsAhead: t,
      x: pos.x,
      y: pos.y,
      altitudeM: pos.altitudeM,
      uncertaintyRadiusM: uncertainty,
    });
  }

  return waypoints;
}
