// FinLens — 虚构公司模拟数据（3 年度，符合三表勾稽关系）
import type { FinancialStatement } from '@/types';

// ============================================================
// 稳健科技 — 经营持续改善的标杆企业
// 特征：收入利润逐年攀升、现金流充裕、负债率递减、所有指标向优
// ============================================================

export const steadyTechData: FinancialStatement[] = [
  {
    companyName: '稳健科技（示例）',
    fiscalYear: 2023,
    revenue: 10000,
    costOfRevenue: 6500,
    sellingExpenses: 800,
    adminExpenses: 600,
    rdExpenses: 400,
    financeExpenses: 200,
    interestExpense: 100,
    incomeTax: 375,
    netIncome: 1125,
    totalAssets: 8000,
    currentAssets: 4000,
    cashEquivalents: 1500,
    accountsReceivable: 900,
    otherReceivables: 100,
    inventory: 600,
    totalLiabilities: 3500,
    currentLiabilities: 3200,
    shortTermBorrowings: 800,
    accountsPayable: 750,
    otherPayables: 150,
    totalEquity: 4500,
    operatingCashFlow: 1200,
  },
  {
    companyName: '稳健科技（示例）',
    fiscalYear: 2024,
    revenue: 12000,           // +20%
    costOfRevenue: 7560,      // 毛利率 37%（+2pp）
    sellingExpenses: 880,
    adminExpenses: 650,
    rdExpenses: 480,
    financeExpenses: 180,
    interestExpense: 85,
    incomeTax: 563,
    netIncome: 1687,          // +50%
    totalAssets: 9500,
    currentAssets: 4800,
    cashEquivalents: 2100,
    accountsReceivable: 980,
    otherReceivables: 110,
    inventory: 680,
    totalLiabilities: 3700,
    currentLiabilities: 3300,
    shortTermBorrowings: 600,
    accountsPayable: 800,
    otherPayables: 160,
    totalEquity: 5800,
    operatingCashFlow: 1800,  // +50%
  },
  {
    companyName: '稳健科技（示例）',
    fiscalYear: 2025,
    revenue: 15000,           // +25%
    costOfRevenue: 9000,      // 毛利率 40%（+3pp）
    sellingExpenses: 950,
    adminExpenses: 700,
    rdExpenses: 580,
    financeExpenses: 150,
    interestExpense: 60,
    incomeTax: 905,
    netIncome: 2715,          // +61%
    totalAssets: 11500,
    currentAssets: 5800,
    cashEquivalents: 2900,
    accountsReceivable: 1080,
    otherReceivables: 120,
    inventory: 750,
    totalLiabilities: 3800,
    currentLiabilities: 3300,
    shortTermBorrowings: 300,
    accountsPayable: 850,
    otherPayables: 170,
    totalEquity: 7700,
    operatingCashFlow: 2900,  // +61%
  },
];

// ============================================================
// 急速控股 — 急剧恶化的风险企业
// 埋入异常:
//   规则1: 收入连年增长但经营现金流暴跌后转负
//          (2023: OCF 950 → 2024: 350 → 2025: -300)
//   规则2: 应收增速远超收入增速
//          (2024: 应收+100% vs 收入+20%, 2025: 应收+208% vs 收入+35%)
//   规则3: 存货异常堆积
//          (2024: 存货+40% vs 收入+20%, 2025: 存货+43% vs 收入+35%)
//   规则4: 毛利率断崖下跌（35% → 25% → 15%）
//   规则9: 存贷双高（2025: 货币资金/总资产≈16%, 短期借款/总资产≈31%）
// ============================================================

export const rapidHoldingsData: FinancialStatement[] = [
  {
    companyName: '急速控股（示例）',
    fiscalYear: 2023,
    revenue: 8000,
    costOfRevenue: 5200,      // 毛利率 35%
    sellingExpenses: 600,
    adminExpenses: 500,
    rdExpenses: 200,
    financeExpenses: 300,
    interestExpense: 180,
    incomeTax: 300,
    netIncome: 900,
    totalAssets: 9000,
    currentAssets: 5000,
    cashEquivalents: 2000,
    accountsReceivable: 1300,
    otherReceivables: 150,
    inventory: 700,
    totalLiabilities: 4500,
    currentLiabilities: 4000,
    shortTermBorrowings: 1500,
    accountsPayable: 700,
    otherPayables: 200,
    totalEquity: 4500,
    operatingCashFlow: 950,
  },
  {
    companyName: '急速控股（示例）',
    fiscalYear: 2024,
    revenue: 9600,            // +20%
    costOfRevenue: 7200,      // 毛利率 25%（-10pp，恶化开始）
    sellingExpenses: 750,
    adminExpenses: 600,
    rdExpenses: 250,
    financeExpenses: 380,
    interestExpense: 250,
    incomeTax: 105,
    netIncome: 315,           // -65%（利润跳水）
    totalAssets: 11500,
    currentAssets: 6800,
    cashEquivalents: 1700,
    accountsReceivable: 2600, // +100% ← 应收暴增！
    otherReceivables: 200,
    inventory: 980,           // +40% ← 存货堆积！
    totalLiabilities: 6800,   // 负债率 59%
    currentLiabilities: 6000,
    shortTermBorrowings: 2800,
    accountsPayable: 880,
    otherPayables: 280,
    totalEquity: 4700,
    operatingCashFlow: 350,   // -63% ← 现金流恶化！
  },
  {
    companyName: '急速控股（示例）',
    fiscalYear: 2025,
    revenue: 13000,           // +35%（收入仍在增长…）
    costOfRevenue: 11050,     // 毛利率 15%（-10pp，断崖下跌）
    sellingExpenses: 650,
    adminExpenses: 530,
    rdExpenses: 200,
    financeExpenses: 380,
    interestExpense: 300,
    incomeTax: 48,
    netIncome: 142,           // ROE ≈ 3%，濒临亏损
    totalAssets: 16000,
    currentAssets: 9500,
    cashEquivalents: 2500,
    accountsReceivable: 8000, // +208% ← 应收彻底失控！
    otherReceivables: 250,
    inventory: 1400,          // +43% ← 库存积压严重
    totalLiabilities: 11200,  // 负债率 70%
    currentLiabilities: 9500,
    shortTermBorrowings: 5000,
    accountsPayable: 1050,
    otherPayables: 380,
    totalEquity: 4800,
    operatingCashFlow: -300,  // 现金流转负！利润只是纸面数字
  },
];
