import { startTransition, useEffect, useState } from 'react';
import { flushSync } from 'react-dom';
import { CreateBrew } from './CreateBrew';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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

  const transitionOpenTo = (state: OpenState) => {
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
    <div className="sticky top-0 z-40">
      <Card
        className={cn(
          'transition-all duration-100 ease-in-out',
          scrolled && 'p-1 gap-0',
          open !== 'none' && 'rounded-b-none border-b-0',
        )}
      >
        <div
          className={cn(
            'overflow-hidden transition-all duration-100 ease-in-out',
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
              <Button
                onClick={() => transitionOpenTo('brew')}
                className="col-span-2"
              >
                New Brew
              </Button>
              <Button variant="outline" onClick={() => transitionOpenTo('bag')}>
                Add Bag
              </Button>
            </div>
          </CardContent>
        )}
      </Card>
      <div
        aria-hidden={open === 'none'}
        inert={open === 'none'}
        className={cn(
          'absolute left-0 right-0 top-full -mt-px origin-top overflow-hidden transition-[opacity,transform] duration-200 ease-out motion-reduce:transition-none',
          open !== 'none'
            ? 'pointer-events-auto translate-y-0 scale-y-100 opacity-100'
            : 'pointer-events-none -translate-y-2 scale-y-[0.98] opacity-0',
        )}
      >
        <div className="bg-card border-x border-b rounded-b-2xl shadow-md px-6 py-6">
          <div hidden={open !== 'brew'}>
            <CreateBrew onCancel={() => transitionOpenTo('none')} />
          </div>
          <div hidden={open !== 'bag'}>
            <CreateCoffeeBagForm onCancel={() => transitionOpenTo('none')} />
          </div>
        </div>
      </div>
    </div>
  );
};
