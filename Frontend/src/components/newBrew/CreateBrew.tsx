import { useQuery } from '@tanstack/react-query';
import { useRef } from 'react';
import { BrewForm } from './BrewForm';
import { getDefaultValues, toBrewRequest } from './brewFormValues';
import { useCreateBrew } from './useCreateBrew';
import { coffeeBagKeys } from '@/api/coffeeBags/coffeeBagKeys';
import { apiClients } from '@/api/apiClients';
import { explodeBeans } from '@/lib/beanExplosion';

interface CreateBrewProps {
  onCancel: () => void;
}

export function CreateBrew({ onCancel }: CreateBrewProps) {
  const submitRef = useRef<HTMLButtonElement>(null);

  const { createBrew, isLoading } = useCreateBrew({
    onSuccess: () => {
      if (submitRef.current !== null) {
        explodeBeans(submitRef.current, { count: 100 });
      }
      onCancel();
    },
  });

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
    brewMethods.find((m) => m.name === 'Espresso') ?? brewMethods[0];

  return (
    <BrewForm
      initialValues={getDefaultValues(initialSelectedMethod)}
      brewMethods={brewMethods}
      coffeeBags={coffeeBags}
      submitLabel="Save Brew"
      cancelLabel="Hide"
      isLoading={isLoading}
      onSubmit={(values) => createBrew(toBrewRequest(values))}
      onCancel={onCancel}
      resetOnSuccess
      submitRef={submitRef}
    />
  );
}
