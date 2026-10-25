import React from 'react';
import { Radio, ShieldAlert, CheckCircle2 } from 'lucide-react';
import styles from './OverviewCards.module.css';
import { TrackedObject, SimulatedAlert } from '../features/simulation/types';

interface OverviewCardsProps {
  objects: TrackedObject[];
  alerts: SimulatedAlert[];
}

export const OverviewCards: React.FC<OverviewCardsProps> = ({ objects, alerts }) => {
  const totalCount = objects.length;
  const lowCount = objects.filter((o) => o.riskLevel === 'low').length;
  const mediumCount = objects.filter((o) => o.riskLevel === 'medium').length;
  const highCount = objects.filter((o) => o.riskLevel === 'high').length;
  const unackAlerts = alerts.filter((a) => !a.acknowledged).length;

  const lowPct = totalCount > 0 ? (lowCount / totalCount) * 100 : 0;
  const medPct = totalCount > 0 ? (mediumCount / totalCount) * 100 : 0;
  const highPct = totalCount > 0 ? (highCount / totalCount) * 100 : 0;

  return (
    <div className={styles.bentoOverview} aria-label="Sector Telemetry Overview">
      {/* Panel 1: Active Tracks */}
      <div className={styles.panel}>
        <div className={styles.panelHeader}>
          <span>Active Tracks</span>
          <Radio size={14} style={{ color: 'var(--accent-primary)' }} />
        </div>
        <div className={styles.primaryStatRow}>
          <span className={styles.statBig}>{totalCount}</span>
          <span className={styles.statLabel}>targets in sector</span>
        </div>
        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
          10km Cartesian surveillance envelope
        </div>
      </div>

      {/* Panel 2: Airspace Risk Breakdown */}
      <div className={styles.panel}>
        <div className={styles.panelHeader}>
          <span>Risk Classification</span>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Evaluated at 4Hz
          </span>
        </div>

        {/* Visual distribution bar */}
        <div className={styles.distBar} role="progressbar" aria-label="Risk Distribution">
          <div className={styles.distSegmentLow} style={{ width: `${lowPct}%` }} title={`Low: ${lowCount}`} />
          <div className={styles.distSegmentMedium} style={{ width: `${medPct}%` }} title={`Medium: ${mediumCount}`} />
          <div className={styles.distSegmentHigh} style={{ width: `${highPct}%` }} title={`High: ${highCount}`} />
        </div>

        {/* 3 Tier Pills */}
        <div className={styles.tiersRow}>
          <div className={`${styles.tierPill} ${styles.tierPillLow}`}>
            <span className={styles.tierCount}>{lowCount}</span>
            <span className={styles.tierName}>Low Risk</span>
          </div>

          <div className={`${styles.tierPill} ${styles.tierPillMedium}`}>
            <span className={styles.tierCount}>{mediumCount}</span>
            <span className={styles.tierName}>Medium Risk</span>
          </div>

          <div className={`${styles.tierPill} ${styles.tierPillHigh}`}>
            <span className={styles.tierCount}>{highCount}</span>
            <span className={styles.tierName}>High Risk</span>
          </div>
        </div>
      </div>

      {/* Panel 3: Alerts & Readiness */}
      <div className={styles.panel}>
        <div className={styles.panelHeader}>
          <span>Pending Alerts</span>
          {unackAlerts > 0 ? (
            <span className={styles.alertBadgeUrgent}>
              <ShieldAlert size={12} /> Action Needed
            </span>
          ) : (
            <span className={styles.alertBadgeNominal}>
              <CheckCircle2 size={12} /> Clear
            </span>
          )}
        </div>

        <div className={styles.primaryStatRow}>
          <span className={styles.statBig}>{unackAlerts}</span>
          <span className={styles.statLabel}>unacknowledged</span>
        </div>

        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
          {alerts.length} total events generated across run
        </div>
      </div>
    </div>
  );
};
