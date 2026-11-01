import { useEffect, useState } from 'react';
import { CreateBrew } from './CreateBrew';
import { EditBrew } from './EditBrew';
import type { DashboardPanel } from '@/lib/dashboardSearch';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { CreateCoffeeBag } from '@/components/coffeeBagForm/CreateCoffeeBag';
import { EditCoffeeBag } from '@/components/coffeeBagForm/EditCoffeeBag';

const SCROLL_THRESHOLD = 8;

interface NewBrewCardProps {
  panel: DashboardPanel;
  onOpenNewBrew: () => void;
  onOpenNewBag: () => void;
  onAddBagFromBrew: () => void;
  onClose: () => void;
}

export const NewBrewCard = ({
  panel,
  onOpenNewBrew,
  onOpenNewBag,
  onAddBagFromBrew,
  onClose,
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

  // Keep the brew form mounted while the bag form is open on top of it, so the
  // user does not lose their half-finished brew when creating a missing bag.
  const keepBrewForm =
    panel.kind === 'new-bag' && panel.returnTo === 'new-brew';
  const showBrewForm = panel.kind === 'new-brew' || keepBrewForm;

  const panelCard = 'bg-card border rounded-2xl shadow-md px-6 py-6';

  return (
    <>
      {panel.kind === 'none' && (
        <div className="sticky top-0 z-40">
          <Card
            className={cn(
              'transition-all duration-100 ease-in-out',
              compact && 'p-1 gap-0',
            )}
          >
            <CardContent className={cn(compact && 'px-1')}>
              <div className="grid grid-cols-3 gap-4">
                <Button onClick={onOpenNewBrew} className="col-span-2">
                  New Brew
                </Button>
                <Button variant="outline" onClick={onOpenNewBag}>
                  Add Bag
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
      {showBrewForm && (
        <div className={keepBrewForm ? 'hidden' : panelCard}>
          <CreateBrew onCancel={onClose} onCreateBag={onAddBagFromBrew} />
        </div>
      )}
      {panel.kind === 'edit-brew' && (
        <div className={panelCard}>
          <EditBrew
            key={panel.brewId}
            brewId={panel.brewId}
            onCancel={onClose}
          />
        </div>
      )}
      {panel.kind === 'new-bag' && (
        <div className={panelCard}>
          <CreateCoffeeBag onCancel={onClose} />
        </div>
      )}
      {panel.kind === 'edit-bag' && (
        <div className={panelCard}>
          <EditCoffeeBag
            key={panel.coffeeBagId}
            coffeeBagId={panel.coffeeBagId}
            onCancel={onClose}
          />
        </div>
      )}
    </>
  );
};
