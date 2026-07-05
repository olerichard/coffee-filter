import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from '@tanstack/react-form';
import { z } from 'zod';
import type { Brew } from '@/api/brews/brewRequestSchemas';
import { BrewCreateRequestSchema } from '@/api/brews/brewRequestSchemas';
import { apiClients } from '@/api/apiClients';

export const BrewFormSchema = BrewCreateRequestSchema;

export type BrewFormValues = z.infer<typeof BrewFormSchema>;

interface UseCreateBrewOptions {
  onSuccess: () => void;
}

const defaultValues: BrewFormValues = {
  coffeeBagId: 0,
  brewMethodId: 0,
  brewTasteScore: 0,
  coffeeDose: 0,
  grindSize: 0,
  brewTime: 0,
  brewWeight: 0,
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
