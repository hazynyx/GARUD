import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { SimulationControls } from './SimulationControls';

describe('SimulationControls', () => {
  it('triggers onToggleRunning when play/pause button clicked', () => {
    const handleToggle = vi.fn();
    render(
      <SimulationControls
        isRunning={true}
        simTimeSec={42.5}
        speedMultiplier={1.0}
        selectedScenarioId="standard-perimeter"
        onToggleRunning={handleToggle}
        onReset={() => {}}
        onSpeedChange={() => {}}
        onScenarioChange={() => {}}
      />
    );

    const pauseBtn = screen.getByRole('button', { name: /Pause Simulation/i });
    fireEvent.click(pauseBtn);
    expect(handleToggle).toHaveBeenCalledTimes(1);
    expect(screen.getByText(/T\+00:42.5/i)).toBeInTheDocument();
  });

  it('triggers onReset when reset button clicked', () => {
    const handleReset = vi.fn();
    render(
      <SimulationControls
        isRunning={false}
        simTimeSec={0}
        speedMultiplier={1.0}
        selectedScenarioId="standard-perimeter"
        onToggleRunning={() => {}}
        onReset={handleReset}
        onSpeedChange={() => {}}
        onScenarioChange={() => {}}
      />
    );

    const resetBtn = screen.getByRole('button', { name: /Reset Simulation/i });
    fireEvent.click(resetBtn);
    expect(handleReset).toHaveBeenCalledTimes(1);
  });

  it('triggers speed multiplier change', () => {
    const handleSpeed = vi.fn();
    render(
      <SimulationControls
        isRunning={true}
        simTimeSec={0}
        speedMultiplier={1.0}
        selectedScenarioId="standard-perimeter"
        onToggleRunning={() => {}}
        onReset={() => {}}
        onSpeedChange={handleSpeed}
        onScenarioChange={() => {}}
      />
    );

    const speed2xBtn = screen.getByRole('button', { name: /2x/i });
    fireEvent.click(speed2xBtn);
    expect(handleSpeed).toHaveBeenCalledWith(2.0);
  });
});
