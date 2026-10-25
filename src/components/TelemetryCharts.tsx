import React from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import { Activity, Gauge, TrendingUp } from 'lucide-react';
import styles from './TelemetryCharts.module.css';
import { TrackedObject } from '../features/simulation/types';

interface TelemetryChartsProps {
  selectedObject: TrackedObject | null;
}

export const TelemetryCharts: React.FC<TelemetryChartsProps> = ({ selectedObject }) => {
  if (!selectedObject) {
    return (
      <div className={styles.panel}>
        <div className={styles.header}>
          <span>Kinematic Telemetry History</span>
        </div>
        <div className={styles.emptyState}>
          Select a track on the radar to inspect historical airspeed and altitude profiles.
        </div>
      </div>
    );
  }

  const history = selectedObject.telemetryHistory;

  const chartData = history.map((pt) => ({
    time: `T+${Math.floor(pt.timestamp)}s`,
    speed: pt.speedMps,
    altitude: pt.altitudeM,
  }));

  return (
    <div className={styles.panel} aria-label="Selected Track Kinematic Profile">
      <div className={styles.header}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Activity size={15} style={{ color: 'var(--accent-primary)' }} />
          <span>Kinematic History: {selectedObject.callsign}</span>
          <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>({selectedObject.id})</span>
        </div>
        <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>
          {history.length} samples cached
        </span>
      </div>

      <div className={styles.chartGrid}>
        {/* Airspeed Chart */}
        <div className={styles.chartCard}>
          <div className={styles.chartTitleRow}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <Gauge size={13} style={{ color: 'var(--accent-secondary)' }} /> Airspeed
            </span>
            <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, color: 'var(--text-main)' }}>
              {selectedObject.speedMps} m/s
            </span>
          </div>

          <div className={styles.chartWrapper}>
            <ResponsiveContainer width="100%" height="100%" minWidth={100} minHeight={120}>
              <LineChart data={chartData} margin={{ top: 5, right: 10, left: -24, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                <XAxis dataKey="time" stroke="#94a3b8" fontSize={9} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={9} tickLine={false} domain={['auto', 'auto']} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    borderColor: '#cbd5e1',
                    borderRadius: '6px',
                    fontSize: '11px',
                    color: '#0f172a',
                    boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
                  }}
                  itemStyle={{ color: '#0284c7' }}
                />
                <Line
                  type="monotone"
                  dataKey="speed"
                  stroke="#0284c7"
                  strokeWidth={2}
                  dot={false}
                  isAnimationActive={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Altitude Chart */}
        <div className={styles.chartCard}>
          <div className={styles.chartTitleRow}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <TrendingUp size={13} style={{ color: 'var(--risk-low)' }} /> Altitude AGL
            </span>
            <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, color: 'var(--text-main)' }}>
              {Math.round(selectedObject.altitudeM)} m
            </span>
          </div>

          <div className={styles.chartWrapper}>
            <ResponsiveContainer width="100%" height="100%" minWidth={100} minHeight={120}>
              <LineChart data={chartData} margin={{ top: 5, right: 10, left: -24, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                <XAxis dataKey="time" stroke="#94a3b8" fontSize={9} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={9} tickLine={false} domain={['auto', 'auto']} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    borderColor: '#cbd5e1',
                    borderRadius: '6px',
                    fontSize: '11px',
                    color: '#0f172a',
                    boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
                  }}
                  itemStyle={{ color: '#059669' }}
                />
                <Line
                  type="monotone"
                  dataKey="altitude"
                  stroke="#059669"
                  strokeWidth={2}
                  dot={false}
                  isAnimationActive={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
