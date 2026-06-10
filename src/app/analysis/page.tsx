// FinLens — 分析结果页（比率 + 预警 + AI 摘要）
'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { BarChart3, AlertTriangle, Brain, ArrowLeft } from 'lucide-react';
import ExampleBanner from '@/components/demo/ExampleBanner';
import RatioDashboard from '@/components/ratios/RatioDashboard';
import AnomalyList from '@/components/anomalies/AnomalyList';
import AiSummary from '@/components/summary/AiSummary';
import NumberDisplay from '@/components/ui/NumberDisplay';
import Skeleton from '@/components/ui/Skeleton';
import { calculateAllRatios, generateOverallJudgment, getKeyMetrics } from '@/lib/ratios';
import { detectAnomalies } from '@/lib/anomalies';
import { validateBalanceSheet } from '@/lib/excel';
import type { FinancialStatement, RatioResult, AnomalyFlag, AiSummaryResult } from '@/types';

type Tab = 'ratios' | 'anomalies' | 'summary';

function AnalysisContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [loading, setLoading] = useState(true);
  const [statements, setStatements] = useState<FinancialStatement[]>([]);
  const [ratios, setRatios] = useState<RatioResult[]>([]);
  const [anomalies, setAnomalies] = useState<AnomalyFlag[]>([]);
  const [judgment, setJudgment] = useState('');
  const [keyMetrics, setKeyMetricsState] = useState({ roe: '—', netMargin: '—', debtRatio: '—', cfToNetIncome: '—' });
  const [isDemo, setIsDemo] = useState(false);
  const [balanceErrors, setBalanceErrors] = useState<string[]>([]);

  // AI 摘要状态
  const [activeTab, setActiveTab] = useState<Tab>('ratios');
  const [aiSummary, setAiSummary] = useState<AiSummaryResult | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  // 加载数据并计算
  useEffect(() => {
    const storedData = sessionStorage.getItem('finlens_statements');
    const source = sessionStorage.getItem('finlens_source');

    if (!storedData) {
      router.push('/');
      return;
    }

    try {
      const parsed: FinancialStatement[] = JSON.parse(storedData);
      setStatements(parsed);
      setIsDemo(source === 'demo');

      // 勾稽关系校验
      const bErrors: string[] = [];
      for (const stmt of parsed) {
        const err = validateBalanceSheet(stmt);
        if (err) bErrors.push(err);
      }
      setBalanceErrors(bErrors);

      // 计算比率
      const r = calculateAllRatios(parsed);
      setRatios(r);

      // 检测异常
      const a = detectAnomalies(parsed);
      setAnomalies(a);

      // 整体判断
      setJudgment(generateOverallJudgment(parsed, r));

      // 关键指标
      setKeyMetricsState(getKeyMetrics(r, parsed));
    } catch {
      router.push('/');
    } finally {
      setLoading(false);
    }
  }, [router]);

  // 自动请求 AI 摘要
  const fetchAiSummary = useCallback(async () => {
    setAiLoading(true);
    setAiError(null);
    try {
      const res = await fetch('/api/ai-summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          companyName: statements[0]?.companyName || '未知公司',
          statements,
          ratios,
          anomalies,
        }),
      });
      const json = await res.json();
      if (json.success) {
        setAiSummary(json.data);
      } else {
        setAiError(json.error || 'AI 摘要生成失败');
      }
    } catch {
      setAiError('AI 摘要请求失败，请检查网络连接后重试。');
    } finally {
      setAiLoading(false);
    }
  }, [statements, ratios, anomalies]);

  // 切换到摘要 Tab 时触发 AI 请求
  useEffect(() => {
    if (activeTab === 'summary' && !aiSummary && !aiLoading && !aiError) {
      fetchAiSummary();
    }
  }, [activeTab, aiSummary, aiLoading, aiError, fetchAiSummary]);

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-64 w-full" count={2} />
      </div>
    );
  }

  if (statements.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 text-center">
        <p className="text-finlens-text-secondary">未找到分析数据，请返回首页上传文件或录入数据。</p>
      </div>
    );
  }

  const companyName = statements[0]?.companyName || '未知公司';

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 animate-fade-in">
      {/* 示例横幅 */}
      {isDemo && <div className="mb-6"><ExampleBanner /></div>}

      {/* 勾稽关系警告 */}
      {balanceErrors.length > 0 && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-sm font-medium text-finlens-accent-red mb-1">资产负债表不平衡</p>
          <ul className="text-xs text-finlens-text-primary space-y-0.5">
            {balanceErrors.map((e, i) => <li key={i}>{e}</li>)}
          </ul>
        </div>
      )}

      {/* 返回按钮 */}
      <button
        onClick={() => router.push('/')}
        className="inline-flex items-center gap-1 text-xs text-finlens-text-secondary hover:text-finlens-primary mb-6 transition-colors"
      >
        <ArrowLeft size={14} />
        返回首页
      </button>

      {/* Header：一句话判断 + 4 个关键指标 */}
      <div className="bg-white border border-finlens-border rounded-md p-5 sm:p-6 mb-6 shadow-[0_1px_3px_rgba(0,0,0,0.08)]">
        <h1 className="text-lg sm:text-xl font-bold text-finlens-primary mb-1">{companyName}</h1>
        <p className="text-sm sm:text-base text-finlens-text-secondary leading-relaxed mb-4">{judgment}</p>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'ROE', value: keyMetrics.roe, desc: '净资产收益率' },
            { label: '净利率', value: keyMetrics.netMargin, desc: '盈利能力' },
            { label: '资产负债率', value: keyMetrics.debtRatio, desc: '财务杠杆' },
            { label: '经营现金流/净利润', value: keyMetrics.cfToNetIncome, desc: '利润含金量' },
          ].map(({ label, value, desc }) => (
            <div key={label} className="text-center p-3 bg-finlens-bg-alt rounded-md">
              <p className="text-xs text-finlens-text-secondary mb-1">{desc}</p>
              <p className="text-xl sm:text-2xl font-bold text-finlens-primary tabular-nums">{value}</p>
              <p className="text-xs text-finlens-text-secondary">{label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Tab 导航 */}
      <div className="flex border-b border-finlens-border mb-6">
        {([
          { key: 'ratios', label: '比率分析', icon: BarChart3, badge: undefined as number | undefined },
          { key: 'anomalies', label: '异常预警', icon: AlertTriangle, badge: anomalies.length },
          { key: 'summary', label: 'AI 管理层摘要', icon: Brain, badge: undefined as number | undefined },
        ]).map(({ key, label, icon: Icon, badge }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key as Tab)}
            className={`flex items-center gap-2 px-4 sm:px-6 py-3 text-sm font-medium transition-colors border-b-2 -mb-[1px] ${
              activeTab === key
                ? 'border-finlens-primary text-finlens-primary'
                : 'border-transparent text-finlens-text-secondary hover:text-finlens-text-primary'
            }`}
          >
            <Icon size={16} />
            {label}
            {badge !== undefined && badge > 0 && (
              <span className={`ml-1 text-xs px-1.5 py-0.5 rounded-full ${
                anomalies.filter(a => a.severity === 'critical').length > 0
                  ? 'bg-finlens-accent-red text-white'
                  : 'bg-finlens-accent-amber/20 text-finlens-accent-amber'
              }`}>
                {badge}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Tab 内容 */}
      <div className="min-h-[300px]">
        {activeTab === 'ratios' && <RatioDashboard ratios={ratios} />}
        {activeTab === 'anomalies' && <AnomalyList anomalies={anomalies} />}
        {activeTab === 'summary' && (
          <AiSummary
            summary={aiSummary}
            loading={aiLoading}
            error={aiError}
            notConfigured={!aiSummary && !aiLoading && !aiError}
            onRetry={fetchAiSummary}
          />
        )}
      </div>
    </div>
  );
}

export default function AnalysisPage() {
  return (
    <Suspense fallback={
      <div className="max-w-6xl mx-auto px-4 py-12 space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    }>
      <AnalysisContent />
    </Suspense>
  );
}
