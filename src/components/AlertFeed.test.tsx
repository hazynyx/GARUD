import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { AlertFeed } from './AlertFeed';
import { SimulatedAlert } from '../features/simulation/types';

describe('AlertFeed', () => {
  const alerts: SimulatedAlert[] = [
    {
      id: 'alt-01',
      objectId: 'UAS-04',
      objectCallsign: 'INTRUDER-1',
      createdAt: 12,
      severity: 'high',
      title: 'PERIMETER BREACH',
      reason: 'Crossed prohibited fence',
      acknowledged: false,
    },
    {
      id: 'alt-02',
      objectId: 'UAS-08',
      objectCallsign: 'GHOST-9',
      createdAt: 15,
      severity: 'medium',
      title: 'BUFFER INGRESS',
      reason: 'Entered outer warning buffer',
      acknowledged: true,
    },
  ];

  it('renders alerts and acknowledges alert on button click', () => {
    const handleAck = vi.fn();
    const handleClear = vi.fn();

    render(
      <AlertFeed
        alerts={alerts}
        onAcknowledgeAlert={handleAck}
        onClearAlerts={handleClear}
      />
    );

    expect(screen.getByText('PERIMETER BREACH')).toBeInTheDocument();
    expect(screen.getByText('BUFFER INGRESS')).toBeInTheDocument();

    const ackButton = screen.getByText('Ack');
    fireEvent.click(ackButton);
    expect(handleAck).toHaveBeenCalledWith('alt-01');
  });

  it('filters pending unacknowledged alerts when clicked', () => {
    render(
      <AlertFeed
        alerts={alerts}
        onAcknowledgeAlert={() => {}}
        onClearAlerts={() => {}}
      />
    );

    const pendingFilterBtn = screen.getByRole('button', { name: /Pending/i });
    fireEvent.click(pendingFilterBtn);

    expect(screen.getByText('PERIMETER BREACH')).toBeInTheDocument();
    expect(screen.queryByText('BUFFER INGRESS')).not.toBeInTheDocument();
  });
});
