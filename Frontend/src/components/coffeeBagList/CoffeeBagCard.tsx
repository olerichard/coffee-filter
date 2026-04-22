import { useRef, useState } from 'react';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import type { CoffeeBag } from '@/api/coffeeBags/coffeeRequestSchemas';
import { useUpdateCoffeeBag } from '@/components/coffeeBagForm/useUpdateCoffeeBag';

export const CoffeeBagCard = ({ coffeeBag }: { coffeeBag: CoffeeBag }) => {
  const [isConfirming, setIsConfirming] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { mutate: markEmpty, isLoading } = useUpdateCoffeeBag({});

  const formatDate = (dateString?: string) => {
    if (!dateString) return null;
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const handleClick = () => {
    if (!isConfirming) {
      setIsConfirming(true);
      timeoutRef.current = setTimeout(() => {
        setIsConfirming(false);
      }, 5000);
    } else {
      markEmpty(
        { id: coffeeBag.id, data: { emptied: new Date().toISOString() } },
        {
          onSuccess: () => {
            setIsConfirming(false);
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
          },
        },
      );
    }
  };

  const opened = formatDate(coffeeBag.opened ?? '');
  const emptied = formatDate(coffeeBag.emptied ?? '');

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

            {!emptied && (
              <Button
                variant={isConfirming ? 'default' : 'ghost'}
                size="sm"
                onClick={handleClick}
                disabled={isLoading}
                className="w-fit"
              >
                {isConfirming ? 'yes, it is' : 'Empty?'}
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
