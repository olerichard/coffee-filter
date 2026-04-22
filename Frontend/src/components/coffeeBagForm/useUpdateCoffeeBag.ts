import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { CoffeeBag } from '@/api/coffeeBags/coffeeRequestSchemas';
import { apiClients } from '@/api/apiClients';

interface UseUpdateCoffeeBagOptions {
  onSuccess?: () => void;
}

export function useUpdateCoffeeBag({ onSuccess }: UseUpdateCoffeeBagOptions = {}) {
  const queryClient = useQueryClient();

  const updateCoffeeBagMutation = useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number;
      data: { emptied?: string; roaster?: string; origin?: string; roastStyle?: string; flavourNotes?: string };
    }) => apiClients.coffeeBag.updateCoffeeBag(id, data),
    onSuccess: async (updatedCoffeeBag, { id }) => {
      await queryClient.setQueryData(
        ['coffeeBags', false],
        (old: Array<CoffeeBag> | undefined) =>
          old?.map((bag) => (bag.id === id ? updatedCoffeeBag : bag)),
      );
      await queryClient.setQueryData(
        ['coffeeBags', true],
        (old: Array<CoffeeBag> | undefined) =>
          old?.map((bag) => (bag.id === id ? updatedCoffeeBag : bag)),
      );
      onSuccess?.();
    },
  });

  return {
    mutate: updateCoffeeBagMutation.mutate,
    isLoading: updateCoffeeBagMutation.isPending,
  };
}