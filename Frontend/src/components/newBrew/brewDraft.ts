import { z } from 'zod';
import { BrewFormSchema } from './brewFormValues';
import type { BrewFormValues } from './brewFormValues';

const DRAFT_VERSION = 1;

// A draft usually has no coffee bag selected yet, so relax only that field.
const BrewDraftSchema = BrewFormSchema.extend({
  coffeeBagId: z.number().int().min(0),
});

export const brewDraftKey = (userId: number) =>
  `coffee-filter:brew-draft:v${DRAFT_VERSION}:${userId}`;

const canUseStorage = () =>
  typeof window !== 'undefined' && typeof window.sessionStorage !== 'undefined';

export function readBrewDraft(userId: number): BrewFormValues | null {
  if (!canUseStorage()) {
    return null;
  }

  try {
    const raw = window.sessionStorage.getItem(brewDraftKey(userId));

    if (raw === null) {
      return null;
    }

    const parsed: unknown = JSON.parse(raw);

    if (parsed === null || typeof parsed !== 'object') {
      return null;
    }

    const { version, values } = parsed as {
      version?: unknown;
      values?: unknown;
    };

    if (version !== DRAFT_VERSION) {
      return null;
    }

    const result = BrewDraftSchema.safeParse(values);

    return result.success ? result.data : null;
  } catch {
    // Corrupt or inaccessible storage: start from a clean form.
    return null;
  }
}

export function writeBrewDraft(userId: number, values: BrewFormValues): void {
  if (!canUseStorage()) {
    return;
  }

  try {
    window.sessionStorage.setItem(
      brewDraftKey(userId),
      JSON.stringify({ version: DRAFT_VERSION, values }),
    );
  } catch {
    // Private mode or quota exceeded: drafts are best effort.
  }
}

export function clearBrewDraft(userId: number): void {
  if (!canUseStorage()) {
    return;
  }

  try {
    window.sessionStorage.removeItem(brewDraftKey(userId));
  } catch {
    // Nothing useful to do if storage is unavailable.
  }
}
