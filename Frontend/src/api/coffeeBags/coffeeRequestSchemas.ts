import z from 'zod';

export const CoffeeBagRequestSchema = z.object({
  id: z.number(),
  userId: z.number(),
  roaster: z.string(),
  origin: z.string(),
  roastStyle: z.string(),
  flavourNotes: z.string().optional(),
  opened: z.iso.datetime({ offset: true }).optional(),
  emptied: z.iso.datetime({ offset: true }).optional(),
});

export type CoffeeBag = z.infer<typeof CoffeeBagRequestSchema>;
