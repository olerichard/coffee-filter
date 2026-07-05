import { useEffect, useMemo } from 'react';
import { useCreateBrew } from './useCreateBrew';
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
import { useQuery } from '@tanstack/react-query';
import { apiClients } from '@/api/apiClients';
import type { BrewMethod } from '@/api/brewMethods/brewMethodRequestSchemas';

const NO_MAX = 999;

interface CreateBrewFormProps {
  onCancel: () => void;
}

export function CreateBrewForm({ onCancel }: CreateBrewFormProps) {
  const { form, isLoading: mutationLoading } = useCreateBrew({
    onSuccess: () => {
      onCancel();
    },
  });

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

  const selectedMethod = useMemo(
    () => brewMethods.find((m) => m.id === form.state.values.brewMethodId),
    [brewMethods, form.state.values.brewMethodId],
  );

  const selectBrewMethod = (method: BrewMethod) => {
    form.setFieldValue('brewMethodId', method.id);
    form.setFieldValue('coffeeDose', method.dose.default);
    form.setFieldValue('grindSize', method.grindSize.default);
    form.setFieldValue('brewTime', method.brewTime.default);
    form.setFieldValue('brewWeight', method.brewWeight.default);
  };

  useEffect(() => {
    if (brewMethods.length > 0 && form.state.values.brewMethodId === 0) {
      const espresso = brewMethods.find((m) => m.name === 'Espresso');
      const defaultMethod = espresso ?? brewMethods[0];
      selectBrewMethod(defaultMethod);
    }
  }, [brewMethods]);

  return (
    <form
      key={selectedMethod?.name ?? 'unknown'}
      onSubmit={(e) => {
        e.preventDefault();
        form.handleSubmit();
      }}
      className="flex flex-col gap-4"
    >
      <div className="grid grid-cols-2 gap-4">
        <form.Field name="brewMethodId">
          {(field) => (
            <Field>
              <FieldLabel htmlFor="brewMethodId">Brew Method *</FieldLabel>
              <Select
                value={
                  field.state.value !== 0 ? field.state.value.toString() : ''
                }
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
                  id="brewMethodId"
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
        <form.Field name="coffeeDose">
          {(field) => (
            <Field>
              <FieldLabel htmlFor="coffeeDose">Dose (g)</FieldLabel>
              <NumberCarousel
                id="coffeeDose"
                value={field.state.value}
                onChange={field.handleChange}
                min={selectedMethod?.dose.min ?? 1}
                max={
                  selectedMethod?.dose.max === 0
                    ? NO_MAX
                    : (selectedMethod?.dose.max ?? 30)
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

        <form.Field name="grindSize">
          {(field) => (
            <Field>
              <FieldLabel htmlFor="grindSize">Grind Size *</FieldLabel>
              <NumberCarousel
                id="grindSize"
                allowDecimal
                value={field.state.value}
                onChange={field.handleChange}
                min={selectedMethod?.grindSize.min ?? 0.5}
                max={
                  selectedMethod?.grindSize.max === 0
                    ? NO_MAX
                    : (selectedMethod?.grindSize.max ?? 20)
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
      </div>

      <div className="grid grid-cols-2 gap-4">
        <form.Field name="brewTime">
          {(field) => (
            <Field>
              <FieldLabel htmlFor="brewTime">Brew Time (s) *</FieldLabel>
              <NumberCarousel
                id="brewTime"
                value={field.state.value}
                onChange={field.handleChange}
                min={selectedMethod?.brewTime.min ?? 1}
                max={
                  selectedMethod?.brewTime.max === 0
                    ? NO_MAX
                    : (selectedMethod?.brewTime.max ?? 40)
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

        <form.Field name="brewWeight">
          {(field) => (
            <Field>
              <FieldLabel htmlFor="brewWeight">Brew Weight (g)</FieldLabel>
              <NumberCarousel
                id="brewWeight"
                value={field.state.value}
                onChange={field.handleChange}
                min={selectedMethod?.brewWeight.min ?? 1}
                max={
                  selectedMethod?.brewWeight.max === 0
                    ? NO_MAX
                    : (selectedMethod?.brewWeight.max ?? 50)
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
        <Button type="submit" disabled={mutationLoading}>
          {mutationLoading ? 'Saving...' : 'Save Brew'}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          Hide
        </Button>
      </div>
    </form>
  );
}
