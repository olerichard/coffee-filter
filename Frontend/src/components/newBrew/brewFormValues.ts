import { z } from 'zod';
import type { Brew, BrewCreateRequest } from '@/api/brews/brewRequestSchemas';
import type { BrewMethod } from '@/api/brewMethods/brewMethodRequestSchemas';
import type { CoffeeBag } from '@/api/coffeeBags/coffeeRequestSchemas';
import { BrewMethodResponseSchema } from '@/api/brewMethods/brewMethodRequestSchemas';

export const BrewFormSchema = z.object({
  brewMethod: BrewMethodResponseSchema,
  coffeeBagId: z.number().min(1, 'Coffee bag is required'),
  brewTasteScore: z.number().max(5),
  coffeeDose: z.number().positive('Dose is required'),
  grindSize: z.number().positive('Grind size is required'),
  brewTime: z.number().positive('Brew time is required'),
  brewWeight: z.number().positive('Brew weight is required'),
  notes: z.string().optional(),
});

export type BrewFormValues = z.infer<typeof BrewFormSchema>;

export const ROAST_STYLE_TO_BREW_METHOD: Record<string, string | undefined> = {
  Espresso: 'Espresso',
  Filter: 'V60',
  Omni: 'V60',
};

export function getBrewMethodForRoastStyle(
  roastStyle: string,
  brewMethods: Array<BrewMethod>,
): BrewMethod {
  const mappedName = ROAST_STYLE_TO_BREW_METHOD[roastStyle];
  if (mappedName !== undefined) {
    const match = brewMethods.find((method) => method.name === mappedName);
    if (match !== undefined) {
      return match;
    }
  }

  return (
    brewMethods.find((method) => method.name === 'Espresso') ?? brewMethods[0]
  );
}

export function getDefaultValues(
  method: BrewMethod,
  coffeeBagId = 0,
): BrewFormValues {
  return {
    brewMethod: method,
    coffeeBagId,
    brewTasteScore: 0,
    coffeeDose: method.dose.default,
    grindSize: method.grindSize.default,
    brewTime: method.brewTime.default,
    brewWeight: method.brewWeight.default,
    notes: '',
  };
}

export function getValuesFromBrew(
  brew: Brew,
  brewMethods: Array<BrewMethod>,
): BrewFormValues | null {
  const method = brewMethods.find((m) => m.id === brew.brewMethodId);
  if (method === undefined) {
    return null;
  }

  return {
    brewMethod: method,
    coffeeBagId: brew.coffeeBagId,
    brewTasteScore: 0,
    coffeeDose: brew.coffeeDose,
    grindSize: brew.grindSize,
    brewTime: brew.brewTime,
    brewWeight: brew.brewWeight,
    notes: '',
  };
}

export function resolveBrewFormValues(
  bag: CoffeeBag,
  brewMethods: Array<BrewMethod>,
  previousBrew?: Brew,
): BrewFormValues {
  if (previousBrew !== undefined) {
    const values = getValuesFromBrew(previousBrew, brewMethods);
    if (values !== null) {
      return { ...values, coffeeBagId: bag.id };
    }
  }

  const method = getBrewMethodForRoastStyle(bag.roastStyle, brewMethods);
  return getDefaultValues(method, bag.id);
}

export function getEditValues(brew: Brew, method: BrewMethod): BrewFormValues {
  return {
    brewMethod: method,
    coffeeBagId: brew.coffeeBagId,
    brewTasteScore: brew.brewTasteScore,
    coffeeDose: brew.coffeeDose,
    grindSize: brew.grindSize,
    brewTime: brew.brewTime,
    brewWeight: brew.brewWeight,
    notes: brew.notes ?? '',
  };
}

export function toBrewRequest(values: BrewFormValues): BrewCreateRequest {
  return {
    coffeeBagId: values.coffeeBagId,
    brewMethodId: values.brewMethod.id,
    brewTasteScore: values.brewTasteScore,
    coffeeDose: values.coffeeDose,
    grindSize: values.grindSize,
    brewTime: values.brewTime,
    brewWeight: values.brewWeight,
    notes: values.notes,
  };
}
