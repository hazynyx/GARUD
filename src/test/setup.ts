import '@testing-library/jest-dom';

// Mock ResizeObserver for Recharts in JSDOM environment
class MockResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}

global.ResizeObserver = MockResizeObserver as unknown as typeof ResizeObserver;

// Mock HTMLCanvasElement.prototype.getContext for RadarView in JSDOM
if (typeof HTMLCanvasElement !== 'undefined') {
  HTMLCanvasElement.prototype.getContext = function (contextType: string) {
    if (contextType === '2d') {
      return {
        save: () => {},
        restore: () => {},
        beginPath: () => {},
        closePath: () => {},
        moveTo: () => {},
        lineTo: () => {},
        arc: () => {},
        stroke: () => {},
        fill: () => {},
        fillRect: () => {},
        clearRect: () => {},
        strokeRect: () => {},
        fillText: () => {},
        measureText: () => ({ width: 40 }),
        scale: () => {},
        translate: () => {},
        rotate: () => {},
        clip: () => {},
        setLineDash: () => {},
        createRadialGradient: () => ({
          addColorStop: () => {},
        }),
        createLinearGradient: () => ({
          addColorStop: () => {},
        }),
      } as unknown as CanvasRenderingContext2D;
    }
    return null;
  } as unknown as typeof HTMLCanvasElement.prototype.getContext;
}
