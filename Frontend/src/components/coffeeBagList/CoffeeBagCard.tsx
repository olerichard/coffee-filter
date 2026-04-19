import { CoffeeBag } from '@/api/coffeeBags/coffeeRequestSchemas';
import { Card, CardContent } from '../ui/card';

export const CoffeeBagCard = ({ coffeeBag }: { coffeeBag: CoffeeBag }) => {
  const formatDate = (dateString?: string) => {
    if (!dateString) return null;
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
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

          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
            {opened && (
              <>
                <span>Opened: {opened}</span>
                <span className="text-muted-foreground">·</span>
              </>
            )}
            {emptied && <span>Emptied: {emptied}</span>}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
