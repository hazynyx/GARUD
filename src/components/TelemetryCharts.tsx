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
      <div className={styles.container}>
        <div className={styles.header}>
          <span>Telemetry Historical Profile</span>
        </div>
        <div className={styles.emptyNotice}>
          Select a track from the radar to inspect speed and altitude timeseries telemetry.
        </div>
      </div>
    );
  }

  const history = selectedObject.telemetryHistory;

  // Format data for Recharts
  const chartData = history.map((pt) => ({
    time: `T+${Math.floor(pt.timestamp)}s`,
    speed: pt.speedMps,
    altitude: pt.altitudeM,
  }));

  return (
    <section className={styles.container} aria-label="Selected Track Kinematic Profile">
      <div className={styles.header}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Activity size={16} style={{ color: 'var(--accent-primary)' }} />
          <span>Telemetry Profile: {selectedObject.callsign} ({selectedObject.id})</span>
        </div>
        <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
          {history.length} Data Samples Cached
        </span>
      </div>

      <div className={styles.chartGrid}>
        {/* Airspeed Chart */}
        <div className={styles.chartCard}>
          <div className={styles.chartTitle}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Gauge size={13} style={{ color: 'var(--accent-cyan)' }} /> Airspeed (m/s)
            </span>
            <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent-cyan)', fontWeight: 600 }}>
              {selectedObject.speedMps} m/s
            </span>
          </div>

          <div className={styles.chartWrapper}>
            <ResponsiveContainer width="100%" height="100%" minWidth={100} minHeight={120}>
              <LineChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#17263c" />
                <XAxis dataKey="time" stroke="#476385" fontSize={9} tickLine={false} />
                <YAxis stroke="#476385" fontSize={9} tickLine={false} domain={['auto', 'auto']} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0c1524',
                    borderColor: '#263d5e',
                    fontSize: '11px',
                    color: '#f8fafc',
                  }}
                  itemStyle={{ color: '#38bdf8' }}
                />
                <Line
                  type="monotone"
                  dataKey="speed"
                  stroke="#38bdf8"
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
          <div className={styles.chartTitle}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <TrendingUp size={13} style={{ color: 'var(--risk-low)' }} /> Altitude AGL (m)
            </span>
            <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--risk-low)', fontWeight: 600 }}>
              {Math.round(selectedObject.altitudeM)} m
            </span>
          </div>

          <div className={styles.chartWrapper}>
            <ResponsiveContainer width="100%" height="100%" minWidth={100} minHeight={120}>
              <LineChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#17263c" />
                <XAxis dataKey="time" stroke="#476385" fontSize={9} tickLine={false} />
                <YAxis stroke="#476385" fontSize={9} tickLine={false} domain={['auto', 'auto']} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0c1524',
                    borderColor: '#263d5e',
                    fontSize: '11px',
                    color: '#f8fafc',
                  }}
                  itemStyle={{ color: '#10b981' }}
                />
                <Line
                  type="monotone"
                  dataKey="altitude"
                  stroke="#10b981"
                  strokeWidth={2}
                  dot={false}
                  isAnimationActive={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </section>
  );
};
