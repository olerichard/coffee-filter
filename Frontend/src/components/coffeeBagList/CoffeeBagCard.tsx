import { useRef, useState } from 'react';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import type { CoffeeBag } from '@/api/coffeeBags/coffeeRequestSchemas';
import { useUpdateCoffeeBag } from '@/components/coffeeBagForm/useUpdateCoffeeBag';

type ConfirmAction = 'open' | 'empty';

export const CoffeeBagCard = ({ coffeeBag }: { coffeeBag: CoffeeBag }) => {
  const [confirmAction, setConfirmAction] = useState<ConfirmAction | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { mutate: updateBag, isLoading } = useUpdateCoffeeBag({});

  const formatDate = (dateString?: string) => {
    if (!dateString) return null;
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const handleClick = (action: ConfirmAction) => {
    if (confirmAction !== action) {
      setConfirmAction(action);
      timeoutRef.current = setTimeout(() => {
        setConfirmAction(null);
      }, 5000);
    } else {
      const data = action === 'empty'
        ? { emptied: new Date().toISOString() }
        : { opened: new Date().toISOString() };

      updateBag(
        { id: coffeeBag.id, data },
        {
          onSuccess: () => {
            setConfirmAction(null);
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
          },
        },
      );
    }
  };

  const opened = formatDate(coffeeBag.opened ?? '');
  const emptied = formatDate(coffeeBag.emptied ?? '');
  const isOpened = !!coffeeBag.opened;
  const isEmptied = !!coffeeBag.emptied;

  const showEmptyButton = isOpened && !isEmptied;
  const showOpenButton = !isOpened && !isEmptied;

  return (
    <Card className="overflow-hidden">
      <CardContent className="py-0 px-4">
        <div className="flex flex-col gap-3">
          <div className="min-w-0 flex-1">
            <p className="font-medium truncate">{coffeeBag.roaster}</p>
            <div className="flex flex-wrap items-center gap-x-1 text-sm text-muted-foreground">
              <span>{coffeeBag.origin}</span>
              {coffeeBag.roastStyle && (
                <>
                  <span className="text-muted-foreground">·</span>
                  <span>{coffeeBag.roastStyle}</span>
                </>
              )}
              {coffeeBag.flavourNotes && (
                <>
                  <span className="text-muted-foreground">·</span>
                  <span>{coffeeBag.flavourNotes} </span>
                </>
              )}
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1 text-sm">
            <div className="flex flex-wrap items-center gap-x-1">
              {opened && (
                <>
                  <span>Opened: {opened}</span>
                  <span className="text-muted-foreground">·</span>
                </>
              )}
              {emptied && <span>Emptied: {emptied}</span>}
            </div>

            {showOpenButton && (
              <Button
                variant={confirmAction === 'open' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => handleClick('open')}
                disabled={isLoading}
                className="w-fit"
              >
                {confirmAction === 'open' ? 'Yes, please' : 'Open ?'}
              </Button>
            )}

            {showEmptyButton && (
              <Button
                variant={confirmAction === 'empty' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => handleClick('empty')}
                disabled={isLoading}
                className="w-fit"
              >
                {confirmAction === 'empty' ? 'yes, it is' : 'Empty ?'}
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
