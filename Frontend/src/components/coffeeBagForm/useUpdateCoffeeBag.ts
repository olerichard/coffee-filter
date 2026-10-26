import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { CoffeeBagUpdateRequest } from '@/api/coffeeBags/coffeeRequestSchemas';
import { coffeeBagKeys } from '@/api/coffeeBags/coffeeBagKeys';
import { apiClients } from '@/api/apiClients';

interface UseUpdateCoffeeBagOptions {
  onSuccess?: () => void;
}

export function useUpdateCoffeeBag({
  onSuccess,
}: UseUpdateCoffeeBagOptions = {}) {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: CoffeeBagUpdateRequest }) =>
      apiClients.coffeeBag.updateCoffeeBag(id, data),
    onSuccess: async () => {
      // Refetch every bag list so filtering by `emptied` stays server-side
      // truth, e.g. an emptied bag drops out of the create brew dropdown.
      // Brews embed bag details, so refresh those too.
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: coffeeBagKeys.all }),
        queryClient.invalidateQueries({ queryKey: ['brews'] }),
      ]);
      onSuccess?.();
    },
  });

  return {
    updateCoffeeBag: mutation.mutateAsync,
    isLoading: mutation.isPending,
  };
}
