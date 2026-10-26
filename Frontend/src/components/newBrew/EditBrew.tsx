import { useQuery } from '@tanstack/react-query';
import { BrewForm } from './BrewForm';
import { getEditValues, toBrewRequest } from './brewFormValues';
import { useDeleteBrew } from './useDeleteBrew';
import { useUpdateBrew } from './useUpdateBrew';
import type { Brew } from '@/api/brews/brewRequestSchemas';
import { apiClients } from '@/api/apiClients';
import { coffeeBagKeys } from '@/api/coffeeBags/coffeeBagKeys';

interface EditBrewProps {
  brew: Brew;
  onCancel: () => void;
}

export function EditBrew({ brew, onCancel }: EditBrewProps) {
  const { updateBrew, isLoading } = useUpdateBrew({ onSuccess: onCancel });
  const { deleteBrew, isDeleting } = useDeleteBrew({ onSuccess: onCancel });

  const brewMethodsQuery = useQuery({
    queryKey: ['brewMethods'],
    queryFn: () => apiClients.brewMethod.getBrewMethods(),
  });

  const coffeeBagsQuery = useQuery({
    queryKey: coffeeBagKeys.list(false),
    queryFn: () => apiClients.coffeeBag.getCoffeeBags(),
  });

  if (brewMethodsQuery.isLoading || coffeeBagsQuery.isLoading) {
    return (
      <div className="flex justify-center py-8">
        <span className="text-muted-foreground">Loading...</span>
      </div>
    );
  }

  const brewMethods = brewMethodsQuery.data ?? [];
  const coffeeBags = coffeeBagsQuery.data ?? [];

  const initialSelectedMethod =
    brewMethods.find((m) => m.id === brew.brewMethodId) ??
    brewMethods.find((m) => m.name === 'Espresso') ??
    brewMethods[0];

  const coffeeBagOptions = coffeeBags.some((bag) => bag.id === brew.coffeeBagId)
    ? coffeeBags
    : [...coffeeBags, brew.coffeeBag];

  return (
    <BrewForm
      initialValues={getEditValues(brew, initialSelectedMethod)}
      brewMethods={brewMethods}
      coffeeBags={coffeeBagOptions}
      submitLabel="Save Changes"
      cancelLabel="Cancel"
      isLoading={isLoading}
      isDeleting={isDeleting}
      onSubmit={(values) =>
        updateBrew({ id: brew.id, data: toBrewRequest(values) })
      }
      onDelete={() => deleteBrew(brew.id)}
      onCancel={onCancel}
    />
  );
}
