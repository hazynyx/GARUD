import React from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  Flame,
  Radio,
  Wifi,
  Navigation,
  Gauge,
  ArrowUpRight,
  Info,
} from 'lucide-react';
import styles from './ObjectDetails.module.css';
import { TrackedObject, RestrictedZone } from '../features/simulation/types';
import { calculateClosingSpeed, calculateDistanceToZone } from '../features/risk/riskScoring';

interface ObjectDetailsProps {
  object: TrackedObject | null;
  zones: RestrictedZone[];
  simTimeSec: number;
}

export const ObjectDetails: React.FC<ObjectDetailsProps> = ({ object, zones, simTimeSec }) => {
  if (!object) {
    return (
      <aside className={styles.container} aria-label="Track Details Inspector">
        <div className={styles.emptyState}>
          <Radio size={40} style={{ opacity: 0.5 }} />
          <h3>No Track Selected</h3>
          <p>Click on any aerial track marker on the PPI radar display to inspect its telemetry and causal risk factors.</p>
        </div>
      </aside>
    );
  }

  // Heading to Cardinal Compass
  const getCardinal = (deg: number): string => {
    const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
    const index = Math.round(((deg % 360) / 45)) % 8;
    return directions[index];
  };

  // Nearest Zone computation
  let nearestZone: RestrictedZone | null = null;
  let minDistance = Infinity;
  for (const z of zones) {
    const d = calculateDistanceToZone(object.x, object.y, z);
    if (d < minDistance) {
      minDistance = d;
      nearestZone = z;
    }
  }

  const closingSpeed = nearestZone ? calculateClosingSpeed(object, nearestZone) : 0;

  const classificationClass =
    object.classification === 'friendly'
      ? styles.classificationFriendly
      : object.classification === 'commercial'
      ? styles.classificationCommercial
      : object.classification === 'unauthorized'
      ? styles.classificationUnauthorized
      : styles.classificationUnknown;

  const riskClass =
    object.riskLevel === 'high'
      ? styles.riskHigh
      : object.riskLevel === 'medium'
      ? styles.riskMedium
      : styles.riskLow;

  const riskIcon =
    object.riskLevel === 'high' ? (
      <Flame size={16} />
    ) : object.riskLevel === 'medium' ? (
      <AlertTriangle size={16} />
    ) : (
      <ShieldCheck size={16} />
    );

  return (
    <aside className={styles.container} aria-label={`Track Details for ${object.callsign}`}>
      {/* Header with ID, Call sign, Classification, and Risk Dial */}
      <div className={styles.headerRow}>
        <div className={styles.identityInfo}>
          <div className={styles.titleRow}>
            <span className={styles.callsign}>{object.callsign}</span>
            <span className={styles.idBadge}>{object.id}</span>
          </div>
          <div className={styles.typeRow}>
            <span>{object.type.replace('_', ' ').toUpperCase()}</span>
            <span>•</span>
            <span className={`${styles.classificationBadge} ${classificationClass}`}>
              {object.classification}
            </span>
          </div>
        </div>

        {/* Explainable Risk Level Header */}
        <div className={styles.riskScoreBox}>
          <div className={`${styles.riskBadge} ${riskClass}`}>
            {riskIcon}
            <span>{object.riskLevel} RISK</span>
          </div>
          <span className={styles.riskScoreNum}>SCORE: {object.riskScore} / 100</span>
        </div>
      </div>

      {/* Real-time Telemetry Grid */}
      <section aria-label="Real-time Telemetry Metrics">
        <h3 style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
          Simulated Kinematic Telemetry
        </h3>
        <div className={styles.telemetryGrid}>
          {/* Coordinates */}
          <div className={styles.telemetryCell}>
            <span className={styles.telemetryLabel}>Sim Coordinates</span>
            <span className={styles.telemetryValue}>
              X: {object.x}m
            </span>
            <span className={styles.telemetryValue}>
              Y: {object.y}m
            </span>
          </div>

          {/* Altitude */}
          <div className={styles.telemetryCell}>
            <span className={styles.telemetryLabel}>Altitude AGL</span>
            <span className={styles.telemetryValue}>
              {Math.round(object.altitudeM)} <span className={styles.telemetryUnit}>m AGL</span>
            </span>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
              Climb: {object.climbRateMps > 0 ? `+${object.climbRateMps}` : object.climbRateMps} m/s
            </span>
          </div>

          {/* Airspeed */}
          <div className={styles.telemetryCell}>
            <span className={styles.telemetryLabel}>Speed</span>
            <span className={styles.telemetryValue}>
              <Gauge size={14} style={{ color: 'var(--accent-primary)' }} />
              {object.speedMps} <span className={styles.telemetryUnit}>m/s</span>
            </span>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
              ~{Math.round(object.speedMps * 3.6)} km/h
            </span>
          </div>

          {/* Heading */}
          <div className={styles.telemetryCell}>
            <span className={styles.telemetryLabel}>Heading</span>
            <span className={styles.telemetryValue}>
              <Navigation size={14} style={{ transform: `rotate(${object.headingDeg}deg)`, color: 'var(--accent-cyan)' }} />
              {Math.round(object.headingDeg)}° <span className={styles.telemetryUnit}>({getCardinal(object.headingDeg)})</span>
            </span>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
              Turn rate: {object.turnRateDegPs}°/s
            </span>
          </div>

          {/* RemoteID Transponder */}
          <div className={styles.telemetryCell}>
            <span className={styles.telemetryLabel}>Transponder / RemoteID</span>
            <span className={styles.telemetryValue}>
              {object.transponderActive ? (
                <span style={{ color: 'var(--risk-low)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <ShieldCheck size={14} /> ACTIVE
                </span>
              ) : (
                <span style={{ color: 'var(--risk-high)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <ShieldAlert size={14} /> NON-COOP
                </span>
              )}
            </span>
          </div>

          {/* Signal RSSI */}
          <div className={styles.telemetryCell}>
            <span className={styles.telemetryLabel}>RF Link RSSI</span>
            <span className={styles.telemetryValue}>
              <Wifi size={14} style={{ color: 'var(--accent-primary)' }} />
              {object.signalStrengthDb} <span className={styles.telemetryUnit}>dBm</span>
            </span>
          </div>
        </div>
      </section>

      {/* Proximity to Restricted Perimeter */}
      {nearestZone && (
        <div style={{
          background: 'var(--bg-secondary)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-sm)',
          padding: '10px 12px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontSize: '0.75rem'
        }}>
          <div>
            <div style={{ color: 'var(--text-secondary)' }}>Nearest Protected Area:</div>
            <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{nearestZone.name}</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: minDistance <= nearestZone.radiusM ? 'var(--risk-high)' : 'var(--text-primary)' }}>
              {Math.round(minDistance)}m
            </div>
            <div style={{ color: closingSpeed > 0 ? '#f87171' : 'var(--text-muted)' }}>
              Approach: {closingSpeed > 0 ? `+${closingSpeed}` : closingSpeed} m/s
            </div>
          </div>
        </div>
      )}

      {/* Explainable Risk Breakdown */}
      <section className={styles.factorSection} aria-label="Explainable Risk Factor Breakdown">
        <div className={styles.factorHeader}>
          <span>Explainable Risk Rationale</span>
          <span style={{ fontSize: '0.72rem', color: 'var(--accent-primary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <ArrowUpRight size={13} /> {object.riskFactors.length} Factors Evaluated
          </span>
        </div>

        <div className={styles.factorList}>
          {object.riskFactors.map((factor, idx) => {
            const contribClass =
              factor.contribution > 0
                ? styles.contribPositive
                : factor.contribution < 0
                ? styles.contribNegative
                : styles.contribNeutral;

            const borderCol =
              factor.contribution > 25
                ? 'var(--risk-high)'
                : factor.contribution > 0
                ? 'var(--risk-medium)'
                : factor.contribution < 0
                ? 'var(--risk-low)'
                : 'var(--border-medium)';

            return (
              <div key={idx} className={styles.factorItem} style={{ borderLeftColor: borderCol }}>
                <div className={styles.factorItemHeader}>
                  <span>{factor.name}</span>
                  <span className={`${styles.factorContribution} ${contribClass}`}>
                    {factor.contribution > 0 ? `+${factor.contribution}` : factor.contribution} pts
                  </span>
                </div>
                <div className={styles.factorDesc}>{factor.description}</div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Safety & Demo Disclaimer */}
      <div className={styles.disclaimer}>
        <Info size={12} style={{ float: 'left', marginRight: '6px', marginTop: '2px', color: 'var(--text-muted)' }} />
        <span>
          <strong>Decision Support Heuristic:</strong> Risk scores and causal factor weights are synthetic demonstration rules and do not constitute certified military or FAA/EASA threat detection.
        </span>
      </div>

      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textAlign: 'right', marginTop: 'auto' }}>
        Last telemetry refresh: T+{Math.floor(object.updatedAt)}s (Sim Clock: T+{Math.floor(simTimeSec)}s)
      </div>
    </aside>
  );
};
