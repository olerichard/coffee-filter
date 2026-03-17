import { useNavigate } from '@tanstack/react-router';
import { useForm } from '@tanstack/react-form';
import { useMutation } from '@tanstack/react-query';
import { z } from 'zod';
import { apiClients } from '@/api/apiClients';

export const BREW_TYPES = ['Espresso'] as const;

export const BrewFormSchema = z.object({
  coffeeBagId: z.number().min(1, 'Coffee bag is required'),
  brewType: z.string().min(1, 'Brew type is required'),
  brewTasteScore: z.number().min(1, 'Taste score is required').max(10),
  coffeeDose: z.number().positive('Dose is required'),
  grindSize: z.number().positive('Grind size is required'),
  brewTime: z.number().positive('Brew time is required'),
  brewWeight: z.number().positive('Brew weight is required'),
  notes: z.string().optional(),
});

export type BrewFormValues = z.infer<typeof BrewFormSchema>;

export function useCreateBrew() {
  const navigate = useNavigate();

  const createBrewMutation = useMutation({
    mutationFn: (data: BrewFormValues) => apiClients.brew.createBrew(data),
    onSuccess: () => {
      navigate({ to: '/' });
    },
  });

  const form = useForm({
    defaultValues: {
      coffeeBagId: 0,
      brewType: 'Espresso',
      brewTasteScore: 0,
      coffeeDose: 0,
      grindSize: 0,
      brewTime: 0,
      brewWeight: 0,
      notes: '',
    } as BrewFormValues,
    validators: {
      onChange: BrewFormSchema,
      onSubmit: BrewFormSchema,
    },
    onSubmit: ({ value }) => {
      createBrewMutation.mutate(value);
    },
  });

  return {
    form,
    isLoading: createBrewMutation.isPending,
  };
}
