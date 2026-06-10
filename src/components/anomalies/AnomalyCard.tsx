// FinLens — 单条预警卡片
import { AlertTriangle, AlertCircle } from 'lucide-react';
import type { AnomalyFlag } from '@/types';

interface AnomalyCardProps {
  anomaly: AnomalyFlag;
}

export default function AnomalyCard({ anomaly }: AnomalyCardProps) {
  const isCritical = anomaly.severity === 'critical';

  return (
    <div
      className={`border rounded-md p-4 ${
        isCritical
          ? 'border-red-200 bg-red-50/50'
          : 'border-amber-200 bg-amber-50/50'
      }`}
    >
      <div className="flex items-start gap-3">
        <div className={`mt-0.5 shrink-0 ${isCritical ? 'text-finlens-accent-red' : 'text-finlens-accent-amber'}`}>
          {isCritical ? <AlertTriangle size={18} /> : <AlertCircle size={18} />}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span
              className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                isCritical
                  ? 'bg-red-100 text-finlens-accent-red'
                  : 'bg-amber-100 text-finlens-accent-amber'
              }`}
            >
              {isCritical ? '严重预警' : '提示关注'}
            </span>
            <span className="text-sm font-medium text-finlens-text-primary">{anomaly.ruleName}</span>
          </div>
          <p className="text-sm text-finlens-text-primary leading-relaxed">{anomaly.description}</p>
          <div className="mt-2 pt-2 border-t border-finlens-border/50">
            <p className="text-xs text-finlens-text-secondary">
              <span className="font-medium text-finlens-text-primary">为什么值得关注：</span>
              {anomaly.concern}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
