import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from '@tanstack/react-form';
import { z } from 'zod';
import type { CoffeeBag } from '@/api/coffeeBags/coffeeRequestSchemas';
import { CoffeeBagCreateRequestSchema } from '@/api/coffeeBags/coffeeRequestSchemas';
import { apiClients } from '@/api/apiClients';

export const ROAST_STYLES = [
  'Light',
  'Light-Medium',
  'Medium',
  'Medium-Dark',
  'Dark',
] as const;

export const CoffeeBagFormSchema = CoffeeBagCreateRequestSchema;

export type CoffeeBagFormValues = z.infer<typeof CoffeeBagFormSchema>;

interface UseCreateCoffeeBagOptions {
  onSuccess: () => void;
}

const defaultValues: CoffeeBagFormValues = {
  roaster: '',
  origin: '',
  roastStyle: '',
  flavourNotes: '',
  opened: '',
};

export function useCreateCoffeeBag({ onSuccess }: UseCreateCoffeeBagOptions) {
  const queryClient = useQueryClient();

  const form = useForm({
    defaultValues: defaultValues,
    validators: {
      onChange: CoffeeBagFormSchema,
      onSubmit: CoffeeBagFormSchema,
    },
    onSubmit: ({ value }) => {
      createCoffeeBagMutation.mutate(value);
    },
  });

  const createCoffeeBagMutation = useMutation({
    mutationFn: (data: CoffeeBagFormValues) =>
      apiClients.coffeeBag.createCoffeeBag(data),
    onSuccess: async (newCoffeeBag) => {
      await queryClient.setQueryData(
        ['coffeeBags'],
        (old: Array<CoffeeBag> | undefined) => [newCoffeeBag, ...(old ?? [])],
      );
      form.reset();
      onSuccess();
    },
  });

  return {
    form,
    isLoading: createCoffeeBagMutation.isPending,
  };
}
