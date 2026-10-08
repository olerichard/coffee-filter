import { useMutation, useQueryClient } from '@tanstack/react-query';
import { coffeeBagKeys } from '@/api/coffeeBags/coffeeBagKeys';
import { apiClients } from '@/api/apiClients';
import { CoffeeBagUpdateRequest } from '@/api/coffeeBags/coffeeRequestSchemas';

interface UseUpdateCoffeeBagOptions {
  onSuccess?: () => void;
}

export function useUpdateCoffeeBag({
  onSuccess,
}: UseUpdateCoffeeBagOptions = {}) {
  const queryClient = useQueryClient();

  const updateCoffeeBagMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: CoffeeBagUpdateRequest }) =>
      apiClients.coffeeBag.updateCoffeeBag(id, data),
    onSuccess: async () => {
      // Refetch every bag list so filtering by `emptied` stays server-side
      // truth, e.g. an emptied bag drops out of the create brew dropdown.
      await queryClient.invalidateQueries({ queryKey: coffeeBagKeys.all });
      onSuccess?.();
    },
  });

  return {
    mutate: updateCoffeeBagMutation.mutate,
    isLoading: updateCoffeeBagMutation.isPending,
  };
}
