import { RestrictedZone, RiskFactor, RiskLevel, TrackedObject } from '../simulation/types';

export interface RiskEvaluation {
  score: number;
  level: RiskLevel;
  factors: RiskFactor[];
  nearestZoneDistanceM: number;
  closingSpeedMps: number;
}

/**
 * Classifies numerical risk score (0-100) into standardized operational tiers:
 * - 0 .. 39: Low
 * - 40 .. 69: Medium
 * - 70 .. 100: High
 */
export function classifyRisk(score: number): RiskLevel {
  if (score >= 70) return 'high';
  if (score >= 40) return 'medium';
  return 'low';
}

/**
 * Computes Euclidean distance between object (x,y) and a zone center (x,y).
 */
export function calculateDistanceToZone(
  x: number,
  y: number,
  zone: RestrictedZone
): number {
  const dx = x - zone.centerX;
  const dy = y - zone.centerY;
  return Math.hypot(dx, dy);
}

/**
 * Calculates rate of approach (closing speed in m/s) toward the nearest restricted zone.
 * Positive = closing distance toward zone.
 * Negative = moving away from zone.
 */
export function calculateClosingSpeed(
  object: Pick<TrackedObject, 'x' | 'y' | 'speedMps' | 'headingDeg'>,
  zone: RestrictedZone
): number {
  const dx = zone.centerX - object.x;
  const dy = zone.centerY - object.y;
  const dist = Math.hypot(dx, dy);

  if (dist < 1) return 0; // Already at center

  // Unit vector toward zone
  const ux = dx / dist;
  const uy = dy / dist;

  // Object velocity components
  const headingRad = (((object.headingDeg % 360) + 360) % 360 * Math.PI) / 180;
  const vx = object.speedMps * Math.sin(headingRad);
  const vy = object.speedMps * Math.cos(headingRad);

  // Dot product of velocity with direction to zone
  const closingSpeed = vx * ux + vy * uy;
  return Math.round(closingSpeed * 10) / 10;
}

/**
 * Evaluates multi-factor explainable risk score for an aerial track.
 * Produces deterministic, inspectable factor breakdowns.
 */
export function calculateRisk(
  object: TrackedObject,
  zones: RestrictedZone[]
): RiskEvaluation {
  const factors: RiskFactor[] = [];
  let score = 0;

  // Find nearest restricted zone
  let nearestZone: RestrictedZone | null = null;
  let minDistance = Infinity;

  for (const zone of zones) {
    const dist = calculateDistanceToZone(object.x, object.y, zone);
    if (dist < minDistance) {
      minDistance = dist;
      nearestZone = zone;
    }
  }

  const distToZone = nearestZone ? minDistance : 9999;
  const closingSpeed = nearestZone ? calculateClosingSpeed(object, nearestZone) : 0;

  // 1. Proximity and Incursion Analysis
  if (nearestZone) {
    if (distToZone <= nearestZone.radiusM) {
      const breachPts = 50;
      score += breachPts;
      factors.push({
        name: 'Zone Incursion',
        contribution: breachPts,
        description: `Inside prohibited perimeter "${nearestZone.name}" (${Math.round(distToZone)}m from center, radius ${nearestZone.radiusM}m).`,
      });
    } else if (distToZone <= nearestZone.warningBufferM) {
      const bufferPts = 30;
      score += bufferPts;
      factors.push({
        name: 'Buffer Warning',
        contribution: bufferPts,
        description: `Operating inside caution buffer zone (${Math.round(distToZone)}m distance; buffer threshold ${nearestZone.warningBufferM}m).`,
      });
    } else if (distToZone <= nearestZone.warningBufferM * 1.4) {
      const proximityPts = 12;
      score += proximityPts;
      factors.push({
        name: 'Approach Proximity',
        contribution: proximityPts,
        description: `Approaching outer surveillance ring of "${nearestZone.name}" (${Math.round(distToZone)}m).`,
      });
    }
  }

  // 2. Vector Heading & Approach Rate
  if (closingSpeed > 15) {
    const ratePts = 20;
    score += ratePts;
    factors.push({
      name: 'High-Rate Closing Vector',
      contribution: ratePts,
      description: `Rapidly closing toward restricted airspace at ${closingSpeed} m/s (~${Math.round(closingSpeed * 3.6)} km/h).`,
    });
  } else if (closingSpeed > 5) {
    const ratePts = 10;
    score += ratePts;
    factors.push({
      name: 'Closing Vector',
      contribution: ratePts,
      description: `Moving toward restricted area at moderate approach velocity (${closingSpeed} m/s).`,
    });
  }

  // 3. Identification & Transponder (RemoteID)
  if (!object.transponderActive) {
    const noTransponderPts = 20;
    score += noTransponderPts;
    factors.push({
      name: 'No RemoteID Broadcast',
      contribution: noTransponderPts,
      description: 'Airframe is non-cooperative; no valid civil transponder or RemoteID broadcast detected.',
    });
  } else if (object.classification === 'friendly') {
    const friendlyDiscount = -15;
    score += friendlyDiscount;
    factors.push({
      name: 'Authorized Friendly Identity',
      contribution: friendlyDiscount,
      description: 'Authenticated friendly security patrol track; risk discounted.',
    });
  }

  // 4. Velocity Profile & Low-Altitude Terrain Masking
  if (object.speedMps > 32) {
    const highSpeedPts = 15;
    score += highSpeedPts;
    factors.push({
      name: 'High-Velocity Anomaly',
      contribution: highSpeedPts,
      description: `Airspeed ${object.speedMps} m/s exceeds standard commercial corridor advisory.`,
    });
  }

  if (object.altitudeM < 35 && object.speedMps > 10) {
    const lowAltPts = 10;
    score += lowAltPts;
    factors.push({
      name: 'Low-Altitude Masking Risk',
      contribution: lowAltPts,
      description: `Low altitude (${Math.round(object.altitudeM)}m AGL) combined with transit speed indicates potential radar shadowing.`,
    });
  }

  // Clamp final score between 0 and 100
  const normalizedScore = Math.max(0, Math.min(100, score));
  const level = classifyRisk(normalizedScore);

  // If score is 0, give an informative benign factor
  if (factors.length === 0) {
    factors.push({
      name: 'Normal Operations',
      contribution: 0,
      description: 'Operating on benign corridor, outside restricted buffers, transponder active.',
    });
  }

  return {
    score: normalizedScore,
    level,
    factors,
    nearestZoneDistanceM: Math.round(distToZone),
    closingSpeedMps: closingSpeed,
  };
}
