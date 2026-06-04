import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

vi.mock('../../services/helpService', () => ({
  default: { getPreferences: vi.fn(), upsertPreference: vi.fn().mockResolvedValue({}), resetAll: vi.fn() },
}));

import OnboardingTour from './OnboardingTour';
import { useHelpStore } from '../../store/helpStore';
import { GUIDE, TOUR_STEPS } from '../../lib/helpContent';

describe('OnboardingTour (first-time walkthrough)', () => {
  beforeEach(() => useHelpStore.setState({ tourOpen: true, completed: {} }));

  it('shows the welcome step when open', () => {
    render(<OnboardingTour />);
    expect(screen.getByText(TOUR_STEPS[0].title)).toBeInTheDocument();
  });

  it('advances to the next step on Next', async () => {
    render(<OnboardingTour />);
    await userEvent.click(screen.getByRole('button', { name: /next/i }));
    expect(await screen.findByText(TOUR_STEPS[1].title)).toBeInTheDocument();
  });

  it('skipping marks the tour complete and closes it', async () => {
    render(<OnboardingTour />);
    await userEvent.click(screen.getByText(/skip tour/i));
    expect(useHelpStore.getState().completed[GUIDE.WELCOME_TOUR]).toBe(true);
    expect(useHelpStore.getState().tourOpen).toBe(false);
  });
});
