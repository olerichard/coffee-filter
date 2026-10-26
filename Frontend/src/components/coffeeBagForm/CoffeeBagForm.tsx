import { useForm } from '@tanstack/react-form';
import { useEffect, useRef, useState } from 'react';
import { CoffeeBagFormSchema, ROAST_STYLES } from './coffeeBagFormValues';
import type { CoffeeBagFormValues } from './coffeeBagFormValues';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Field, FieldDescription, FieldLabel } from '@/components/ui/field';
import { cn } from '@/lib/utils';

const DELETE_CONFIRM_TIMEOUT_MS = 5000;

interface CoffeeBagFormProps {
  initialValues: CoffeeBagFormValues;
  submitLabel: string;
  cancelLabel: string;
  isLoading: boolean;
  onSubmit: (values: CoffeeBagFormValues) => Promise<unknown> | void;
  onCancel: () => void;
  onDelete?: () => void;
  isDeleting?: boolean;
  deleteDisabled?: boolean;
  deleteDisabledReason?: string;
  resetOnSuccess?: boolean;
}

export function CoffeeBagForm({
  initialValues,
  submitLabel,
  cancelLabel,
  isLoading,
  onSubmit,
  onCancel,
  onDelete,
  isDeleting = false,
  deleteDisabled = false,
  deleteDisabledReason,
  resetOnSuccess = false,
}: CoffeeBagFormProps) {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const deleteTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const form = useForm({
    defaultValues: initialValues,
    validators: {
      onChange: CoffeeBagFormSchema,
      onSubmit: CoffeeBagFormSchema,
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

  const handleDeleteClick = () => {
    if (onDelete === undefined || deleteDisabled) {
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
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <form.Field name="roaster">
          {(field) => (
            <Field>
              <FieldLabel htmlFor="roaster">Roaster *</FieldLabel>
              <Input
                aria-invalid={
                  field.state.meta.errors.length > 0 &&
                  field.state.meta.isTouched
                }
                id="roaster"
                value={field.state.value || ''}
                onChange={(e) => field.handleChange(e.currentTarget.value)}
                onBlur={field.handleBlur}
                placeholder="e.g., Onyx Coffee Lab"
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

        <form.Field name="name">
          {(field) => (
            <Field>
              <FieldLabel htmlFor="name">Name</FieldLabel>
              <Input
                aria-invalid={
                  field.state.meta.errors.length > 0 &&
                  field.state.meta.isTouched
                }
                id="name"
                value={field.state.value || ''}
                onChange={(e) => field.handleChange(e.currentTarget.value)}
                onBlur={field.handleBlur}
                placeholder="e.g., Ethiopia Yirgacheffe"
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

        <form.Field name="origin">
          {(field) => (
            <Field>
              <FieldLabel htmlFor="origin">Origin *</FieldLabel>
              <Input
                aria-invalid={
                  field.state.meta.errors.length > 0 &&
                  field.state.meta.isTouched
                }
                id="origin"
                value={field.state.value || ''}
                onChange={(e) => field.handleChange(e.currentTarget.value)}
                onBlur={field.handleBlur}
                placeholder="e.g., Ethiopia"
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

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <form.Field name="roastStyle">
          {(field) => (
            <Field>
              <FieldLabel htmlFor="roastStyle">Roast Style *</FieldLabel>
              <Select
                value={field.state.value || ''}
                onValueChange={field.handleChange}
              >
                <SelectTrigger
                  aria-invalid={
                    field.state.meta.errors.length > 0 &&
                    field.state.meta.isTouched
                  }
                  id="roastStyle"
                >
                  <SelectValue placeholder="Select roast style" />
                </SelectTrigger>
                <SelectContent>
                  {ROAST_STYLES.map((style) => (
                    <SelectItem key={style} value={style}>
                      {style}
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

        <form.Field name="opened">
          {(field) => (
            <Field>
              <FieldLabel htmlFor="opened">Opened</FieldLabel>
              <Input
                type="date"
                id="opened"
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
      </div>

      <form.Field name="flavourNotes">
        {(field) => (
          <Field>
            <FieldLabel htmlFor="flavourNotes">Flavour Notes</FieldLabel>
            <Input
              aria-invalid={
                field.state.meta.errors.length > 0 && field.state.meta.isTouched
              }
              id="flavourNotes"
              value={field.state.value || ''}
              onChange={(e) => field.handleChange(e.currentTarget.value)}
              onBlur={field.handleBlur}
              placeholder="e.g., Blueberry, chocolate, citrus"
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
          <div className="flex flex-col gap-1">
            <Button
              type="button"
              variant={confirmDelete ? 'destructive' : 'ghost'}
              className={cn(!confirmDelete && 'text-destructive')}
              onClick={handleDeleteClick}
              disabled={isBusy || deleteDisabled}
            >
              {isDeleting
                ? 'Deleting...'
                : confirmDelete
                  ? 'Confirm delete'
                  : 'Delete bag'}
            </Button>
            {deleteDisabled && deleteDisabledReason && (
              <span className="text-xs text-muted-foreground">
                {deleteDisabledReason}
              </span>
            )}
          </div>
        )}

        <div className="ml-auto flex gap-2">
          <Button type="submit" disabled={isBusy}>
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
