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
  const { displayWhole, displayDecimal, isDragging, handlers } =
    useNumberCarousel({
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
        'relative rounded-md border bg-background',
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
        <div className="absolute inset-0 flex">
          <div className="flex-1" {...handlers.whole} />
          <div className="flex-1" {...handlers.decimal} />
        </div>
      ) : (
        <div
          className="absolute inset-0 cursor-grab active:cursor-grabbing"
          {...handlers.whole}
        />
      )}
      <div className="flex justify-center items-center">
        <div
          className={cn(
            'py-2 px-1 rounded select-none cursor-grab active:cursor-grabbing',
          )}
        >
          {displayWhole}
        </div>
        <div
          className={cn(
            'text-4xl',
            !allowDecimal && 'hidden',
          )}
        >
          .
        </div>
        <div
          className={cn(
            'py-2 px-1 rounded select-none',
            !allowDecimal && 'hidden',
          )}
        >
          {displayDecimal}
        </div>
      </div>
    </div>
  );
}
