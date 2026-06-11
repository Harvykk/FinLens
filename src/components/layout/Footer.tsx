// FinLens — 页脚
export default function Footer() {
  return (
    <footer className="border-t border-finlens-border bg-finlens-bg-alt py-6 mt-auto">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 text-center text-xs text-finlens-text-secondary">
        <p>FinLens 财报智能分析 · 分析结果仅供参考，不构成投资建议</p>
        <p className="mt-1">所有示例数据均为模拟数据，非真实公司信息</p>
        <p className="mt-3 pt-3 border-t border-finlens-border/50 text-finlens-text-secondary/60">
          Built by <span className="font-medium text-finlens-primary/70">Harvey Lee</span>
        </p>
      </div>
    </footer>
  );
}
