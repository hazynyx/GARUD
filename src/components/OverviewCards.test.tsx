import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { OverviewCards } from './OverviewCards';
import { TrackedObject, SimulatedAlert } from '../features/simulation/types';

describe('OverviewCards', () => {
  const sampleTracks: TrackedObject[] = [
    {
      id: 'UAS-01',
      callsign: 'ALPHA',
      type: 'quadcopter',
      classification: 'friendly',
      x: 0,
      y: 0,
      altitudeM: 100,
      speedMps: 10,
      headingDeg: 90,
      climbRateMps: 0,
      turnRateDegPs: 0,
      signalStrengthDb: -60,
      transponderActive: true,
      riskScore: 20,
      riskLevel: 'low',
      riskFactors: [],
      updatedAt: 0,
      telemetryHistory: [],
    },
    {
      id: 'UAS-02',
      callsign: 'BRAVO',
      type: 'fixed_wing',
      classification: 'unauthorized',
      x: 100,
      y: 100,
      altitudeM: 150,
      speedMps: 30,
      headingDeg: 180,
      climbRateMps: 0,
      turnRateDegPs: 0,
      signalStrengthDb: -80,
      transponderActive: false,
      riskScore: 85,
      riskLevel: 'high',
      riskFactors: [],
      updatedAt: 0,
      telemetryHistory: [],
    },
  ];

  const sampleAlerts: SimulatedAlert[] = [
    {
      id: 'alt-1',
      objectId: 'UAS-02',
      objectCallsign: 'BRAVO',
      createdAt: 10,
      severity: 'high',
      title: 'CRITICAL THREAT',
      reason: 'Zone incursion detected',
      acknowledged: false,
    },
  ];

  it('renders track counts and breakdown by risk levels accurately', () => {
    render(<OverviewCards objects={sampleTracks} alerts={sampleAlerts} />);

    expect(screen.getByText('Active Tracks')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument(); // total count
    expect(screen.getByText('Low Risk')).toBeInTheDocument();
    expect(screen.getByText('High Risk')).toBeInTheDocument();
    expect(screen.getByText('Pending Alerts')).toBeInTheDocument();
    expect(screen.getAllByText('1').length).toBeGreaterThanOrEqual(1);
  });
});
