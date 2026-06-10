// FinLens — 示例数据标识横幅
'use client';

import { Info } from 'lucide-react';

export default function ExampleBanner() {
  return (
    <div className="bg-finlens-accent-amber/10 border border-finlens-accent-amber/30 rounded-md px-4 py-2.5 flex items-center gap-2.5 animate-fade-in">
      <Info size={16} className="text-finlens-accent-amber shrink-0" />
      <p className="text-xs sm:text-sm text-finlens-accent-amber font-medium">
        当前展示的是模拟数据，仅供功能演示参考，不代表任何真实公司财务状况。
      </p>
    </div>
  );
}
