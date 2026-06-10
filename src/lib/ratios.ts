// FinLens — 财务比率计算引擎
// 严格按照 docs/financial-ratios-formulas.md 实现
import type { FinancialStatement, RatioResult, RatioValue } from '@/types';

type StatementGetter = (s: FinancialStatement) => number;

// ---- 辅助函数 ----

/** 计算同比增速，处理N/A场景 */
function yoyGrowth(
  current: number,
  prior: number,
): { value: number | null; naReason?: string } {
  if (prior === 0) {
    return { value: null, naReason: '上年值为零，增速无意义' };
  }
  // 上年负、本年正 → 取绝对值做分母
  if (prior < 0 && current > 0) {
    return { value: (current - prior) / Math.abs(prior) * 100, naReason: undefined };
  }
  // 本年与上年均为负 → N/A
  if (current < 0 && prior < 0) {
    return { value: null, naReason: '两年均为负，增速不适用' };
  }
  return { value: (current - prior) / Math.abs(prior) * 100, naReason: undefined };
}

/** 两数相除并格式化为百分比 */
function pct(num: number, den: number): { value: number | null; naReason?: string } {
  if (den === 0) return { value: null, naReason: '分母为零' };
  return { value: (num / den) * 100 };
}

/** 两数相除返回倍数值 */
function ratio(num: number, den: number): { value: number | null; naReason?: string } {
  if (den === 0) return { value: null, naReason: '分母为零' };
  return { value: num / den };
}

/** 天数计算 */
function days(num: number, den: number): { value: number | null; naReason?: string } {
  if (den <= 0) return { value: null, naReason: '分母非正' };
  return { value: (num / den) * 365 };
}

/** 获取两年平均值（年末值近似） */
function avgVal(data: FinancialStatement[], year: number, getter: StatementGetter): number {
  const current = data.find(s => s.fiscalYear === year);
  const prior = data.find(s => s.fiscalYear === year - 1);
  if (!current) return 0;
  if (!prior) return getter(current);
  return (getter(current) + getter(prior)) / 2;
}

/** 对每年计算一个比率值 */
function computePerYear(
  data: FinancialStatement[],
  compute: (s: FinancialStatement, idx: number, all: FinancialStatement[]) => { value: number | null; naReason?: string },
): RatioValue[] {
  const sorted = [...data].sort((a, b) => a.fiscalYear - b.fiscalYear);
  return sorted.map((s, idx) => {
    const result = compute(s, idx, sorted);
    return {
      year: s.fiscalYear,
      value: result.value,
      naReason: result.naReason,
    };
  });
}

/** 判断趋势 */
function judgeTrend(values: RatioValue[]): 'up' | 'down' | 'stable' | 'na' {
  const valid = values.filter(v => v.value !== null);
  if (valid.length < 2) return 'na';
  const first = valid[0].value!;
  const last = valid[valid.length - 1].value!;
  const diff = last - first;
  if (diff > 0.5) return 'up';
  if (diff < -0.5) return 'down';
  return 'stable';
}

function lastValid(values: RatioValue[]): number | null {
  for (let i = values.length - 1; i >= 0; i--) {
    if (values[i].value !== null) return values[i].value;
  }
  return null;
}

// ---- 计算入口 ----

