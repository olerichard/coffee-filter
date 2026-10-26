import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { CoffeeBagCreateRequest } from '@/api/coffeeBags/coffeeRequestSchemas';
import { coffeeBagKeys } from '@/api/coffeeBags/coffeeBagKeys';
import { apiClients } from '@/api/apiClients';

interface UseCreateCoffeeBagOptions {
  onSuccess: () => void;
}

export function useCreateCoffeeBag({ onSuccess }: UseCreateCoffeeBagOptions) {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (data: CoffeeBagCreateRequest) =>
      apiClients.coffeeBag.createCoffeeBag(data),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: coffeeBagKeys.all });
      onSuccess();
    },
  });

  return {
    createCoffeeBag: mutation.mutateAsync,
    isLoading: mutation.isPending,
  };
}
