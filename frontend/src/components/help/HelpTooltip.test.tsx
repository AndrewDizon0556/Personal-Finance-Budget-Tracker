import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

vi.mock('../../services/helpService', () => ({
  default: { getPreferences: vi.fn(), upsertPreference: vi.fn(), resetAll: vi.fn() },
}));

import HelpTooltip from './HelpTooltip';
import { useHelpStore } from '../../store/helpStore';

describe('HelpTooltip', () => {
  beforeEach(() => useHelpStore.setState({ tipsEnabled: true }));

  it('reveals the explanation on hover', async () => {
    render(<HelpTooltip content="How much you can safely spend." />);
    await userEvent.hover(screen.getByRole('button', { name: /more information/i }));
    expect(await screen.findByRole('tooltip')).toHaveTextContent('How much you can safely spend.');
  });

  it('renders nothing when tips are turned off', () => {
    useHelpStore.setState({ tipsEnabled: false });
    const { container } = render(<HelpTooltip content="Hidden when tips are off" />);
    expect(container).toBeEmptyDOMElement();
  });
});
