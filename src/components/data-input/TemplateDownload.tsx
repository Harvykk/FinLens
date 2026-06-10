// FinLens — 模板下载组件
'use client';

import { Download } from 'lucide-react';
import { downloadTemplate } from '@/lib/excel';

export default function TemplateDownload() {
  return (
    <div className="bg-finlens-primary-pale border border-finlens-primary/10 rounded-md p-4">
      <div className="flex items-start gap-4 flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-sm font-semibold text-finlens-primary">下载 Excel 模板</h3>
          <p className="text-xs text-finlens-text-secondary mt-0.5">
            标准模板含三个年度 Sheet（利润表、资产负债表、现金流量表科目），标 ★ 为必填项
          </p>
        </div>
        <button
          onClick={downloadTemplate}
          className="inline-flex items-center gap-2 px-4 py-2 bg-finlens-primary text-white text-sm font-medium rounded-sm hover:bg-finlens-primary-light transition-colors shrink-0"
        >
          <Download size={14} />
          下载模板 (.xlsx)
        </button>
      </div>
    </div>
  );
}
