import { useEffect, useState } from 'react';
import { CreateBrew } from './CreateBrew';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { CreateCoffeeBagForm } from '@/components/coffeeBagForm/CreateCoffeeBagForm';

type OpenState = 'none' | 'bag' | 'brew';

const SCROLL_THRESHOLD = 8;

export const NewBrewCard = () => {
  const [open, setOpen] = useState<OpenState>('none');
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > SCROLL_THRESHOLD);
    };

    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div className="sticky top-0 z-40">
      <Card
        className={cn(
          'transition-all duration-200 ease-in-out',
          scrolled && 'p-1 gap-0',
          open !== 'none' && 'rounded-b-none border-b-0',
        )}
      >
        <div
          className={cn(
            'overflow-hidden transition-all duration-200 ease-in-out',
            scrolled ? 'max-h-0 opacity-0' : 'max-h-12 opacity-100',
          )}
        >
          <CardHeader>
            <CardTitle>Create new Brew</CardTitle>
          </CardHeader>
        </div>
        {open === 'none' && (
          <CardContent className={cn(scrolled && 'px-1')}>
            <div className="grid grid-cols-3 gap-4">
              <Button onClick={() => setOpen('brew')} className="col-span-2">
                New Brew
              </Button>
              <Button variant="outline" onClick={() => setOpen('bag')}>
                Add Bag
              </Button>
            </div>
          </CardContent>
        )}
      </Card>
      <div
        className={cn(
          'absolute left-0 right-0 top-full -mt-px overflow-hidden transition-all duration-300 ease-in-out',
          open !== 'none'
            ? 'max-h-250 opacity-100'
            : 'max-h-0 opacity-0 pointer-events-none',
        )}
      >
        <div className="bg-card border-x border-b rounded-b-2xl shadow-md px-6 py-6">
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
        </div>
      </div>
    </div>
  );
};
