import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { Brew, BrewUpdateRequest } from '@/api/brews/brewRequestSchemas';
import { coffeeBagKeys } from '@/api/coffeeBags/coffeeBagKeys';
import { apiClients } from '@/api/apiClients';

interface UseUpdateBrewOptions {
  onSuccess: () => void;
}

export function useUpdateBrew({ onSuccess }: UseUpdateBrewOptions) {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: BrewUpdateRequest }) =>
      apiClients.brew.updateBrew(id, data),
    onSuccess: async (updatedBrew) => {
      await queryClient.setQueryData(
        ['brews'],
        (old: Array<Brew> | undefined) =>
          old?.map((brew) =>
            brew.id === updatedBrew.id ? updatedBrew : brew,
          ) ?? [updatedBrew],
      );
      await queryClient.invalidateQueries({ queryKey: coffeeBagKeys.all });
      onSuccess();
    },
  });

  return {
    updateBrew: mutation.mutateAsync,
    isLoading: mutation.isPending,
  };
}
