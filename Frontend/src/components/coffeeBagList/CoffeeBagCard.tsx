import { useRef, useState } from 'react';
import { PencilIcon } from 'lucide-react';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import type { CoffeeBagWithUsage } from '@/api/coffeeBags/coffeeRequestSchemas';
import { useUpdateCoffeeBag } from '@/components/coffeeBagForm/useUpdateCoffeeBag';

type ConfirmAction = 'open' | 'empty';

interface CoffeeBagCardProps {
  coffeeBag: CoffeeBagWithUsage;
  onEdit: (coffeeBagId: number) => void;
}

export const CoffeeBagCard = ({ coffeeBag, onEdit }: CoffeeBagCardProps) => {
  const [confirmAction, setConfirmAction] = useState<ConfirmAction | null>(
    null,
  );
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { updateCoffeeBag, isLoading } = useUpdateCoffeeBag({});

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
      const now = new Date();
      const midnightUtc = new Date(
        Date.UTC(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0),
      ).toISOString();
      const actionData =
        action === 'empty'
          ? { emptied: now.toISOString() }
          : { opened: midnightUtc };
      const updateData = {
        roaster: coffeeBag.roaster,
        name: coffeeBag.name,
        origin: coffeeBag.origin,
        roastStyle: coffeeBag.roastStyle,
        flavourNotes: coffeeBag.flavourNotes,
        opened: coffeeBag.opened,
        emptied: coffeeBag.emptied,
        ...actionData,
      };

      void updateCoffeeBag(
        { id: coffeeBag.id, data: updateData },
        {
          onSuccess: () => {
            setConfirmAction(null);
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
          },
        },
      ).catch(() => {
        setConfirmAction(null);
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
      });
    }
  };

  const opened = formatDate(coffeeBag.opened ?? '');
  const emptied = formatDate(coffeeBag.emptied ?? '');
  const isOpened = !!coffeeBag.opened;
  const isEmptied = !!coffeeBag.emptied;

  const showEmptyButton = isOpened && !isEmptied;
  const showOpenButton = !isOpened && !isEmptied;

  const roasterDisplay = coffeeBag.name
    ? `${coffeeBag.roaster} - ${coffeeBag.name}`
    : coffeeBag.roaster;

  return (
    <Card className="relative overflow-hidden">
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        className="absolute top-2 right-2 z-10 rounded-full"
        onClick={() => onEdit(coffeeBag.id)}
        aria-label="Edit coffee bag"
        title="Edit coffee bag"
      >
        <PencilIcon />
      </Button>
      <CardContent className="py-0 px-4">
        <div className="flex flex-col gap-3">
          <div className="min-w-0 flex-1 pr-10">
            <p className="font-medium truncate">{roasterDisplay}</p>
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
