import { BREW_TYPES, useCreateBrew } from './useCreateBrew';
import type { CoffeeBag } from '@/api/brews/brewRequestSchemas';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ScoreSelector } from '@/components/brews/ScoreSelector';
import { Field, FieldDescription, FieldLabel } from '@/components/ui/field';

interface CreateBrewFormProps {
  coffeeBags: Array<CoffeeBag>;
  isLoading: boolean;
  onCancel: () => void;
}

export function CreateBrewForm({
  coffeeBags,
  isLoading: parentLoading,
  onCancel,
}: CreateBrewFormProps) {
  const { form, isLoading: mutationLoading } = useCreateBrew();

  const isLoading = parentLoading || mutationLoading;

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        form.handleSubmit();
      }}
      className="flex flex-col gap-4"
    >
      <div className="grid grid-cols-2 gap-4">
        <form.Field name="brewType">
          {(field) => (
            <Field>
              <FieldLabel htmlFor="brewType">Brew Type *</FieldLabel>
              <Select
                disabled
                value={field.state.value}
                onValueChange={field.handleChange}
              >
                <SelectTrigger
                  aria-invalid={
                    field.state.meta.errors.length > 0 &&
                    field.state.meta.isTouched
                  }
                  id="brewType"
                >
                  <SelectValue placeholder="Select brew type" />
                </SelectTrigger>
                <SelectContent>
                  {BREW_TYPES.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
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
              <ScoreSelector
                id="coffeeDose"
                value={field.state.value}
                onChange={field.handleChange}
                max={30}
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
              <ScoreSelector
                id="grindSize"
                value={field.state.value}
                onChange={field.handleChange}
                max={20}
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
              <ScoreSelector
                id="brewTime"
                value={field.state.value}
                onChange={field.handleChange}
                max={40}
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
              <ScoreSelector
                id="brewWeight"
                value={field.state.value}
                onChange={field.handleChange}
                max={50}
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
            <ScoreSelector
              value={field.state.value}
              onChange={field.handleChange}
              max={10}
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
                field.state.meta.errors.length > 0 &&
                field.state.meta.isTouched
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

      <div className="flex gap-2 pt-4">
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Saving...' : 'Save Brew'}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
