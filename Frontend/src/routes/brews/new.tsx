import { useState } from 'react';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
import { apiClients } from '@/api/apiClients';

const BREW_TYPES = [
  'Espresso',
  'Pour Over',
  'French Press',
  'AeroPress',
  'Moka Pot',
  'Cold Brew',
  'Drip',
  'Siphon',
] as const;

interface BrewFormData {
  coffeeBagId: number;
  brewType: string;
  brewTasteScore: number;
  coffeeDose: number;
  grindSize: number;
  brewTime: number;
  brewWeight?: number;
  brewAddedWeight?: number;
  brewAddedWeightTasteScore?: number;
  notes?: string;
}

export const Route = createFileRoute('/brews/new')({
  component: NewBrewPage,
});

function NewBrewPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<BrewFormData>({
    coffeeBagId: 0,
    brewType: '',
    brewTasteScore: 0,
    coffeeDose: 0,
    grindSize: 0,
    brewTime: 0,
  });

  const coffeeBagsQuery = useQuery({
    queryKey: ['coffeeBags'],
    queryFn: () => apiClients.coffeeBag.getCoffeeBags(),
  });

  const createBrewMutation = useMutation({
    mutationFn: (data: BrewFormData) => apiClients.brew.createBrew(data),
    onSuccess: () => {
      navigate({ to: '/' });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !formData.coffeeBagId ||
      !formData.brewType ||
      !formData.brewTasteScore ||
      !formData.coffeeDose ||
      !formData.grindSize ||
      !formData.brewTime
    ) {
      return;
    }
    createBrewMutation.mutate(formData);
  };

  const isLoading = coffeeBagsQuery.isLoading || createBrewMutation.isPending;

  return (
    <div className="max-w-2xl mx-auto py-6">
      <Card>
        <CardHeader>
          <CardTitle>New Brew</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="coffeeBag">Coffee Bag *</Label>
              <Select
                value={formData.coffeeBagId.toString()}
                onValueChange={(value) =>
                  setFormData({ ...formData, coffeeBagId: parseInt(value) })
                }
              >
                <SelectTrigger id="coffeeBag">
                  <SelectValue placeholder="Select a coffee bag" />
                </SelectTrigger>
                <SelectContent>
                  {coffeeBagsQuery.data?.map((bag) => (
                    <SelectItem key={bag.id} value={bag.id.toString()}>
                      {bag.roaster} - {bag.origin}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="brewType">Brew Type *</Label>
              <Select
                value={formData.brewType}
                onValueChange={(value) =>
                  setFormData({ ...formData, brewType: value })
                }
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
            </div>

            <div className="flex flex-col gap-2 ">
              <Label htmlFor="brewTasteScore">Taste Score *</Label>
              <ScoreSelector
                value={formData.brewTasteScore}
                onChange={(value) =>
                  setFormData({ ...formData, brewTasteScore: value })
                }
                max={10}
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="coffeeDose">Dose (g) *</Label>
                <Input
                  id="coffeeDose"
                  type="number"
                  step="0.1"
                  value={formData.coffeeDose || ''}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      coffeeDose: parseFloat(e.target.value) || 0,
                    })
                  }
                />
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="grindSize">Grind Size *</Label>
                <Input
                  id="grindSize"
                  type="number"
                  step="0.1"
                  value={formData.grindSize || ''}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      grindSize: parseFloat(e.target.value) || 0,
                    })
                  }
                />
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="brewTime">Brew Time (s) *</Label>
                <Input
                  id="brewTime"
                  type="number"
                  step="1"
                  value={formData.brewTime || ''}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      brewTime: parseInt(e.target.value) || 0,
                    })
                  }
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="brewWeight">Brew Weight (g)</Label>
                <Input
                  id="brewWeight"
                  type="number"
                  step="0.1"
                  value={formData.brewWeight || ''}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      brewWeight: parseFloat(e.target.value) || undefined,
                    })
                  }
                />
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="notes">Notes</Label>
                <Input
                  id="notes"
                  value={formData.notes || ''}
                  onChange={(e) =>
                    setFormData({ ...formData, notes: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="brewAddedWeight">Added Weight (g)</Label>
                <Input
                  id="brewAddedWeight"
                  type="number"
                  step="0.1"
                  value={formData.brewAddedWeight || ''}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      brewAddedWeight: parseFloat(e.target.value) || undefined,
                    })
                  }
                />
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="brewAddedWeightTasteScore">
                  Added Weight Taste Score
                </Label>
                <Input
                  id="brewAddedWeightTasteScore"
                  type="number"
                  min="1"
                  max="10"
                  value={formData.brewAddedWeightTasteScore || ''}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      brewAddedWeightTasteScore:
                        parseInt(e.target.value) || undefined,
                    })
                  }
                />
              </div>
            </div>

            <div className="flex gap-2 pt-4">
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Saving...' : 'Save Brew'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate({ to: '/' })}
              >
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
