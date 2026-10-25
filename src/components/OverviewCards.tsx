import React from 'react';
import { Radio, ShieldCheck, AlertTriangle, Flame, Bell } from 'lucide-react';
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
  const activeUnackAlerts = alerts.filter((a) => !a.acknowledged).length;

  return (
    <section className={styles.container} aria-label="Airspace Tactical Overview">
      {/* Total Active Tracks */}
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <span>Active Tracks</span>
          <div className={styles.iconWrapper}>
            <Radio size={16} />
          </div>
        </div>
        <div className={styles.valueRow}>
          <span className={styles.cardValue}>{totalCount}</span>
          <span className={styles.cardSubtext}>UAS in Sector</span>
        </div>
      </div>

      {/* Low Risk */}
      <div className={`${styles.card} ${styles.low}`}>
        <div className={styles.cardHeader}>
          <span>Low Risk</span>
          <div className={styles.iconWrapper}>
            <ShieldCheck size={16} />
          </div>
        </div>
        <div className={styles.valueRow}>
          <span className={styles.cardValue}>{lowCount}</span>
          <span className={styles.cardSubtext}>Normal Flight</span>
        </div>
      </div>

      {/* Medium Risk */}
      <div className={`${styles.card} ${styles.medium}`}>
        <div className={styles.cardHeader}>
          <span>Medium Risk</span>
          <div className={styles.iconWrapper}>
            <AlertTriangle size={16} />
          </div>
        </div>
        <div className={styles.valueRow}>
          <span className={styles.cardValue}>{mediumCount}</span>
          <span className={styles.cardSubtext}>Buffer / Speed Warning</span>
        </div>
      </div>

      {/* High Risk */}
      <div className={`${styles.card} ${styles.high}`}>
        <div className={styles.cardHeader}>
          <span>High Risk</span>
          <div className={styles.iconWrapper}>
            <Flame size={16} />
          </div>
        </div>
        <div className={styles.valueRow}>
          <span className={styles.cardValue}>{highCount}</span>
          <span className={styles.cardSubtext}>Critical Perimeter Threat</span>
        </div>
      </div>

      {/* Active Unacknowledged Alerts */}
      <div className={`${styles.card} ${styles.alertActive}`}>
        <div className={styles.cardHeader}>
          <span>Pending Alerts</span>
          <div className={styles.iconWrapper}>
            <Bell size={16} />
          </div>
        </div>
        <div className={styles.valueRow}>
          <span className={styles.cardValue}>{activeUnackAlerts}</span>
          <span className={styles.cardSubtext}>Unacknowledged</span>
        </div>
      </div>
    </section>
  );
};
