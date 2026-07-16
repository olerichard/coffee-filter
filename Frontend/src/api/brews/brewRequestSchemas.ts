import z from 'zod';
import { CoffeeBagResponseSchema } from '../coffeeBags/coffeeRequestSchemas';

export const BrewResponseSchema = z.object({
  id: z.number(),
  coffeeBagId: z.number(),
  coffeeBag: CoffeeBagResponseSchema,
  brewMethodId: z.number(),
  brewMethodName: z.string(),
  coffeeDose: z.number(),
  grindSize: z.number(),
  brewTime: z.number(),
  brewWeight: z.number(),
  brewTasteScore: z.number(),
  notes: z.string().optional(),
  brewedOn: z.iso.datetime({ offset: true }),
});

export type Brew = z.infer<typeof BrewResponseSchema>;

export const BrewCreateRequestSchema = z.object({
  coffeeBagId: z.number(),
  brewMethodId: z.number(),
  brewTasteScore: z.number(),
  coffeeDose: z.number(),
  grindSize: z.number(),
  brewTime: z.number(),
  brewWeight: z.number(),
  notes: z.string().optional(),
});

export type BrewCreateRequest = z.infer<typeof BrewCreateRequestSchema>;

export const BrewUpdateRequestSchema = z.object({
  coffeeBagId: z.number(),
  brewMethodId: z.number(),
  brewTasteScore: z.number(),
  coffeeDose: z.number(),
  grindSize: z.number(),
  brewTime: z.number(),
  brewWeight: z.number(),
  notes: z.string().optional(),
});

export type BrewUpdateRequest = z.infer<typeof BrewUpdateRequestSchema>;
