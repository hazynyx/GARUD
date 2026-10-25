import { describe, it, expect } from 'vitest';
import { calculateRisk, classifyRisk, calculateClosingSpeed } from './riskScoring';
import { RestrictedZone, TrackedObject } from '../simulation/types';

describe('riskScoring logic', () => {
  const sampleZone: RestrictedZone = {
    id: 'test-zone',
    name: 'Protected Compound',
    centerX: 0,
    centerY: 0,
    radiusM: 500,
    warningBufferM: 1500,
    minAltM: 0,
    maxAltM: 1000,
    type: 'vip_perimeter',
  };

  const baseObject: TrackedObject = {
    id: 'UAS-01',
    callsign: 'DRONE-1',
    type: 'quadcopter',
    classification: 'unauthorized',
    x: 3000,
    y: 3000,
    altitudeM: 100,
    speedMps: 15,
    headingDeg: 225, // Heading southwest towards (0, 0)
    climbRateMps: 0,
    turnRateDegPs: 0,
    signalStrengthDb: -70,
    transponderActive: true,
    riskScore: 0,
    riskLevel: 'low',
    riskFactors: [],
    updatedAt: 0,
    telemetryHistory: [],
  };

  it('correctly classifies score tiers', () => {
    expect(classifyRisk(25)).toBe('low');
    expect(classifyRisk(39)).toBe('low');
    expect(classifyRisk(40)).toBe('medium');
    expect(classifyRisk(69)).toBe('medium');
    expect(classifyRisk(70)).toBe('high');
    expect(classifyRisk(100)).toBe('high');
  });

  it('computes positive closing speed when heading directly toward zone', () => {
    // At (0, 1000), heading South (180 deg) toward (0, 0) at 20 m/s
    const closingObj = { ...baseObject, x: 0, y: 1000, headingDeg: 180, speedMps: 20 };
    const cs = calculateClosingSpeed(closingObj, sampleZone);
    expect(cs).toBeCloseTo(20, 1);
  });

  it('computes negative closing speed when heading directly away from zone', () => {
    // At (0, 1000), heading North (0 deg) away from (0, 0) at 20 m/s
    const retreatingObj = { ...baseObject, x: 0, y: 1000, headingDeg: 0, speedMps: 20 };
    const cs = calculateClosingSpeed(retreatingObj, sampleZone);
    expect(cs).toBeCloseTo(-20, 1);
  });

  it('assigns high risk score and zone incursion factor when inside restricted radius', () => {
    const incursionObj: TrackedObject = {
      ...baseObject,
      x: 200,
      y: 200, // Distance = sqrt(200^2 + 200^2) = 282m <= 500m
      transponderActive: false,
    };

    const evalResult = calculateRisk(incursionObj, [sampleZone]);
    expect(evalResult.level).toBe('high');
    expect(evalResult.score).toBeGreaterThanOrEqual(70);

    const hasIncursionFactor = evalResult.factors.some((f) => f.name === 'Zone Incursion');
    expect(hasIncursionFactor).toBe(true);

    const hasNoTransponderFactor = evalResult.factors.some((f) => f.name === 'No RemoteID Broadcast');
    expect(hasNoTransponderFactor).toBe(true);
  });

  it('discounts risk for authorized friendly tracks', () => {
    const friendlyObj: TrackedObject = {
      ...baseObject,
      classification: 'friendly',
      transponderActive: true,
      x: 1000,
      y: 0,
    };

    const evalResult = calculateRisk(friendlyObj, [sampleZone]);
    const hasDiscount = evalResult.factors.some((f) => f.name === 'Authorized Friendly Identity');
    expect(hasDiscount).toBe(true);
  });
});
