// FinLens — 手动录入表单（三表 × 多年份）
'use client';

import { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import type { FinancialStatement } from '@/types';

// 科目定义（方便表单渲染）
const INCOME_FIELDS: { field: keyof FinancialStatement; label: string }[] = [
  { field: 'revenue', label: '营业收入' },
  { field: 'costOfRevenue', label: '营业成本' },
  { field: 'sellingExpenses', label: '销售费用' },
  { field: 'adminExpenses', label: '管理费用' },
  { field: 'rdExpenses', label: '研发费用' },
  { field: 'financeExpenses', label: '财务费用（总额）' },
  { field: 'interestExpense', label: '其中：利息费用' },
  { field: 'incomeTax', label: '所得税费用' },
  { field: 'netIncome', label: '净利润' },
];

const BALANCE_FIELDS: { field: keyof FinancialStatement; label: string }[] = [
  { field: 'totalAssets', label: '总资产' },
  { field: 'currentAssets', label: '流动资产' },
  { field: 'cashEquivalents', label: '货币资金' },
  { field: 'accountsReceivable', label: '应收账款' },
  { field: 'otherReceivables', label: '其他应收款' },
  { field: 'inventory', label: '存货' },
  { field: 'totalLiabilities', label: '总负债' },
  { field: 'currentLiabilities', label: '流动负债' },
  { field: 'shortTermBorrowings', label: '短期借款' },
  { field: 'accountsPayable', label: '应付账款' },
  { field: 'otherPayables', label: '其他应付款' },
  { field: 'totalEquity', label: '净资产（所有者权益）' },
];

const CASHFLOW_FIELDS: { field: keyof FinancialStatement; label: string }[] = [
  { field: 'operatingCashFlow', label: '经营活动现金流量净额' },
];

function emptyStatement(year: number): FinancialStatement {
  return {
    companyName: '',
    fiscalYear: year,
    revenue: 0, costOfRevenue: 0, sellingExpenses: 0, adminExpenses: 0,
    rdExpenses: 0, financeExpenses: 0, interestExpense: 0, incomeTax: 0,
    netIncome: 0, totalAssets: 0, currentAssets: 0, cashEquivalents: 0,
    accountsReceivable: 0, otherReceivables: 0, inventory: 0,
    totalLiabilities: 0, currentLiabilities: 0, shortTermBorrowings: 0,
    accountsPayable: 0, otherPayables: 0, totalEquity: 0,
    operatingCashFlow: 0,
  };
}

interface ManualEntryProps {
  onSubmit: (statements: FinancialStatement[], companyName: string) => void;
}

export default function ManualEntry({ onSubmit }: ManualEntryProps) {
  const currentYear = new Date().getFullYear();
  const [companyName, setCompanyName] = useState('');
  const [statements, setStatements] = useState<FinancialStatement[]>([
    emptyStatement(currentYear),
    emptyStatement(currentYear - 1),
    emptyStatement(currentYear - 2),
  ]);
  const [activeTab, setActiveTab] = useState<0 | 1 | 2>(0);
  const [errors, setErrors] = useState<string[]>([]);

  const updateField = (yearIdx: number, field: keyof FinancialStatement, value: string) => {
    const num = value === '' ? 0 : Number(value);
    setStatements(prev => {
      const next = [...prev];
      next[yearIdx] = { ...next[yearIdx], [field]: isNaN(num) ? prev[yearIdx][field] : num };
      return next;
    });
  };

  const addYear = () => {
    const lastYear = statements[statements.length - 1]?.fiscalYear || currentYear;
    setStatements(prev => [...prev, emptyStatement(lastYear - 1)]);
  };

  const removeYear = (idx: number) => {
    if (statements.length <= 1) return;
    setStatements(prev => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = () => {
    const errs: string[] = [];
    if (!companyName.trim()) errs.push('请输入公司名称。');

    for (const s of statements) {
      if (!s.revenue) errs.push(`${s.fiscalYear}年度：营业收入为必填项，请补充。`);
      if (!s.netIncome && s.revenue > 0) errs.push(`${s.fiscalYear}年度：净利润为空，请补充。`);
    }

    setErrors(errs);
    if (errs.length > 0) return;

    const filled = statements.map(s => ({ ...s, companyName: companyName.trim() }));
    onSubmit(filled, companyName.trim());
  };

  const renderFieldRow = (s: FinancialStatement, yearIdx: number, field: keyof FinancialStatement, label: string) => {
    const val = s[field] as number;
    return (
      <div key={field} className="flex items-center gap-2 py-1.5">
        <label className="w-40 text-xs text-finlens-text-secondary shrink-0">{label}</label>
        <input
          type="number"
          step="any"
          value={val || ''}
          onChange={e => updateField(yearIdx, field, e.target.value)}
          placeholder="0"
          className="flex-1 px-2 py-1 text-sm border border-finlens-border rounded-sm focus:outline-none focus:border-finlens-primary tabular-nums"
        />
        <span className="text-xs text-finlens-text-secondary w-8">万元</span>
      </div>
    );
  };

  const tabs = [
    { label: '利润表', fields: INCOME_FIELDS },
    { label: '资产负债表', fields: BALANCE_FIELDS },
    { label: '现金流量表', fields: CASHFLOW_FIELDS },
  ] as const;

  return (
    <div className="space-y-4 animate-fade-in">
      {/* 公司名 */}
      <div className="flex items-center gap-3">
        <label className="text-sm font-medium text-finlens-text-primary w-20 shrink-0">公司名称</label>
        <input
          type="text"
          value={companyName}
          onChange={e => setCompanyName(e.target.value)}
          placeholder="请输入上市公司全称"
          className="flex-1 px-3 py-2 text-sm border border-finlens-border rounded-sm focus:outline-none focus:border-finlens-primary"
        />
      </div>

      {/* 年度切换 */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-xs text-finlens-text-secondary mr-1">年度：</span>
        {statements.map((s, idx) => (
          <div key={idx} className="flex items-center gap-1">
            <input
              type="number"
              value={s.fiscalYear || ''}
              onChange={e => {
                const y = parseInt(e.target.value);
                if (!isNaN(y)) {
                  setStatements(prev => {
                    const next = [...prev];
                    next[idx] = { ...next[idx], fiscalYear: y };
                    return next;
                  });
                }
              }}
              className="w-20 px-2 py-1 text-sm border border-finlens-border rounded-sm text-center tabular-nums focus:outline-none focus:border-finlens-primary"
              placeholder="年份"
            />
            {statements.length > 1 && (
              <button onClick={() => removeYear(idx)} className="text-finlens-text-secondary hover:text-finlens-accent-red">
                <Trash2 size={14} />
              </button>
            )}
          </div>
        ))}
        <button
          onClick={addYear}
          className="inline-flex items-center gap-1 px-2 py-1 text-xs text-finlens-primary hover:bg-finlens-primary-pale rounded-sm"
        >
          <Plus size={14} />
          添加年度
        </button>
      </div>

      {/* 报表 Tab 切换 */}
      <div className="flex border-b border-finlens-border">
        {tabs.map((tab, idx) => (
          <button
            key={idx}
            onClick={() => setActiveTab(idx as 0 | 1 | 2)}
            className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-[1px] ${
              activeTab === idx
                ? 'border-finlens-primary text-finlens-primary'
                : 'border-transparent text-finlens-text-secondary hover:text-finlens-text-primary'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* 表单字段 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-0">
        {statements.map((s, yearIdx) => (
          <div key={yearIdx} className="border border-finlens-border rounded-md p-3">
            <h4 className="text-sm font-semibold text-finlens-primary mb-2">{s.fiscalYear}年</h4>
            {tabs[activeTab].fields.map(f => renderFieldRow(s, yearIdx, f.field, f.label))}
          </div>
        ))}
      </div>

      {/* 错误 */}
      {errors.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-md p-3">
          <ul className="space-y-1 text-sm text-finlens-accent-red">
            {errors.map((e, i) => <li key={i}>{e}</li>)}
          </ul>
        </div>
      )}

      {/* 提交 */}
      <button
        onClick={handleSubmit}
        className="w-full sm:w-auto px-6 py-2.5 bg-finlens-primary text-white text-sm font-medium rounded-sm hover:bg-finlens-primary-light transition-colors"
      >
        提交分析
      </button>
    </div>
  );
}
