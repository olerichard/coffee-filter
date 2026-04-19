import {
  ROAST_STYLES,
  useCreateCoffeeBag,
} from '@/components/coffeeBagForm/useCreateCoffeeBag';
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

interface CreateCoffeeBagFormProps {
  onCancel: () => void;
}

export function CreateCoffeeBagForm({ onCancel }: CreateCoffeeBagFormProps) {
  const { form, isLoading } = useCreateCoffeeBag({
    onSuccess: () => {
      onCancel();
    },
  });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        form.handleSubmit();
      }}
      className="flex flex-col gap-4"
    >
      <div className="grid grid-cols-2 gap-4">
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

      <div className="grid grid-cols-2 gap-4">
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

      <div className="flex justify-end gap-2 pt-4">
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Saving...' : 'Save Coffee Bag'}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          Hide
        </Button>
      </div>
    </form>
  );
}
