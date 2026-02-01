import z from 'zod';

export const CoffeeBagRequestSchema = z.object({
  id: z.guid(),
  userId: z.number(),
  roaster: z.string(),
  origin: z.string(),
  roastStyle: z.string(),
  flavourNotes: z.string().optional(),
  opened: z.iso.datetime({ offset: true }).optional(),
  emptied: z.iso.datetime({ offset: true }).optional(),
});

export const BrewRequestSchema = z.object({
  id: z.number(),
  userId: z.number(),
  user: z.object(),
  coffeeBagId: z.number(),
  coffeeBag: CoffeeBagRequestSchema,
  brewType: z.string(),
  coffeeDose: z.number(),
  grindSize: z.number(),
  brewTime: z.number(),
  brewWeight: z.number(),
  brewTasteScore: z.number(),
  brewAddedWeight: z.number().catch(0),
  brewAddedTasteScore: z.number().catch(0),
  notes: z.string().optional(),
  brewedOn: z.iso.datetime({ offset: true }),
});

export type Brew = z.infer<typeof BrewRequestSchema>;
export type CoffeeBag = z.infer<typeof CoffeeBagRequestSchema>;
