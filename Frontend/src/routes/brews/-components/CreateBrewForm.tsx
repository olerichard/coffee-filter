import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ScoreSelector } from '@/components/brews/ScoreSelector';
import { useCreateBrew, BREW_TYPES } from './useCreateBrew';
import type { CoffeeBag } from '@/api/brews/brewRequestSchemas';

interface CreateBrewFormProps {
  coffeeBags: CoffeeBag[];
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
      <form.Field name="coffeeBagId">
        {(field) => (
          <div className="flex flex-col gap-2">
            <Label htmlFor="coffeeBag">Coffee Bag *</Label>
            <Select
              value={
                field.state.value !== 0 ? field.state.value.toString() : ''
              }
              onValueChange={(value) => field.handleChange(parseInt(value))}
            >
              <SelectTrigger id="coffeeBag">
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
                <p className="text-sm text-red-500">
                  {field.state.meta.errors[0]?.message}
                </p>
              )}
          </div>
        )}
      </form.Field>

      <form.Field name="brewType">
        {(field) => (
          <div className="flex flex-col gap-2">
            <Label htmlFor="brewType">Brew Type *</Label>
            <Select
              value={field.state.value}
              onValueChange={field.handleChange}
            >
              <SelectTrigger id="brewType">
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
                <p className="text-sm text-red-500">
                  {field.state.meta.errors[0]?.message}
                </p>
              )}
          </div>
        )}
      </form.Field>

      <form.Field name="brewTasteScore">
        {(field) => (
          <div className="flex flex-col gap-2 ">
            <Label htmlFor="brewTasteScore">Taste Score *</Label>
            <ScoreSelector
              value={field.state.value}
              onChange={field.handleChange}
              max={10}
            />
            {field.state.meta.errors.length > 0 &&
              field.state.meta.isTouched && (
                <p className="text-sm text-red-500">
                  {field.state.meta.errors[0]?.message}
                </p>
              )}
          </div>
        )}
      </form.Field>

      <div className="grid grid-cols-3 gap-4">
        <form.Field name="coffeeDose">
          {(field) => (
            <div className="flex flex-col gap-2">
              <Label htmlFor="coffeeDose">Dose (g) *</Label>
              <Input
                id="coffeeDose"
                type="number"
                step="0.1"
                value={field.state.value || ''}
                onChange={(e) =>
                  field.handleChange(parseFloat(e.target.value) || 0)
                }
                onBlur={field.handleBlur}
              />
              {field.state.meta.errors.length > 0 &&
                field.state.meta.isTouched && (
                  <p className="text-sm text-red-500">
                    {field.state.meta.errors[0]?.message}
                  </p>
                )}
            </div>
          )}
        </form.Field>

        <form.Field name="grindSize">
          {(field) => (
            <div className="flex flex-col gap-2">
              <Label htmlFor="grindSize">Grind Size *</Label>
              <Input
                id="grindSize"
                type="number"
                step="0.1"
                value={field.state.value || ''}
                onChange={(e) =>
                  field.handleChange(parseFloat(e.target.value) || 0)
                }
                onBlur={field.handleBlur}
              />
              {field.state.meta.errors.length > 0 &&
                field.state.meta.isBlurred && (
                  <p className="text-sm text-red-500">
                    {field.state.meta.errors[0]?.message}
                  </p>
                )}
            </div>
          )}
        </form.Field>

        <form.Field name="brewTime">
          {(field) => (
            <div className="flex flex-col gap-2">
              <Label htmlFor="brewTime">Brew Time (s) *</Label>
              <Input
                id="brewTime"
                type="number"
                step="1"
                value={field.state.value || ''}
                onChange={(e) =>
                  field.handleChange(parseInt(e.target.value) || 0)
                }
                onBlur={field.handleBlur}
              />
              {field.state.meta.errors.length > 0 &&
                field.state.meta.isTouched && (
                  <p className="text-sm text-red-500">
                    {field.state.meta.errors[0]?.message}
                  </p>
                )}
            </div>
          )}
        </form.Field>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <form.Field name="brewWeight">
          {(field) => (
            <div className="flex flex-col gap-2">
              <Label htmlFor="brewWeight">Brew Weight (g)</Label>
              <Input
                id="brewWeight"
                type="number"
                step="0.1"
                value={field.state.value || ''}
                onChange={(e) => field.handleChange(parseFloat(e.target.value))}
                onBlur={field.handleBlur}
              />
              {field.state.meta.errors.length > 0 &&
                field.state.meta.isTouched && (
                  <p className="text-sm text-red-500">
                    {field.state.meta.errors[0]?.message}
                  </p>
                )}
            </div>
          )}
        </form.Field>

        <form.Field name="notes">
          {(field) => (
            <div className="flex flex-col gap-2">
              <Label htmlFor="notes">Notes</Label>
              <Input
                id="notes"
                value={field.state.value || ''}
                onChange={(e) => field.handleChange(e.currentTarget.value)}
                onBlur={field.handleBlur}
              />
              {field.state.meta.errors.length > 0 &&
                field.state.meta.isTouched && (
                  <p className="text-sm text-red-500">
                    {field.state.meta.errors[0]?.message}
                  </p>
                )}
            </div>
          )}
        </form.Field>
      </div>

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
