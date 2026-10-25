import { describe, it, expect } from 'vitest';
import {
  initializeSimulation,
  resetSimulation,
  setSimulationRunning,
  setSimulationSpeed,
  selectScenario,
  stepSimulation,
  acknowledgeAlert,
} from './simulationEngine';
import { SCENARIOS } from './scenarios';

describe('simulationEngine', () => {
  it('initializes with at least 10 tracked objects with stable unique IDs', () => {
    const state = initializeSimulation('standard-perimeter');
    expect(state.objects.length).toBeGreaterThanOrEqual(10);
    const ids = state.objects.map((o) => o.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ids.length);
  });

  it('initializes with default zones and running status', () => {
    const state = initializeSimulation();
    expect(state.isRunning).toBe(true);
    expect(state.simTimeSec).toBe(0);
    expect(state.zones.length).toBeGreaterThanOrEqual(1);
  });

  it('advances simulation time and kinematic coordinates when running', () => {
    const state = initializeSimulation();
    const initialObj = state.objects[0];
    const advanced = stepSimulation(state, 1.0);

    expect(advanced.simTimeSec).toBe(1.0);
    const advancedObj = advanced.objects[0];
    expect(advancedObj.updatedAt).toBe(1.0);

    // If speed > 0, position or heading should have updated
    if (initialObj.speedMps > 0) {
      const moved = initialObj.x !== advancedObj.x || initialObj.y !== advancedObj.y;
      expect(moved).toBe(true);
    }
  });

  it('does not advance positions or sim time when paused', () => {
    let state = initializeSimulation();
    state = setSimulationRunning(state, false);
    const initialX = state.objects[0].x;
    const initialY = state.objects[0].y;

    const pausedStep = stepSimulation(state, 1.0);
    expect(pausedStep.simTimeSec).toBe(0);
    expect(pausedStep.objects[0].x).toBe(initialX);
    expect(pausedStep.objects[0].y).toBe(initialY);
  });

  it('respects speed multiplier when advancing', () => {
    let state = initializeSimulation();
    state = setSimulationSpeed(state, 2.0);
    const advanced = stepSimulation(state, 1.0);
    expect(advanced.simTimeSec).toBe(2.0);
  });

  it('resets state cleanly to initial scenario parameters', () => {
    let state = initializeSimulation();
    state = stepSimulation(state, 10.0);
    expect(state.simTimeSec).toBe(10.0);

    const resetState = resetSimulation(state);
    expect(resetState.simTimeSec).toBe(0);
    expect(resetState.objects[0].x).toBe(SCENARIOS[0].initialObjects[0].x);
    expect(resetState.objects[0].y).toBe(SCENARIOS[0].initialObjects[0].y);
    expect(resetState.alerts.length).toBe(0);
  });

  it('switches scenarios properly', () => {
    let state = initializeSimulation('standard-perimeter');
    expect(state.selectedScenarioId).toBe('standard-perimeter');

    state = selectScenario(state, 'perimeter-breach');
    expect(state.selectedScenarioId).toBe('perimeter-breach');
    expect(state.simTimeSec).toBe(0);
    expect(state.objects[0].callsign).toContain('INTRUDER');
  });

  it('acknowledges alerts correctly', () => {
    let state = initializeSimulation();
    state.alerts = [
      {
        id: 'test-alert-1',
        objectId: 'UAS-01',
        objectCallsign: 'ALPHA',
        createdAt: 5,
        severity: 'high',
        title: 'Test Threat',
        reason: 'Test reason',
        acknowledged: false,
      },
    ];

    const acknowledged = acknowledgeAlert(state, 'test-alert-1');
    expect(acknowledged.alerts[0].acknowledged).toBe(true);
  });
});
