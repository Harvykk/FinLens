# FinLens 设计令牌 (Design Tokens)

> 全站唯一设计来源。所有组件必须严格引用这些令牌，禁止在页面/组件中使用任意颜色、间距、圆角值。

---

## 色彩 (Colors)

### 主色 — 深蓝
- `--color-primary`: `#1E3A5F` — 导航栏背景、标题、重点卡片底色、图表主色
- `--color-primary-light`: `#2D5A8E` — 悬停态、次要强调
- `--color-primary-pale`: `#E8EEF4` — 极浅蓝底（卡片内分区背景）

### 底色
- `--color-bg`: `#FFFFFF` — 主背景
- `--color-bg-alt`: `#F6F7F9` — 次级背景（区块底色区分）
- `--color-border`: `#E5E7EB` — 分割线、边框

### 强调色
- `--color-accent-red`: `#DC2626` — 预警标红、关键风险结论
- `--color-accent-amber`: `#D97706` — 次级预警（warning级别）

### 数据色板（图表用，全站不超过4种数据颜色）
- `--color-data-1`: `#1E3A5F` — 主数据色
- `--color-data-2`: `#3B82F6` — 第二数据色
- `--color-data-3`: `#64748B` — 第三数据色/中性
- `--color-data-4`: `#DC2626` — 预警/异常数据色

### 正负标识（双重标识：颜色 + 箭头/图标）
- `--color-positive`: `#16A34A` — 正向变动（绿色 ↑）
- `--color-negative`: `#DC2626` — 负向变动（红色 ↓）

### 文字颜色
- `--color-text-primary`: `#111827` — 正文
- `--color-text-secondary`: `#6B7280` — 辅助说明
- `--color-text-inverse`: `#FFFFFF` — 深色底反白

---

## 间距 (Spacing)

基准：4px。全站使用以下 scale，禁止出现不在列表中的间距值。

| Token | 值 | 用途 |
|-------|------|------|
| `--space-1` | 4px | 极小间距（标签与图标之间） |
| `--space-2` | 8px | 紧凑间距（卡片内元素间） |
| `--space-3` | 12px | 默认内边距 |
| `--space-4` | 16px | 标准内边距 |
| `--space-5` | 20px | 宽松内边距 |
| `--space-6` | 24px | 卡片间距、区块间距 |
| `--space-8` | 32px | 大区块间距 |
| `--space-10` | 40px | 章节间距 |
| `--space-12` | 48px | 页面级大间距 |

---

## 圆角 (Border Radius)

- `--radius-sm`: `4px` — 按钮、输入框、标签
- `--radius-md`: `8px` — 卡片、面板
- `--radius-full`: `9999px` — 药丸标签

---

## 字体 (Typography)

### 字体族
- **中文正文**：系统默认栈 `-apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC", "Microsoft YaHei", sans-serif`
- **数字**：使用 `font-variant-numeric: tabular-nums` 确保等宽对齐，关键比率字体加大

### 字号层级
| Token | 值 | 用途 |
|-------|------|------|
| `--text-xs` | 12px | 标签、注释 |
| `--text-sm` | 14px | 辅助说明、表格内容 |
| `--text-base` | 16px | 正文 |
| `--text-lg` | 18px | 副标题 |
| `--text-xl` | 20px | 卡片标题 |
| `--text-2xl` | 24px | 区块标题 |
| `--text-3xl` | 30px | 关键比率数字 |
| `--text-4xl` | 36px | 顶部核心指标（最大号） |

### 字重
- `--font-normal`: `400`
- `--font-medium`: `500`
- `--font-semibold`: `600`
- `--font-bold`: `700`

---

## 阴影 (Shadows)

- `--shadow-card`: `0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.06)` — 卡片
- `--shadow-none`: `none` — 其余一律不使用阴影

---

## 动效 (Animation)

仅允许以下两处动效：

1. **页面淡入**: `fadeIn 0.2s ease-out` — 页面/区块首次出现时
2. **数字滚动到位**: `countUp 0.6s ease-out` — 关键数字从 0 滚动到目标值

其余一律静止。禁止悬停放大、禁止弹跳、禁止旋转加载图标（用静态骨架屏替代）。

### FadeIn 实现
```css
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(4px); }
  to { opacity: 1; transform: translateY(0); }
}
```

### CountUp 实现
使用 CSS transition 配合 JS 触发，数字从 0 过渡到目标值。

---

## 图标 (Icons)

使用 `lucide-react` 图标库，统一尺寸规范：
- 16px：行内图标
- 20px：卡片标题图标
- 24px：区块标题图标

---

## 断点 (Breakpoints)

- `sm`: `640px` — 平板竖屏
- `md`: `768px` — 平板横屏
- `lg`: `1024px` — 桌面
- `xl`: `1280px` — 宽屏

**硬性验收项**：`375px` 宽度（iPhone SE）下图表和表格必须可读、可横向滑动，不得溢出破版。

---

## 使用方式

在 `globals.css` 中以 CSS 自定义属性形式定义，Tailwind 配置中扩展对应 token。所有组件优先使用 Tailwind 类名引用这些值。
