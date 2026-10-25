import { SimulatedAlert, TrackedObject, RestrictedZone } from '../simulation/types';

/**
 * Compares prior and next tracked objects to generate state-transition alerts.
 * Uses state escalation and cooldown logic to eliminate duplicate alert spamming.
 */
export function createAlerts(
  previousObjects: Map<string, TrackedObject>,
  currentObjects: TrackedObject[],
  zones: RestrictedZone[],
  currentSimTimeSec: number,
  existingAlerts: SimulatedAlert[]
): SimulatedAlert[] {
  const newAlerts: SimulatedAlert[] = [];

  for (const current of currentObjects) {
    const prev = previousObjects.get(current.id);

    // Rule 1: High Risk Level Escalation
    // Trigger when an object escalates from low/medium to high, or when newly entering high risk
    if (current.riskLevel === 'high') {
      const isNewHigh = !prev || prev.riskLevel !== 'high';
      const recentHighAlert = existingAlerts.find(
        (a) => a.objectId === current.id && a.severity === 'high' && (currentSimTimeSec - a.createdAt < 25)
      );

      if (isNewHigh && !recentHighAlert) {
        newAlerts.push({
          id: `alt-high-${current.id}-${Math.floor(currentSimTimeSec)}`,
          objectId: current.id,
          objectCallsign: current.callsign,
          createdAt: currentSimTimeSec,
          severity: 'high',
          title: `CRITICAL RISK: ${current.callsign} (${current.id})`,
          reason: current.riskFactors.map(f => f.name).join(', ') || 'High cumulative risk threshold crossed.',
          acknowledged: false,
        });
      }
    }

    // Rule 2: Restricted Perimeter Incursion
    // Trigger when crossing inside the restricted core zone radius
    for (const zone of zones) {
      const prevDist = prev ? Math.hypot(prev.x - zone.centerX, prev.y - zone.centerY) : Infinity;
      const currDist = Math.hypot(current.x - zone.centerX, current.y - zone.centerY);

      const crossedIncursionBoundary = prevDist > zone.radiusM && currDist <= zone.radiusM;
      if (crossedIncursionBoundary) {
        newAlerts.push({
          id: `alt-breach-${current.id}-${zone.id}-${Math.floor(currentSimTimeSec)}`,
          objectId: current.id,
          objectCallsign: current.callsign,
          createdAt: currentSimTimeSec,
          severity: 'high',
          title: `PERIMETER BREACH: ${zone.name}`,
          reason: `${current.callsign} penetrated core protected boundary (${Math.round(currDist)}m <= ${zone.radiusM}m).`,
          acknowledged: false,
        });
      }

      // Rule 3: Buffer Zone Ingress
      const crossedBufferBoundary = prevDist > zone.warningBufferM && currDist <= zone.warningBufferM;
      if (crossedBufferBoundary && current.riskLevel !== 'high') {
        newAlerts.push({
          id: `alt-buf-${current.id}-${zone.id}-${Math.floor(currentSimTimeSec)}`,
          objectId: current.id,
          objectCallsign: current.callsign,
          createdAt: currentSimTimeSec,
          severity: 'medium',
          title: `BUFFER INGRESS: ${current.callsign}`,
          reason: `Entered surveillance buffer of ${zone.name} at ${Math.round(currDist)}m.`,
          acknowledged: false,
        });
      }
    }

    // Rule 4: High Speed Non-Cooperative Vector
    if (prev && !current.transponderActive && current.speedMps > 30) {
      const wasSlow = prev.speedMps <= 30;
      if (wasSlow) {
        newAlerts.push({
          id: `alt-spd-${current.id}-${Math.floor(currentSimTimeSec)}`,
          objectId: current.id,
          objectCallsign: current.callsign,
          createdAt: currentSimTimeSec,
          severity: 'medium',
          title: `HIGH-SPEED UNIDENTIFIED SPRINT: ${current.callsign}`,
          reason: `Airspeed accelerated to ${current.speedMps} m/s without active RemoteID transponder.`,
          acknowledged: false,
        });
      }
    }
  }

  // Prepend newest alerts, keep list capped at 50 to maintain performance
  const combined = [...newAlerts, ...existingAlerts];
  return combined.slice(0, 50);
}
