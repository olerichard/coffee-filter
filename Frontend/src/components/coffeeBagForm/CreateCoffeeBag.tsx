import { CoffeeBagForm } from './CoffeeBagForm';
import { getDefaultValues, toCreateRequest } from './coffeeBagFormValues';
import { useCreateCoffeeBag } from './useCreateCoffeeBag';

interface CreateCoffeeBagProps {
  onCancel: () => void;
}

export function CreateCoffeeBag({ onCancel }: CreateCoffeeBagProps) {
  const { createCoffeeBag, isLoading } = useCreateCoffeeBag({
    onSuccess: onCancel,
  });

  return (
    <CoffeeBagForm
      initialValues={getDefaultValues()}
      submitLabel="Save Coffee Bag"
      cancelLabel="Hide"
      isLoading={isLoading}
      onSubmit={(values) => createCoffeeBag(toCreateRequest(values))}
      onCancel={onCancel}
      resetOnSuccess
    />
  );
}
