import React from 'react';
import { ShieldAlert, Radio, Activity } from 'lucide-react';
import styles from './App.module.css';

export const App: React.FC = () => {
  return (
    <div className={styles.container}>
      {/* Persistent Simulation Warning Banner */}
      <aside className={styles.simBanner} role="status" aria-label="Simulation Mode Indicator">
        <ShieldAlert className={styles.simBannerIcon} size={16} />
        <span>SIMULATION MODE — NOT LIVE SENSOR DATA • SYNTHETIC TEST TELEMETRY ONLY</span>
      </aside>

      {/* Main Tactical Header */}
      <header className={styles.header}>
        <div className={styles.brand}>
          <div className={styles.brandIcon}>
            <Radio size={28} />
          </div>
          <div>
            <h1 className={styles.brandTitle}>
              GARUD 🦅 <span className={styles.brandSubtitle}>Airspace Security & C2 Decision Support</span>
            </h1>
          </div>
        </div>

        <div className={styles.systemBadge}>
          <span className={styles.systemStatusLive} />
          <span>SYS.ONLINE // SIM_CLOCK: 00:00:00</span>
        </div>
      </header>

      {/* Main Content Area */}
      <main className={styles.mainContent}>
        <div className={styles.grid}>
          <section className={styles.radarSection} aria-label="Tactical Radar Display">
            {/* Radar View Container */}
            <div style={{
              background: 'var(--radar-bg)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
              minHeight: '480px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexDirection: 'column',
              gap: '12px',
              color: 'var(--text-secondary)'
            }}>
              <Activity size={32} style={{ color: 'var(--accent-primary)' }} />
              <p>Radar Visualization Subsystem Initializing...</p>
            </div>
          </section>

          <aside className={styles.sideSection} aria-label="Telemetry and Details">
            <div style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
              padding: '20px',
              minHeight: '480px'
            }}>
              <h2 style={{ fontSize: '1rem', color: 'var(--text-primary)', marginBottom: '8px' }}>
                Tracked Object Telemetry
              </h2>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                Select an aerial track from the radar display to inspect real-time synthetic metrics, velocity vectors, and risk classification rationale.
              </p>
            </div>
          </aside>
        </div>
      </main>

      {/* Footer */}
      <footer className={styles.footer}>
        <span>GARUD C2 Prototype v0.1 • Hackathon Edition</span>
        <span>Decision Support Only — No Weapon / Jamming Systems Integrated</span>
      </footer>
    </div>
  );
};

export default App;
