# FinLens — 项目说明

## 项目概述
FinLens（FinLens 财报智能分析）是一款上市公司财报智能分析 Web 工具。用户提交财务数据（Excel 上传或网页表单录入），工具自动生成比率分析看板、异常预警清单和 AI 管理层摘要。

## 技术栈
- **框架**: Next.js 16 (App Router) + TypeScript
- **样式**: Tailwind CSS 4（CSS-based theme）
- **图表**: Recharts 3
- **Excel**: SheetJS (xlsx)
- **AI**: OpenAI 兼容 SDK（支持 OpenAI / DeepSeek / 智谱 等）
- **图标**: lucide-react
- **部署**: Vercel

## 文档路径索引
| 文档 | 路径 | 说明 |
|------|------|------|
| 需求指令 | 见本对话记录 | 完整功能需求规范 |
| 设计令牌 | [docs/design-tokens.md](docs/design-tokens.md) | 色彩、间距、圆角、字体、动效 |
| 财务比率计算公式 | [docs/financial-ratios-formulas.md](docs/financial-ratios-formulas.md) | 16 项比率的分子分母、口径、N/A 场景 |
| 异常预警规则清单 | [docs/anomaly-detection-rules.md](docs/anomaly-detection-rules.md) | 9 条预警规则的触发条件与阈值 |
| 实施计划 | (参见上一轮 plan 文件) | 架构设计与开发顺序 |
| 部署指南 | [docs/deployment-guide.md](docs/deployment-guide.md) | Vercel 部署步骤 |

## 项目结构
```
src/
├── app/
│   ├── layout.tsx              # 全局布局（Navbar + Footer）
│   ├── page.tsx                # 首页（上传/录入/示例入口）
│   ├── analysis/page.tsx       # 分析结果页（比率/预警/摘要三Tab）
│   ├── api/analyze/route.ts    # POST 分析 API
│   ├── api/ai-summary/route.ts # POST AI 摘要 API
│   └── globals.css             # Tailwind + 设计令牌 CSS 变量
├── components/
│   ├── layout/    (Navbar, Footer)
│   ├── data-input/ (FileUpload, ManualEntry, TemplateDownload)
│   ├── ratios/    (RatioDashboard, RatioCard, RatioTrendChart, DuPontChart)
│   ├── anomalies/ (AnomalyList, AnomalyCard)
│   ├── summary/   (AiSummary)
│   ├── ui/        (NumberDisplay, TrendIndicator, DataTable, Skeleton)
│   └── demo/      (ExampleBanner)
├── lib/
│   ├── tokens.ts       # 设计令牌 TS 常量
│   ├── ratios.ts       # 比率计算引擎
│   ├── anomalies.ts    # 异常检测规则引擎
│   ├── excel.ts        # Excel 解析/模板生成
│   ├── sample-data.ts  # 示例数据（稳健科技 + 急速控股）
│   └── ai.ts           # AI 接口封装
├── types/
│   └── index.ts        # 全局 TypeScript 类型定义
```

## 两条红线
1. **所有示例数据只能来自公开披露信息或模拟数据。** 当前示例数据（稳健科技、急速控股）均为虚构公司，数据完全模拟。
2. **API Key 只存在于环境变量，绝不出现在任何会提交到 Git 的文件中。** AI_API_KEY 通过 `.env.local` 配置，`.env.local.example` 仅为格式示例，不含真实密钥。`.gitignore` 已配置忽略 `.env*.local` 文件。

## 本地运行
```bash
npm install
cp .env.local.example .env.local
# 编辑 .env.local，填入 AI_API_KEY
npm run dev
# 访问 http://localhost:3000
```

## 构建
```bash
npm run build  # 生产构建
npm start      # 启动生产服务
```
