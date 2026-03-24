import { useRef, useState } from 'react';

type Direction = 'inc' | 'dec' | 'stay';

function getDirection(
  currentY: number,
  newY: number,
  sensitivity: number,
): Direction {
  const delta = currentY - newY;
  if (delta >= sensitivity) return 'inc';
  if (delta <= -sensitivity) return 'dec';
  return 'stay';
}

interface UseWholeOptions {
  whole: number;
  decimal: number | null;
  onChange: (value: number) => void;
  min: number;
  max: number;
}

function useWhole({ whole, decimal, onChange, min, max }: UseWholeOptions) {
  const [isDragging, setIsDragging] = useState(false);
  const startY = useRef(0);
  const touchStartY = useRef(0);

  const applyChange = (direction: Direction) => {
    if (direction === 'stay') return;

    if (direction === 'dec') {
      if (whole <= min) return;
      onChange(whole - 1 + (decimal ?? 0) / 10);
      return;
    }

    if (whole >= max) return;

    const newWhole = whole + 1;
    newWhole >= max
      ? onChange(newWhole)
      : onChange(newWhole + (decimal ?? 0) / 10);
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    e.preventDefault();
    setIsDragging(true);
    startY.current = e.clientY;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return;

    const direction = getDirection(startY.current, e.clientY, 20);
    if (direction !== 'stay') {
      applyChange(direction);
      startY.current = e.clientY;
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    setIsDragging(false);
    (e.target as HTMLElement).releasePointerCapture(e.pointerId);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    const direction = getDirection(
      touchStartY.current,
      e.touches[0].clientY,
      8,
    );
    if (direction !== 'stay') {
      applyChange(direction);
      touchStartY.current = e.touches[0].clientY;
    }
  };

  const handleTouchEnd = () => {};

  const displayValue = whole.toString().padStart(2, '0');

  return {
    isDragging,
    displayValue,
    handlers: {
      onPointerDown: handlePointerDown,
      onPointerMove: handlePointerMove,
      onPointerUp: handlePointerUp,
      onPointerLeave: handlePointerUp,
      onTouchStart: handleTouchStart,
      onTouchMove: handleTouchMove,
      onTouchEnd: handleTouchEnd,
    },
  };
}

interface UseDecimalOptions {
  whole: number;
  decimal: number;
  onChange: (value: number) => void;
  min: number;
  max: number;
  enabled: boolean;
}

function useDecimal({ whole, decimal, onChange, min, max, enabled }: UseDecimalOptions) {
  const [isDragging, setIsDragging] = useState(false);
  const startY = useRef(0);
  const touchStartY = useRef(0);

  const applyChange = (direction: Direction) => {
    if (direction === 'stay') return;

    if (direction === 'inc') {
      if (whole >= max) return;
      const newDecimal = decimal + 1 > 9 ? 0 : decimal + 1;
      const wholeIncrement = decimal + 1 > 9 ? 1 : 0;
      const newWhole = Math.min(whole + wholeIncrement, max);
      onChange(newWhole + newDecimal / 10);
    }

    if (whole <= min && decimal === 0) return;
    const newDecimal = decimal - 1 < 0 ? 9 : decimal - 1;
    const wholeDecrement = decimal - 1 < 0 ? -1 : 0;
    const newWhole = Math.max(whole + wholeDecrement, min);
    onChange(newWhole + newDecimal / 10);
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    if (!enabled) return;
    e.preventDefault();
    setIsDragging(true);
    startY.current = e.clientY;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging || !enabled) return;

    const direction = getDirection(startY.current, e.clientY, 20);
    if (direction !== 'stay') {
      applyChange(direction);
      startY.current = e.clientY;
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!enabled) return;
    setIsDragging(false);
    (e.target as HTMLElement).releasePointerCapture(e.pointerId);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (!enabled) return;
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!enabled) return;
    const direction = getDirection(
      touchStartY.current,
      e.touches[0].clientY,
      8,
    );
    if (direction !== 'stay') {
      applyChange(direction);
      touchStartY.current = e.touches[0].clientY;
    }
  };

  const handleTouchEnd = () => {};

  const displayValue = enabled ? decimal.toString() : '';

  return {
    isDragging: enabled ? isDragging : false,
    displayValue,
    handlers: {
      onPointerDown: handlePointerDown,
      onPointerMove: handlePointerMove,
      onPointerUp: handlePointerUp,
      onPointerLeave: handlePointerUp,
      onTouchStart: handleTouchStart,
      onTouchMove: handleTouchMove,
      onTouchEnd: handleTouchEnd,
    },
  };
}

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
  const getWhole = (v: number) => Math.floor(v);
  const getDecimal = (v: number) => {
    const decimal = Math.round((v - Math.floor(v)) * 10);
    return decimal === 0 ? 0 : decimal;
  };

  const whole = getWhole(value);
  const decimal = allowDecimal ? getDecimal(value) : null;

  const wholeResult = useWhole({
    whole,
    decimal,
    onChange,
    min,
    max,
  });

  const decimalResult = useDecimal({
    whole,
    decimal: decimal ?? 0,
    onChange,
    min,
    max,
    enabled: allowDecimal && decimal !== null,
  });

  return {
    isDraggingWhole: wholeResult.isDragging,
    isDraggingDecimal: decimalResult.isDragging,
    displayWhole: allowDecimal ? whole.toString() : wholeResult.displayValue,
    displayDecimal: decimalResult.displayValue,
    isDragging: wholeResult.isDragging || decimalResult.isDragging,
    handlers: {
      whole: wholeResult.handlers,
      decimal: decimalResult.handlers,
    },
  };
}
