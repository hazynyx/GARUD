import { describe, it, expect } from 'vitest';
import { predictPosition, predictTrajectory } from './prediction';
import { TrackedObject } from '../simulation/types';

describe('prediction logic', () => {
  const sampleObject: TrackedObject = {
    id: 'UAS-TEST',
    callsign: 'TEST-DRONE',
    type: 'quadcopter',
    classification: 'unauthorized',
    x: 0,
    y: 0,
    altitudeM: 100,
    speedMps: 20, // 20 m/s
    headingDeg: 0, // 0 deg = North (+Y)
    climbRateMps: 2, // 2 m/s
    turnRateDegPs: 0,
    signalStrengthDb: -70,
    transponderActive: true,
    riskScore: 0,
    riskLevel: 'low',
    riskFactors: [],
    updatedAt: 0,
    telemetryHistory: [],
  };

  it('predicts Northward movement accurately (heading 0 deg, +Y)', () => {
    const pos = predictPosition(sampleObject, 10);
    expect(pos.x).toBeCloseTo(0, 1);
    expect(pos.y).toBeCloseTo(200, 1); // 20 m/s * 10s = 200m North
    expect(pos.altitudeM).toBeCloseTo(120, 1); // 100 + 2*10 = 120m
  });

  it('predicts Eastward movement accurately (heading 90 deg, +X)', () => {
    const eastObj = { ...sampleObject, headingDeg: 90, climbRateMps: 0 };
    const pos = predictPosition(eastObj, 5);
    expect(pos.x).toBeCloseTo(100, 1); // 20 m/s * 5s = 100m East
    expect(pos.y).toBeCloseTo(0, 1);
    expect(pos.altitudeM).toBe(100);
  });

  it('handles zero speed without drifting', () => {
    const staticObj = { ...sampleObject, speedMps: 0, climbRateMps: 0 };
    const pos = predictPosition(staticObj, 30);
    expect(pos.x).toBe(0);
    expect(pos.y).toBe(0);
    expect(pos.altitudeM).toBe(100);
  });

  it('handles negative or zero prediction horizon safely', () => {
    const posZero = predictPosition(sampleObject, 0);
    expect(posZero.x).toBe(sampleObject.x);
    expect(posZero.y).toBe(sampleObject.y);

    const posNeg = predictPosition(sampleObject, -10);
    expect(posNeg.x).toBe(sampleObject.x);
  });

  it('generates trajectory waypoints with expanding uncertainty bounds', () => {
    const waypoints = predictTrajectory(sampleObject, 30, 5);
    expect(waypoints.length).toBe(6); // 5, 10, 15, 20, 25, 30s
    expect(waypoints[0].secondsAhead).toBe(5);
    expect(waypoints[5].secondsAhead).toBe(30);

    // Uncertainty must strictly expand with time horizon
    for (let i = 1; i < waypoints.length; i++) {
      expect(waypoints[i].uncertaintyRadiusM).toBeGreaterThan(waypoints[i - 1].uncertaintyRadiusM);
    }
  });
});
