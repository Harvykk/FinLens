export const runtime = 'edge';

// FinLens — AI 摘要 API
// POST: 接收比率 + 预警数据，调用 AI 生成管理层摘要
import { NextResponse } from 'next/server';
import { generateAiSummary } from '@/lib/ai';
import type { FinancialStatement, RatioResult, AnomalyFlag } from '@/types';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      companyName,
      statements,
      ratios,
      anomalies,
    }: {
      companyName: string;
      statements: FinancialStatement[];
      ratios: RatioResult[];
      anomalies: AnomalyFlag[];
    } = body;

    if (!companyName || !ratios) {
      return NextResponse.json(
        { error: '缺少分析数据，请先完成比率计算后再生成摘要。' },
        { status: 400 },
      );
    }

    const result = await generateAiSummary(companyName, statements, ratios, anomalies);

    if (!result) {
      return NextResponse.json(
        {
          error: 'AI 未配置。请在环境变量中设置 AI_API_KEY 后重试。',
          notConfigured: true,
        },
        { status: 503 },
      );
    }

    return NextResponse.json({ success: true, data: result });
  } catch (error: any) {
    return NextResponse.json(
      { error: `AI 摘要生成失败：${error.message || '请检查 API Key 配置和网络连接。'}` },
      { status: 500 },
    );
  }
}
