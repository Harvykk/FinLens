// FinLens — AI 管理层摘要展示
'use client';

import { Brain, Copy, Check, Loader2 } from 'lucide-react';
import { useState } from 'react';
import type { AiSummaryResult } from '@/types';

interface AiSummaryProps {
  summary: AiSummaryResult | null;
  loading: boolean;
  error: string | null;
  notConfigured: boolean;
  onRetry: () => void;
}

export default function AiSummary({ summary, loading, error, notConfigured, onRetry }: AiSummaryProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (!summary) return;
    const text = [
      `【管理层分析评述 — ${summary.overview}】`,
      '',
      '## 最值得关注的问题',
      ...summary.topConcerns.map((c, i) => `${i + 1}. ${c}`),
      '',
      '## 建议追问方向',
      ...summary.suggestedQuestions.map((q, i) => `${i + 1}. ${q}`),
    ].join('\n');

    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
      const ta = document.createElement('textarea');
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // 未配置
  if (notConfigured && !summary && !loading) {
    return (
      <div className="bg-finlens-bg-alt border border-finlens-border rounded-md p-6 text-center animate-fade-in">
        <div className="flex justify-center mb-3">
          <Brain size={28} className="text-finlens-text-secondary" />
        </div>
        <p className="text-sm font-medium text-finlens-text-primary">AI 摘要功能未启用</p>
        <p className="text-xs text-finlens-text-secondary mt-1">
          在环境变量中设置 AI_API_KEY 后即可自动生成管理层分析评述。
        </p>
      </div>
    );
  }

  // 加载中
  if (loading) {
    return (
      <div className="bg-white border border-finlens-border rounded-md p-6 text-center animate-fade-in">
        <Loader2 size={24} className="text-finlens-primary animate-spin mx-auto mb-3" />
        <p className="text-sm text-finlens-text-secondary">正在生成管理层分析评述…</p>
      </div>
    );
  }

  // 错误
  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-6 text-center animate-fade-in">
        <p className="text-sm text-finlens-accent-red mb-2">{error}</p>
        <button
          onClick={onRetry}
          className="text-sm text-finlens-primary hover:underline"
        >
          点击重试
        </button>
      </div>
    );
  }

  // 有结果
  if (summary) {
    return (
      <div className="space-y-5 animate-fade-in">
        {/* 整体判断 */}
        <div className="bg-finlens-primary text-white rounded-md p-5">
          <div className="flex items-center gap-2 mb-2">
            <Brain size={16} />
            <span className="text-xs font-medium opacity-80">AI 管理层分析评述</span>
          </div>
          <p className="text-sm leading-relaxed opacity-95">{summary.overview}</p>
        </div>

        {/* 关注问题 */}
        {summary.topConcerns.length > 0 && (
          <div className="border border-finlens-border rounded-md p-4">
            <h4 className="text-sm font-semibold text-finlens-primary mb-2">最值得关注的 {summary.topConcerns.length} 个问题</h4>
            <ol className="space-y-2">
              {summary.topConcerns.map((c, i) => (
                <li key={i} className="text-sm text-finlens-text-primary flex gap-2">
                  <span className="font-bold text-finlens-primary shrink-0">{i + 1}.</span>
                  <span>{c}</span>
                </li>
              ))}
            </ol>
          </div>
        )}

        {/* 建议追问 */}
        {summary.suggestedQuestions.length > 0 && (
          <div className="border border-finlens-border rounded-md p-4">
            <h4 className="text-sm font-semibold text-finlens-primary mb-2">建议追问方向</h4>
            <ul className="space-y-2">
              {summary.suggestedQuestions.map((q, i) => (
                <li key={i} className="text-sm text-finlens-text-primary flex gap-2">
                  <span className="text-finlens-primary">→</span>
                  <span>{q}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* 复制按钮 */}
        <button
          onClick={handleCopy}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm text-finlens-primary border border-finlens-border rounded-sm hover:bg-finlens-bg-alt transition-colors"
        >
          {copied ? <Check size={14} className="text-finlens-positive" /> : <Copy size={14} />}
          {copied ? '已复制' : '一键复制摘要'}
        </button>
      </div>
    );
  }

  return null;
}
