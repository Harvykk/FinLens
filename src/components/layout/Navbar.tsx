// FinLens — 全局导航栏
import Link from 'next/link';
import { BarChart3 } from 'lucide-react';

export default function Navbar() {
  return (
    <nav className="border-b border-finlens-border bg-finlens-bg sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5 no-underline group">
          <div className="w-8 h-8 rounded-md bg-finlens-primary flex items-center justify-center">
            <BarChart3 size={18} className="text-white" />
          </div>
          <div>
            <span className="text-lg font-bold text-finlens-primary tracking-tight">FinLens</span>
            <span className="text-xs text-finlens-text-secondary ml-1.5 hidden sm:inline">财报智能分析</span>
          </div>
        </Link>
        <div className="flex items-center gap-4">
          <Link
            href="/?demo=steady"
            className="text-sm text-finlens-text-secondary hover:text-finlens-primary transition-colors"
          >
            查看示例
          </Link>
        </div>
      </div>
    </nav>
  );
}
