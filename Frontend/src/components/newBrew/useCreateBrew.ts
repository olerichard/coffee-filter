import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from '@tanstack/react-form';
import { z } from 'zod';
import type { Brew } from '@/api/brews/brewRequestSchemas';
import { BrewCreateRequestSchema } from '@/api/brews/brewRequestSchemas';
import { apiClients } from '@/api/apiClients';
import type { BrewMethod } from '@/api/brewMethods/brewMethodRequestSchemas';

const BrewFormSchema = BrewCreateRequestSchema;

type BrewFormValues = z.infer<typeof BrewFormSchema>;

export function getDefaultValues(method: BrewMethod): BrewFormValues {
  return {
    coffeeBagId: 0,
    brewMethodId: method.id,
    brewTasteScore: 0,
    coffeeDose: method.dose.default,
    grindSize: method.grindSize.default,
    brewTime: method.brewTime.default,
    brewWeight: method.brewWeight.default,
    notes: '',
  };
}

interface UseCreateBrewOptions {
  initialSelectedMethod: BrewMethod;
  onSuccess: () => void;
}

export function useCreateBrew({
  initialSelectedMethod,
  onSuccess,
}: UseCreateBrewOptions) {
  const queryClient = useQueryClient();

  const form = useForm({
    defaultValues: getDefaultValues(initialSelectedMethod),
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
