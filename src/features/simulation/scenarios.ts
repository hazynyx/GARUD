import { ScenarioPreset, RestrictedZone, TrackedObject } from './types';
import { calculateRisk } from '../risk/riskScoring';

export const DEFAULT_ZONES: RestrictedZone[] = [
  {
    id: 'zone-vip-center',
    name: 'Sector 4 High-Security Perimeter',
    centerX: 0,
    centerY: 0,
    radiusM: 1000,
    warningBufferM: 2200,
    minAltM: 0,
    maxAltM: 1200,
    type: 'vip_perimeter',
  },
  {
    id: 'zone-helipad',
    name: 'Tactical Helipad & Substation',
    centerX: 2400,
    centerY: -1800,
    radiusM: 600,
    warningBufferM: 1200,
    minAltM: 0,
    maxAltM: 800,
    type: 'critical_infrastructure',
  },
];

function createTrack(
  id: string,
  callsign: string,
  type: TrackedObject['type'],
  classification: TrackedObject['classification'],
  x: number,
  y: number,
  altitudeM: number,
  speedMps: number,
  headingDeg: number,
  climbRateMps: number,
  turnRateDegPs: number,
  signalStrengthDb: number,
  transponderActive: boolean,
  zones: RestrictedZone[]
): TrackedObject {
  const baseObj: TrackedObject = {
    id,
    callsign,
    type,
    classification,
    x,
    y,
    altitudeM,
    speedMps,
    headingDeg,
    climbRateMps,
    turnRateDegPs,
    signalStrengthDb,
    transponderActive,
    riskScore: 0,
    riskLevel: 'low',
    riskFactors: [],
    updatedAt: 0,
    telemetryHistory: [
      {
        timestamp: 0,
        x,
        y,
        altitudeM,
        speedMps,
        headingDeg,
      },
    ],
  };

  const evalRisk = calculateRisk(baseObj, zones);
  baseObj.riskScore = evalRisk.score;
  baseObj.riskLevel = evalRisk.level;
  baseObj.riskFactors = evalRisk.factors;

  return baseObj;
}