export function calculateAllRatios(data: FinancialStatement[]): RatioResult[] {
  if (!data || data.length === 0) return [];

  const results: RatioResult[] = [];
  const sorted = [...data].sort((a, b) => a.fiscalYear - b.fiscalYear);

  // ========================
  // 一、盈利能力
  // ========================

  // 1. 毛利率
  results.push({
    id: 'grossMargin',
    name: '毛利率',
    category: 'profitability',
    values: computePerYear(sorted, s => {
      if (s.revenue <= 0) return { value: null, naReason: '营业收入非正' };
      return pct(s.revenue - s.costOfRevenue, s.revenue);
    }),
    unit: '%',
    trend: 'stable',
    benchmark: '> 30% 为良好',
  });

  // 2. 净利率
  results.push({
    id: 'netMargin',
    name: '净利率',
    category: 'profitability',
    values: computePerYear(sorted, s => {
      if (s.revenue <= 0) return { value: null, naReason: '营业收入非正' };
      return pct(s.netIncome, s.revenue);
    }),
    unit: '%',
    trend: 'stable',
    benchmark: '> 10% 为优秀',
  });

  // 3. 收入增速
  results.push({
    id: 'revenueGrowth',
    name: '收入增速',
    category: 'profitability',
    values: computePerYear(sorted, (s, idx, all) => {
      if (idx === 0) return { value: null, naReason: '仅一年数据' };
      const prior = all[idx - 1];
      return yoyGrowth(s.revenue, prior.revenue);
    }),
    unit: '%',
    trend: 'stable',
    benchmark: '正值为增长',
  });

  // 4. 净利润增速
  results.push({
    id: 'netIncomeGrowth',
    name: '净利润增速',
    category: 'profitability',
    values: computePerYear(sorted, (s, idx, all) => {
      if (idx === 0) return { value: null, naReason: '仅一年数据' };
      const prior = all[idx - 1];
      return yoyGrowth(s.netIncome, prior.netIncome);
    }),
    unit: '%',
    trend: 'stable',
    benchmark: '正值为增长，需与收入增速对比',
  });

  // 5. ROE
  results.push({
    id: 'roe',
    name: 'ROE（净资产收益率）',
    category: 'profitability',
    values: computePerYear(sorted, s => {
      const equity = s.totalEquity;
      if (equity <= 0) return { value: null, naReason: '净资产非正' };
      // 简化：使用年末净资产（近似平均）
      const avgEquity = avgVal(sorted, s.fiscalYear, st => st.totalEquity);
      return pct(s.netIncome, avgEquity);
    }),
    unit: '%',
    trend: 'stable',
    benchmark: '> 15% 为优秀，< 5% 偏低',
  });

  // 6. ROA
  results.push({
    id: 'roa',
    name: 'ROA（总资产收益率）',
    category: 'profitability',
    values: computePerYear(sorted, s => {
      if (s.totalAssets <= 0) return { value: null, naReason: '总资产非正' };
      const avgAssets = avgVal(sorted, s.fiscalYear, st => st.totalAssets);
      return pct(s.netIncome, avgAssets);
    }),
    unit: '%',
    trend: 'stable',
    benchmark: '> 5% 为良好',
  });

  // 7. 杜邦分解
  const duPontNetMargin = computePerYear(sorted, s => {
    if (s.revenue <= 0) return { value: null, naReason: '营业收入非正' };
    return pct(s.netIncome, s.revenue);
  });

  const duPontTurnover = computePerYear(sorted, s => {
    if (s.totalAssets <= 0) return { value: null, naReason: '总资产非正' };
    const avgAssets = avgVal(sorted, s.fiscalYear, st => st.totalAssets);
    return ratio(s.revenue, avgAssets);
  });

  const duPontLeverage = computePerYear(sorted, s => {
    const avgEquity = avgVal(sorted, s.fiscalYear, st => st.totalEquity);
    const avgAssets = avgVal(sorted, s.fiscalYear, st => st.totalAssets);
    if (avgEquity <= 0) return { value: null, naReason: '净资产非正' };
    return ratio(avgAssets, avgEquity);
  });

  results.push({
    id: 'dupont-netMargin',
    name: '杜邦-净利率',
    category: 'profitability',
    values: duPontNetMargin,
    unit: '%',
    trend: 'stable',
  });
  results.push({
    id: 'dupont-turnover',
    name: '杜邦-总资产周转率',
    category: 'profitability',
    values: duPontTurnover,
    unit: '次',
    trend: 'stable',
  });
  results.push({
    id: 'dupont-leverage',
    name: '杜邦-权益乘数',
    category: 'profitability',
    values: duPontLeverage,
    unit: '倍',
    trend: 'stable',
  });

  // ========================
  // 二、偿债能力
  // ========================

  // 8. 流动比率
  results.push({
    id: 'currentRatio',
    name: '流动比率',
    category: 'solvency',
    values: computePerYear(sorted, s => {
      if (s.currentLiabilities === 0) return { value: null, naReason: '无流动负债' };
      return ratio(s.currentAssets, s.currentLiabilities);
    }),
    unit: '倍',
    trend: 'stable',
    benchmark: '> 2 安全，< 1 危险',
  });

  // 9. 速动比率
  results.push({
    id: 'quickRatio',
    name: '速动比率',
    category: 'solvency',
    values: computePerYear(sorted, s => {
      if (s.currentLiabilities === 0) return { value: null, naReason: '无流动负债' };
      return ratio(s.currentAssets - s.inventory, s.currentLiabilities);
    }),
    unit: '倍',
    trend: 'stable',
    benchmark: '> 1 安全，< 0.5 需关注',
  });

  // 10. 资产负债率
  results.push({
    id: 'debtRatio',
    name: '资产负债率',
    category: 'solvency',
    values: computePerYear(sorted, s => {
      if (s.totalAssets === 0) return { value: null, naReason: '总资产为零' };
      return pct(s.totalLiabilities, s.totalAssets);
    }),
    unit: '%',
    trend: 'stable',
    benchmark: '40%-60% 适中，> 70% 高杠杆',
  });

  // 11. 利息保障倍数
  results.push({
    id: 'interestCoverage',
    name: '利息保障倍数',
    category: 'solvency',
    values: computePerYear(sorted, s => {
      if (s.interestExpense === 0) return { value: null, naReason: '无有息负债或利息费用未填列' };
      const ebit = s.netIncome + s.incomeTax + s.interestExpense;
      return ratio(ebit, s.interestExpense);
    }),
    unit: '倍',
    trend: 'stable',
    benchmark: '> 3 安全，< 1 危险',
  });

  // ========================
  // 三、营运能力
  // ========================

  // 12. 应收账款周转天数
  results.push({
    id: 'dso',
    name: '应收账款周转天数',
    category: 'efficiency',
    values: computePerYear(sorted, s => {
      if (s.revenue <= 0) return { value: null, naReason: '营业收入非正' };
      const avgAR = avgVal(sorted, s.fiscalYear, st => st.accountsReceivable);
      return days(avgAR, s.revenue);
    }),
    unit: '天',
    trend: 'stable',
    benchmark: '越短越好',
  });

  // 13. 存货周转天数
  results.push({
    id: 'dio',
    name: '存货周转天数',
    category: 'efficiency',
    values: computePerYear(sorted, s => {
      if (s.costOfRevenue <= 0) return { value: null, naReason: '营业成本非正' };
      const avgInv = avgVal(sorted, s.fiscalYear, st => st.inventory);
      return days(avgInv, s.costOfRevenue);
    }),
    unit: '天',
    trend: 'stable',
    benchmark: '越短越好',
  });

  // 14. 应付账款周转天数
  results.push({
    id: 'dpo',
    name: '应付账款周转天数',
    category: 'efficiency',
    values: computePerYear(sorted, s => {
      if (s.costOfRevenue <= 0) return { value: null, naReason: '营业成本非正' };
      const avgAP = avgVal(sorted, s.fiscalYear, st => st.accountsPayable);
      return days(avgAP, s.costOfRevenue);
    }),
    unit: '天',
    trend: 'stable',
    benchmark: '长有利于流动性，过长可能支付困难',
  });

  // 15. 现金循环周期
  // CCC = DSO + DIO - DPO，需要同行数据
  const dsoValues = computePerYear(sorted, s => {
    if (s.revenue <= 0) return { value: null, naReason: '营业收入非正' };
    const avgAR = avgVal(sorted, s.fiscalYear, st => st.accountsReceivable);
    return days(avgAR, s.revenue);
  });
  const dioValues = computePerYear(sorted, s => {
    if (s.costOfRevenue <= 0) return { value: null, naReason: '营业成本非正' };
    const avgInv = avgVal(sorted, s.fiscalYear, st => st.inventory);
    return days(avgInv, s.costOfRevenue);
  });
  const dpoValues = computePerYear(sorted, s => {
    if (s.costOfRevenue <= 0) return { value: null, naReason: '营业成本非正' };
    const avgAP = avgVal(sorted, s.fiscalYear, st => st.accountsPayable);
    return days(avgAP, s.costOfRevenue);
  });

  results.push({
    id: 'ccc',
    name: '现金循环周期',
    category: 'efficiency',
    values: sorted.map((s, idx) => {
      const dso = dsoValues[idx].value;
      const dio = dioValues[idx].value;
      const dpo = dpoValues[idx].value;
      if (dso === null || dio === null || dpo === null) {
        return { year: s.fiscalYear, value: null, naReason: '组成指标数据不足' };
      }
      return { year: s.fiscalYear, value: dso + dio - dpo };
    }),
    unit: '天',
    trend: 'stable',
    benchmark: '越短越好，负值为占用上下游资金',
  });

  // ========================
  // 四、现金流质量
  // ========================

  // 16. 经营现金流/净利润
  results.push({
    id: 'cfToNetIncome',
    name: '经营现金流/净利润',
    category: 'cashflow',
    values: computePerYear(sorted, s => {
      if (s.netIncome <= 0) return { value: null, naReason: '净利润非正' };
      return ratio(s.operatingCashFlow, s.netIncome);
    }),
    unit: '倍',
    trend: 'stable',
    benchmark: '> 1 利润质量高，< 0.7 需关注',
  });

  // 补充趋势判断
  for (const r of results) {
    r.trend = judgeTrend(r.values);
  }

  return results;
}

