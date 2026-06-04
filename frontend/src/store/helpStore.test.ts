import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock the network layer so guidance logic is tested in isolation (and offline).
vi.mock('../services/helpService', () => ({
  default: {
    getPreferences: vi.fn().mockResolvedValue([]),
    upsertPreference: vi.fn().mockResolvedValue({}),
    resetAll: vi.fn().mockResolvedValue(undefined),
  },
}));

import { useHelpStore } from './helpStore';
import helpService from '../services/helpService';
import { GUIDE } from '../lib/helpContent';

const resetStore = () =>
  useHelpStore.setState({ tipsEnabled: true, completed: {}, lastShown: {}, tourOpen: false, hydrated: false });

describe('helpStore (smart help logic)', () => {
  beforeEach(() => {
    resetStore();
    vi.clearAllMocks();
  });

  it('keeps tips on by default and lets the user mute them', () => {
    expect(useHelpStore.getState().tipsEnabled).toBe(true);
    useHelpStore.getState().setTipsEnabled(false);
    expect(useHelpStore.getState().tipsEnabled).toBe(false);
  });

  it('marks a guide completed and mirrors it to the backend', () => {
    useHelpStore.getState().markCompleted(GUIDE.WELCOME_TOUR);
    expect(useHelpStore.getState().completed[GUIDE.WELCOME_TOUR]).toBe(true);
    expect(helpService.upsertPreference).toHaveBeenCalledWith(GUIDE.WELCOME_TOUR, true);
  });

  it('does not re-show a completed guide (completion is remembered)', () => {
    useHelpStore.getState().markCompleted(GUIDE.SEMESTER_GUIDE);
    expect(useHelpStore.getState().completed[GUIDE.SEMESTER_GUIDE]).toBe(true);
  });

  it('resets all guides locally and on the backend', () => {
    useHelpStore.getState().markCompleted(GUIDE.WELCOME_TOUR);
    useHelpStore.getState().resetAllGuides();
    expect(useHelpStore.getState().completed).toEqual({});
    expect(helpService.resetAll).toHaveBeenCalledTimes(1);
  });

  it('hydrates completion from the server so finished tours stay done', async () => {
    (helpService.getPreferences as ReturnType<typeof vi.fn>).mockResolvedValueOnce([
      { id: '1', guideName: GUIDE.WELCOME_TOUR, completed: true, lastShown: null, updatedAt: null },
    ]);
    await useHelpStore.getState().hydrateFromServer();
    expect(useHelpStore.getState().completed[GUIDE.WELCOME_TOUR]).toBe(true);
    expect(useHelpStore.getState().hydrated).toBe(true);
  });
});
