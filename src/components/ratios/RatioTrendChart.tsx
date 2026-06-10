// FinLens — 比率年度对比柱状图
'use client';

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import type { RatioValue } from '@/types';

interface RatioTrendChartProps {
  values: RatioValue[];
  color?: string;
  compact?: boolean;
}

/** Y 轴从 0 起算，顶部留 10% 空间 */
function yDomain(dataMax: number): [number, number] {
  if (dataMax === 0) return [0, 1];
  return [0, dataMax * 1.15];
}

export default function RatioTrendChart({ values, color = '#1E3A5F', compact = false }: RatioTrendChartProps) {
  const validData = values
    .filter((v): v is RatioValue & { value: number } => v.value !== null)
    .map(v => ({ year: v.year, value: v.value }));

  if (validData.length === 0) {
    return <div className="flex items-center justify-center h-full text-xs text-finlens-text-secondary">数据不足</div>;
  }

  const dataMax = Math.max(...validData.map(d => d.value));
  const [domainMin, domainMax] = yDomain(dataMax);

  const height = compact ? 72 : 220;

  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={validData} margin={{ top: 2, right: 2, bottom: 2, left: 2 }}>
        <XAxis dataKey="year" hide={compact} tick={{ fontSize: 12 }} tickLine={false} />
        <YAxis
          hide={compact}
          tick={{ fontSize: 11 }}
          width={40}
          tickLine={false}
          axisLine={false}
          domain={[domainMin, domainMax]}
        />
        <Tooltip
          contentStyle={{
            border: '1px solid #E5E7EB',
            borderRadius: '4px',
            fontSize: '12px',
            boxShadow: compact ? 'none' : '0 1px 3px rgba(0,0,0,0.08)',
          }}
          formatter={(value) => [Number(value).toFixed(2), '']}
          labelFormatter={(label) => `${label}年`}
        />
        <Bar
          dataKey="value"
          fill={color}
          radius={[2, 2, 0, 0]}
          maxBarSize={compact ? 30 : 48}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}
