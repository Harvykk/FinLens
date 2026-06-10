// FinLens — AI 接口封装（OpenAI 兼容）
import type { FinancialStatement, RatioResult, AnomalyFlag, AiSummaryResult } from '@/types';

interface AiConfig {
  apiKey: string;
  baseUrl?: string;
  model?: string;
}

function getAiConfig(): AiConfig | null {
  const apiKey = process.env.AI_API_KEY;
  if (!apiKey) return null;
  return {
    apiKey,
    baseUrl: process.env.AI_BASE_URL || undefined,
    model: process.env.AI_MODEL || 'gpt-4o-mini',
  };
}

function buildPrompt(
  companyName: string,
  years: number[],
  ratios: RatioResult[],
  anomalies: AnomalyFlag[],
): string {
  // 构建比率摘要
  const ratioSummary = ratios.map(r => {
    const vals = r.values
      .filter(v => v.value !== null)
      .map(v => `${v.year}年: ${v.value!.toFixed(2)}${r.unit}`)
      .join('，');
    const naVals = r.values.filter(v => v.value === null);
    const naStr = naVals.length > 0 ? `（${naVals.map(v => `${v.year}年: ${v.naReason}`).join('；')}）` : '';
    return `- ${r.name}: ${vals}${naStr}`;
  }).join('\n');

  // 构建异常摘要
  let anomalySummary = '无异常预警。';
  if (anomalies.length > 0) {
    anomalySummary = anomalies.map(a => `[${a.severity === 'critical' ? '严重' : '警告'}] ${a.ruleName}: ${a.description}`).join('\n');
  }

  return `你是一位资深财务分析师，正在审阅一家上市公司的财务报表。

## 公司信息
- 公司名称：${companyName}
- 分析年度：${years.join('年、')}年

## 财务比率计算结果
${ratioSummary}

## 异常预警
${anomalySummary}

## 要求
请基于以上真实数据，生成一份管理层分析评述。要求：
1. **严禁编造任何数字**。只能引用上面给出的数据，不得自行补充任何未出现的金额或比率值。
2. 输出分为三部分：
   - 整体经营判断（一段话，80-120字）
   - 最值得关注的2-3个问题（列表格式，每条简要说明）
   - 建议追问方向（列表格式，2-3条具体可执行的建议）
3. 语言专业、克制、以数据说话。用中文输出。
4. 如果数据中出现明显异常信号，在判断中如实指出；如果整体健康，给出正面评价但保留审慎措辞。
5. 不要输出"以下是分析"之类的开场白，直接进入正文。

请按以下 JSON 格式输出（仅输出 JSON，不要包含 markdown 代码块标记）：
{
  "overview": "整体经营判断",
  "topConcerns": ["问题1", "问题2", "问题3"],
  "suggestedQuestions": ["建议1", "建议2", "建议3"]
}`;
}

export async function generateAiSummary(
  companyName: string,
  statements: FinancialStatement[],
  ratios: RatioResult[],
  anomalies: AnomalyFlag[],
): Promise<AiSummaryResult | null> {
  const config = getAiConfig();
  if (!config) return null;

  const years = statements.map(s => s.fiscalYear).sort();

  // 动态导入 OpenAI（避免客户端 bundle 问题）
  const { OpenAI } = await import('openai');

  const client = new OpenAI({
    apiKey: config.apiKey,
    baseURL: config.baseUrl,
  });

  try {
    const response = await client.chat.completions.create({
      model: config.model || 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: '你是一位资深财务分析师，所有分析必须严格基于提供的数据，不编造任何数字。输出格式为 JSON。',
        },
        {
          role: 'user',
          content: buildPrompt(companyName, years, ratios, anomalies),
        },
      ],
      temperature: 0.3, // 低温度保证一致性
      max_tokens: 1000,
      response_format: { type: 'json_object' },
    });

    const content = response.choices[0]?.message?.content;
    if (!content) return null;

    const parsed = JSON.parse(content);
    return {
      overview: parsed.overview || '无法生成摘要。',
      topConcerns: Array.isArray(parsed.topConcerns) ? parsed.topConcerns : [],
      suggestedQuestions: Array.isArray(parsed.suggestedQuestions) ? parsed.suggestedQuestions : [],
    };
  } catch (error: any) {
    console.error('AI summary generation failed:', error.message);
    return {
      overview: 'AI 摘要生成失败，请检查 API Key 配置和网络连接。',
      topConcerns: [],
      suggestedQuestions: [],
    };
  }
}

/** 检查 AI 是否已配置 */
export function isAiConfigured(): boolean {
  return getAiConfig() !== null;
}
