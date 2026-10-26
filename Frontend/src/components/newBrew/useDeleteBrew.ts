import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { Brew } from '@/api/brews/brewRequestSchemas';
import { coffeeBagKeys } from '@/api/coffeeBags/coffeeBagKeys';
import { apiClients } from '@/api/apiClients';

interface UseDeleteBrewOptions {
  onSuccess: () => void;
}

export function useDeleteBrew({ onSuccess }: UseDeleteBrewOptions) {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (id: number) => apiClients.brew.deleteBrew(id),
    onSuccess: async (_, id) => {
      await queryClient.setQueryData(
        ['brews'],
        (old: Array<Brew> | undefined) =>
          old?.filter((brew) => brew.id !== id) ?? [],
      );
      queryClient.removeQueries({ queryKey: ['brews', id] });
      await queryClient.invalidateQueries({ queryKey: coffeeBagKeys.all });
      onSuccess();
    },
  });

  return {
    deleteBrew: mutation.mutate,
    isDeleting: mutation.isPending,
  };
}
