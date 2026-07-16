import { useQuery } from '@tanstack/react-query';
import { apiClients } from '@/api/apiClients';
import { useCreateBrew, getDefaultValues } from './useCreateBrew';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { NumberCarousel } from '@/components/brews/NumberCarousel';
import { StarSelector } from '@/components/ui/StarSelector';
import { Field, FieldDescription, FieldLabel } from '@/components/ui/field';
import type { BrewMethod } from '@/api/brewMethods/brewMethodRequestSchemas';
import type { CoffeeBag } from '@/api/coffeeBags/coffeeRequestSchemas';

const NO_MAX = 999;

interface CreateBrewProps {
  onCancel: () => void;
}

export function CreateBrew({ onCancel }: CreateBrewProps) {
  const brewMethodsQuery = useQuery({
    queryKey: ['brewMethods'],
    queryFn: () => apiClients.brewMethod.getBrewMethods(),
  });

  const brewMethods = brewMethodsQuery.data ?? [];

  const coffeeBagsQuery = useQuery({
    queryKey: ['coffeeBags'],
    queryFn: () => apiClients.coffeeBag.getCoffeeBags(),
  });

  const coffeeBags = coffeeBagsQuery.data ?? [];

  if (brewMethodsQuery.isLoading || coffeeBagsQuery.isLoading) {
    return (
      <div className="flex justify-center py-8">
        <span className="text-muted-foreground">Loading...</span>
      </div>
    );
  }

  const initialSelectedMethod =
    brewMethods.find((m) => m.name === 'Espresso') ?? brewMethods[0];

  return (
    <CreateBrewForm
      initialSelectedMethod={initialSelectedMethod}
      brewMethods={brewMethods}
      coffeeBags={coffeeBags}
      onCancel={onCancel}
    />
  );
}

interface CreateBrewFormInnerProps {
  initialSelectedMethod: BrewMethod;
  brewMethods: BrewMethod[];
  coffeeBags: CoffeeBag[];
  onCancel: () => void;
}

