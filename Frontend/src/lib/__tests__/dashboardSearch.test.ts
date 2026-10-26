import { describe, expect, it } from 'vitest';
import {
  closeDashboardPanel,
  getDashboardPanel,
  getDashboardShowEmpty,
  getDashboardView,
  openEditBag,
  openEditBrew,
  openNewBag,
  openNewBrew,
  setDashboardShowEmpty,
  setDashboardView,
  validateDashboardSearch,
} from '../dashboardSearch';

describe('validateDashboardSearch', () => {
  it('uses list defaults when no search params are present', () => {
    const search = validateDashboardSearch({});

    expect(getDashboardView(search)).toBe('brews');
    expect(getDashboardShowEmpty(search)).toBe(false);
    expect(getDashboardPanel(search)).toEqual({ kind: 'none' });
  });

  it('parses list state and converts ids to numbers', () => {
    const search = validateDashboardSearch({
      view: 'bags',
      showEmpty: 'true',
      brew: '42',
    });

    expect(search).toMatchObject({
      view: 'bags',
      showEmpty: true,
      brew: 42,
    });
  });

  it('accepts booleans and numbers already parsed by the router', () => {
    const search = validateDashboardSearch({
      view: 'bags',
      showEmpty: false,
      brew: 42,
    });

    expect(search).toMatchObject({
      view: 'bags',
      showEmpty: false,
      brew: 42,
    });
  });

  it('ignores malformed values instead of throwing', () => {
    const search = validateDashboardSearch({
      view: 'coffeeBags',
      showEmpty: 'sometimes',
      new: 'coffee',
      brew: 'not-a-number',
      bag: '-5',
    });

    expect(getDashboardView(search)).toBe('brews');
    expect(getDashboardShowEmpty(search)).toBe(false);
    expect(getDashboardPanel(search)).toEqual({ kind: 'none' });
  });
});

describe('getDashboardPanel', () => {
  it('resolves create panels', () => {
    expect(getDashboardPanel(validateDashboardSearch({ new: 'brew' }))).toEqual(
      {
        kind: 'new-brew',
      },
    );
    expect(getDashboardPanel(validateDashboardSearch({ new: 'bag' }))).toEqual({
      kind: 'new-bag',
    });
  });

  it('resolves edit panels', () => {
    expect(getDashboardPanel(validateDashboardSearch({ brew: '42' }))).toEqual({
      kind: 'edit-brew',
      brewId: 42,
    });
    expect(getDashboardPanel(validateDashboardSearch({ bag: '5' }))).toEqual({
      kind: 'edit-bag',
      coffeeBagId: 5,
    });
  });

  it('resolves conflicting panel params deterministically', () => {
    expect(
      getDashboardPanel(
        validateDashboardSearch({ new: 'bag', bag: '5', brew: '42' }),
      ),
    ).toEqual({ kind: 'edit-brew', brewId: 42 });
  });
});

describe('dashboard search helpers', () => {
  it('opens panels without losing list state or conflicting panel params', () => {
    const current = validateDashboardSearch({
      view: 'bags',
      showEmpty: 'true',
      new: 'bag',
      bag: '5',
    });

    expect(openNewBrew(current)).toEqual({
      view: 'bags',
      showEmpty: true,
      new: 'brew',
    });
    expect(openNewBag(current)).toEqual({
      view: 'bags',
      showEmpty: true,
      new: 'bag',
    });
    expect(openEditBrew(current, 42)).toEqual({
      view: 'bags',
      showEmpty: true,
      brew: 42,
    });
    expect(openEditBag(current, 7)).toEqual({
      view: 'bags',
      showEmpty: true,
      bag: 7,
    });
  });

  it('closes the panel while preserving list state', () => {
    const current = validateDashboardSearch({
      view: 'bags',
      showEmpty: 'true',
      brew: '42',
    });

    expect(closeDashboardPanel(current)).toEqual({
      view: 'bags',
      showEmpty: true,
    });
  });

  it('omits default list params and preserves the open panel', () => {
    const current = validateDashboardSearch({ brew: '42', showEmpty: 'true' });

    expect(setDashboardView(current, 'brews')).toEqual({
      brew: 42,
      showEmpty: true,
    });
    expect(setDashboardShowEmpty(current, false)).toEqual({
      brew: 42,
    });
  });
});