export const SCENARIOS: ScenarioPreset[] = [
  {
    id: 'standard-perimeter',
    name: 'Scenario 1: Standard Sector Surveillance',
    description: 'Routine airspace with mixed commercial delivery corridors, friendly security patrols, and one uncooperative drone loitering near the outer buffer.',
    zones: DEFAULT_ZONES,
    initialObjects: [
      createTrack('UAS-01', 'HAWK-PATROL-1', 'quadcopter', 'friendly', -1400, 1200, 120, 14, 135, 0, 1.2, -62, true, DEFAULT_ZONES),
      createTrack('UAS-02', 'CARGO-MED-8', 'fixed_wing', 'commercial', 3800, 3200, 350, 24, 225, -0.5, 0, -78, true, DEFAULT_ZONES),
      createTrack('UAS-03', 'SURVEY-GEO-X', 'hexacopter', 'commercial', -2800, -2200, 180, 12, 45, 0.2, 0.5, -74, true, DEFAULT_ZONES),
      createTrack('UAS-04', 'PHANTOM-ROQUE', 'quadcopter', 'unauthorized', -1800, 1900, 95, 18, 140, 0, 0, -82, false, DEFAULT_ZONES),
      createTrack('UAS-05', 'NIMBUS-AERO', 'commercial_uav', 'commercial', 4200, -1200, 280, 22, 310, 0, -0.5, -70, true, DEFAULT_ZONES),
      createTrack('UAS-06', 'SCOUT-ORBIT-2', 'quadcopter', 'friendly', 1200, 1400, 110, 10, 270, 0, 2.0, -58, true, DEFAULT_ZONES),
      createTrack('UAS-07', 'AGRI-SPRAY-4', 'hexacopter', 'commercial', -3900, 100, 60, 9, 90, 0, 0, -85, true, DEFAULT_ZONES),
      createTrack('UAS-08', 'UNID-GHOST-9', 'unknown_micro_uas', 'unknown', 1900, 2100, 85, 16, 210, -0.2, -0.8, -89, false, DEFAULT_ZONES),
      createTrack('UAS-09', 'SKY-FEED-MEDIA', 'quadcopter', 'commercial', -800, -3400, 150, 15, 10, 0.4, 0, -72, true, DEFAULT_ZONES),
      createTrack('UAS-10', 'RAPTOR-FIXED', 'fixed_wing', 'unauthorized', 3200, 2800, 220, 28, 230, 0, 0.2, -80, false, DEFAULT_ZONES),
      createTrack('UAS-11', 'PERIMETER-EAGLE', 'quadcopter', 'friendly', 400, -1100, 90, 12, 350, 0, -1.5, -60, true, DEFAULT_ZONES),
      createTrack('UAS-12', 'INFRA-INSPECT', 'hexacopter', 'commercial', 2600, -1600, 130, 8, 300, 0, 1.0, -68, true, DEFAULT_ZONES),
    ],
  },
  {
    id: 'perimeter-breach',
    name: 'Scenario 2: Critical Perimeter Incursion & Swarm Vector',
    description: 'High-threat incursion scenario featuring multiple fast unauthorized drones vectoring directly into the protected compound without RemoteID.',
    zones: DEFAULT_ZONES,
    initialObjects: [
      createTrack('UAS-01', 'INTRUDER-ALPHA', 'fixed_wing', 'unauthorized', 1600, 1500, 110, 36, 225, -0.8, 0, -88, false, DEFAULT_ZONES),
      createTrack('UAS-02', 'INTRUDER-BRAVO', 'quadcopter', 'unauthorized', -1300, 1400, 80, 28, 135, 0, 0, -86, false, DEFAULT_ZONES),
      createTrack('UAS-03', 'INTRUDER-CHARLIE', 'unknown_micro_uas', 'unauthorized', 1200, -1100, 45, 30, 315, 0.5, 0, -92, false, DEFAULT_ZONES),
      createTrack('UAS-04', 'GUARDIAN-INTERCEPT', 'quadcopter', 'friendly', 300, 400, 150, 20, 45, 1.2, 0, -54, true, DEFAULT_ZONES),
      createTrack('UAS-05', 'CARGO-DIVERT-3', 'commercial_uav', 'commercial', 3900, 3500, 400, 20, 90, 0, 0.5, -75, true, DEFAULT_ZONES),
      createTrack('UAS-06', 'CIVIL-EVAC-1', 'hexacopter', 'commercial', -3200, 2400, 200, 15, 270, 0, 0, -79, true, DEFAULT_ZONES),
      createTrack('UAS-07', 'INTRUDER-DELTA', 'unknown_micro_uas', 'unauthorized', -600, -1800, 60, 26, 20, 0, 0, -91, false, DEFAULT_ZONES),
      createTrack('UAS-08', 'SECURITY-RELAY', 'quadcopter', 'friendly', -400, 500, 130, 12, 180, 0, 2.0, -56, true, DEFAULT_ZONES),
      createTrack('UAS-09', 'PRESS-COPTER', 'quadcopter', 'commercial', -2500, -1200, 140, 14, 60, 0, 0, -74, true, DEFAULT_ZONES),
      createTrack('UAS-10', 'UNKNOWN-FAST-X', 'fixed_wing', 'unauthorized', 2800, -400, 160, 38, 270, -0.5, 0, -84, false, DEFAULT_ZONES),
      createTrack('UAS-11', 'PATROL-SENTINEL', 'quadcopter', 'friendly', 900, -900, 100, 15, 135, 0, -1.0, -60, true, DEFAULT_ZONES),
      createTrack('UAS-12', 'DISPATCH-RUNNER', 'commercial_uav', 'commercial', 4400, -2200, 320, 22, 10, 0, 0, -77, true, DEFAULT_ZONES),
    ],
  },
  {
    id: 'high-density-airspace',
    name: 'Scenario 3: Dense Urban Approach Corridor',
    description: 'High-density mixed operations corridor testing simultaneous tracking, tight vertical separation, and multi-track prioritization.',
    zones: DEFAULT_ZONES,
    initialObjects: [
      createTrack('UAS-01', 'METRO-TAXI-01', 'commercial_uav', 'commercial', -1200, -2800, 450, 26, 15, 0.5, 0, -65, true, DEFAULT_ZONES),
      createTrack('UAS-02', 'METRO-TAXI-02', 'commercial_uav', 'commercial', -900, -2200, 520, 24, 20, 0, 0, -67, true, DEFAULT_ZONES),
      createTrack('UAS-03', 'DELIVERY-HUB-A', 'hexacopter', 'commercial', -3100, 1200, 120, 16, 90, 0, 0.3, -71, true, DEFAULT_ZONES),
      createTrack('UAS-04', 'DELIVERY-HUB-B', 'hexacopter', 'commercial', -2800, 1600, 140, 15, 85, 0, -0.2, -73, true, DEFAULT_ZONES),
      createTrack('UAS-05', 'POLICE-AIR-1', 'quadcopter', 'friendly', 600, 800, 160, 18, 220, 0, 1.5, -59, true, DEFAULT_ZONES),
      createTrack('UAS-06', 'TELECOM-INSPECT', 'hexacopter', 'commercial', 3100, 1900, 95, 7, 180, 0, 1.8, -74, true, DEFAULT_ZONES),
      createTrack('UAS-07', 'ROGUE-FLYER-7', 'quadcopter', 'unauthorized', -1900, 2300, 80, 22, 130, 0, 0, -83, false, DEFAULT_ZONES),
      createTrack('UAS-08', 'AMBULANCE-DRONE', 'fixed_wing', 'friendly', -3600, -1800, 280, 32, 55, 1.0, 0, -62, true, DEFAULT_ZONES),
      createTrack('UAS-09', 'ROOFTOP-SURVEY', 'quadcopter', 'commercial', 1800, -2600, 110, 10, 340, 0, 0.8, -75, true, DEFAULT_ZONES),
      createTrack('UAS-10', 'UNKNOWN-RACER', 'unknown_micro_uas', 'unauthorized', 2100, 900, 50, 34, 250, 0, 0, -89, false, DEFAULT_ZONES),
      createTrack('UAS-11', 'SECURITY-LEAD', 'quadcopter', 'friendly', -200, -400, 130, 14, 40, 0, 0.5, -57, true, DEFAULT_ZONES),
      createTrack('UAS-12', 'VIP-ESCORT', 'quadcopter', 'friendly', 200, -200, 140, 14, 40, 0, 0.5, -58, true, DEFAULT_ZONES),
      createTrack('UAS-13', 'WEATHER-SONDE', 'fixed_wing', 'commercial', 4200, 3600, 850, 18, 200, -1.2, 0, -81, true, DEFAULT_ZONES),
      createTrack('UAS-14', 'SHADOW-GLIDER', 'fixed_wing', 'unauthorized', -3000, -2900, 190, 25, 35, 0, 0, -87, false, DEFAULT_ZONES),
    ],
  },
];
