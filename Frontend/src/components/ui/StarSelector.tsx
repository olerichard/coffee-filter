import { useRef, useState, useCallback } from 'react';
import { StarIcon, CircleOffIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StarSelectorProps {
  value: number;
  onChange: (value: number) => void;
  className?: string;
}

export function StarSelector({
  value,
  onChange,
  className,
}: StarSelectorProps) {
  const [hoverValue, setHoverValue] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);

  const getRatingFromPosition = useCallback((clientX: number) => {
    if (!containerRef.current) return 0;
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const starWidth = rect.width / 6;
    const rating = Math.min(5, Math.max(0, Math.floor(x / starWidth)));
    return rating;
  }, []);

  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      isDragging.current = true;
      const touch = e.touches[0];
      const rating = getRatingFromPosition(touch.clientX);
      if (rating !== value) {
        onChange(rating);
      }
    },
    [value, onChange, getRatingFromPosition],
  );

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (!isDragging.current) return;
      const touch = e.touches[0];
      const rating = getRatingFromPosition(touch.clientX);
      if (rating !== value) {
        onChange(rating);
      }
    },
    [value, onChange, getRatingFromPosition],
  );

  const handleTouchEnd = useCallback(() => {
    isDragging.current = false;
  }, []);

  const handleClick = useCallback(
    (rating: number) => {
      if (rating !== value) {
        onChange(rating);
      }
    },
    [value, onChange],
  );

  return (
    <div
      ref={containerRef}
      className={cn('flex justify-center shrink-0 px-4 select-none', className)}
      role="group"
      aria-label="Rate this brew"
      style={{ touchAction: 'none' }}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <button
        type="button"
        onClick={() => handleClick(0)}
        onMouseEnter={() => setHoverValue(0)}
        onMouseLeave={() => setHoverValue(0)}
        className="p-2 cursor-pointer transition-colors hover:text-amber-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-full"
        aria-label="Rate 0"
      >
        <CircleOffIcon
          className={cn(
            'size-8 md:size-10 transition-colors',
            'text-muted hover:text-muted-foreground',
          )}
        />
      </button>
      {Array.from({ length: 5 }, (_, i) => {
        const rating = i + 1;
        const isFilled = rating <= (hoverValue > 0 ? hoverValue : value);
        return (
          <button
            key={rating}
            type="button"
            onClick={() => handleClick(rating)}
            onMouseEnter={() => setHoverValue(rating)}
            onMouseLeave={() => setHoverValue(0)}
            className="p-2 cursor-pointer transition-colors hover:text-amber-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-full"
            aria-label={`Rate ${rating} out of 5`}
          >
            <StarIcon
              className={cn(
                'size-8 md:size-10 transition-colors',
                isFilled
                  ? 'fill-amber-500 text-amber-500'
                  : 'text-muted-foreground',
              )}
            />
          </button>
        );
      })}
    </div>
  );
}
