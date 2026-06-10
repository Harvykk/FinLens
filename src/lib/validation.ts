// FinLens — 财务数据校验（纯计算，Edge/Node.js 通用）
import type { FinancialStatement } from '@/types';

/** 验证勾稽关系（资产 = 负债 + 权益） */
export function validateBalanceSheet(stmt: FinancialStatement): string | null {
  const diff = Math.abs(stmt.totalAssets - (stmt.totalLiabilities + stmt.totalEquity));
  const tolerance = Math.max(stmt.totalAssets * 0.001, 1); // 0.1% 或 1 万元

  if (diff > tolerance) {
    const expectedEquity = stmt.totalAssets - stmt.totalLiabilities;
    return `${stmt.fiscalYear}年度资产负债表不平衡：总资产 ${stmt.totalAssets.toLocaleString()} 万元 ≠ 总负债 ${stmt.totalLiabilities.toLocaleString()} + 净资产 ${stmt.totalEquity.toLocaleString()} = ${(stmt.totalLiabilities + stmt.totalEquity).toLocaleString()} 万元，差额 ${diff.toFixed(0)} 万元。请检查数据后重新上传。`;
  }
  return null;
}
