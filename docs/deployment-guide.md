# FinLens 部署指南

## 部署到 Vercel

### 第一步：推送代码到 GitHub
```bash
# 在项目根目录
git remote add origin <你的 GitHub 仓库地址>
git push -u origin main
```

### 第二步：在 Vercel 中导入项目
1. 访问 [vercel.com](https://vercel.com) 并登录（推荐使用 GitHub 账号）
2. 点击 **"New Project"** 或 **"Import"**
3. 选择刚才推送的 GitHub 仓库
4. Vercel 会自动识别为 Next.js 项目，无需修改构建设置

### 第三步：配置环境变量
在 Vercel 项目设置页面的 **Settings → Environment Variables** 中添加：

| 变量名 | 值 | 说明 |
|--------|-----|------|
| `AI_API_KEY` | `你的 API Key` | **必填**，AI 摘要功能所需的 API 密钥 |
| `AI_BASE_URL` | `你的 API 地址` | 可选，使用第三方兼容服务时填写 |
| `AI_MODEL` | `gpt-4o-mini` | 可选，默认使用 gpt-4o-mini |

> ⚠️ **重要**：环境变量仅在 Vercel 后台配置，不要写入代码或 `.env.local.example` 以外的文件。

### 第四步：部署
- 点击 **"Deploy"** 按钮
- 等待构建完成（通常 1-2 分钟）
- 部署成功后 Vercel 会提供访问域名（如 `finlens.vercel.app`）

### 第五步：验证部署
1. 打开 Vercel 提供的域名
2. 测试功能：
   - 点击"稳健科技"示例 → 应看到完整的比率分析看板
   - 点击"急速控股"示例 → 应看到异常预警（3-5 条）
   - 切换到"AI 管理层摘要"标签 → 应生成管理评述
   - 下载 Excel 模板 → 应下载 .xlsx 文件
   - 在 375px 宽度（手机）下浏览 → 应正常显示无溢出

## 部署到 Cloudflare Pages

FinLens 通过 `@opennextjs/cloudflare` 适配器支持 Cloudflare Pages 部署，在 Cloudflare 全球边缘网络上运行。

### 前置条件
1. [Cloudflare 账号](https://dash.cloudflare.com/sign-up)
2. 代码已推送到 GitHub / GitLab 仓库
3. （可选）安装 [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/)：`npm install -g wrangler`

### 方案一：通过 Cloudflare Dashboard 部署（推荐）

1. 登录 [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. 进入 **Workers & Pages** → **Pages** → **连接到 Git**
3. 选择你的 GitHub 仓库
4. 配置构建设置：
   | 设置项 | 值 |
   |--------|-----|
   | 构建命令 | `npm run cf:build` |
   | 输出目录 | `.open-next/worker` |
   | 框架预设 | Next.js |
5. 配置环境变量（Settings → Environment Variables）：
   | 变量名 | 说明 |
   |--------|------|
   | `AI_API_KEY` | **必填**，AI 摘要 API 密钥 |
   | `AI_BASE_URL` | 可选，第三方兼容 API 地址 |
   | `AI_MODEL` | 可选，默认 `gpt-4o-mini` |
6. 点击 **"保存并部署"**

### 方案二：通过 Wrangler CLI 部署

```bash
# 本地预览
npm run cf:preview

# 部署到 Cloudflare Pages
npm run cf:deploy
```

> ⚠️ 使用 CLI 部署前，需通过 `wrangler pages secret put AI_API_KEY` 设置生产环境密钥。

### Cloudflare Pages 与 Vercel 的差异
| 项目 | Vercel | Cloudflare Pages |
|------|--------|------------------|
| 运行时 | Node.js | Edge（Cloudflare Workers） |
| 构建命令 | 自动检测 | `opennextjs-cloudflare build` |
| API 密钥配置 | Dashboard 环境变量 | Dashboard Secrets |
| 本地预览 | `npm run dev` | `npm run cf:preview` |

> ℹ️ Cloudflare Pages 使用 Edge Runtime，已针对该运行时重构了 AI 调用（使用标准 fetch 替代 OpenAI SDK）和 Excel 模块（纯客户端处理）。

## 密钥安全检查清单
部署完成后，逐项确认：
- [ ] `.gitignore` 中已包含 `.env*.local` 规则
- [ ] `git log -p` 中无任何 API Key 明文
- [ ] Vercel 环境变量中 AI_API_KEY 已正确配置
- [ ] `.env.local.example` 中仅为示例值（`your-api-key-here`），不含真实密钥
- [ ] 所有提交到 Git 的文件中搜索 `AI_API_KEY=` 仅出现在 `.env.local.example`

## 自定义域名（可选）
1. 在 Vercel 项目设置 → **Domains** 中添加自定义域名
2. 按提示在 DNS 服务商处添加 CNAME 记录
3. 等待 SSL 证书自动签发

## 常见问题

### AI 摘要显示"未配置"
- 确认 Vercel 环境变量中 `AI_API_KEY` 已设置
- 重新部署一次使环境变量生效

### Excel 上传解析失败
- 确认使用了从 FinLens 下载的模板
- 检查模板中"公司名称"和"会计年度"行未被删除
- 数值型科目填写了纯数字，不含单位

### 显示"资产负债表不平"
- 核对：总资产 = 总负债 + 净资产（所有者权益）
- 差额超过 0.1% 会触发校验提示
