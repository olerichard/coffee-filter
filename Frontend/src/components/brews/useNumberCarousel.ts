import { useCallback, useRef, useState } from 'react';

interface UseNumberCarouselOptions {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  allowDecimal?: boolean;
}

export function useNumberCarousel({
  value,
  onChange,
  min = 0,
  max = 99,
  allowDecimal = false,
}: UseNumberCarouselOptions) {
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

  const baseHandlers = {
    onPointerUp: handlePointerUp,
    onPointerLeave: handlePointerUp,

    onTouchEnd: handleTouchEnd,
  };

  const wholeHandlers = {
    ...baseHandlers,
    onPointerDown: handleWholePointerDown,
    onPointerMove: handleWholePointerMove,
    onTouchStart: handleWholeTouchStart,
    onTouchMove: handleWholeTouchMove,
  };

  const decimalHandlers = {
    ...baseHandlers,
    onPointerDown: handleDecimalPointerDown,
    onPointerMove: handleDecimalPointerMove,
    onTouchMove: handleDecimalTouchMove,
    onTouchStart: handleDecimalTouchStart,
  };

  return {
    isDraggingWhole,
    isDraggingDecimal,
    displayWhole,
    displayDecimal,
    isDragging,
    handlers: { whole: wholeHandlers, decimal: decimalHandlers },
  };
}
