import { useCallback, useRef, useState } from 'react';
import { cn } from '@/lib/utils';

interface ScoreSelectorProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  id?: string;
  className?: string;
}

export function ScoreSelector({
  value,
  onChange,
  min = 0,
  max = 99,
  id,
  className,
}: ScoreSelectorProps) {
  const [isDragging, setIsDragging] = useState(false);
  const startY = useRef(0);

  const touchStartY = useRef(0);

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    e.preventDefault();
    setIsDragging(true);
    startY.current = e.clientY;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  }, []);

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

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY;
  }, []);

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      const sensitivity = 8;
      const delta = touchStartY.current - e.touches[0].clientY;

      if (delta >= sensitivity) {
        if (value < max) onChange(value + 1);
        touchStartY.current = e.touches[0].clientY;
        return;
      }

      if (delta <= sensitivity * -1) {
        if (value > min) onChange(value - 1);
        touchStartY.current = e.touches[0].clientY;
        return;
      }
    },
    [value, min, max, onChange],
  );

  const handleTouchEnd = useCallback(() => {
    // Cleanup if needed
  }, []);

  const displayValue = value.toString().padStart(2, '0');

  return (
    <div
      id={id}
      className={cn(
        'rounded-md border bg-background',
        'p-4  w-32 text-center',
        'text-6xl font-bold tabular-nums',
        'cursor-grab active:cursor-grabbing',
        'transition-colors duration-150',
        isDragging && 'bg-accent border-primary',
        className,
      )}
      style={{ touchAction: 'none' }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {displayValue}
    </div>
  );
}
