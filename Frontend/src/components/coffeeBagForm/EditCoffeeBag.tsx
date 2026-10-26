import { CoffeeBagForm } from './CoffeeBagForm';
import { getEditValues, toUpdateRequest } from './coffeeBagFormValues';
import { useDeleteCoffeeBag } from './useDeleteCoffeeBag';
import { useUpdateCoffeeBag } from './useUpdateCoffeeBag';
import type { CoffeeBagWithUsage } from '@/api/coffeeBags/coffeeRequestSchemas';

interface EditCoffeeBagProps {
  coffeeBag: CoffeeBagWithUsage;
  onCancel: () => void;
}

export function EditCoffeeBag({ coffeeBag, onCancel }: EditCoffeeBagProps) {
  const { updateCoffeeBag, isLoading } = useUpdateCoffeeBag({
    onSuccess: onCancel,
  });
  const { deleteCoffeeBag, isDeleting } = useDeleteCoffeeBag({
    onSuccess: onCancel,
  });

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
