// FinLens — 文件上传组件（拖拽 + 进度 + 错误大白话提示）
'use client';

import { useState, useCallback, useRef } from 'react';
import { Upload, FileSpreadsheet, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import type { FinancialStatement, ParseError } from '@/types';
import { parseExcelFile, validateBalanceSheet } from '@/lib/excel';

interface FileUploadProps {
  onDataParsed: (statements: FinancialStatement[]) => void;
  onErrors: (errors: ParseError[]) => void;
}

export default function FileUpload({ onDataParsed, onErrors }: FileUploadProps) {
  const [dragOver, setDragOver] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [parseErrors, setParseErrors] = useState<ParseError[]>([]);
  const [balanceErrors, setBalanceErrors] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  const processFile = useCallback(async (file: File) => {
    const ext = file.name.split('.').pop()?.toLowerCase();
    if (ext !== 'xlsx' && ext !== 'xls') {
      setParseErrors([{ row: 0, field: '', message: `文件格式不支持（.${ext}）。请上传 .xlsx 或 .xls 格式的 Excel 文件。` }]);
      return;
    }

    setFileName(file.name);
    setLoading(true);
    setParseErrors([]);
    setBalanceErrors([]);

    try {
      const { statements, errors } = await parseExcelFile(file);
      setParseErrors(errors);

      // 勾稽关系校验
      const bErrors: string[] = [];
      for (const stmt of statements) {
        const err = validateBalanceSheet(stmt);
        if (err) bErrors.push(err);
      }
      setBalanceErrors(bErrors);

      if (errors.length === 0 && bErrors.length === 0) {
        onDataParsed(statements);
        onErrors([]);
      } else {
        onErrors(errors);
      }
    } catch (err: any) {
      setParseErrors([{ row: 0, field: '', message: err.message || '文件解析失败，请使用下载的模板填写后重新上传。' }]);
    } finally {
      setLoading(false);
    }
  }, [onDataParsed, onErrors]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) processFile(file);
  }, [processFile]);

  return (
    <div className="space-y-4">
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={`
          border-2 border-dashed rounded-md p-8 text-center cursor-pointer transition-all
          ${dragOver
            ? 'border-finlens-primary bg-finlens-primary-pale'
            : 'border-finlens-border hover:border-finlens-primary/50 hover:bg-finlens-bg-alt'
          }
        `}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".xlsx,.xls"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) processFile(file);
          }}
        />

        {loading ? (
          <div className="flex flex-col items-center gap-3">
            <Loader2 size={32} className="text-finlens-primary animate-spin" />
            <p className="text-sm text-finlens-text-secondary">正在解析 {fileName}…</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3">
            {fileName && parseErrors.length === 0 && balanceErrors.length === 0 ? (
              <CheckCircle size={32} className="text-finlens-positive" />
            ) : (
              <Upload size={32} className="text-finlens-text-secondary" />
            )}
            <div>
              <p className="text-sm font-medium text-finlens-text-primary">
                {fileName
                  ? parseErrors.length > 0 || balanceErrors.length > 0
                    ? '解析完成，但存在以下问题：'
                    : `已选择：${fileName}`
                  : '拖拽 Excel 文件到此处，或点击选择文件'
                }
              </p>
              <p className="text-xs text-finlens-text-secondary mt-1">
                支持 .xlsx / .xls 格式，请使用下载的模板填写数据
              </p>
            </div>
          </div>
        )}
      </div>

      {/* 解析错误 */}
      {parseErrors.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex items-start gap-2">
            <AlertCircle size={16} className="text-finlens-accent-red mt-0.5 shrink-0" />
            <div className="text-sm">
              <p className="font-medium text-finlens-accent-red mb-2">数据格式问题（{parseErrors.length} 处）：</p>
              <ul className="space-y-1.5">
                {parseErrors.map((err, i) => (
                  <li key={i} className="text-finlens-text-primary">{err.message}</li>
                ))}
              </ul>
              <p className="text-xs text-finlens-text-secondary mt-2">请修改 Excel 文件后重新上传。</p>
            </div>
          </div>
        </div>
      )}

      {/* 勾稽关系错误 */}
      {balanceErrors.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex items-start gap-2">
            <AlertCircle size={16} className="text-finlens-accent-red mt-0.5 shrink-0" />
            <div className="text-sm">
              <p className="font-medium text-finlens-accent-red mb-2">资产负债表不平（{balanceErrors.length} 处）：</p>
              <ul className="space-y-1.5">
                {balanceErrors.map((err, i) => (
                  <li key={i} className="text-finlens-text-primary">{err}</li>
                ))}
              </ul>
              <p className="text-xs text-finlens-text-secondary mt-2">请检查：资产 = 负债 + 净资产。修正后重新上传。</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
