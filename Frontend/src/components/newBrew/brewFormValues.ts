import { z } from 'zod';
import type { Brew, BrewCreateRequest } from '@/api/brews/brewRequestSchemas';
import type { BrewMethod } from '@/api/brewMethods/brewMethodRequestSchemas';
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

export function getDefaultValues(method: BrewMethod): BrewFormValues {
  return {
    brewMethod: method,
    coffeeBagId: 0,
    brewTasteScore: 0,
    coffeeDose: method.dose.default,
    grindSize: method.grindSize.default,
    brewTime: method.brewTime.default,
    brewWeight: method.brewWeight.default,
    notes: '',
  };
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
