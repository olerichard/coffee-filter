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
  onClose: () => void;
}

export const NewBrewCard = ({
  panel,
  onOpenNewBrew,
  onOpenNewBag,
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

  const panelContent = (() => {
    switch (panel.kind) {
      case 'none':
        return null;
      case 'new-brew':
        return <CreateBrew onCancel={onClose} />;
      case 'edit-brew':
        return (
          <EditBrew
            key={panel.brewId}
            brewId={panel.brewId}
            onCancel={onClose}
          />
        );
      case 'new-bag':
        return <CreateCoffeeBag onCancel={onClose} />;
      case 'edit-bag':
        return (
          <EditCoffeeBag
            key={panel.coffeeBagId}
            coffeeBagId={panel.coffeeBagId}
            onCancel={onClose}
          />
        );
    }
  })();

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
      {panelContent !== null && (
        <div className="bg-card border rounded-2xl shadow-md px-6 py-6">
          {panelContent}
        </div>
      )}
    </>
  );
};
