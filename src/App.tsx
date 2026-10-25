import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { ShieldAlert, Radio, Activity, Cpu } from 'lucide-react';
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
      // Ignore if user is inside an input or select
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

  // Find currently selected object
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
      {/* Persistent Simulation Warning Banner */}
      <aside className={styles.simBanner} role="status" aria-label="Simulation Mode Indicator">
        <ShieldAlert className={styles.simBannerIcon} size={16} />
        <span>SIMULATION MODE — NOT LIVE SENSOR DATA • SYNTHETIC TEST TELEMETRY ONLY</span>
      </aside>

      {/* Main Tactical C2 Header */}
      <header className={styles.header}>
        <div className={styles.brand}>
          <div className={styles.brandIcon}>
            <Radio size={28} />
          </div>
          <div>
            <h1 className={styles.brandTitle}>
              GARUD 🦅 <span className={styles.brandSubtitle}>Counter-Drone Monitoring & Airspace Security</span>
            </h1>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          <div className={styles.systemBadge}>
            <Cpu size={14} />
            <span>CORE: {simState.isRunning ? 'ACTIVE TICK' : 'STANDBY'}</span>
          </div>

          <div className={styles.systemBadge}>
            <span
              className={styles.systemStatusLive}
              style={{
                backgroundColor: simState.isRunning ? 'var(--risk-low)' : 'var(--risk-medium)',
                boxShadow: simState.isRunning ? '0 0 8px var(--risk-low)' : 'none',
              }}
            />
            <span>SIM_CLOCK: {formattedSimClock}</span>
          </div>
        </div>
      </header>

      {/* Main Dashboard Body */}
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

        {/* Metric Overview Cards */}
        <OverviewCards objects={simState.objects} alerts={simState.alerts} />

        {/* Tactical Airspace Operations Grid */}
        <div className={styles.grid}>
          {/* Left Column: Tactical PPI Radar & Telemetry Charts */}
          <section className={styles.radarSection} aria-label="Tactical Airspace View">
            <RadarView
              objects={simState.objects}
              zones={simState.zones}
              selectedObjectId={selectedObject?.id ?? null}
              predictionHorizonSec={simState.predictionHorizonSec}
              onSelectObject={handleSelectObject}
              onHorizonChange={handleHorizonChange}
            />

            {/* Historical Telemetry Charts */}
            <TelemetryCharts selectedObject={selectedObject} />
          </section>

          {/* Right Column: Track Details / Explainable Risk & Security Alert Stream */}
          <aside className={styles.sideSection} aria-label="Telemetry and Alerts">
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

      {/* Tactical C2 Footer */}
      <footer className={styles.footer}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Activity size={14} style={{ color: 'var(--accent-primary)' }} />
          <span>GARUD Airspace Surveillance Prototype • Version 0.2-hackathon</span>
        </div>
        <div>
          <span>Decision Support Only — No Weapon, Jamming, or Interception Capabilities Integrated</span>
        </div>
      </footer>
    </div>
  );
};

export default App;
