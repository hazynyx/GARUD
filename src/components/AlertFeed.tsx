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
    <section className={styles.container} aria-label="Tactical Airspace Alert Stream">
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.titleGroup}>
          <Bell size={18} style={{ color: 'var(--accent-primary)' }} />
          <span>Security Alert Stream</span>
          {unackCount > 0 && <span className={styles.badgeCount}>{unackCount} NEW</span>}
        </div>

        <div className={styles.actionsGroup}>
          {/* Filters */}
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
            Critical
          </button>

          {alerts.length > 0 && (
            <button
              type="button"
              className={styles.clearBtn}
              onClick={onClearAlerts}
              title="Clear all alerts from feed"
            >
              <Trash2 size={12} style={{ display: 'inline', marginRight: '2px' }} /> Clear
            </button>
          )}
        </div>
      </div>

      {/* Alert Cards List */}
      <div className={styles.feedList}>
        {filteredAlerts.length === 0 ? (
          <div className={styles.emptyAlerts}>
            <ShieldCheck size={28} style={{ opacity: 0.4, color: 'var(--risk-low)' }} />
            <span>No alerts matching current filter. Airspace sector calm.</span>
          </div>
        ) : (
          filteredAlerts.map((alert) => {
            const isHigh = alert.severity === 'high';
            const isMedium = alert.severity === 'medium';
            const cardClass = alert.acknowledged
              ? styles.alertCardAcknowledged
              : isHigh
              ? styles.alertCardHigh
              : isMedium
              ? styles.alertCardMedium
              : styles.alertCardLow;

            return (
              <div key={alert.id} className={`${styles.alertCard} ${cardClass}`}>
                <div className={styles.alertTopRow}>
                  <div className={styles.alertTitleGroup}>
                    {isHigh ? (
                      <ShieldAlert size={14} style={{ color: 'var(--risk-high)' }} />
                    ) : (
                      <AlertTriangle size={14} style={{ color: 'var(--risk-medium)' }} />
                    )}
                    <span>{alert.title}</span>
                  </div>
                  <span className={styles.timeTag}>T+{Math.floor(alert.createdAt)}s</span>
                </div>

                <div className={styles.alertReason}>{alert.reason}</div>

                <div className={styles.alertBottomRow}>
                  <span
                    className={styles.targetTag}
                    onClick={() => onSelectTrack && onSelectTrack(alert.objectId)}
                    style={{ cursor: onSelectTrack ? 'pointer' : 'default' }}
                    title="Click to select this track on radar"
                  >
                    TARGET: {alert.objectCallsign} ({alert.objectId})
                  </span>

                  {!alert.acknowledged ? (
                    <button
                      type="button"
                      className={styles.ackBtn}
                      onClick={() => onAcknowledgeAlert(alert.id)}
                      title="Acknowledge alert"
                    >
                      <Check size={12} /> Ack
                    </button>
                  ) : (
                    <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
                      ✓ Acknowledged
                    </span>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </section>
  );
};