function CreateBrewForm({
  initialSelectedMethod,
  brewMethods,
  coffeeBags,
  onCancel,
}: CreateBrewFormInnerProps) {
  const { form, isLoading } = useCreateBrew({
    initialSelectedMethod,
    onSuccess: onCancel,
  });

  const selectBrewMethod = (method: BrewMethod) => {
    form.reset(getDefaultValues(method));
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        form.handleSubmit();
      }}
      className="flex flex-col gap-4"
    >
      <div className="grid grid-cols-2 gap-4">
        <form.Field name="brewMethod">
          {(field) => (
            <Field>
              <FieldLabel htmlFor="brewMethod">Brew Method *</FieldLabel>
              <Select
                value={field.state.value.id.toString()}
                onValueChange={(value) => {
                  const method = brewMethods.find(
                    (m) => m.id === parseInt(value),
                  );
                  if (method) selectBrewMethod(method);
                }}
              >
                <SelectTrigger
                  aria-invalid={
                    field.state.meta.errors.length > 0 &&
                    field.state.meta.isTouched
                  }
                  id="brewMethod"
                >
                  <SelectValue placeholder="Select brew method" />
                </SelectTrigger>
                <SelectContent>
                  {brewMethods.map((method) => (
                    <SelectItem key={method.id} value={method.id.toString()}>
                      {method.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {field.state.meta.errors.length > 0 &&
                field.state.meta.isTouched && (
                  <FieldDescription>
                    {field.state.meta.errors[0]?.message}
                  </FieldDescription>
                )}
            </Field>
          )}
        </form.Field>

        <form.Field name="coffeeBagId">
          {(field) => (
            <Field>
              <FieldLabel htmlFor="coffeeBagId">Coffee Bag *</FieldLabel>
              <Select
                value={
                  field.state.value !== 0 ? field.state.value.toString() : ''
                }
                onValueChange={(value) => field.handleChange(parseInt(value))}
              >
                <SelectTrigger
                  aria-invalid={
                    field.state.meta.errors.length > 0 &&
                    field.state.meta.isTouched
                  }
                  id="coffeeBagId"
                >
                  <SelectValue placeholder="Select a coffee bag" />
                </SelectTrigger>
                <SelectContent>
                  {coffeeBags.map((bag) => (
                    <SelectItem key={bag.id} value={bag.id.toString()}>
                      {bag.roaster} - {bag.origin}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {field.state.meta.errors.length > 0 &&
                field.state.meta.isTouched && (
                  <FieldDescription>
                    {field.state.meta.errors[0]?.message}
                  </FieldDescription>
                )}
            </Field>
          )}
        </form.Field>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <form.Subscribe
          selector={(state) => state.values.brewMethod}
        >
          {(brewMethod) => (
            <form.Field name="coffeeDose">
              {(field) => (
                <Field>
                  <FieldLabel htmlFor="coffeeDose">Dose (g)</FieldLabel>
                  <NumberCarousel
                    id="coffeeDose"
                    value={field.state.value}
                    onChange={field.handleChange}
                    min={brewMethod.dose.min}
                    max={
                      brewMethod.dose.max === 0
                        ? NO_MAX
                        : brewMethod.dose.max
                    }
                    allowDecimal
                  />
                  {field.state.meta.errors.length > 0 &&
                    field.state.meta.isTouched && (
                      <FieldDescription>
                        {field.state.meta.errors[0]?.message}
                      </FieldDescription>
                    )}
                </Field>
              )}
            </form.Field>
          )}
        </form.Subscribe>

        <form.Subscribe
          selector={(state) => state.values.brewMethod}
        >
          {(brewMethod) => (
            <form.Field name="grindSize">
              {(field) => (
                <Field>
                  <FieldLabel htmlFor="grindSize">Grind Size *</FieldLabel>
                  <NumberCarousel
                    id="grindSize"
                    allowDecimal
                    value={field.state.value}
                    onChange={field.handleChange}
                    min={brewMethod.grindSize.min}
                    max={
                      brewMethod.grindSize.max === 0
                        ? NO_MAX
                        : brewMethod.grindSize.max
                    }
                  />
                  {field.state.meta.errors.length > 0 &&
                    field.state.meta.isTouched && (
                      <FieldDescription>
                        {field.state.meta.errors[0]?.message}
                      </FieldDescription>
                    )}
                </Field>
              )}
            </form.Field>
          )}
        </form.Subscribe>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <form.Subscribe
          selector={(state) => state.values.brewMethod}
        >
          {(brewMethod) => (
            <form.Field name="brewTime">
              {(field) => (
                <Field>
                  <FieldLabel htmlFor="brewTime">Brew Time (s) *</FieldLabel>
                  <NumberCarousel
                    id="brewTime"
                    value={field.state.value}
                    onChange={field.handleChange}
                    min={brewMethod.brewTime.min}
                    max={
                      brewMethod.brewTime.max === 0
                        ? NO_MAX
                        : brewMethod.brewTime.max
                    }
                  />
                  {field.state.meta.errors.length > 0 &&
                    field.state.meta.isTouched && (
                      <FieldDescription>
                        {field.state.meta.errors[0]?.message}
                      </FieldDescription>
                    )}
                </Field>
              )}
            </form.Field>
          )}
        </form.Subscribe>

        <form.Subscribe
          selector={(state) => state.values.brewMethod}
        >
          {(brewMethod) => (
            <form.Field name="brewWeight">
              {(field) => (
                <Field>
                  <FieldLabel htmlFor="brewWeight">Brew Weight (g)</FieldLabel>
                  <NumberCarousel
                    id="brewWeight"
                    value={field.state.value}
                    onChange={field.handleChange}
                    min={brewMethod.brewWeight.min}
                    max={
                      brewMethod.brewWeight.max === 0
                        ? NO_MAX
                        : brewMethod.brewWeight.max
                    }
                  />
                  {field.state.meta.errors.length > 0 &&
                    field.state.meta.isTouched && (
                      <FieldDescription>
                        {field.state.meta.errors[0]?.message}
                      </FieldDescription>
                    )}
                </Field>
              )}
            </form.Field>
          )}
        </form.Subscribe>
      </div>

      <form.Field name="brewTasteScore">
        {(field) => (
          <Field>
            <FieldLabel htmlFor="brewTasteScore">Taste Score *</FieldLabel>
            <StarSelector
              value={field.state.value ?? 0}
              onChange={field.handleChange}
            />
            {field.state.meta.errors.length > 0 &&
              field.state.meta.isTouched && (
                <FieldDescription>
                  {field.state.meta.errors[0]?.message}
                </FieldDescription>
              )}
          </Field>
        )}
      </form.Field>

      <form.Field name="notes">
        {(field) => (
          <Field>
            <FieldLabel htmlFor="notes">Notes</FieldLabel>
            <Input
              aria-invalid={
                field.state.meta.errors.length > 0 && field.state.meta.isTouched
              }
              id="notes"
              value={field.state.value || ''}
              onChange={(e) => field.handleChange(e.currentTarget.value)}
              onBlur={field.handleBlur}
            />
            {field.state.meta.errors.length > 0 &&
              field.state.meta.isTouched && (
                <FieldDescription>
                  {field.state.meta.errors[0]?.message}
                </FieldDescription>
              )}
          </Field>
        )}
      </form.Field>

      <div className="flex justify-end gap-2 pt-4">
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Saving...' : 'Save Brew'}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          Hide
        </Button>
      </div>
    </form>
  );
}
