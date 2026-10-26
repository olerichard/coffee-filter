import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { Brew, BrewCreateRequest } from '@/api/brews/brewRequestSchemas';
import { coffeeBagKeys } from '@/api/coffeeBags/coffeeBagKeys';
import { apiClients } from '@/api/apiClients';

interface UseCreateBrewOptions {
  onSuccess: () => void;
}

export function useCreateBrew({ onSuccess }: UseCreateBrewOptions) {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (data: BrewCreateRequest) => apiClients.brew.createBrew(data),
    onSuccess: async (newBrew) => {
      await queryClient.setQueryData(
        ['brews'],
        (old: Array<Brew> | undefined) => [newBrew, ...(old ?? [])],
      );
      await queryClient.invalidateQueries({ queryKey: coffeeBagKeys.all });
      onSuccess();
    },
  });

  return {
    createBrew: mutation.mutateAsync,
    isLoading: mutation.isPending,
  };
}
