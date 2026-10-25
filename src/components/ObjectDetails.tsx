import React, { useState } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  Flame,
  Radio,
  ChevronDown,
  ChevronUp,
  Wifi,
  Navigation,
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
  const [showFactors, setShowFactors] = useState<boolean>(true);
  const [showRF, setShowRF] = useState<boolean>(false);

  if (!object) {
    return (
      <aside className={styles.panel} aria-label="Track Details Inspector">
        <div className={styles.emptyState}>
          <Radio size={32} style={{ opacity: 0.4 }} />
          <h3 style={{ fontSize: '0.875rem', fontWeight: 600 }}>No Track Selected</h3>
          <p style={{ fontSize: '0.75rem' }}>Select an aerial track on the radar PPI to inspect its telemetry and causal risk rationale.</p>
        </div>
      </aside>
    );
  }

  const getCardinal = (deg: number): string => {
    const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
    const index = Math.round((((deg % 360) + 360) % 360) / 45) % 8;
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

  const badgeClass =
    object.classification === 'friendly'
      ? styles.badgeFriendly
      : object.classification === 'commercial'
      ? styles.badgeCommercial
      : object.classification === 'unauthorized'
      ? styles.badgeUnauthorized
      : styles.badgeUnknown;

  const riskBadgeClass =
    object.riskLevel === 'high'
      ? styles.badgeUnauthorized
      : object.riskLevel === 'medium'
      ? styles.badgeUnknown
      : styles.badgeFriendly;

  const riskMeterColor =
    object.riskLevel === 'high'
      ? 'var(--risk-high)'
      : object.riskLevel === 'medium'
      ? 'var(--risk-medium)'
      : 'var(--risk-low)';

  const riskIcon =
    object.riskLevel === 'high' ? (
      <Flame size={13} />
    ) : object.riskLevel === 'medium' ? (
      <AlertTriangle size={13} />
    ) : (
      <ShieldCheck size={13} />
    );

  return (
    <aside className={styles.panel} aria-label={`Track Details for ${object.callsign}`}>
      {/* Header: Identity & Classification */}
      <div className={styles.header}>
        <div className={styles.identityArea}>
          <div className={styles.callsignRow}>
            <span className={styles.callsign}>{object.callsign}</span>
            <span className={styles.idTag}>[{object.id}]</span>
          </div>
          <div className={styles.typeRow}>
            <span>{object.type.replace('_', ' ')}</span>
            <span>·</span>
            <span className={`${styles.badge} ${badgeClass}`}>
              {object.classification}
            </span>
          </div>
        </div>

        <div className={`${styles.riskBadge} ${riskBadgeClass}`}>
          {riskIcon}
          <span>{object.riskLevel.toUpperCase()} RISK</span>
        </div>
      </div>

      {/* Risk Score Summary Box */}
      <div className={styles.riskCard}>
        <div className={styles.riskHeaderRow}>
          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
            Calculated Risk Assessment
          </span>
          <span className={styles.riskScoreVal}>{object.riskScore} / 100</span>
        </div>
        <div className={styles.riskMeter}>
          <div
            className={styles.riskMeterFill}
            style={{ width: `${object.riskScore}%`, background: riskMeterColor }}
          />
        </div>
      </div>

      {/* Primary Telemetry Grid */}
      <div className={styles.telemetryGrid}>
        {/* Coordinates */}
        <div className={styles.metricCell}>
          <span className={styles.metricLabel}>Sim Position</span>
          <span className={styles.metricValue}>
            X {object.x}m
          </span>
          <span className={styles.metricValue}>
            Y {object.y}m
          </span>
        </div>

        {/* Altitude */}
        <div className={styles.metricCell}>
          <span className={styles.metricLabel}>Altitude AGL</span>
          <span className={styles.metricValue}>
            {Math.round(object.altitudeM)} <span className={styles.metricUnit}>m</span>
          </span>
          <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>
            {object.climbRateMps >= 0 ? `+${object.climbRateMps}` : object.climbRateMps} m/s vert
          </span>
        </div>

        {/* Speed */}
        <div className={styles.metricCell}>
          <span className={styles.metricLabel}>Airspeed</span>
          <span className={styles.metricValue}>
            {object.speedMps} <span className={styles.metricUnit}>m/s</span>
          </span>
          <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>
            ~{Math.round(object.speedMps * 3.6)} km/h
          </span>
        </div>

        {/* Heading */}
        <div className={styles.metricCell}>
          <span className={styles.metricLabel}>Heading</span>
          <span className={styles.metricValue}>
            <Navigation
              size={12}
              style={{
                transform: `rotate(${object.headingDeg}deg)`,
                color: 'var(--accent-secondary)',
                display: 'inline',
              }}
            />
            {Math.round(object.headingDeg)}° <span className={styles.metricUnit}>({getCardinal(object.headingDeg)})</span>
          </span>
          <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>
            Turn {object.turnRateDegPs}°/s
          </span>
        </div>
      </div>

      {/* Nearest Geofence Proximity */}
      {nearestZone && (
        <div className={styles.zoneBanner}>
          <div>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.6875rem' }}>Nearest Perimeter</div>
            <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>{nearestZone.name}</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{
              fontFamily: 'var(--font-mono)',
              fontWeight: 700,
              color: minDistance <= nearestZone.radiusM ? 'var(--risk-high)' : 'var(--text-main)'
            }}>
              {Math.round(minDistance)}m
            </div>
            <div style={{ fontSize: '0.6875rem', color: closingSpeed > 0 ? '#b91c1c' : 'var(--text-muted)' }}>
              Approach: {closingSpeed > 0 ? `+${closingSpeed}` : closingSpeed} m/s
            </div>
          </div>
        </div>
      )}

      {/* Collapsible Contributing Risk Factors */}
      <div>
        <button
          type="button"
          className={styles.collapsibleToggle}
          onClick={() => setShowFactors(!showFactors)}
          aria-expanded={showFactors}
        >
          <span>Contributing Factors ({object.riskFactors.length})</span>
          {showFactors ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>

        {showFactors && (
          <div className={styles.factorList}>
            {object.riskFactors.map((factor, idx) => (
              <div key={idx} className={styles.factorItem}>
                <div className={styles.factorHeader}>
                  <span>{factor.name}</span>
                  <span className={`${styles.factorPoints} ${factor.contribution >= 0 ? styles.ptsPositive : styles.ptsNegative}`}>
                    {factor.contribution > 0 ? `+${factor.contribution}` : factor.contribution} pts
                  </span>
                </div>
                <div style={{ color: 'var(--text-secondary)', fontSize: '0.6875rem', lineHeight: 1.3 }}>
                  {factor.description}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Collapsible Secondary Telemetry / RF Status */}
      <div>
        <button
          type="button"
          className={styles.collapsibleToggle}
          onClick={() => setShowRF(!showRF)}
          aria-expanded={showRF}
        >
          <span>RF & Identification Telemetry</span>
          {showRF ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>

        {showRF && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginTop: '4px' }}>
            <div className={styles.metricCell}>
              <span className={styles.metricLabel}>RemoteID Status</span>
              <span className={styles.metricValue} style={{ fontSize: '0.75rem' }}>
                {object.transponderActive ? (
                  <span style={{ color: 'var(--risk-low)', display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                    <ShieldCheck size={12} /> Active
                  </span>
                ) : (
                  <span style={{ color: 'var(--risk-high)', display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                    <ShieldAlert size={12} /> Non-Coop
                  </span>
                )}
              </span>
            </div>

            <div className={styles.metricCell}>
              <span className={styles.metricLabel}>RF Link RSSI</span>
              <span className={styles.metricValue}>
                <Wifi size={12} style={{ color: 'var(--accent-secondary)' }} />
                {object.signalStrengthDb} <span className={styles.metricUnit}>dBm</span>
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Safety & Demo Disclaimer */}
      <div className={styles.disclaimer}>
        Simulated telemetry & heuristic risk scoring. For decision support demonstration only.
        <div style={{ marginTop: '2px', fontFamily: 'var(--font-mono)' }}>
          Updated: T+{Math.floor(object.updatedAt)}s (Clock: T+{Math.floor(simTimeSec)}s)
        </div>
      </div>
    </aside>
  );
};
