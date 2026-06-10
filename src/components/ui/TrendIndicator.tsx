// FinLens — 趋势指示器（颜色 + 箭头双重标识）
import { ArrowUp, ArrowDown, Minus } from 'lucide-react';

interface TrendIndicatorProps {
  trend: 'up' | 'down' | 'stable' | 'na';
  label?: string;
  className?: string;
}

export default function TrendIndicator({ trend, label, className = '' }: TrendIndicatorProps) {
  if (trend === 'na') return null;

  const config = {
    up: {
      icon: ArrowUp,
      color: 'text-finlens-positive',
      text: label || '上升',
    },
    down: {
      icon: ArrowDown,
      color: 'text-finlens-negative',
      text: label || '下降',
    },
    stable: {
      icon: Minus,
      color: 'text-finlens-text-secondary',
      text: label || '持平',
    },
  };

  const { icon: Icon, color, text } = config[trend];

  return (
    <span className={`inline-flex items-center gap-0.5 text-xs font-medium ${color} ${className}`}>
      <Icon size={12} strokeWidth={3} />
      {text}
    </span>
  );
}
