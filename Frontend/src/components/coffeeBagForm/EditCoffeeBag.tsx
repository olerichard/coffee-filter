import { useQuery, useQueryClient } from '@tanstack/react-query';
import { CoffeeBagForm } from './CoffeeBagForm';
import { getEditValues, toUpdateRequest } from './coffeeBagFormValues';
import { useDeleteCoffeeBag } from './useDeleteCoffeeBag';
import { useUpdateCoffeeBag } from './useUpdateCoffeeBag';
import type { CoffeeBagWithUsage } from '@/api/coffeeBags/coffeeRequestSchemas';
import { apiClients } from '@/api/apiClients';
import { coffeeBagKeys } from '@/api/coffeeBags/coffeeBagKeys';
import { Button } from '@/components/ui/button';

interface EditCoffeeBagProps {
  coffeeBagId: number;
  onCancel: () => void;
}

export function EditCoffeeBag({ coffeeBagId, onCancel }: EditCoffeeBagProps) {
  const queryClient = useQueryClient();
  const { updateCoffeeBag, isLoading } = useUpdateCoffeeBag({
    onSuccess: onCancel,
  });
  const { deleteCoffeeBag, isDeleting } = useDeleteCoffeeBag({
    onSuccess: onCancel,
  });

  const cachedCoffeeBag = [false, true]
    .map((includeEmpty) =>
      queryClient.getQueryData<Array<CoffeeBagWithUsage>>(
        coffeeBagKeys.list(includeEmpty),
      ),
    )
    .flatMap((coffeeBags) => coffeeBags ?? [])
    .find((coffeeBag) => coffeeBag.id === coffeeBagId);

  const coffeeBagQuery = useQuery({
    queryKey: coffeeBagKeys.detail(coffeeBagId),
    queryFn: () => apiClients.coffeeBag.getCoffeeBagById(coffeeBagId),
    initialData: cachedCoffeeBag,
  });

  if (coffeeBagQuery.isLoading) {
    return (
      <div className="flex justify-center py-8">
        <span className="text-muted-foreground">Loading...</span>
      </div>
    );
  }

  const coffeeBag = coffeeBagQuery.data;

  if (coffeeBag === undefined) {
    return (
      <div className="flex flex-col items-center gap-3 py-8">
        <span className="text-destructive">
          Could not load this coffee bag.
        </span>
        <Button type="button" variant="outline" onClick={onCancel}>
          Close
        </Button>
      </div>
    );
  }

  const hasBrews = coffeeBag.brewCount > 0;
  const deleteDisabledReason = hasBrews
    ? coffeeBag.brewCount === 1
      ? 'Used in 1 brew. Delete that brew first.'
      : `Used in ${coffeeBag.brewCount} brews. Delete those brews first.`
    : undefined;

  return (
    <CoffeeBagForm
      initialValues={getEditValues(coffeeBag)}
      submitLabel="Save Changes"
      cancelLabel="Cancel"
      isLoading={isLoading}
      isDeleting={isDeleting}
      onSubmit={(values) =>
        updateCoffeeBag({
          id: coffeeBag.id,
          data: toUpdateRequest(values),
        })
      }
      onDelete={() => deleteCoffeeBag(coffeeBag.id)}
      deleteDisabled={hasBrews}
      deleteDisabledReason={deleteDisabledReason}
      onCancel={onCancel}
    />
  );
}
