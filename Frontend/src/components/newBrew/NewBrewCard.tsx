import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CreateBrew } from './CreateBrew';
import { CreateCoffeeBagForm } from '@/components/coffeeBagForm/CreateCoffeeBagForm';

type OpenState = 'none' | 'bag' | 'brew';

export const NewBrewCard = () => {
  const [open, setOpen] = useState<OpenState>('none');

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create new Brew</CardTitle>
      </CardHeader>
      <CardContent>
        {open == 'none' && (
          <div className="grid grid-cols-3 gap-4">
            <Button onClick={() => setOpen('brew')} className="col-span-2">
              New Brew
            </Button>
            <Button variant="outline" onClick={() => setOpen('bag')}>
              Add Bag
            </Button>
          </div>
        )}
        <div
          className={`transition-all duration-300 ease-in-out overflow-hidden ${
            open === 'brew' ? 'max-h-250 opacity-100' : 'max-h-0 opacity-0'
          }`}
        >
          <CreateBrew onCancel={() => setOpen('none')} />
        </div>
        <div
          className={`transition-all duration-300 ease-in-out overflow-hidden ${
            open === 'bag' ? 'max-h-250 opacity-100' : 'max-h-0 opacity-0'
          }`}
        >
          <CreateCoffeeBagForm onCancel={() => setOpen('none')} />
        </div>
      </CardContent>
    </Card>
  );
};
