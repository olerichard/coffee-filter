// @vitest-environment jsdom
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { BrewForm } from '../BrewForm';
import { getDefaultValues } from '../brewFormValues';
import type { BrewFormValues } from '../brewFormValues';
import type { BrewMethod } from '@/api/brewMethods/brewMethodRequestSchemas';
import type { Brew } from '@/api/brews/brewRequestSchemas';
import type { CoffeeBag } from '@/api/coffeeBags/coffeeRequestSchemas';

const method: BrewMethod = {
  id: 1,
  name: 'Espresso',
  dose: { min: 15, max: 25, default: 18 },
  grindSize: { min: 1, max: 10, default: 5 },
  brewTime: { min: 20, max: 40, default: 30 },
  brewWeight: { min: 20, max: 60, default: 36 },
};

const bag: CoffeeBag = {
  id: 7,
  userId: 1,
  roaster: 'Tim Wendelboe',
  origin: 'Kenya',
  roastStyle: 'Light',
};

const v60: BrewMethod = {
  id: 2,
  name: 'V60',
  dose: { min: 10, max: 60, default: 16 },
  grindSize: { min: 10, max: 15, default: 12.5 },
  brewTime: { min: 10, max: 420, default: 150 },
  brewWeight: { min: 1, max: 400, default: 240 },
};

const filterBag: CoffeeBag = {
  id: 7,
  userId: 1,
  roaster: 'Tim Wendelboe',
  origin: 'Kenya',
  roastStyle: 'Filter',
};

beforeAll(() => {
  // jsdom has no pointer capture, and Radix Select uses it while opening.
  Object.defineProperties(Element.prototype, {
    hasPointerCapture: { value: () => false, configurable: true },
    setPointerCapture: { value: () => {}, configurable: true },
    releasePointerCapture: { value: () => {}, configurable: true },
  });
  Element.prototype.scrollIntoView = () => {};

  vi.stubGlobal(
    'ResizeObserver',
    class {
      observe() {}
      unobserve() {}
      disconnect() {}
    },
  );
});

interface RenderOptions {
  coffeeBags?: Array<CoffeeBag>;
  brewMethods?: Array<BrewMethod>;
  previousBrews?: Map<number, Brew>;
  onCreateBag?: () => void;
  onDraftChange?: (values: BrewFormValues) => void;
  onCancel?: () => void;
}

function renderForm({
  coffeeBags = [],
  brewMethods = [method],
  previousBrews,
  onCreateBag,
  onDraftChange,
  onCancel = vi.fn(),
}: RenderOptions = {}) {
  return render(
    <BrewForm
      initialValues={getDefaultValues(method)}
      brewMethods={brewMethods}
      coffeeBags={coffeeBags}
      previousBrews={previousBrews}
      submitLabel="Save Brew"
      cancelLabel="Hide"
      isLoading={false}
      onSubmit={vi.fn()}
      onCancel={onCancel}
      onCreateBag={onCreateBag}
      onDraftChange={onDraftChange}
    />,
  );
}

function openBagSelect() {
  const trigger = screen.getByRole('combobox', { name: /Coffee Bag/ });

  trigger.focus();
  fireEvent.keyDown(trigger, { key: 'ArrowDown' });
}

afterEach(() => {
  cleanup();
});

describe('BrewForm coffee bag select', () => {
  it('offers a way to create a bag when the user has none', () => {
    const onCreateBag = vi.fn();

    renderForm({ onCreateBag });
    openBagSelect();

    expect(screen.getByText('No coffee bags with coffee left')).toBeTruthy();

    fireEvent.click(screen.getByRole('option', { name: 'Add a coffee bag…' }));

    expect(onCreateBag).toHaveBeenCalledTimes(1);
  });

  it('shows the empty hint under the field', () => {
    renderForm();

    expect(
      screen.getByText('You need a coffee bag before you can save a brew.'),
    ).toBeTruthy();
  });

  it('lists the available bags and no create option', () => {
    renderForm({ coffeeBags: [bag] });
    openBagSelect();

    expect(
      screen.queryByRole('option', { name: 'Add a coffee bag…' }),
    ).toBeNull();

    fireEvent.click(
      screen.getByRole('option', { name: 'Tim Wendelboe - Kenya' }),
    );

    expect(
      screen.getByRole('combobox', { name: /Coffee Bag/ }).textContent,
    ).toContain('Tim Wendelboe - Kenya');
  });

  it('does not show the create option when no handler is provided', () => {
    renderForm();
    openBagSelect();

    const option = screen.getByRole('option', {
      name: 'Add a coffee bag…',
    });

    expect(option.getAttribute('aria-disabled')).toBe('true');
  });

  it('reports draft changes as the user edits', () => {
    const onDraftChange = vi.fn();

    renderForm({ onDraftChange });

    fireEvent.change(screen.getByLabelText('Notes'), {
      target: { value: 'Tasting good' },
    });

    expect(onDraftChange).toHaveBeenLastCalledWith(
      expect.objectContaining({ notes: 'Tasting good' }),
    );
  });
});

describe('BrewForm bag-driven defaults', () => {
  it('prefills method defaults based on the bag roast style', () => {
    const onDraftChange = vi.fn();

    renderForm({
      brewMethods: [method, v60],
      coffeeBags: [filterBag],
      onDraftChange,
    });
    openBagSelect();
    fireEvent.click(
      screen.getByRole('option', { name: 'Tim Wendelboe - Kenya' }),
    );

    expect(onDraftChange).toHaveBeenLastCalledWith(
      expect.objectContaining({
        coffeeBagId: 7,
        brewMethod: v60,
        coffeeDose: 16,
        grindSize: 12.5,
        brewTime: 150,
        brewWeight: 240,
        brewTasteScore: 0,
        notes: '',
      }),
    );
  });

  it('prefills from the previous brew but resets score and notes', () => {
    const onDraftChange = vi.fn();
    const previousBrew: Brew = {
      id: 10,
      coffeeBagId: 7,
      coffeeBag: filterBag,
      brewMethodId: 2,
      brewMethodName: 'V60',
      coffeeDose: 20,
      grindSize: 13,
      brewTime: 200,
      brewWeight: 300,
      brewTasteScore: 4,
      notes: 'Tasty cup',
      brewedOn: '2026-01-01T00:00:00.000Z',
    };

    renderForm({
      brewMethods: [method, v60],
      coffeeBags: [filterBag],
      previousBrews: new Map([[7, previousBrew]]),
      onDraftChange,
    });
    openBagSelect();
    fireEvent.click(
      screen.getByRole('option', { name: 'Tim Wendelboe - Kenya' }),
    );

    expect(onDraftChange).toHaveBeenLastCalledWith(
      expect.objectContaining({
        coffeeBagId: 7,
        brewMethod: v60,
        coffeeDose: 20,
        grindSize: 13,
        brewTime: 200,
        brewWeight: 300,
        brewTasteScore: 0,
        notes: '',
      }),
    );
  });
});
