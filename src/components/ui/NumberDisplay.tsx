// FinLens — 等宽数字展示组件
'use client';

import { useEffect, useRef, useState } from 'react';

interface NumberDisplayProps {
  value: string | number;
  unit?: string;
  size?: 'sm' | 'base' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl';
  color?: string;
  animate?: boolean;
  className?: string;
}

const sizeMap: Record<string, string> = {
  sm: 'text-sm',
  base: 'text-base',
  lg: 'text-lg',
  xl: 'text-xl',
  '2xl': 'text-2xl',
  '3xl': 'text-3xl',
  '4xl': 'text-4xl',
};

export default function NumberDisplay({
  value,
  unit,
  size = 'base',
  color,
  animate = true,
  className = '',
}: NumberDisplayProps) {
  const [displayValue, setDisplayValue] = useState(0);
  const targetRef = useRef(0);
  const animFrameRef = useRef<number>(0);

  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  const isNA = typeof value === 'string' && (value === 'N/A' || value === '—');

  useEffect(() => {
    if (isNA || isNaN(numValue)) {
      setDisplayValue(0);
      return;
    }

    if (!animate) {
      setDisplayValue(numValue);
      return;
    }

    targetRef.current = numValue;
    const startValue = 0;
    const duration = 600;
    const startTime = performance.now();

    function tick(now: number) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // easeOutCubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayValue(startValue + (numValue - startValue) * eased);

      if (progress < 1) {
        animFrameRef.current = requestAnimationFrame(tick);
      }
    }

    animFrameRef.current = requestAnimationFrame(tick);

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [value, numValue, isNA, animate]);

  if (isNA) {
    return <span className={`tabular-nums ${sizeMap[size]} text-finlens-text-secondary ${className}`}>N/A</span>;
  }

  // 智能格式化：保留合适的小数位
  const formatted = numValue >= 100
    ? Math.round(displayValue).toLocaleString()
    : numValue >= 1
      ? displayValue.toFixed(1)
      : displayValue.toFixed(2);

  return (
    <span
      className={`tabular-nums font-semibold ${sizeMap[size]} ${className}`}
      style={color ? { color } : undefined}
    >
      {formatted}
      {unit && <span className="text-sm font-normal ml-0.5 text-finlens-text-secondary">{unit}</span>}
    </span>
  );
}
