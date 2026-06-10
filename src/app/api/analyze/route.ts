// FinLens — 分析 API
// POST: 接收 FinancialStatement[]，返回比率 + 预警 + 整体判断
import { NextResponse } from 'next/server';
import { calculateAllRatios, generateOverallJudgment, getKeyMetrics } from '@/lib/ratios';
import { detectAnomalies } from '@/lib/anomalies';
import { validateBalanceSheet } from '@/lib/excel';
import type { FinancialStatement } from '@/types';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const statements: FinancialStatement[] = body.statements;

    if (!Array.isArray(statements) || statements.length === 0) {
      return NextResponse.json(
        { error: '未收到财务数据。请上传 Excel 文件或填写表单后重试。' },
        { status: 400 },
      );
    }

    // 勾稽关系校验
    const balanceErrors: string[] = [];
    for (const stmt of statements) {
      const err = validateBalanceSheet(stmt);
      if (err) balanceErrors.push(err);
    }

    // 计算比率
    const ratios = calculateAllRatios(statements);
    const anomalies = detectAnomalies(statements);
    const overallJudgment = generateOverallJudgment(statements, ratios);
    const keyMetrics = getKeyMetrics(ratios, statements);

    return NextResponse.json({
      success: true,
      data: {
        companyName: statements[0]?.companyName || '未知公司',
        statements,
        ratios,
        anomalies,
        overallJudgment,
        keyMetrics,
        balanceErrors: balanceErrors.length > 0 ? balanceErrors : null,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: `分析请求处理失败：${error.message || '未知错误'}` },
      { status: 500 },
    );
  }
}
