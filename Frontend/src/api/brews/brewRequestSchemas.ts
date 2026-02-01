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
  user: z.object().optional(),
  coffeeBagId: z.number(),
  coffeeBag: CoffeeBagRequestSchema.optional(),
  brewType: z.string(),
  coffeeDose: z.number().optional(),
  grindSize: z.number().optional(),
  BrewTime: z.number().optional(),
  BrewWeight: z.number().optional(),
  BrewTasteScore: z.number().optional(),
  BrewAddedWeight: z.number().optional(),
  BrewAddedTasteScore: z.number().optional(),
  notes: z.string().optional(),
});
