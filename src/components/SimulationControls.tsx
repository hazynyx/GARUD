import React from 'react';
import { Play, Pause, RotateCcw, Clock } from 'lucide-react';
import styles from './SimulationControls.module.css';
import { SCENARIOS } from '../features/simulation/scenarios';

interface SimulationControlsProps {
  isRunning: boolean;
  simTimeSec: number;
  speedMultiplier: number;
  selectedScenarioId: string;
  onToggleRunning: () => void;
  onReset: () => void;
  onSpeedChange: (speed: number) => void;
  onScenarioChange: (scenarioId: string) => void;
}

export const SimulationControls: React.FC<SimulationControlsProps> = ({
  isRunning,
  simTimeSec,
  speedMultiplier,
  selectedScenarioId,
  onToggleRunning,
  onReset,
  onSpeedChange,
  onScenarioChange,
}) => {
  const formatTime = (totalSeconds: number): string => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = Math.floor(totalSeconds % 60);
    const tenths = Math.floor((totalSeconds % 1) * 10);
    return `${mins.toString().padStart(2, '0')}:${secs
      .toString()
      .padStart(2, '0')}.${tenths}`;
  };

  const speedOptions = [0.5, 1.0, 2.0, 5.0];

  return (
    <div className={styles.toolbar} role="toolbar" aria-label="Simulation Controls">
      {/* Primary Playback controls */}
      <div className={styles.leftGroup}>
        <button
          type="button"
          className={`${styles.btn} ${isRunning ? styles.btnWarning : styles.btnPrimary}`}
          onClick={onToggleRunning}
          aria-label={isRunning ? 'Pause Simulation' : 'Resume Simulation'}
          title={isRunning ? 'Pause simulation (Space)' : 'Resume simulation (Space)'}
        >
          {isRunning ? <Pause size={14} /> : <Play size={14} />}
          <span>{isRunning ? 'Pause' : 'Resume'}</span>
        </button>

        <button
          type="button"
          className={styles.btn}
          onClick={onReset}
          aria-label="Reset Simulation to Initial State"
          title="Reset to initial state (R)"
        >
          <RotateCcw size={14} />
          <span>Reset</span>
        </button>

        {/* Speed multiplier segmented control */}
        <div className={styles.speedGroup} role="group" aria-label="Simulation Speed Multiplier">
          {speedOptions.map((speed) => (
            <button
              key={speed}
              type="button"
              className={`${styles.speedBtn} ${
                speedMultiplier === speed ? styles.speedBtnActive : ''
              }`}
              onClick={() => onSpeedChange(speed)}
              aria-pressed={speedMultiplier === speed}
              title={`Set speed to ${speed}x`}
            >
              {speed}x
            </button>
          ))}
        </div>
      </div>

      {/* Scenario Presets & Simulation Clock */}
      <div className={styles.leftGroup}>
        <div className={styles.scenarioGroup}>
          <label htmlFor="scenario-select" className={styles.scenarioLabel}>
            Scenario:
          </label>
          <select
            id="scenario-select"
            className={styles.scenarioSelect}
            value={selectedScenarioId}
            onChange={(e) => onScenarioChange(e.target.value)}
            aria-label="Select Operational Scenario"
          >
            {SCENARIOS.map((sc) => (
              <option key={sc.id} value={sc.id}>
                {sc.name}
              </option>
            ))}
          </select>
        </div>

        <div className={styles.clockBadge} title="Elapsed Simulation Clock">
          <Clock size={13} style={{ color: 'var(--text-muted)' }} />
          <span>T+{formatTime(simTimeSec)}</span>
        </div>
      </div>
    </div>
  );
};
