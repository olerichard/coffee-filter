import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { apiClients } from '@/api/apiClients';
import { CreateBrewForm } from './CreateBrewForm';
import { CreateCoffeeBagForm } from '@/components/coffeeBagForm/CreateCoffeeBagForm';

export function NewBrewCard() {
  const [isBrewOpen, setIsBrewOpen] = useState(false);
  const [isCoffeeBagOpen, setIsCoffeeBagOpen] = useState(false);

  const coffeeBagsQuery = useQuery({
    queryKey: ['coffeeBags'],
    queryFn: () => apiClients.coffeeBag.getCoffeeBags(),
  });

  const isLoading = coffeeBagsQuery.isLoading;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create new Brew</CardTitle>
      </CardHeader>
      <CardContent>
        {!isBrewOpen && !isCoffeeBagOpen && (
          <div className="grid grid-cols-3 gap-4">
            <Button onClick={() => setIsBrewOpen(true)} className="col-span-2">
              Start New Brew
            </Button>
            <Button variant="outline" onClick={() => setIsCoffeeBagOpen(true)}>
              Add Coffee Bag
            </Button>
          </div>
        )}
        <div
          className={`transition-all duration-300 ease-in-out overflow-hidden ${
            isBrewOpen ? 'max-h-250 opacity-100' : 'max-h-0 opacity-0'
          }`}
        >
          <CreateBrewForm
            coffeeBags={coffeeBagsQuery.data ?? []}
            isLoading={isLoading}
            onCancel={() => setIsBrewOpen(false)}
          />
        </div>
        <div
          className={`transition-all duration-300 ease-in-out overflow-hidden ${
            isCoffeeBagOpen ? 'max-h-250 opacity-100' : 'max-h-0 opacity-0'
          }`}
        >
          <CreateCoffeeBagForm onCancel={() => setIsCoffeeBagOpen(false)} />
        </div>
      </CardContent>
    </Card>
  );
}
