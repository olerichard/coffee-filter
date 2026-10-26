import { useForm } from '@tanstack/react-form';
import { useEffect, useRef, useState } from 'react';
import { BrewFormSchema, getDefaultValues } from './brewFormValues';
import type { Ref } from 'react';
import type { BrewFormValues } from './brewFormValues';
import type { BrewMethod } from '@/api/brewMethods/brewMethodRequestSchemas';
import type { CoffeeBag } from '@/api/coffeeBags/coffeeRequestSchemas';
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
import { cn } from '@/lib/utils';

const NO_MAX = 999;
const DELETE_CONFIRM_TIMEOUT_MS = 5000;

interface BrewFormProps {
  initialValues: BrewFormValues;
  brewMethods: Array<BrewMethod>;
  coffeeBags: Array<CoffeeBag>;
  submitLabel: string;
  cancelLabel: string;
  isLoading: boolean;
  onSubmit: (values: BrewFormValues) => Promise<unknown> | void;
  onCancel: () => void;
  onDelete?: () => void;
  isDeleting?: boolean;
  resetOnSuccess?: boolean;
  submitRef?: Ref<HTMLButtonElement>;
}

export function BrewForm({
  initialValues,
  brewMethods,
  coffeeBags,
  submitLabel,
  cancelLabel,
  isLoading,
  onSubmit,
  onCancel,
  onDelete,
  isDeleting = false,
  resetOnSuccess = false,
  submitRef,
}: BrewFormProps) {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const deleteTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const form = useForm({
    defaultValues: initialValues,
    validators: {
      onChange: BrewFormSchema,
      onSubmit: BrewFormSchema,
    },
    onSubmit: async ({ value }) => {
      await onSubmit(value);
      if (resetOnSuccess) {
        form.reset();
      }
    },
  });

  useEffect(() => {
    return () => {
      if (deleteTimeoutRef.current !== null) {
        clearTimeout(deleteTimeoutRef.current);
      }
    };
  }, []);

  const selectBrewMethod = (method: BrewMethod) => {
    form.reset(getDefaultValues(method));
  };

  const handleDeleteClick = () => {
    if (onDelete === undefined) {
      return;
    }

    if (!confirmDelete) {
      setConfirmDelete(true);
      if (deleteTimeoutRef.current !== null) {
        clearTimeout(deleteTimeoutRef.current);
      }
      deleteTimeoutRef.current = setTimeout(() => {
        setConfirmDelete(false);
      }, DELETE_CONFIRM_TIMEOUT_MS);
      return;
    }

    if (deleteTimeoutRef.current !== null) {
      clearTimeout(deleteTimeoutRef.current);
    }
    setConfirmDelete(false);
    onDelete();
  };

  const isBusy = isLoading || isDeleting;

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
          {(field) => {
            const isBagAvailable = coffeeBags.some(
              (bag) => bag.id === field.state.value,
            );

            return (
              <Field>
                <FieldLabel htmlFor="coffeeBagId">Coffee Bag *</FieldLabel>
                <Select
                  value={isBagAvailable ? field.state.value.toString() : ''}
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
            );
          }}
        </form.Field>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <form.Subscribe selector={(state) => state.values.brewMethod}>
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
                      brewMethod.dose.max === 0 ? NO_MAX : brewMethod.dose.max
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

        <form.Subscribe selector={(state) => state.values.brewMethod}>
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
        <form.Subscribe selector={(state) => state.values.brewMethod}>
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

        <form.Subscribe selector={(state) => state.values.brewMethod}>
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
              value={field.state.value}
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

      <div className="flex flex-wrap items-center gap-2 pt-4">
        {onDelete !== undefined && (
          <Button
            type="button"
            variant={confirmDelete ? 'destructive' : 'ghost'}
            className={cn(!confirmDelete && 'text-destructive')}
            onClick={handleDeleteClick}
            disabled={isBusy}
          >
            {isDeleting
              ? 'Deleting...'
              : confirmDelete
                ? 'Confirm delete'
                : 'Delete brew'}
          </Button>
        )}

        <div className="ml-auto flex gap-2">
          <Button type="submit" ref={submitRef} disabled={isBusy}>
            {isLoading ? 'Saving...' : submitLabel}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isDeleting}
          >
            {cancelLabel}
          </Button>
        </div>
      </div>
    </form>
  );
}
