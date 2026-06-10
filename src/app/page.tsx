// FinLens — 首页（上传入口 + 示例入口）
'use client';

import { useState, useCallback, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { FileSpreadsheet, Pencil, Eye, ArrowRight, BarChart3 } from 'lucide-react';
import FileUpload from '@/components/data-input/FileUpload';
import ManualEntry from '@/components/data-input/ManualEntry';
import TemplateDownload from '@/components/data-input/TemplateDownload';
import { steadyTechData, rapidHoldingsData } from '@/lib/sample-data';
import type { FinancialStatement, ParseError } from '@/types';

type InputMode = 'choose' | 'upload' | 'manual';

function HomeContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const demoParam = searchParams.get('demo');

  const [mode, setMode] = useState<InputMode>(demoParam ? 'choose' : 'choose');
  const [errors, setErrors] = useState<ParseError[]>([]);

  const handleUploadParsed = useCallback((statements: FinancialStatement[]) => {
    sessionStorage.setItem('finlens_statements', JSON.stringify(statements));
    sessionStorage.setItem('finlens_source', 'upload');
    router.push('/analysis');
  }, [router]);

  const handleManualSubmit = useCallback((statements: FinancialStatement[], _companyName: string) => {
    sessionStorage.setItem('finlens_statements', JSON.stringify(statements));
    sessionStorage.setItem('finlens_source', 'manual');
    router.push('/analysis');
  }, [router]);

  const handleViewExample = useCallback((which?: 'steady' | 'rapid') => {
    const data = which === 'rapid' ? rapidHoldingsData : steadyTechData;
    sessionStorage.setItem('finlens_statements', JSON.stringify(data));
    sessionStorage.setItem('finlens_source', 'demo');
    if (which) sessionStorage.setItem('finlens_demo_type', which);
    router.push('/analysis');
  }, [router]);

  // URL demo 参数直接跳转
  if (demoParam === 'steady') handleViewExample('steady');
  if (demoParam === 'rapid') handleViewExample('rapid');

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12 animate-fade-in">
      {/* Hero */}
      <div className="text-center mb-10">
        <div className="flex items-center justify-center gap-2 mb-3">
          <div className="w-9 h-9 rounded-md bg-finlens-primary flex items-center justify-center">
            <BarChart3 size={20} className="text-white" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-finlens-primary tracking-tight">FinLens</h1>
          <span className="text-lg sm:text-xl text-finlens-text-secondary">财报智能分析</span>
        </div>
        <p className="text-xs sm:text-sm text-finlens-text-secondary/70 max-w-xl mx-auto leading-relaxed">
          提交上市公司财务数据<br />
          几分钟内获得专业比率分析、异常预警和 AI 管理层摘要
        </p>
      </div>

      {/* 操作入口 */}
      {mode === 'choose' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
          <button
            onClick={() => setMode('upload')}
            className="group bg-white border border-finlens-border rounded-md p-6 text-left hover:border-finlens-primary/50 hover:shadow-[0_2px_6px_rgba(0,0,0,0.1)] transition-all"
          >
            <div className="w-10 h-10 rounded-md bg-finlens-primary-pale flex items-center justify-center mb-3 group-hover:bg-finlens-primary/10 transition-colors">
              <FileSpreadsheet size={22} className="text-finlens-primary" />
            </div>
            <h3 className="text-base font-semibold text-finlens-text-primary mb-1">上传 Excel 文件</h3>
            <p className="text-xs text-finlens-text-secondary leading-relaxed">
              下载模板 → 填入三表数据 → 上传解析。适合批量录入多年度数据。
            </p>
          </button>
          <button
            onClick={() => setMode('manual')}
            className="group bg-white border border-finlens-border rounded-md p-6 text-left hover:border-finlens-primary/50 hover:shadow-[0_2px_6px_rgba(0,0,0,0.1)] transition-all"
          >
            <div className="w-10 h-10 rounded-md bg-finlens-primary-pale flex items-center justify-center mb-3 group-hover:bg-finlens-primary/10 transition-colors">
              <Pencil size={22} className="text-finlens-primary" />
            </div>
            <h3 className="text-base font-semibold text-finlens-text-primary mb-1">网页表单录入</h3>
            <p className="text-xs text-finlens-text-secondary leading-relaxed">
              直接在网页上填写利润表、资产负债表、现金流量表科目，支持多年度。
            </p>
          </button>
        </div>
      )}

      {/* 返回 */}
      {mode !== 'choose' && (
        <button
          onClick={() => setMode('choose')}
          className="text-sm text-finlens-text-secondary hover:text-finlens-primary mb-4 transition-colors"
        >
          ← 返回选择
        </button>
      )}

      {/* 上传模式 */}
      {mode === 'upload' && (
        <div className="space-y-6">
          <TemplateDownload />
          <div className="bg-white border border-finlens-border rounded-md p-5">
            <h3 className="text-sm font-semibold text-finlens-text-primary mb-3">上传已填写的 Excel</h3>
            <FileUpload onDataParsed={handleUploadParsed} onErrors={setErrors} />
          </div>
        </div>
      )}

      {/* 手动录入 */}
      {mode === 'manual' && (
        <div className="bg-white border border-finlens-border rounded-md p-5">
          <h3 className="text-sm font-semibold text-finlens-text-primary mb-4">填写财务数据</h3>
          <ManualEntry onSubmit={handleManualSubmit} />
        </div>
      )}

      {/* 示例入口 */}
      {mode === 'choose' && (
        <div className="border-t border-finlens-border pt-8">
          <h3 className="text-sm font-semibold text-finlens-text-primary text-center mb-4">快速体验示例</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button
              onClick={() => handleViewExample('steady')}
              className="flex items-center justify-between bg-white border border-finlens-border rounded-md p-4 hover:border-finlens-primary/50 hover:shadow-[0_2px_6px_rgba(0,0,0,0.1)] transition-all group"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-finlens-positive/10 flex items-center justify-center">
                  <Eye size={16} className="text-finlens-positive" />
                </div>
                <div className="text-left">
                  <p className="text-sm font-medium text-finlens-text-primary">稳健科技</p>
                  <p className="text-xs text-finlens-text-secondary">经营健康的标杆企业 → 看正常分析效果</p>
                </div>
              </div>
              <ArrowRight size={16} className="text-finlens-text-secondary group-hover:text-finlens-primary transition-colors" />
            </button>
            <button
              onClick={() => handleViewExample('rapid')}
              className="flex items-center justify-between bg-white border border-finlens-border rounded-md p-4 hover:border-finlens-primary/50 hover:shadow-[0_2px_6px_rgba(0,0,0,0.1)] transition-all group"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-finlens-accent-red/10 flex items-center justify-center">
                  <Eye size={16} className="text-finlens-accent-red" />
                </div>
                <div className="text-left">
                  <p className="text-sm font-medium text-finlens-text-primary">急速控股</p>
                  <p className="text-xs text-finlens-text-secondary">暗藏财务风险 → 看预警功能如何发现问题</p>
                </div>
              </div>
              <ArrowRight size={16} className="text-finlens-text-secondary group-hover:text-finlens-primary transition-colors" />
            </button>
          </div>
          <p className="text-xs text-finlens-text-secondary text-center mt-3">
            以上公司均为虚构，数据仅用于功能演示
          </p>
        </div>
      )}
    </div>
  );
}

export default function Home() {
  return (
    <Suspense fallback={<div className="max-w-4xl mx-auto px-4 py-12 text-center text-sm text-finlens-text-secondary">加载中…</div>}>
      <HomeContent />
    </Suspense>
  );
}
