import { describe, expect, it } from 'vitest';
import {
  getBrewMethodForRoastStyle,
  getValuesFromBrew,
  resolveBrewFormValues,
} from '../brewFormValues';
import type { BrewMethod } from '@/api/brewMethods/brewMethodRequestSchemas';
import type { Brew } from '@/api/brews/brewRequestSchemas';
import type { CoffeeBag } from '@/api/coffeeBags/coffeeRequestSchemas';

const espresso: BrewMethod = {
  id: 1,
  name: 'Espresso',
  dose: { min: 10, max: 30, default: 18 },
  grindSize: { min: 1, max: 3, default: 2 },
  brewTime: { min: 10, max: 60, default: 27 },
  brewWeight: { min: 1, max: 60, default: 36 },
};

const v60: BrewMethod = {
  id: 2,
  name: 'V60',
  dose: { min: 10, max: 60, default: 16 },
  grindSize: { min: 10, max: 15, default: 12.5 },
  brewTime: { min: 10, max: 420, default: 150 },
  brewWeight: { min: 1, max: 400, default: 240 },
};

const methods = [espresso, v60];

const bag: CoffeeBag = {
  id: 7,
  userId: 1,
  roaster: 'Tim Wendelboe',
  origin: 'Kenya',
  roastStyle: 'Filter',
};

const previousBrew: Brew = {
  id: 10,
  coffeeBagId: 7,
  coffeeBag: bag,
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

describe('getBrewMethodForRoastStyle', () => {
  it('maps espresso roast style to the Espresso method', () => {
    expect(getBrewMethodForRoastStyle('Espresso', methods)).toBe(espresso);
  });

  it('maps filter roast style to the V60 method', () => {
    expect(getBrewMethodForRoastStyle('Filter', methods)).toBe(v60);
  });

  it('maps omni roast style to the V60 method', () => {
    expect(getBrewMethodForRoastStyle('Omni', methods)).toBe(v60);
  });

  it('falls back to Espresso for an unknown roast style', () => {
    expect(getBrewMethodForRoastStyle('Light', methods)).toBe(espresso);
  });
});

describe('getValuesFromBrew', () => {
  it('copies the previous brew values but resets score and notes', () => {
    expect(getValuesFromBrew(previousBrew, methods)).toEqual({
      brewMethod: v60,
      coffeeBagId: 7,
      brewTasteScore: 0,
      coffeeDose: 20,
      grindSize: 13,
      brewTime: 200,
      brewWeight: 300,
      notes: '',
    });
  });

  it('returns null when the previous brew method no longer exists', () => {
    const brew: Brew = { ...previousBrew, brewMethodId: 999 };
    expect(getValuesFromBrew(brew, methods)).toBeNull();
  });
});

describe('resolveBrewFormValues', () => {
  it('uses the previous brew when one exists', () => {
    expect(resolveBrewFormValues(bag, methods, previousBrew)).toEqual({
      brewMethod: v60,
      coffeeBagId: 7,
      brewTasteScore: 0,
      coffeeDose: 20,
      grindSize: 13,
      brewTime: 200,
      brewWeight: 300,
      notes: '',
    });
  });

  it('falls back to the roast-style method defaults without a previous brew', () => {
    expect(resolveBrewFormValues(bag, methods)).toEqual({
      brewMethod: v60,
      coffeeBagId: 7,
      brewTasteScore: 0,
      coffeeDose: 16,
      grindSize: 12.5,
      brewTime: 150,
      brewWeight: 240,
      notes: '',
    });
  });

  it('uses the roast-style method when the previous brew method is gone', () => {
    const brew: Brew = { ...previousBrew, brewMethodId: 999 };
    expect(resolveBrewFormValues(bag, methods, brew)).toEqual({
      brewMethod: v60,
      coffeeBagId: 7,
      brewTasteScore: 0,
      coffeeDose: 16,
      grindSize: 12.5,
      brewTime: 150,
      brewWeight: 240,
      notes: '',
    });
  });
});
