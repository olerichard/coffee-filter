import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { apiClients } from '@/api/apiClients';
import { CreateBrewForm } from './CreateBrewForm';

export function NewBrewCard() {
  const [isOpen, setIsOpen] = useState(false);

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
        {!isOpen && (
          <Button onClick={() => setIsOpen(true)} className="w-full">
            Start New Brew
          </Button>
        )}
        <div
          className={`transition-all duration-300 ease-in-out overflow-hidden ${
            isOpen ? 'max-h-250 opacity-100' : 'max-h-0 opacity-0'
          }`}
        >
          <CreateBrewForm
            coffeeBags={coffeeBagsQuery.data ?? []}
            isLoading={isLoading}
            onCancel={() => setIsOpen(false)}
          />
        </div>
      </CardContent>
    </Card>
  );
}
