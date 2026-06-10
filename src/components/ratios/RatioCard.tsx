// FinLens — 单个比率卡片
'use client';

import { useMemo } from 'react';
import NumberDisplay from '@/components/ui/NumberDisplay';
import TrendIndicator from '@/components/ui/TrendIndicator';
import RatioTrendChart from './RatioTrendChart';
import type { RatioResult } from '@/types';

interface RatioCardProps {
  ratio: RatioResult;
}

export default function RatioCard({ ratio }: RatioCardProps) {
  const lastValue = useMemo(() => {
    const valid = ratio.values.filter(v => v.value !== null);
    return valid.length > 0 ? valid[valid.length - 1].value : null;
  }, [ratio.values]);

  const lastYear = useMemo(() => {
    const valid = ratio.values.filter(v => v.value !== null);
    return valid.length > 0 ? valid[valid.length - 1].year : null;
  }, [ratio.values]);

  const isNA = lastValue === null;

  return (
    <div className="bg-white border border-finlens-border rounded-md p-4 shadow-[0_1px_3px_rgba(0,0,0,0.08)] hover:shadow-[0_2px_6px_rgba(0,0,0,0.1)] transition-shadow">
      {/* 标题行 */}
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="text-xs text-finlens-text-secondary font-medium">{ratio.name}</p>
        </div>
        <TrendIndicator trend={ratio.trend} />
      </div>

      {/* 核心数字 */}
      <div className="mb-3">
        {isNA ? (
          <span className="text-2xl font-semibold text-finlens-text-secondary tabular-nums">N/A</span>
        ) : (
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-bold text-finlens-primary tabular-nums">
              {lastValue!.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
            <span className="text-sm text-finlens-text-secondary">{ratio.unit}</span>
          </div>
        )}
        {lastYear && !isNA && (
          <p className="text-xs text-finlens-text-secondary mt-0.5">{lastYear}年</p>
        )}
        {isNA && ratio.values.find(v => v.naReason) && (
          <p className="text-xs text-finlens-text-secondary mt-0.5">
            {ratio.values.find(v => v.naReason)?.naReason}
          </p>
        )}
      </div>

      {/* 迷你趋势图 */}
      <div className="h-18">
        <RatioTrendChart values={ratio.values} color="#1E3A5F" compact />
      </div>

      {/* 基准参考 */}
      {ratio.benchmark && (
        <p className="text-xs text-finlens-text-secondary mt-2 pt-2 border-t border-finlens-border/50">
          {ratio.benchmark}
        </p>
      )}
    </div>
  );
}
