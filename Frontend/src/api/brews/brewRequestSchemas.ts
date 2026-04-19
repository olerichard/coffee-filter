import z from 'zod';
import { CoffeeBagResponseSchema } from '../coffeeBags/coffeeRequestSchemas';

export const BrewResponseSchema = z.object({
  id: z.number(),
  coffeeBagId: z.number(),
  coffeeBag: CoffeeBagResponseSchema,
  brewType: z.string(),
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
  coffeeBagId: z.number().min(1, 'Coffee bag is required'),
  brewType: z.string().min(1, 'Brew type is required'),
  brewTasteScore: z.number().max(5),
  coffeeDose: z.number().positive('Dose is required'),
  grindSize: z.number().positive('Grind size is required'),
  brewTime: z.number().positive('Brew time is required'),
  brewWeight: z.number().positive('Brew weight is required'),
  notes: z.string().optional(),
});

export type BrewCreateRequest = z.infer<typeof BrewCreateRequestSchema>;

export const BrewUpdateRequestSchema = z.object({
  coffeeBagId: z.number().min(1, 'Coffee bag is required'),
  brewType: z.string().min(1, 'Brew type is required'),
  brewTasteScore: z.number().max(5),
  coffeeDose: z.number().positive('Dose is required'),
  grindSize: z.number().positive('Grind size is required'),
  brewTime: z.number().positive('Brew time is required'),
  brewWeight: z.number().positive('Brew weight is required'),
  notes: z.string().optional(),
});

export type BrewUpdateRequest = z.infer<typeof BrewUpdateRequestSchema>;
