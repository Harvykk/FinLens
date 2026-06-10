// FinLens — 比率看板容器
'use client';

import RatioCard from './RatioCard';
import DuPontChart from './DuPontChart';
import type { RatioResult } from '@/types';

interface RatioDashboardProps {
  ratios: RatioResult[];
}

const CATEGORIES: { key: string; title: string; ids: string[] }[] = [
  {
    key: 'profitability',
    title: '盈利能力',
    ids: ['grossMargin', 'netMargin', 'revenueGrowth', 'netIncomeGrowth', 'roe', 'roa'],
  },
  {
    key: 'solvency',
    title: '偿债能力',
    ids: ['currentRatio', 'quickRatio', 'debtRatio', 'interestCoverage'],
  },
  {
    key: 'efficiency',
    title: '营运能力',
    ids: ['dso', 'dio', 'dpo', 'ccc'],
  },
  {
    key: 'cashflow',
    title: '现金流质量',
    ids: ['cfToNetIncome'],
  },
];

export default function RatioDashboard({ ratios }: RatioDashboardProps) {
  if (!ratios || ratios.length === 0) {
    return (
      <div className="text-center py-12 text-finlens-text-secondary text-sm">
        暂无比率数据。请先上传或录入财务数据。
      </div>
    );
  }

  const ratioMap = new Map(ratios.map(r => [r.id, r]));

  return (
    <div className="space-y-8 animate-fade-in">
      {/* 杜邦分解（独立区） */}
      <div className="bg-white border border-finlens-border rounded-md p-5">
        <h3 className="text-lg font-semibold text-finlens-primary mb-4">杜邦分解</h3>
        <DuPontChart ratios={ratios} />
      </div>

      {/* 四大类比率 */}
      {CATEGORIES.map(cat => {
        const catRatios = cat.ids.map(id => ratioMap.get(id)).filter(Boolean) as RatioResult[];
        if (catRatios.length === 0) return null;

        return (
          <div key={cat.key}>
            <h3 className="text-lg font-semibold text-finlens-primary mb-3">{cat.title}</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {catRatios.map(r => (
                <RatioCard key={r.id} ratio={r} />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
