export type RiskLevel = 'low' | 'medium' | 'high';

export type ObjectType =
  | 'quadcopter'
  | 'fixed_wing'
  | 'hexacopter'
  | 'commercial_uav'
  | 'unknown_micro_uas';

export type TrackClassification =
  | 'friendly'
  | 'commercial'
  | 'unauthorized'
  | 'unknown';

export interface TelemetryPoint {
  timestamp: number; // simulation time (seconds)
  x: number; // meters from radar center
  y: number; // meters from radar center
  altitudeM: number; // meters AGL
  speedMps: number; // meters per second
  headingDeg: number; // 0..359 degrees (0 = North, 90 = East)
}

export interface RiskFactor {
  name: string;
  contribution: number; // points contributed to total risk score (0-100)
  description: string;
}

export interface TrackedObject {
  id: string;
  callsign: string;
  type: ObjectType;
  classification: TrackClassification;
  x: number;
  y: number;
  altitudeM: number;
  speedMps: number;
  headingDeg: number;
  climbRateMps: number;
  turnRateDegPs: number;
  signalStrengthDb: number; // RSSI in dBm (e.g., -55 to -90)
  transponderActive: boolean; // RemoteID broadcast status
  riskScore: number; // 0 to 100
  riskLevel: RiskLevel;
  riskFactors: RiskFactor[];
  updatedAt: number; // Sim time in seconds
  telemetryHistory: TelemetryPoint[];
}

export interface RestrictedZone {
  id: string;
  name: string;
  centerX: number;
  centerY: number;
  radiusM: number; // Core prohibited zone radius (meters)
  warningBufferM: number; // Outer buffer zone radius (meters)
  minAltM: number;
  maxAltM: number;
  type: 'no_fly_zone' | 'critical_infrastructure' | 'vip_perimeter';
}

export interface SimulatedAlert {
  id: string;
  objectId: string;
  objectCallsign: string;
  createdAt: number; // sim time seconds
  severity: RiskLevel;
  title: string;
  reason: string;
  acknowledged: boolean;
  acknowledgedAt?: number;
}

export interface ScenarioPreset {
  id: string;
  name: string;
  description: string;
  initialObjects: TrackedObject[];
  zones: RestrictedZone[];
}

export interface SimulationState {
  isRunning: boolean;
  simTimeSec: number;
  speedMultiplier: number; // 0.5, 1, 2, 5
  selectedScenarioId: string;
  selectedObjectId: string | null;
  objects: TrackedObject[];
  zones: RestrictedZone[];
  alerts: SimulatedAlert[];
  predictionHorizonSec: number; // e.g., 30s
}
