// FinLens — 异常预警清单
'use client';

import { AlertTriangle, AlertCircle } from 'lucide-react';
import AnomalyCard from './AnomalyCard';
import type { AnomalyFlag } from '@/types';

interface AnomalyListProps {
  anomalies: AnomalyFlag[];
}

export default function AnomalyList({ anomalies }: AnomalyListProps) {
  if (!anomalies || anomalies.length === 0) {
    return (
      <div className="bg-finlens-bg-alt border border-finlens-border rounded-md p-8 text-center animate-fade-in">
        <div className="flex justify-center mb-3">
          <div className="w-12 h-12 rounded-full bg-finlens-positive/10 flex items-center justify-center">
            <AlertCircle size={24} className="text-finlens-positive" />
          </div>
        </div>
        <p className="text-sm font-medium text-finlens-text-primary">未发现异常信号</p>
        <p className="text-xs text-finlens-text-secondary mt-1">
          基于当前检测规则，该公司的财务数据未触发异常预警。这不代表绝对安全，建议结合行业和业务背景综合判断。
        </p>
      </div>
    );
  }

  const criticals = anomalies.filter(a => a.severity === 'critical');
  const warnings = anomalies.filter(a => a.severity === 'warning');

  return (
    <div className="space-y-4 animate-fade-in">
      {/* 统计摘要 */}
      <div className="flex items-center gap-4 text-sm">
        {criticals.length > 0 && (
          <span className="inline-flex items-center gap-1.5 text-finlens-accent-red font-medium">
            <AlertTriangle size={16} />
            {criticals.length} 条严重预警
          </span>
        )}
        {warnings.length > 0 && (
          <span className="inline-flex items-center gap-1.5 text-finlens-accent-amber font-medium">
            <AlertCircle size={16} />
            {warnings.length} 条提示关注
          </span>
        )}
      </div>

      {/* Critical 预警优先 */}
      {criticals.map(a => (
        <AnomalyCard key={a.id} anomaly={a} />
      ))}
      {warnings.map(a => (
        <AnomalyCard key={a.id} anomaly={a} />
      ))}
    </div>
  );
}
