import type { z } from 'zod';
import type {
  CoffeeBag,
  CoffeeBagCreateRequest,
  CoffeeBagUpdateRequest,
} from '@/api/coffeeBags/coffeeRequestSchemas';
import { CoffeeBagCreateRequestSchema } from '@/api/coffeeBags/coffeeRequestSchemas';

export const ROAST_STYLES = ['Espresso', 'Filter', 'Omni'] as const;

export const CoffeeBagFormSchema = CoffeeBagCreateRequestSchema;

export type CoffeeBagFormValues = z.infer<typeof CoffeeBagFormSchema>;

const defaultValues: CoffeeBagFormValues = {
  roaster: '',
  name: '',
  origin: '',
  roastStyle: '',
  flavourNotes: '',
  opened: '',
};

export function getDefaultValues(): CoffeeBagFormValues {
  return { ...defaultValues };
}

export function getEditValues(coffeeBag: CoffeeBag): CoffeeBagFormValues {
  return {
    roaster: coffeeBag.roaster,
    name: coffeeBag.name ?? '',
    origin: coffeeBag.origin,
    roastStyle: coffeeBag.roastStyle,
    flavourNotes: coffeeBag.flavourNotes ?? '',
    opened: coffeeBag.opened?.slice(0, 10) ?? '',
  };
}

function formatOpened(opened?: string) {
  return opened ? new Date(`${opened}T00:00:00.000Z`).toISOString() : undefined;
}

export function toCreateRequest(
  values: CoffeeBagFormValues,
): CoffeeBagCreateRequest {
  return {
    ...values,
    opened: formatOpened(values.opened),
  };
}

export function toUpdateRequest(
  values: CoffeeBagFormValues,
): CoffeeBagUpdateRequest {
  return {
    ...values,
    opened: formatOpened(values.opened),
    clearOpened: values.opened === '',
  };
}
