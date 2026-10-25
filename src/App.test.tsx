import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import App from './App';

describe('App', () => {
  it('renders simulation mode warning banner prominently', () => {
    render(<App />);
    expect(screen.getByText(/SIMULATION MODE — NOT LIVE SENSOR DATA/i)).toBeInTheDocument();
  });

  it('renders the GARUD brand header', () => {
    render(<App />);
    expect(screen.getByText(/GARUD 🦅/i)).toBeInTheDocument();
  });
});
