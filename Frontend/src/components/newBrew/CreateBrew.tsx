import { useQuery } from '@tanstack/react-query';
import { useCallback, useMemo, useRef } from 'react';
import { BrewForm } from './BrewForm';
import { getDefaultValues, toBrewRequest } from './brewFormValues';
import { clearBrewDraft, readBrewDraft, writeBrewDraft } from './brewDraft';
import { useCreateBrew } from './useCreateBrew';
import type { BrewFormValues } from './brewFormValues';
import type { Brew } from '@/api/brews/brewRequestSchemas';
import { coffeeBagKeys } from '@/api/coffeeBags/coffeeBagKeys';
import { apiClients } from '@/api/apiClients';
import { useAuth } from '@/components/context/authentication/AuthenticationContext';
import { Button } from '@/components/ui/button';
import { explodeBeans } from '@/lib/beanExplosion';

interface CreateBrewProps {
  onCancel: () => void;
  onCreateBag: () => void;
}

export function CreateBrew({ onCancel, onCreateBag }: CreateBrewProps) {
  const submitRef = useRef<HTMLButtonElement>(null);
  const userId = useAuth().user?.id ?? 0;

  // Read once per user: the draft should survive remounts while the user is
  // moving between the brew and bag forms.
  const draft = useMemo(() => readBrewDraft(userId), [userId]);

  const handleDraftChange = useCallback(
    (values: BrewFormValues) => {
      writeBrewDraft(userId, values);
    },
    [userId],
  );

  const handleDraftReset = useCallback(() => {
    clearBrewDraft(userId);
  }, [userId]);

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

  const brewsQuery = useQuery({
    queryKey: ['brews'],
    queryFn: () => apiClients.brew.getBrews(),
  });

  // Brews are returned newest-first, so the first entry per bag is the most
  // recent brew to prefill from.
  const previousBrews = useMemo(() => {
    const map = new Map<number, Brew>();
    for (const brew of brewsQuery.data ?? []) {
      if (!map.has(brew.coffeeBagId)) {
        map.set(brew.coffeeBagId, brew);
      }
    }
    return map;
  }, [brewsQuery.data]);

  if (
    brewMethodsQuery.isLoading ||
    coffeeBagsQuery.isLoading ||
    brewsQuery.isLoading
  ) {
    return (
      <div className="flex justify-center py-8">
        <span className="text-muted-foreground">Loading...</span>
      </div>
    );
  }

  if (
    brewMethodsQuery.isError ||
    coffeeBagsQuery.isError ||
    brewMethodsQuery.data === undefined
  ) {
    return (
      <div className="flex flex-col items-center gap-3 py-8">
        <span className="text-destructive">Could not load the brew form.</span>
        <Button type="button" variant="outline" onClick={onCancel}>
          Close
        </Button>
      </div>
    );
  }

  const brewMethods = brewMethodsQuery.data;
  const coffeeBags = coffeeBagsQuery.data ?? [];

  if (brewMethods.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 py-8">
        <span className="text-destructive">No brew methods are available.</span>
        <Button type="button" variant="outline" onClick={onCancel}>
          Close
        </Button>
      </div>
    );
  }

  const initialSelectedMethod =
    brewMethods.find((m) => m.name === 'Espresso') ?? brewMethods[0];

  // Use the saved draft only if its brew method still exists; otherwise the
  // ranges and defaults would not match the current data.
  const draftMethod =
    draft === null
      ? undefined
      : brewMethods.find((method) => method.id === draft.brewMethod.id);

  const initialValues =
    draft !== null && draftMethod !== undefined
      ? { ...draft, brewMethod: draftMethod }
      : getDefaultValues(initialSelectedMethod);

  return (
    <BrewForm
      initialValues={initialValues}
      brewMethods={brewMethods}
      coffeeBags={coffeeBags}
      previousBrews={previousBrews}
      submitLabel="Save Brew"
      cancelLabel="Hide"
      isLoading={isLoading}
      onSubmit={(values) => createBrew(toBrewRequest(values))}
      onCancel={onCancel}
      onCreateBag={onCreateBag}
      onDraftChange={handleDraftChange}
      onDraftReset={handleDraftReset}
      resetOnSuccess
      submitRef={submitRef}
    />
  );
}
