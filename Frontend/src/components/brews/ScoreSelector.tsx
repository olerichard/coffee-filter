import { useCallback, useRef, useState } from 'react';

import { cn } from '@/lib/utils';

interface ScoreSelectorProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  className?: string;
}

export function ScoreSelector({
  value,
  onChange,
  min = 0,
  max = 99,
  className,
}: ScoreSelectorProps) {
  const [isDragging, setIsDragging] = useState(false);
  const startY = useRef(0);
  const startValue = useRef(0);

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      e.preventDefault();
      setIsDragging(true);
      startY.current = e.clientY;
      startValue.current = value;
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
    },
    [value],
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!isDragging) return;

      const sensitivity = 20;
      const delta = startY.current - e.clientY;

      if (delta >= sensitivity) {
        if (value < max) onChange(value + 1);
        startY.current = e.clientY;
        return;
      }

      if (delta <= sensitivity * -1) {
        if (value > min) onChange(value - 1);
        startY.current = e.clientY;
        return;
      }
    },
    [isDragging, min, max, onChange, value],
  );

  const handlePointerUp = useCallback((e: React.PointerEvent) => {
    setIsDragging(false);
    (e.target as HTMLElement).releasePointerCapture(e.pointerId);
  }, []);

  const displayValue = value.toString().padStart(2, '0');

  return (
    <div
      className={cn(
        'rounded-md border bg-background',
        'p-4  w-32 text-center',
        'text-6xl font-bold tabular-nums',
        'cursor-grab active:cursor-grabbing',
        'transition-colors duration-150',
        isDragging && 'bg-accent border-primary',
        className,
      )}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
    >
      {displayValue}
    </div>
  );
}
