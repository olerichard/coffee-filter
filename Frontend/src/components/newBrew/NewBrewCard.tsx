import { startTransition, useEffect, useState } from 'react';
import { flushSync } from 'react-dom';
import { CreateBrew } from './CreateBrew';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { CreateCoffeeBagForm } from '@/components/coffeeBagForm/CreateCoffeeBagForm';

type OpenState = 'none' | 'bag' | 'brew';

type ViewTransitionDocument = Document & {
  startViewTransition?: (update: () => void) => unknown;
};

const SCROLL_THRESHOLD = 8;

const prefersReducedMotion = () =>
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const runViewTransition = (update: () => void) => {
  if (
    typeof document === 'undefined' ||
    prefersReducedMotion() ||
    !('startViewTransition' in document)
  ) {
    startTransition(update);
    return;
  }

  (document as ViewTransitionDocument).startViewTransition(() => {
    flushSync(update);
  });
};

export const NewBrewCard = () => {
  const [open, setOpen] = useState<OpenState>('none');
  const [scrolled, setScrolled] = useState(false);

  const compact = scrolled;

  const transitionOpenTo = (state: OpenState) => {
    if (state !== 'none' && window.scrollY > 0) {
      window.scrollTo({ top: 0, behavior: 'auto' });
    }

    runViewTransition(() => {
      setOpen(state);
    });
  };

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
                  onClick={() => transitionOpenTo('brew')}
                  className="col-span-2"
                >
                  New Brew
                </Button>
                <Button
                  variant="outline"
                  onClick={() => transitionOpenTo('bag')}
                >
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
          <CreateBrew onCancel={() => transitionOpenTo('none')} />
        </div>
        <div hidden={open !== 'bag'}>
          <CreateCoffeeBagForm onCancel={() => transitionOpenTo('none')} />
        </div>
      </div>
    </>
  );
};
