import React, { useState } from 'react';
import { Bell, Check, ShieldAlert, AlertTriangle, ShieldCheck, Trash2 } from 'lucide-react';
import styles from './AlertFeed.module.css';
import { SimulatedAlert } from '../features/simulation/types';

interface AlertFeedProps {
  alerts: SimulatedAlert[];
  onAcknowledgeAlert: (alertId: string) => void;
  onClearAlerts: () => void;
  onSelectTrack?: (objectId: string) => void;
}

export const AlertFeed: React.FC<AlertFeedProps> = ({
  alerts,
  onAcknowledgeAlert,
  onClearAlerts,
  onSelectTrack,
}) => {
  const [filter, setFilter] = useState<'all' | 'unack' | 'high'>('all');

  const filteredAlerts = alerts.filter((a) => {
    if (filter === 'unack') return !a.acknowledged;
    if (filter === 'high') return a.severity === 'high';
    return true;
  });

  const unackCount = alerts.filter((a) => !a.acknowledged).length;

  return (
    <div className={styles.panel} aria-label="Security Alert Stream">
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.titleArea}>
          <div className={styles.title}>
            <Bell size={15} style={{ color: 'var(--accent-primary)' }} />
            <span>Alert Notifications</span>
          </div>
          {unackCount > 0 && <span className={styles.unackBadge}>{unackCount}</span>}
        </div>

        <div className={styles.actionsGroup}>
          {/* Segmented Filter */}
          <div className={styles.filterSegmented} role="group" aria-label="Filter Alerts">
            <button
              type="button"
              className={`${styles.filterBtn} ${filter === 'all' ? styles.filterBtnActive : ''}`}
              onClick={() => setFilter('all')}
            >
              All ({alerts.length})
            </button>
            <button
              type="button"
              className={`${styles.filterBtn} ${filter === 'unack' ? styles.filterBtnActive : ''}`}
              onClick={() => setFilter('unack')}
            >
              Pending ({unackCount})
            </button>
            <button
              type="button"
              className={`${styles.filterBtn} ${filter === 'high' ? styles.filterBtnActive : ''}`}
              onClick={() => setFilter('high')}
            >
              High
            </button>
          </div>

          {alerts.length > 0 && (
            <button
              type="button"
              className={styles.clearBtn}
              onClick={onClearAlerts}
              title="Clear alerts from feed"
            >
              <Trash2 size={12} style={{ display: 'inline', marginRight: '2px' }} /> Clear
            </button>
          )}
        </div>
      </div>

      {/* Alert Feed List */}
      <div className={styles.feedList}>
        {filteredAlerts.length === 0 ? (
          <div className={styles.emptyState}>
            <ShieldCheck size={24} style={{ color: 'var(--risk-low)' }} />
            <span>No alerts in current view. Airspace is calm.</span>
          </div>
        ) : (
          filteredAlerts.map((alert) => {
            const isHigh = alert.severity === 'high';
            const isMedium = alert.severity === 'medium';
            const cardClass = alert.acknowledged
              ? styles.alertAcknowledged
              : isHigh
              ? styles.alertHigh
              : isMedium
              ? styles.alertMedium
              : styles.alertLow;

            return (
              <div key={alert.id} className={`${styles.alertCard} ${cardClass}`}>
                <div className={styles.topRow}>
                  <div className={styles.eventTitle}>
                    {isHigh ? (
                      <ShieldAlert size={13} style={{ color: 'var(--risk-high)' }} />
                    ) : (
                      <AlertTriangle size={13} style={{ color: 'var(--risk-medium)' }} />
                    )}
                    <span>{alert.title}</span>
                  </div>
                  <span className={styles.timeTag}>T+{Math.floor(alert.createdAt)}s</span>
                </div>

                <div className={styles.eventReason}>{alert.reason}</div>

                <div className={styles.bottomRow}>
                  <button
                    type="button"
                    className={styles.targetLink}
                    onClick={() => onSelectTrack && onSelectTrack(alert.objectId)}
                    title="Select and center target on radar"
                  >
                    Target: {alert.objectCallsign} ({alert.objectId})
                  </button>

                  {!alert.acknowledged ? (
                    <button
                      type="button"
                      className={styles.ackButton}
                      onClick={() => onAcknowledgeAlert(alert.id)}
                      title="Acknowledge this alert"
                    >
                      <Check size={11} /> Ack
                    </button>
                  ) : (
                    <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>
                      ✓ Acknowledged
                    </span>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
