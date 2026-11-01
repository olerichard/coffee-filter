// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { NewBrewCard } from '../NewBrewCard';
import type { DashboardPanel } from '@/lib/dashboardSearch';

const { mounts } = vi.hoisted(() => ({ mounts: { count: 0 } }));

vi.mock('../CreateBrew', async () => {
  const { useState } = await import('react');

  return {
    CreateBrew: ({ onCreateBag }: { onCreateBag: () => void }) => {
      const [mountId] = useState(() => {
        mounts.count += 1;
        return mounts.count;
      });

      return (
        <div data-testid="brew-form">
          <span>brew-{mountId}</span>
          <button type="button" onClick={onCreateBag}>
            open-bag-form
          </button>
        </div>
      );
    },
  };
});

vi.mock('../EditBrew', () => ({
  EditBrew: () => <div>edit brew form</div>,
}));

vi.mock('../../coffeeBagForm/CreateCoffeeBag', () => ({
  CreateCoffeeBag: () => <div>bag form</div>,
}));

vi.mock('../../coffeeBagForm/EditCoffeeBag', () => ({
  EditCoffeeBag: () => <div>edit bag form</div>,
}));

const handlers = {
  onOpenNewBrew: vi.fn(),
  onOpenNewBag: vi.fn(),
  onAddBagFromBrew: vi.fn(),
  onClose: vi.fn(),
};

function renderCard(panel: DashboardPanel) {
  return render(<NewBrewCard panel={panel} {...handlers} />);
}

beforeEach(() => {
  mounts.count = 0;
});

afterEach(() => {
  cleanup();
  Object.values(handlers).forEach((handler) => handler.mockReset());
});

describe('NewBrewCard', () => {
  it('keeps the brew form mounted while the bag form is on top', () => {
    const { rerender } = renderCard({ kind: 'new-brew' });

    expect(screen.getByTestId('brew-form').textContent).toContain('brew-1');

    rerender(
      <NewBrewCard
        panel={{ kind: 'new-bag', returnTo: 'new-brew' }}
        {...handlers}
      />,
    );

    // Same instance, so nothing the user typed is lost.
    expect(screen.getByTestId('brew-form').textContent).toContain('brew-1');
    expect(screen.getByTestId('brew-form').parentElement?.className).toContain(
      'hidden',
    );
    expect(screen.getByText('bag form')).toBeTruthy();

    rerender(<NewBrewCard panel={{ kind: 'new-brew' }} {...handlers} />);

    expect(screen.getByTestId('brew-form').textContent).toContain('brew-1');
    expect(
      screen.getByTestId('brew-form').parentElement?.className,
    ).not.toContain('hidden');
  });

  it('unmounts the brew form when the bag form is opened from the button', () => {
    renderCard({ kind: 'new-bag' });

    expect(screen.queryByTestId('brew-form')).toBeNull();
    expect(screen.getByText('bag form')).toBeTruthy();
  });

  it('asks the dashboard to open the bag form with a return target', () => {
    renderCard({ kind: 'new-brew' });

    fireEvent.click(screen.getByRole('button', { name: 'open-bag-form' }));

    expect(handlers.onAddBagFromBrew).toHaveBeenCalledTimes(1);
  });
});
