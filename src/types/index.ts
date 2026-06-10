// FinLens — 全局类型定义

export interface FinancialStatement {
  companyName: string;
  fiscalYear: number;

  // 利润表
  revenue: number;
  costOfRevenue: number;
  sellingExpenses: number;
  adminExpenses: number;
  rdExpenses: number;
  financeExpenses: number;
  interestExpense: number; // 其中：利息费用（取自财务费用-利息支出）
  incomeTax: number;
  netIncome: number;

  // 资产负债表
  totalAssets: number;
  currentAssets: number;
  cashEquivalents: number; // 货币资金
  accountsReceivable: number;
  otherReceivables: number;
  inventory: number;
  totalLiabilities: number;
  currentLiabilities: number;
  shortTermBorrowings: number; // 短期借款
  accountsPayable: number;
  otherPayables: number;
  totalEquity: number;

  // 现金流量表
  operatingCashFlow: number;
}

export type RatioCategory =
  | 'profitability'
  | 'solvency'
  | 'efficiency'
  | 'cashflow';

export interface RatioValue {
  year: number;
  value: number | null; // null 表示 N/A
  naReason?: string;
}

export interface RatioResult {
  id: string;
  name: string;
  category: RatioCategory;
  values: RatioValue[];
  unit: string;
  trend: 'up' | 'down' | 'stable' | 'na';
  benchmark?: string;
}

export interface AnomalyFlag {
  id: string;
  ruleId: number;
  ruleName: string;
  severity: 'critical' | 'warning';
  description: string;
  concern: string;
}

export interface AnalysisResult {
  companyName: string;
  statements: FinancialStatement[];
  ratios: RatioResult[];
  anomalies: AnomalyFlag[];
  overallJudgment: string; // 一句话整体判断
  keyMetrics: {
    roe: string;
    netMargin: string;
    debtRatio: string;
    cfToNetIncome: string;
  };
  aiSummary: string | null;
}

// AI Summary
export interface AiSummaryResult {
  overview: string; // 整体经营判断
  topConcerns: string[]; // 2-3 个最值得关注的问题
  suggestedQuestions: string[]; // 建议追问方向
}

// Excel 模板列定义
export interface TemplateColumn {
  field: keyof FinancialStatement;
  label: string;
  report: '利润表' | '资产负债表' | '现金流量表';
  required: boolean;
}

// 上传/录入状态
export type InputMode = 'upload' | 'manual' | 'demo';

export interface ParseError {
  row: number;
  field: string;
  message: string;
}
