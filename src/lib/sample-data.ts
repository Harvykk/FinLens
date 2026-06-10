// FinLens — 虚构公司模拟数据（3 年度，符合三表勾稽关系）
import type { FinancialStatement } from '@/types';

// ============================================================
// 稳健科技 — 经营健康的标杆企业
// 特征：稳健增长、现金流充裕、负债合理、各项指标均处于健康区间
// ============================================================

export const steadyTechData: FinancialStatement[] = [
  {
    companyName: '稳健科技（示例）',
    fiscalYear: 2023,
    revenue: 10000,
    costOfRevenue: 6000,
    sellingExpenses: 800,
    adminExpenses: 600,
    rdExpenses: 400,
    financeExpenses: 200,
    interestExpense: 100,
    incomeTax: 600,
    netIncome: 1400,
    totalAssets: 8000,
    currentAssets: 4000,
    cashEquivalents: 1500,
    accountsReceivable: 800,
    otherReceivables: 100,
    inventory: 600,
    totalLiabilities: 3200,
    currentLiabilities: 3200,
    shortTermBorrowings: 500,
    accountsPayable: 800,
    otherPayables: 150,
    totalEquity: 4800,
    operatingCashFlow: 1500,
  },
  {
    companyName: '稳健科技（示例）',
    fiscalYear: 2024,
    revenue: 11500,
    costOfRevenue: 6900,
    sellingExpenses: 900,
    adminExpenses: 650,
    rdExpenses: 460,
    financeExpenses: 180,
    interestExpense: 90,
    incomeTax: 720,
    netIncome: 1690,
    totalAssets: 9200,
    currentAssets: 4600,
    cashEquivalents: 1800,
    accountsReceivable: 920,
    otherReceivables: 115,
    inventory: 690,
    totalLiabilities: 3500,
    currentLiabilities: 3500,
    shortTermBorrowings: 450,
    accountsPayable: 850,
    otherPayables: 165,
    totalEquity: 5700,
    operatingCashFlow: 1800,
  },
  {
    companyName: '稳健科技（示例）',
    fiscalYear: 2025,
    revenue: 13200,
    costOfRevenue: 7920,
    sellingExpenses: 1020,
    adminExpenses: 720,
    rdExpenses: 530,
    financeExpenses: 160,
    interestExpense: 80,
    incomeTax: 850,
    netIncome: 2000,
    totalAssets: 10600,
    currentAssets: 5300,
    cashEquivalents: 2100,
    accountsReceivable: 1060,
    otherReceivables: 130,
    inventory: 790,
    totalLiabilities: 3850,
    currentLiabilities: 3850,
    shortTermBorrowings: 400,
    accountsPayable: 900,
    otherPayables: 180,
    totalEquity: 6750,
    operatingCashFlow: 2150,
  },
];

// ============================================================
// 急速控股 — 暗藏财务风险的问题企业
// 埋入异常:
//   规则1: 收入增长但经营现金流持续下降（2024降15% → 2025降24%）
//   规则2: 应收增速远超收入增速（2024: 应收+60% vs 收入+20%, 2025: 应收+50% vs 收入+15%）
//   规则9: 存贷双高（2025: 货币资金/总资产≈24%, 短期借款/总资产≈20%）
// ============================================================

export const rapidHoldingsData: FinancialStatement[] = [
  {
    companyName: '急速控股（示例）',
    fiscalYear: 2023,
    revenue: 8000,
    costOfRevenue: 5200,
    sellingExpenses: 600,
    adminExpenses: 500,
    rdExpenses: 200,
    financeExpenses: 300,
    interestExpense: 180,
    incomeTax: 360,
    netIncome: 840,
    totalAssets: 10000,
    currentAssets: 5200,
    cashEquivalents: 2500,
    accountsReceivable: 1000,
    otherReceivables: 150,
    inventory: 800,
    totalLiabilities: 5000,
    currentLiabilities: 4500,
    shortTermBorrowings: 1800,
    accountsPayable: 700,
    otherPayables: 200,
    totalEquity: 5000,
    operatingCashFlow: 950,
  },
  {
    companyName: '急速控股（示例）',
    fiscalYear: 2024,
    revenue: 9600,         // +20%
    costOfRevenue: 6240,
    sellingExpenses: 720,
    adminExpenses: 580,
    rdExpenses: 240,
    financeExpenses: 340,
    interestExpense: 210,
    incomeTax: 444,
    netIncome: 1036,       // +23%
    totalAssets: 12000,
    currentAssets: 6500,
    cashEquivalents: 3000,
    accountsReceivable: 1600,  // +60% ← 异常！
    otherReceivables: 180,
    inventory: 960,           // +20%
    totalLiabilities: 6500,
    currentLiabilities: 5800,
    shortTermBorrowings: 2200,
    accountsPayable: 820,
    otherPayables: 250,
    totalEquity: 5500,
    operatingCashFlow: 810,    // -15% ← 异常！
  },
  {
    companyName: '急速控股（示例）',
    fiscalYear: 2025,
    revenue: 11040,        // +15%
    costOfRevenue: 7176,
    sellingExpenses: 850,
    adminExpenses: 660,
    rdExpenses: 300,
    financeExpenses: 390,
    interestExpense: 250,
    incomeTax: 499,
    netIncome: 1165,       // +12%
    totalAssets: 14000,
    currentAssets: 7800,
    cashEquivalents: 3400,    // 3400/14000 = 24.3% ← 存贷双高
    accountsReceivable: 2400, // +50% ← 异常！远超收入增速15%
    otherReceivables: 200,
    inventory: 1100,         // +15%
    totalLiabilities: 8000,
    currentLiabilities: 7000,
    shortTermBorrowings: 2800, // 2800/14000 = 20% ← 存贷双高
    accountsPayable: 950,
    otherPayables: 300,
    totalEquity: 6000,
    operatingCashFlow: 615,    // -24% ← 异常！
  },
];
