import z from 'zod';

export const CoffeeBagResponseSchema = z.object({
  id: z.number(),
  userId: z.number(),
  roaster: z.string(),
  name: z.string().optional(),
  origin: z.string(),
  roastStyle: z.string(),
  flavourNotes: z.string().optional(),
  opened: z.iso.datetime({ offset: true }).optional().nullable(),
  emptied: z.iso.datetime({ offset: true }).optional().nullable(),
});

export type CoffeeBag = z.infer<typeof CoffeeBagResponseSchema>;

export const CoffeeBagCreateRequestSchema = z.object({
  roaster: z.string().min(1).max(100),
  name: z.string().max(100).optional(),
  origin: z.string().min(1).max(100),
  roastStyle: z.string().min(1).max(50),
  flavourNotes: z.string().max(500).optional(),
  opened: z.string().optional(),
});

export type CoffeeBagCreateRequest = z.infer<
  typeof CoffeeBagCreateRequestSchema
>;

export const CoffeeBagUpdateRequestSchema = z.object({
  roaster: z.string().min(1).max(100),
  name: z.string().max(100).optional(),
  origin: z.string().min(1).max(100),
  roastStyle: z.string().min(1).max(50),
  flavourNotes: z.string().max(500).optional(),
  opened: z.string().optional(),
  emptied: z.string().optional(),
});

export type CoffeeBagUpdateRequest = z.infer<
  typeof CoffeeBagUpdateRequestSchema
>;
