import { useMutation, useQueryClient } from '@tanstack/react-query';
import { coffeeBagKeys } from '@/api/coffeeBags/coffeeBagKeys';
import { apiClients } from '@/api/apiClients';

interface UseDeleteCoffeeBagOptions {
  onSuccess: () => void;
}

export function useDeleteCoffeeBag({ onSuccess }: UseDeleteCoffeeBagOptions) {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (id: number) => apiClients.coffeeBag.deleteCoffeeBag(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: coffeeBagKeys.all });
      onSuccess();
    },
  });

  return {
    deleteCoffeeBag: mutation.mutate,
    isDeleting: mutation.isPending,
  };
}
