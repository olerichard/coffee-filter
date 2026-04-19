import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from '@tanstack/react-form';
import { z } from 'zod';
import type { Brew } from '@/api/brews/brewRequestSchemas';
import { BrewCreateRequestSchema } from '@/api/brews/brewRequestSchemas';
import { apiClients } from '@/api/apiClients';

export const BREW_TYPES = ['Espresso'] as const;

export const BrewFormSchema = BrewCreateRequestSchema;

export type BrewFormValues = z.infer<typeof BrewFormSchema>;

interface UseCreateBrewOptions {
  onSuccess: () => void;
}

const defaultValues: BrewFormValues = {
  coffeeBagId: 0,
  brewType: 'Espresso',
  brewTasteScore: 0,
  coffeeDose: 18,
  grindSize: 2,
  brewTime: 27,
  brewWeight: 37,
  notes: '',
};

export function useCreateBrew({ onSuccess }: UseCreateBrewOptions) {
  const queryClient = useQueryClient();

  const form = useForm({
    defaultValues: defaultValues,
    validators: {
      onChange: BrewFormSchema,
      onSubmit: BrewFormSchema,
    },
    onSubmit: ({ value }) => {
      createBrewMutation.mutate(value);
    },
  });

  const createBrewMutation = useMutation({
    mutationFn: (data: BrewFormValues) => apiClients.brew.createBrew(data),
    onSuccess: async (newBrew) => {
      await queryClient.setQueryData(
        ['brews'],
        (old: Array<Brew> | undefined) => [newBrew, ...(old ?? [])],
      );
      form.reset();
      onSuccess();
    },
  });

  return {
    form,
    isLoading: createBrewMutation.isPending,
  };
}
