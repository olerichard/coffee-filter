import z from 'zod';

export const BrewMethodSettingSchema = z.object({
  min: z.number(),
  max: z.number(),
  default: z.number(),
});

export type BrewMethodSetting = z.infer<typeof BrewMethodSettingSchema>;

export const BrewMethodResponseSchema = z.object({
  id: z.number(),
  name: z.string(),
  dose: BrewMethodSettingSchema,
  grindSize: BrewMethodSettingSchema,
  brewTime: BrewMethodSettingSchema,
  brewWeight: BrewMethodSettingSchema,
});

export type BrewMethod = z.infer<typeof BrewMethodResponseSchema>;
