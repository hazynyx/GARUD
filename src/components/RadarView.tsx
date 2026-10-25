import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Crosshair, ZoomIn, ZoomOut, RotateCcw, Compass, Route } from 'lucide-react';
import styles from './RadarView.module.css';
import { TrackedObject, RestrictedZone } from '../features/simulation/types';
import { predictTrajectory } from '../features/tracking/prediction';

interface RadarViewProps {
  objects: TrackedObject[];
  zones: RestrictedZone[];
  selectedObjectId: string | null;
  predictionHorizonSec: number;
  onSelectObject: (id: string) => void;
  onHorizonChange: (horizonSec: number) => void;
}

const RADAR_MAX_RANGE_M = 5000;

export const RadarView: React.FC<RadarViewProps> = ({
  objects,
  zones,
  selectedObjectId,
  predictionHorizonSec,
  onSelectObject,
  onHorizonChange,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [zoomLevel, setZoomLevel] = useState<number>(1.0);
  const [showPredictions, setShowPredictions] = useState<boolean>(true);
  const [showZones, setShowZones] = useState<boolean>(true);
  const [mouseCoord, setMouseCoord] = useState<{ x: number; y: number } | null>(null);
  const [hoveredObjectId, setHoveredObjectId] = useState<string | null>(null);

  const sweepAngleRef = useRef<number>(0);
  const animFrameIdRef = useRef<number | null>(null);

  // Zoom handlers
  const handleZoomIn = () => setZoomLevel((z) => Math.min(2.5, Math.round((z + 0.25) * 100) / 100));
  const handleZoomOut = () => setZoomLevel((z) => Math.max(0.6, Math.round((z - 0.25) * 100) / 100));
  const handleResetZoom = () => setZoomLevel(1.0);

  // Convert simulated meters (x, y) to canvas pixels
  const worldToScreen = useCallback(
    (worldX: number, worldY: number, width: number, height: number) => {
      const cx = width / 2;
      const cy = height / 2;
      const scale = (Math.min(width, height) / 2 / RADAR_MAX_RANGE_M) * zoomLevel;
      const sx = cx + worldX * scale;
      const sy = cy - worldY * scale; // Invert Y because canvas Y points down
      return { sx, sy, scale };
    },
    [zoomLevel]
  );

  // Convert canvas pixels to simulated meters
  const screenToWorld = useCallback(
    (screenX: number, screenY: number, width: number, height: number) => {
      const cx = width / 2;
      const cy = height / 2;
      const scale = (Math.min(width, height) / 2 / RADAR_MAX_RANGE_M) * zoomLevel;
      const worldX = (screenX - cx) / scale;
      const worldY = (cy - screenY) / scale;
      return { worldX: Math.round(worldX), worldY: Math.round(worldY) };
    },
    [zoomLevel]
  );

  // Handle canvas clicks to select objects
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    const width = canvas.width / (window.devicePixelRatio || 1);
    const height = canvas.height / (window.devicePixelRatio || 1);

    let closestObj: TrackedObject | null = null;
    let minScreenDist = 24;

    for (const obj of objects) {
      const { sx, sy } = worldToScreen(obj.x, obj.y, width, height);
      const dist = Math.hypot(clickX - sx, clickY - sy);
      if (dist < minScreenDist) {
        minScreenDist = dist;
        closestObj = obj;
      }
    }

    if (closestObj) {
      onSelectObject(closestObj.id);
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const width = canvas.width / (window.devicePixelRatio || 1);
    const height = canvas.height / (window.devicePixelRatio || 1);

    const world = screenToWorld(mouseX, mouseY, width, height);
    setMouseCoord({ x: world.worldX, y: world.worldY });

    let hovered: string | null = null;
    for (const obj of objects) {
      const { sx, sy } = worldToScreen(obj.x, obj.y, width, height);
      if (Math.hypot(mouseX - sx, mouseY - sy) < 18) {
        hovered = obj.id;
        break;
      }
    }
    setHoveredObjectId(hovered);
  };

  const handleMouseLeave = () => {
    setMouseCoord(null);
    setHoveredObjectId(null);
  };

  // Main Canvas Rendering Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let isSubscribed = true;

    const render = () => {
      if (!isSubscribed) return;

      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();

      if (canvas.width !== rect.width * dpr || canvas.height !== rect.height * dpr) {
        canvas.width = rect.width * dpr;
        canvas.height = rect.height * dpr;
      }

      ctx.save();
      ctx.scale(dpr, dpr);

      const width = rect.width;
      const height = rect.height;
      const cx = width / 2;
      const cy = height / 2;
      const radiusPx = (Math.min(width, height) / 2) * 0.94;

      // 1. Radar Background
      ctx.fillStyle = '#090e17';
      ctx.fillRect(0, 0, width, height);

      // Radar PPI circular boundary clip
      ctx.save();
      ctx.beginPath();
      ctx.arc(cx, cy, radiusPx, 0, Math.PI * 2);
      ctx.clip();

      // Subtle radial backdrop
      const grad = ctx.createRadialGradient(cx, cy, 10, cx, cy, radiusPx);
      grad.addColorStop(0, '#0d1522');
      grad.addColorStop(0.7, '#090e17');
      grad.addColorStop(1, '#060a12');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);

      // 2. Concentric Range Rings (1km to 5km)
      const ringSteps = [1000, 2000, 3000, 4000, 5000];
      for (const rangeM of ringSteps) {
        const ringPx = (rangeM / RADAR_MAX_RANGE_M) * (Math.min(width, height) / 2) * zoomLevel;
        ctx.beginPath();
        ctx.arc(cx, cy, ringPx, 0, Math.PI * 2);
        ctx.strokeStyle = rangeM === 5000 ? '#1e2e47' : '#142033';
        ctx.lineWidth = rangeM === 5000 ? 1.5 : 1;
        ctx.stroke();

        // Monospace range text label
        ctx.font = '10px ui-monospace, SFMono-Regular, monospace';
        ctx.fillStyle = '#475e7a';
        ctx.fillText(`${rangeM / 1000} km`, cx + 6, cy - ringPx + 12);
      }

      // 3. Azimuth Crosshairs and Bearings (every 30 degrees)
      for (let deg = 0; deg < 360; deg += 30) {
        const rad = ((deg - 90) * Math.PI) / 180;
        const outerX = cx + Math.cos(rad) * radiusPx;
        const outerY = cy + Math.sin(rad) * radiusPx;

        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(outerX, outerY);
        ctx.strokeStyle = deg % 90 === 0 ? '#1a283e' : '#101a2b';
        ctx.lineWidth = deg % 90 === 0 ? 1.2 : 0.8;
        ctx.stroke();

        // Azimuth label
        const lx = cx + Math.cos(rad) * (radiusPx - 14);
        const ly = cy + Math.sin(rad) * (radiusPx - 14);
        ctx.font = '9px ui-monospace, SFMono-Regular, monospace';
        ctx.fillStyle = '#475e7a';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        const degStr = deg === 0 ? 'N' : deg === 90 ? 'E' : deg === 180 ? 'S' : deg === 270 ? 'W' : `${deg}°`;
        ctx.fillText(degStr, lx, ly);
      }

      // 4. Restricted Airspace Zones
      if (showZones) {
        for (const zone of zones) {
          const { sx: zx, sy: zy, scale } = worldToScreen(zone.centerX, zone.centerY, width, height);

          // Outer Buffer Zone
          const bufferPx = zone.warningBufferM * scale;
          ctx.beginPath();
          ctx.arc(zx, zy, bufferPx, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(217, 119, 6, 0.05)';
          ctx.fill();
          ctx.strokeStyle = 'rgba(217, 119, 6, 0.4)';
          ctx.lineWidth = 1;
          ctx.setLineDash([4, 4]);
          ctx.stroke();
          ctx.setLineDash([]);

          // Core Prohibited Zone
          const corePx = zone.radiusM * scale;
          ctx.beginPath();
          ctx.arc(zx, zy, corePx, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(220, 38, 38, 0.12)';
          ctx.fill();
          ctx.strokeStyle = 'rgba(239, 68, 68, 0.85)';
          ctx.lineWidth = 1.4;
          ctx.setLineDash([6, 3]);
          ctx.stroke();
          ctx.setLineDash([]);

          // Zone Center Marker & Label
          ctx.fillStyle = '#ef4444';
          ctx.beginPath();
          ctx.arc(zx, zy, 3, 0, Math.PI * 2);
          ctx.fill();

          ctx.font = '10px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
          ctx.fillStyle = '#fca5a5';
          ctx.textAlign = 'center';
          ctx.fillText(`⛔ ${zone.name}`, zx, zy - corePx - 6);
        }
      }

      // 5. Radar Sweep Beam (Rotating Clockwise)
      sweepAngleRef.current = (sweepAngleRef.current + 0.02) % (Math.PI * 2);
      const sweepAngle = sweepAngleRef.current;

      const sweepGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, radiusPx);
      sweepGrad.addColorStop(0, 'rgba(14, 165, 233, 0.2)');
      sweepGrad.addColorStop(1, 'rgba(14, 165, 233, 0.0)');

      ctx.save();
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, radiusPx, sweepAngle - 0.22, sweepAngle, false);
      ctx.closePath();
      ctx.fillStyle = sweepGrad;
      ctx.fill();

      // Leading beam edge
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(cx + Math.cos(sweepAngle) * radiusPx, cy + Math.sin(sweepAngle) * radiusPx);
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.5)';
      ctx.lineWidth = 1.2;
      ctx.stroke();
      ctx.restore();

      // 6. Tracked Aerial Objects
      for (const obj of objects) {
        const { sx, sy } = worldToScreen(obj.x, obj.y, width, height);

        const riskColor =
          obj.riskLevel === 'high' ? '#dc2626' : obj.riskLevel === 'medium' ? '#d97706' : '#059669';

        const isSelected = obj.id === selectedObjectId;
        const isHovered = obj.id === hoveredObjectId;

        // 6a. Render Trajectory Prediction Path
        if (showPredictions) {
          const waypoints = predictTrajectory(obj, predictionHorizonSec, 5);
          if (waypoints.length > 0) {
            ctx.beginPath();
            ctx.moveTo(sx, sy);
            for (const wp of waypoints) {
              const { sx: wx, sy: wy } = worldToScreen(wp.x, wp.y, width, height);
              ctx.lineTo(wx, wy);
            }
            ctx.strokeStyle = isSelected ? riskColor : 'rgba(148, 163, 184, 0.3)';
            ctx.lineWidth = isSelected ? 1.6 : 0.9;
            ctx.setLineDash([3, 4]);
            ctx.stroke();
            ctx.setLineDash([]);

            // Terminal waypoint dot
            const terminalWp = waypoints[waypoints.length - 1];
            const { sx: tx, sy: ty, scale } = worldToScreen(terminalWp.x, terminalWp.y, width, height);

            ctx.beginPath();
            ctx.arc(tx, ty, isSelected ? 3 : 2, 0, Math.PI * 2);
            ctx.fillStyle = riskColor;
            ctx.fill();

            // Terminal uncertainty circle for selected object
            if (isSelected) {
              const uncPx = Math.max(4, terminalWp.uncertaintyRadiusM * scale);
              ctx.beginPath();
              ctx.arc(tx, ty, uncPx, 0, Math.PI * 2);
              ctx.strokeStyle = 'rgba(2, 132, 199, 0.4)';
              ctx.lineWidth = 1;
              ctx.stroke();
            }
          }
        }

        // 6b. Velocity Vector Line
        const headingRad = (((obj.headingDeg % 360) + 360) % 360 * Math.PI) / 180;
        const vecLen = Math.max(10, Math.min(32, obj.speedMps * 0.8));
        const vx = sx + Math.sin(headingRad) * vecLen;
        const vy = sy - Math.cos(headingRad) * vecLen;

        ctx.beginPath();
        ctx.moveTo(sx, sy);
        ctx.lineTo(vx, vy);
        ctx.strokeStyle = riskColor;
        ctx.lineWidth = 1.4;
        ctx.stroke();

        // 6c. Object Marker Symbol
        ctx.save();
        ctx.translate(sx, sy);
        ctx.rotate(headingRad);

        ctx.beginPath();
        ctx.moveTo(0, -6);
        ctx.lineTo(4.5, 5);
        ctx.lineTo(0, 2.5);
        ctx.lineTo(-4.5, 5);
        ctx.closePath();
        ctx.fillStyle = riskColor;
        ctx.fill();
        ctx.strokeStyle = '#060a12';
        ctx.lineWidth = 0.8;
        ctx.stroke();
        ctx.restore();

        // 6d. Selection Reticle
        if (isSelected) {
          ctx.strokeStyle = '#0284c7';
          ctx.lineWidth = 1.4;
          const boxSize = 13;

          // Corner brackets
          ctx.beginPath();
          // Top-Left
          ctx.moveTo(sx - boxSize, sy - boxSize + 5);
          ctx.lineTo(sx - boxSize, sy - boxSize);
          ctx.lineTo(sx - boxSize + 5, sy - boxSize);
          // Top-Right
          ctx.moveTo(sx + boxSize - 5, sy - boxSize);
          ctx.lineTo(sx + boxSize, sy - boxSize);
          ctx.lineTo(sx + boxSize, sy - boxSize + 5);
          // Bottom-Right
          ctx.moveTo(sx + boxSize, sy + boxSize - 5);
          ctx.lineTo(sx + boxSize, sy + boxSize);
          ctx.lineTo(sx + boxSize - 5, sy + boxSize);
          // Bottom-Left
          ctx.moveTo(sx - boxSize + 5, sy + boxSize);
          ctx.lineTo(sx - boxSize, sy + boxSize);
          ctx.lineTo(sx - boxSize, sy + boxSize - 5);
          ctx.stroke();

          // Reticle subtle ring
          ctx.beginPath();
          ctx.arc(sx, sy, boxSize + 3, 0, Math.PI * 2);
          ctx.strokeStyle = 'rgba(2, 132, 199, 0.35)';
          ctx.setLineDash([2, 3]);
          ctx.stroke();
          ctx.setLineDash([]);
        }

        // 6e. Hover highlight
        if (isHovered && !isSelected) {
          ctx.beginPath();
          ctx.arc(sx, sy, 10, 0, Math.PI * 2);
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
          ctx.lineWidth = 1;
          ctx.stroke();
        }

        // 6f. Track Call Sign Tag
        ctx.font = '10px ui-monospace, SFMono-Regular, monospace';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';

        const tagText = `${obj.callsign} [${Math.round(obj.altitudeM)}m]`;
        const textMetrics = ctx.measureText(tagText);
        const tagX = sx + 9;
        const tagY = sy - 9;

        ctx.fillStyle = 'rgba(9, 14, 23, 0.88)';
        ctx.fillRect(tagX - 2, tagY - 7, textMetrics.width + 5, 13);
        ctx.strokeStyle = isSelected ? '#0284c7' : 'rgba(255, 255, 255, 0.12)';
        ctx.lineWidth = 0.8;
        ctx.strokeRect(tagX - 2, tagY - 7, textMetrics.width + 5, 13);

        ctx.fillStyle = isSelected ? '#ffffff' : '#cbd5e1';
        ctx.fillText(tagText, tagX + 1, tagY);
      }

      ctx.restore(); // Restore PPI clip

      // Outer boundary ring border
      ctx.beginPath();
      ctx.arc(cx, cy, radiusPx, 0, Math.PI * 2);
      ctx.strokeStyle = '#1e2e47';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      ctx.restore();

      animFrameIdRef.current = requestAnimationFrame(render);
    };

    animFrameIdRef.current = requestAnimationFrame(render);

    return () => {
      isSubscribed = false;
      if (animFrameIdRef.current) {
        cancelAnimationFrame(animFrameIdRef.current);
      }
    };
  }, [
    objects,
    zones,
    selectedObjectId,
    hoveredObjectId,
    predictionHorizonSec,
    zoomLevel,
    showPredictions,
    showZones,
    worldToScreen,
  ]);

  return (
    <div className={styles.radarPanel} ref={containerRef}>
      {/* Radar Top Bar */}
      <div className={styles.header}>
        <div className={styles.titleArea}>
          <div className={styles.title}>
            <Crosshair size={16} style={{ color: 'var(--accent-primary)' }} />
            <span>Airspace Radar PPI</span>
          </div>
          <span className={styles.badge}>10km Aperture</span>
        </div>

        <div className={styles.controlsGroup}>
          {/* Zoom Segmented Control */}
          <div className={styles.segmentedControl} role="group" aria-label="Radar Zoom Controls">
            <button
              type="button"
              className={styles.toolBtn}
              onClick={handleZoomIn}
              title="Zoom In"
              aria-label="Zoom In Radar"
            >
              <ZoomIn size={13} />
            </button>
            <button
              type="button"
              className={styles.toolBtn}
              onClick={handleZoomOut}
              title="Zoom Out"
              aria-label="Zoom Out Radar"
            >
              <ZoomOut size={13} />
            </button>
            <button
              type="button"
              className={styles.toolBtn}
              onClick={handleResetZoom}
              title="Reset Zoom to 1x"
              aria-label="Reset Zoom"
            >
              <RotateCcw size={12} />
              <span>{zoomLevel}x</span>
            </button>
          </div>

          {/* Prediction Horizon Segmented Control */}
          <div className={styles.segmentedControl} role="group" aria-label="Prediction Horizon">
            {[15, 30, 60].map((h) => (
              <button
                key={h}
                type="button"
                className={`${styles.toolBtn} ${
                  predictionHorizonSec === h ? styles.toolBtnActive : ''
                }`}
                onClick={() => onHorizonChange(h)}
                title={`Set projection horizon to ${h}s`}
              >
                +{h}s
              </button>
            ))}
          </div>

          {/* Toggles */}
          <div className={styles.segmentedControl}>
            <button
              type="button"
              className={`${styles.toolBtn} ${showPredictions ? styles.toolBtnActive : ''}`}
              onClick={() => setShowPredictions(!showPredictions)}
              title="Toggle Trajectory Projections"
              aria-pressed={showPredictions}
            >
              <Route size={13} />
              <span>Paths</span>
            </button>
            <button
              type="button"
              className={`${styles.toolBtn} ${showZones ? styles.toolBtnActive : ''}`}
              onClick={() => setShowZones(!showZones)}
              title="Toggle Restricted Geofences"
              aria-pressed={showZones}
            >
              <Compass size={13} />
              <span>Zones</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Interactive Canvas */}
      <div className={styles.viewportContainer}>
        <canvas
          ref={canvasRef}
          className={styles.canvas}
          onClick={handleCanvasClick}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          style={{ cursor: hoveredObjectId ? 'pointer' : 'crosshair' }}
          aria-label="Interactive Airspace Radar PPI Display"
          role="img"
        />

        {/* Live Cursor Coordinate Readout */}
        {mouseCoord && (
          <div className={styles.cursorReadout}>
            X: {mouseCoord.x}m · Y: {mouseCoord.y}m · Range: {Math.round(Math.hypot(mouseCoord.x, mouseCoord.y))}m
          </div>
        )}
      </div>

      {/* Radar Bottom Legend */}
      <div className={styles.footer}>
        <div className={styles.legendList}>
          <div className={styles.legendItem}>
            <span className={`${styles.legendDot} ${styles.dotLow}`} />
            <span>Low (0–39)</span>
          </div>
          <div className={styles.legendItem}>
            <span className={`${styles.legendDot} ${styles.dotMedium}`} />
            <span>Medium (40–69)</span>
          </div>
          <div className={styles.legendItem}>
            <span className={`${styles.legendDot} ${styles.dotHigh}`} />
            <span>High (70–100)</span>
          </div>
          <div className={styles.legendItem}>
            <span className={styles.dotZone} />
            <span>Restricted Geofence</span>
          </div>
        </div>
        <div>
          <span>Click any marker to inspect telemetry</span>
        </div>
      </div>
    </div>
  );
};
