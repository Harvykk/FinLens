// FinLens — 设计令牌 TypeScript 常量
// 所有组件引用此文件中的 token，禁止硬编码颜色/间距/圆角值

export const tokens = {
  color: {
    primary: '#1E3A5F',
    primaryLight: '#2D5A8E',
    primaryPale: '#E8EEF4',
    bg: '#FFFFFF',
    bgAlt: '#F6F7F9',
    border: '#E5E7EB',
    accentRed: '#DC2626',
    accentAmber: '#D97706',
    data1: '#1E3A5F',
    data2: '#3B82F6',
    data3: '#64748B',
    data4: '#DC2626',
    positive: '#16A34A',
    negative: '#DC2626',
    textPrimary: '#111827',
    textSecondary: '#6B7280',
    textInverse: '#FFFFFF',
  },

  spacing: {
    1: '4px',
    2: '8px',
    3: '12px',
    4: '16px',
    5: '20px',
    6: '24px',
    8: '32px',
    10: '40px',
    12: '48px',
  },

  radius: {
    sm: '4px',
    md: '8px',
    full: '9999px',
  },

  fontSize: {
    xs: '12px',
    sm: '14px',
    base: '16px',
    lg: '18px',
    xl: '20px',
    '2xl': '24px',
    '3xl': '30px',
    '4xl': '36px',
  },

  shadow: {
    card: '0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.06)',
    none: 'none',
  },
} as const;

// 数据色板数组（用于 recharts 图表配色）
export const CHART_COLORS = [
  tokens.color.data1,
  tokens.color.data2,
  tokens.color.data3,
  tokens.color.data4,
] as const;

// 正负标识
export const TREND_COLORS = {
  up: tokens.color.positive,
  down: tokens.color.negative,
  stable: tokens.color.textSecondary,
} as const;