/** 生成一句话整体判断 */
export function generateOverallJudgment(data: FinancialStatement[], ratios: RatioResult[]): string {
  const last = data[data.length - 1];
  if (!last) return '';

  const getLastVal = (id: string) => {
    const r = ratios.find(rr => rr.id === id);
    return r ? lastValid(r.values) : null;
  };

  const roe = getLastVal('roe');
  const cfNI = getLastVal('cfToNetIncome');
  const debt = getLastVal('debtRatio');
  const revGrowth = getLastVal('revenueGrowth');

  const parts: string[] = [];
  const company = last.companyName.replace('（示例）', '');

  // ROE 判断
  if (roe !== null) {
    if (roe >= 15) parts.push('盈利能力优秀');
    else if (roe >= 5) parts.push('盈利能力一般');
    else parts.push('盈利能力偏弱');
  }

  // 现金流判断
  if (cfNI !== null) {
    if (cfNI >= 1) parts.push('利润现金含量高');
    else if (cfNI >= 0.7) parts.push('利润现金含量正常');
    else parts.push('利润现金含量偏低');
  }

  // 杠杆判断
  if (debt !== null) {
    if (debt > 70) parts.push('财务杠杆偏高');
    else if (debt < 40) parts.push('财务杠杆偏低（保守）');
    else parts.push('财务杠杆适中');
  }

  // 增长判断
  if (revGrowth !== null) {
    if (revGrowth > 10) parts.push('收入保持较快增长');
    else if (revGrowth > 0) parts.push('收入微增');
    else parts.push('收入出现下滑');
  }

  if (parts.length === 0) return `${company}：数据不足，无法生成整体判断。`;
  return `${company}：${parts.join('，')}。`;
}

/** 提取 4 个关键指标 */
export function getKeyMetrics(ratios: RatioResult[], data: FinancialStatement[]) {
  const last = data[data.length - 1];
  const fmt = (id: string, unit: string) => {
    const r = ratios.find(rr => rr.id === id);
    if (!r) return '—';
    const lv = lastValid(r.values);
    if (lv === null) return 'N/A';
    return `${lv.toFixed(2)}${unit}`;
  };

  return {
    roe: fmt('roe', '%'),
    netMargin: fmt('netMargin', '%'),
    debtRatio: fmt('debtRatio', '%'),
    cfToNetIncome: fmt('cfToNetIncome', '倍'),
  };
}
