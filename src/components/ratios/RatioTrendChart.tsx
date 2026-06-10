// FinLens — 比率迷你趋势折线图
'use client';

import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import type { RatioValue } from '@/types';

interface RatioTrendChartProps {
  values: RatioValue[];
  color?: string;
  compact?: boolean;
}

export default function RatioTrendChart({ values, color = '#1E3A5F', compact = false }: RatioTrendChartProps) {
  const validData = values
    .filter(v => v.value !== null)
    .map(v => ({ year: v.year, value: v.value }));

  if (validData.length < 2) {
    // 单点也用图表展示
    if (validData.length === 1) {
      return (
        <ResponsiveContainer width="100%" height={compact ? 48 : 200}>
          <LineChart data={validData}>
            <XAxis dataKey="year" hide={compact} tick={{ fontSize: 12 }} />
            <YAxis hide={compact} tick={{ fontSize: 11 }} width={40} />
            <Tooltip
              contentStyle={{
                border: '1px solid #E5E7EB',
                borderRadius: '4px',
                fontSize: '12px',
                boxShadow: 'none',
              }}
              formatter={(value) => [Number(value).toFixed(2), '']}
              labelFormatter={(label) => `${label}年`}
            />
            <Line
              type="monotone"
              dataKey="value"
              stroke={color}
              strokeWidth={1.5}
              dot={{ r: 3, fill: color, strokeWidth: 0 }}
              activeDot={{ r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      );
    }
    return <div className="flex items-center justify-center h-full text-xs text-finlens-text-secondary">数据不足</div>;
  }

  return (
    <ResponsiveContainer width="100%" height={compact ? 48 : 200}>
      <LineChart data={validData} margin={{ top: 2, right: 2, bottom: 2, left: 2 }}>
        {!compact && <XAxis dataKey="year" tick={{ fontSize: 12 }} tickLine={false} />}
        {!compact && <YAxis tick={{ fontSize: 11 }} width={40} tickLine={false} axisLine={false} />}
        <Tooltip
          contentStyle={{
            border: '1px solid #E5E7EB',
            borderRadius: '4px',
            fontSize: '12px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
          }}
          formatter={(value) => [Number(value).toFixed(2), '']}
          labelFormatter={(label) => `${label}年`}
        />
        <Line
          type="monotone"
          dataKey="value"
          stroke={color}
          strokeWidth={1.5}
          dot={{ r: 2.5, fill: color, strokeWidth: 0 }}
          activeDot={{ r: 4 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
