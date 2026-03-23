import { useCallback, useRef, useState } from 'react';
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
  const [isDraggingWhole, setIsDraggingWhole] = useState(false);
  const [isDraggingDecimal, setIsDraggingDecimal] = useState(false);
  const startY = useRef(0);
  const touchStartY = useRef(0);

  const getWhole = (v: number) => Math.floor(v);
  const getDecimal = (v: number) => {
    const decimal = Math.round((v - Math.floor(v)) * 10);
    return decimal === 0 ? 0 : decimal;
  };

  const whole = getWhole(value);
  const decimal = allowDecimal ? getDecimal(value) : null;

  const handleWholePointerDown = useCallback((e: React.PointerEvent) => {
    e.preventDefault();
    setIsDraggingWhole(true);
    startY.current = e.clientY;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  }, []);

  const handleDecimalPointerDown = useCallback((e: React.PointerEvent) => {
    e.preventDefault();
    setIsDraggingDecimal(true);
    startY.current = e.clientY;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  }, []);

  const handleWholePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!isDraggingWhole) return;

      const sensitivity = 20;
      const delta = startY.current - e.clientY;

      if (delta >= sensitivity) {
        if (whole < max) {
          const newWhole = whole + 1;
          if (newWhole >= max) {
            onChange(newWhole);
          } else {
            onChange(newWhole + (decimal ?? 0) / 10);
          }
        }
        startY.current = e.clientY;
        return;
      }

      if (delta <= sensitivity * -1) {
        if (whole > min) onChange(whole - 1 + (decimal ?? 0) / 10);
        startY.current = e.clientY;
        return;
      }
    },
    [isDraggingWhole, whole, decimal, min, max, onChange],
  );

  const handleDecimalPointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!isDraggingDecimal || decimal === null) return;

      const sensitivity = 20;
      const delta = startY.current - e.clientY;

      if (delta >= sensitivity) {
        if (whole >= max) return;
        const newDecimal = decimal + 1 > 9 ? 0 : decimal + 1;
        const wholeIncrement = decimal + 1 > 9 ? 1 : 0;
        const newWhole = Math.min(whole + wholeIncrement, max);
        onChange(newWhole + newDecimal / 10);
        startY.current = e.clientY;
        return;
      }

      if (delta <= sensitivity * -1) {
        if (whole <= min && decimal === 0) return;
        const newDecimal = decimal - 1 < 0 ? 9 : decimal - 1;
        const wholeDecrement = decimal - 1 < 0 ? -1 : 0;
        const newWhole = Math.max(whole + wholeDecrement, min);
        onChange(newWhole + newDecimal / 10);
        startY.current = e.clientY;
        return;
      }
    },
    [isDraggingDecimal, whole, decimal, min, max, onChange],
  );

  const handlePointerUp = useCallback((e: React.PointerEvent) => {
    setIsDraggingWhole(false);
    setIsDraggingDecimal(false);
    (e.target as HTMLElement).releasePointerCapture(e.pointerId);
  }, []);

  const handleWholeTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY;
  }, []);

  const handleDecimalTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY;
  }, []);

  const handleWholeTouchMove = useCallback(
    (e: React.TouchEvent) => {
      const sensitivity = 8;
      const delta = touchStartY.current - e.touches[0].clientY;

      if (delta >= sensitivity) {
        if (whole < max) {
          const newWhole = whole + 1;
          if (newWhole >= max) {
            onChange(newWhole);
          } else {
            onChange(newWhole + (decimal !== null ? decimal : 0) / 10);
          }
        }
        touchStartY.current = e.touches[0].clientY;
        return;
      }

      if (delta <= sensitivity * -1) {
        if (whole > min)
          onChange(whole - 1 + (decimal !== null ? decimal : 0) / 10);
        touchStartY.current = e.touches[0].clientY;
        return;
      }
    },
    [whole, decimal, min, max, onChange],
  );

  const handleDecimalTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (decimal === null) return;

      const sensitivity = 8;
      const delta = touchStartY.current - e.touches[0].clientY;

      if (delta >= sensitivity) {
        if (whole >= max) return;
        const newDecimal = decimal + 1 > 9 ? 0 : decimal + 1;
        const wholeIncrement = decimal + 1 > 9 ? 1 : 0;
        const newWhole = Math.min(whole + wholeIncrement, max);
        onChange(newWhole + newDecimal / 10);
        touchStartY.current = e.touches[0].clientY;
        return;
      }

      if (delta <= sensitivity * -1) {
        if (whole <= min && decimal === 0) return;
        const newDecimal = decimal - 1 < 0 ? 9 : decimal - 1;
        const wholeDecrement = decimal - 1 < 0 ? -1 : 0;
        const newWhole = Math.max(whole + wholeDecrement, min);
        onChange(newWhole + newDecimal / 10);
        touchStartY.current = e.touches[0].clientY;
        return;
      }
    },
    [whole, decimal, min, max, onChange],
  );

  const handleTouchEnd = useCallback(() => {}, []);

  const displayWhole = allowDecimal
    ? whole.toString()
    : whole.toString().padStart(2, '0');
  const displayDecimal = allowDecimal ? decimal?.toString() : '';
  const isDragging = isDraggingWhole || isDraggingDecimal;

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
            onPointerDown={handleWholePointerDown}
            onPointerMove={handleWholePointerMove}
            onPointerUp={handlePointerUp}
            onPointerLeave={handlePointerUp}
            onTouchStart={handleWholeTouchStart}
            onTouchMove={handleWholeTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            {displayWhole}
          </div>
          <div
            className={cn(
              'text-4xl text-muted-foreground',
              isDraggingDecimal && 'text-foreground',
            )}
          >
            .
          </div>
          <div
            className={cn(
              'py-2 px-1 rounded cursor-grab active:cursor-grabbing select-none',
              isDraggingDecimal && 'bg-accent/50 rounded',
            )}
            onPointerDown={handleDecimalPointerDown}
            onPointerMove={handleDecimalPointerMove}
            onPointerUp={handlePointerUp}
            onPointerLeave={handlePointerUp}
            onTouchStart={handleDecimalTouchStart}
            onTouchMove={handleDecimalTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            {displayDecimal}
          </div>
        </div>
      ) : (
        <div
          onPointerDown={handleWholePointerDown}
          onPointerMove={handleWholePointerMove}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerUp}
          onTouchStart={handleWholeTouchStart}
          onTouchMove={handleWholeTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {displayWhole}
        </div>
      )}
    </div>
  );
}
