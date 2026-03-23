import { useNumberCarousel } from './useNumberCarousel';
import { cn } from '@/lib/utils';

interface NumberCarouselProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  allowDecimal?: boolean;
  id?: string;
  className?: string;
}

export function NumberCarousel({
  value,
  onChange,
  min = 0,
  max = 99,
  allowDecimal = false,
  id,
  className,
}: NumberCarouselProps) {
  const {
    isDraggingWhole,
    isDraggingDecimal,
    displayWhole,
    displayDecimal,
    isDragging,
    handlers,
  } = useNumberCarousel({
    value,
    onChange,
    min,
    max,
    allowDecimal,
  });

  return (
    <div
      id={id}
      className={cn(
        'rounded-md border bg-background',
        'p-4 w-32 text-center',
        'text-6xl font-bold tabular-nums',
        'cursor-grab active:cursor-grabbing',
        'transition-colors duration-150',
        isDragging && 'bg-accent border-primary',
        className,
      )}
      style={{ touchAction: 'none' }}
    >
      {allowDecimal ? (
        <div className="flex justify-center items-center">
          <div
            className={cn(
              'py-2 px-1 rounded cursor-grab active:cursor-grabbing select-none',
              isDraggingWhole && 'bg-accent/50 rounded',
            )}
            {...handlers.whole}
          >
            {displayWhole}
          </div>
          <div
            className={cn('text-4xl ', isDraggingDecimal && 'text-foreground')}
          >
            .
          </div>
          <div
            className={cn(
              'py-2 px-1 rounded cursor-grab active:cursor-grabbing select-none',
              isDraggingDecimal && 'bg-accent/50 rounded',
            )}
            {...handlers.decimal}
          >
            {displayDecimal}
          </div>
        </div>
      ) : (
        <div {...handlers.whole}>{displayWhole}</div>
      )}
    </div>
  );
}
