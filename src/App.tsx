import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { ShieldAlert, Radio, Activity } from 'lucide-react';
import styles from './App.module.css';
import {
  initializeSimulation,
  resetSimulation,
  setSimulationRunning,
  setSimulationSpeed,
  selectScenario,
  selectObject,
  acknowledgeAlert,
  clearAlerts,
  setPredictionHorizon,
  stepSimulation,
} from './features/simulation/simulationEngine';
import { SimulationState } from './features/simulation/types';
import { SimulationControls } from './components/SimulationControls';
import { OverviewCards } from './components/OverviewCards';
import { RadarView } from './components/RadarView';
import { ObjectDetails } from './components/ObjectDetails';
import { AlertFeed } from './components/AlertFeed';
import { TelemetryCharts } from './components/TelemetryCharts';

export const App: React.FC = () => {
  const [simState, setSimState] = useState<SimulationState>(() => initializeSimulation());

  // Fixed tick step: 250ms (4Hz tactical refresh)
  const TICK_INTERVAL_MS = 250;
  const DELTA_SECONDS = 0.25;

  useEffect(() => {
    const timer = setInterval(() => {
      setSimState((prevState) => {
        if (!prevState.isRunning) return prevState;
        return stepSimulation(prevState, DELTA_SECONDS);
      });
    }, TICK_INTERVAL_MS);

    return () => {
      clearInterval(timer);
    };
  }, []);

  // Keyboard shortcut listener (Space = Pause/Resume, R = Reset)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'SELECT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }
      if (e.code === 'Space') {
        e.preventDefault();
        setSimState((prev) => setSimulationRunning(prev, !prev.isRunning));
      } else if (e.key === 'r' || e.key === 'R') {
        e.preventDefault();
        setSimState((prev) => resetSimulation(prev));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Handlers
  const handleToggleRunning = useCallback(() => {
    setSimState((prev) => setSimulationRunning(prev, !prev.isRunning));
  }, []);

  const handleReset = useCallback(() => {
    setSimState((prev) => resetSimulation(prev));
  }, []);

  const handleSpeedChange = useCallback((speed: number) => {
    setSimState((prev) => setSimulationSpeed(prev, speed));
  }, []);

  const handleScenarioChange = useCallback((scenarioId: string) => {
    setSimState((prev) => selectScenario(prev, scenarioId));
  }, []);

  const handleSelectObject = useCallback((objectId: string) => {
    setSimState((prev) => selectObject(prev, objectId));
  }, []);

  const handleHorizonChange = useCallback((horizonSec: number) => {
    setSimState((prev) => setPredictionHorizon(prev, horizonSec));
  }, []);

  const handleAcknowledgeAlert = useCallback((alertId: string) => {
    setSimState((prev) => acknowledgeAlert(prev, alertId));
  }, []);

  const handleClearAlerts = useCallback(() => {
    setSimState((prev) => clearAlerts(prev));
  }, []);

  // Selected object memo
  const selectedObject = useMemo(() => {
    return simState.objects.find((o) => o.id === simState.selectedObjectId) ?? simState.objects[0] ?? null;
  }, [simState.objects, simState.selectedObjectId]);

  // Formatted simulation clock string
  const formattedSimClock = useMemo(() => {
    const totalSecs = Math.floor(simState.simTimeSec);
    const m = Math.floor(totalSecs / 60);
    const s = totalSecs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  }, [simState.simTimeSec]);

  return (
    <div className={styles.container}>
      {/* Simulation Warning Banner */}
      <aside className={styles.simBanner} role="status" aria-label="Simulation Mode Indicator">
        <ShieldAlert className={styles.simBannerIcon} size={15} />
        <span>SIMULATION MODE — NOT LIVE SENSOR DATA • SYNTHETIC TEST TELEMETRY ONLY</span>
      </aside>

      {/* Main Tactical C2 Header */}
      <header className={styles.header}>
        <div className={styles.brandArea}>
          <div className={styles.brandIcon}>
            <Radio size={20} />
          </div>
          <div className={styles.brandText}>
            <h1 className={styles.brandTitle}>
              GARUD 🦅
            </h1>
            <span className={styles.brandSubtitle}>Counter-Drone Monitoring & Airspace Security</span>
          </div>
        </div>

        <div className={styles.headerStatus}>
          <div className={styles.statusPill}>
            <span className={simState.isRunning ? styles.liveDot : styles.pausedDot} />
            <span>{simState.isRunning ? 'Active Simulation' : 'Paused'}</span>
          </div>

          <div className={styles.statusPill} style={{ fontFamily: 'var(--font-mono)' }}>
            <span>Clock: {formattedSimClock}</span>
          </div>
        </div>
      </header>

      {/* Main Dashboard Bento Workspace */}
      <main className={styles.mainContent}>
        {/* Playback & Scenario Controls Bar */}
        <SimulationControls
          isRunning={simState.isRunning}
          simTimeSec={simState.simTimeSec}
          speedMultiplier={simState.speedMultiplier}
          selectedScenarioId={simState.selectedScenarioId}
          onToggleRunning={handleToggleRunning}
          onReset={handleReset}
          onSpeedChange={handleSpeedChange}
          onScenarioChange={handleScenarioChange}
        />

        {/* Bento Overview Metrics */}
        <OverviewCards objects={simState.objects} alerts={simState.alerts} />

        {/* Primary Workspace Bento Grid */}
        <div className={styles.bentoGrid}>
          {/* Primary Left Column: Radar Centerpiece & Kinematic Profile */}
          <section className={styles.leftWorkspace} aria-label="Primary Radar Workspace">
            <RadarView
              objects={simState.objects}
              zones={simState.zones}
              selectedObjectId={selectedObject?.id ?? null}
              predictionHorizonSec={simState.predictionHorizonSec}
              onSelectObject={handleSelectObject}
              onHorizonChange={handleHorizonChange}
            />

            <TelemetryCharts selectedObject={selectedObject} />
          </section>

          {/* Secondary Right Column: Track Telemetry & Security Alerts */}
          <aside className={styles.rightWorkspace} aria-label="Selected Target and Security Alerts">
            <ObjectDetails
              object={selectedObject}
              zones={simState.zones}
              simTimeSec={simState.simTimeSec}
            />

            <AlertFeed
              alerts={simState.alerts}
              onAcknowledgeAlert={handleAcknowledgeAlert}
              onClearAlerts={handleClearAlerts}
              onSelectTrack={handleSelectObject}
            />
          </aside>
        </div>
      </main>

      {/* Understated C2 Footer */}
      <footer className={styles.footer}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Activity size={14} style={{ color: 'var(--accent-primary)' }} />
          <span>GARUD Tactical Airspace Platform · Decision-Support Prototype</span>
        </div>
        <div>
          <span>Passive situational monitoring only · No weapon or kinetic effector systems integrated</span>
        </div>
      </footer>
    </div>
  );
};

export default App;
