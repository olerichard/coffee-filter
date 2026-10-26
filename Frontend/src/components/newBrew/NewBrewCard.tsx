import { useEffect, useState } from 'react';
import { CreateBrew } from './CreateBrew';
import { EditBrew } from './EditBrew';
import type { Brew } from '@/api/brews/brewRequestSchemas';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { CreateCoffeeBagForm } from '@/components/coffeeBagForm/CreateCoffeeBagForm';

export type NewBrewOpenState = 'none' | 'bag' | 'brew';

const SCROLL_THRESHOLD = 8;

interface NewBrewCardProps {
  open: NewBrewOpenState;
  onOpenChange: (state: NewBrewOpenState) => void;
  editingBrew?: Brew | null;
  onEditEnd: () => void;
}

export const NewBrewCard = ({
  open,
  onOpenChange,
  editingBrew = null,
  onEditEnd,
}: NewBrewCardProps) => {
  const [scrolled, setScrolled] = useState(false);

  const compact = scrolled;

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > SCROLL_THRESHOLD);
    };

    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <>
      {open === 'none' && (
        <div className="sticky top-0 z-40">
          <Card
            className={cn(
              'transition-all duration-100 ease-in-out',
              compact && 'p-1 gap-0',
            )}
          >
            <CardContent className={cn(compact && 'px-1')}>
              <div className="grid grid-cols-3 gap-4">
                <Button
                  onClick={() => onOpenChange('brew')}
                  className="col-span-2"
                >
                  New Brew
                </Button>
                <Button variant="outline" onClick={() => onOpenChange('bag')}>
                  Add Bag
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
      <div
        hidden={open === 'none'}
        className="bg-card border rounded-2xl shadow-md px-6 py-6"
      >
        <div hidden={open !== 'brew'}>
          {editingBrew !== null ? (
            <EditBrew
              key={editingBrew.id}
              brew={editingBrew}
              onCancel={onEditEnd}
            />
          ) : (
            <CreateBrew onCancel={() => onOpenChange('none')} />
          )}
        </div>
        <div hidden={open !== 'bag'}>
          <CreateCoffeeBagForm onCancel={() => onOpenChange('none')} />
        </div>
      </div>
    </>
  );
};
