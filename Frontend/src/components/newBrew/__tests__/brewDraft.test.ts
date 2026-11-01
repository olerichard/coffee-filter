// @vitest-environment jsdom
import { afterEach, describe, expect, it } from 'vitest';
import {
  brewDraftKey,
  clearBrewDraft,
  readBrewDraft,
  writeBrewDraft,
} from '../brewDraft';
import { getDefaultValues } from '../brewFormValues';
import type { BrewMethod } from '@/api/brewMethods/brewMethodRequestSchemas';

const method: BrewMethod = {
  id: 1,
  name: 'Espresso',
  dose: { min: 15, max: 25, default: 18 },
  grindSize: { min: 1, max: 10, default: 5 },
  brewTime: { min: 20, max: 40, default: 30 },
  brewWeight: { min: 20, max: 60, default: 36 },
};

const validDraft = {
  ...getDefaultValues(method),
  notes: 'Blueberry and cocoa',
  coffeeBagId: 7,
};

afterEach(() => {
  window.sessionStorage.clear();
});

describe('brew draft storage', () => {
  it('round-trips form values', () => {
    writeBrewDraft(1, validDraft);

    expect(readBrewDraft(1)).toEqual(validDraft);
  });

  it('keeps a draft without a selected coffee bag', () => {
    const draft = { ...validDraft, coffeeBagId: 0 };

    writeBrewDraft(1, draft);

    expect(readBrewDraft(1)).toEqual(draft);
  });

  it('scopes drafts per user', () => {
    writeBrewDraft(1, validDraft);

    expect(readBrewDraft(2)).toBeNull();
  });

  it('ignores malformed JSON', () => {
    window.sessionStorage.setItem(brewDraftKey(1), '{not json');

    expect(readBrewDraft(1)).toBeNull();
  });

  it('ignores an unknown draft version', () => {
    window.sessionStorage.setItem(
      brewDraftKey(1),
      JSON.stringify({ version: 999, values: validDraft }),
    );

    expect(readBrewDraft(1)).toBeNull();
  });

  it('ignores values that no longer match the form schema', () => {
    window.sessionStorage.setItem(
      brewDraftKey(1),
      JSON.stringify({
        version: 1,
        values: { ...validDraft, coffeeDose: -5 },
      }),
    );

    expect(readBrewDraft(1)).toBeNull();
  });

  it('clears only the requested user draft', () => {
    writeBrewDraft(1, validDraft);
    writeBrewDraft(2, validDraft);

    clearBrewDraft(1);

    expect(readBrewDraft(1)).toBeNull();
    expect(readBrewDraft(2)).toEqual(validDraft);
  });
});
