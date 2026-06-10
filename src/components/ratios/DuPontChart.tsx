// FinLens — 杜邦分解图
'use client';

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import type { RatioResult, RatioValue } from '@/types';

interface DuPontChartProps {
  ratios: RatioResult[];
}

const COLORS = ['#1E3A5F', '#3B82F6', '#64748B'];

export default function DuPontChart({ ratios }: DuPontChartProps) {
  const netMargin = ratios.find(r => r.id === 'dupont-netMargin');
  const turnover = ratios.find(r => r.id === 'dupont-turnover');
  const leverage = ratios.find(r => r.id === 'dupont-leverage');
  const roe = ratios.find(r => r.id === 'roe');

  if (!netMargin || !turnover || !leverage) {
    return <p className="text-sm text-finlens-text-secondary">杜邦分解数据不足。</p>;
  }

  // 获取最新一年的数据
  const years = netMargin.values.filter(v => v.value !== null).map(v => v.year);
  if (years.length === 0) return <p className="text-sm text-finlens-text-secondary">杜邦分解数据不足（N/A）。</p>;

  // 检查是否整体 N/A
  const lastROE = roe?.values.find(v => v.year === years[years.length - 1]);
  if (lastROE?.naReason && lastROE.naReason.includes('净资产非正')) {
    return <p className="text-sm text-finlens-text-secondary">净资产非正，杜邦分解不适用。</p>;
  }

  const getVal = (r: RatioResult, year: number) => {
    const v = r.values.find(x => x.year === year);
    return v?.value ?? 0;
  };

  // 按年度组织柱状图数据
  const chartData = years.map(year => ({
    year,
    '净利率(%)': getVal(netMargin, year),
    '周转率(次)': getVal(turnover, year),
    '权益乘数(倍)': getVal(leverage, year),
  }));

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        {/* 三因子年度值表 + 公式 */}
        {years.map(year => {
          const nm = getVal(netMargin, year);
          const to = getVal(turnover, year);
          const lev = getVal(leverage, year);
          const roeVal = nm * to * lev / 100; // 净利率是%, 需要除100

          return (
            <div key={year} className="bg-finlens-bg-alt rounded-md p-3 text-center">
              <p className="text-xs text-finlens-text-secondary mb-1">{year}年</p>
              <div className="text-xs text-finlens-text-secondary space-y-0.5">
                <p>净利率 {nm.toFixed(1)}%</p>
                <p className="text-finlens-text-secondary/60">×</p>
                <p>周转率 {to.toFixed(2)} 次</p>
                <p className="text-finlens-text-secondary/60">×</p>
                <p>权益乘数 {lev.toFixed(2)} 倍</p>
                <p className="text-finlens-text-secondary/60">=</p>
                <p className="text-sm font-semibold text-finlens-primary tabular-nums">
                  ROE {roeVal.toFixed(1)}%
                </p>
              </div>
            </div>
          );
        })}
      </div>
      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} barCategoryGap="20%">
            <XAxis dataKey="year" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 11 }} width={40} tickLine={false} axisLine={false} />
            <Tooltip
              contentStyle={{
                border: '1px solid #E5E7EB',
                borderRadius: '4px',
                fontSize: '12px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
              }}
            />
            {['净利率(%)', '周转率(次)', '权益乘数(倍)'].map((key, idx) => (
              <Bar key={key} dataKey={key} fill={COLORS[idx]} radius={[2, 2, 0, 0]} />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
