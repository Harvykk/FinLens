// FinLens — 异常检测规则引擎
// 严格按照 docs/anomaly-detection-rules.md 实现
import type { FinancialStatement, AnomalyFlag } from '@/types';

type Getter = (s: FinancialStatement) => number;

function yoyPct(current: number, prior: number): number | null {
  if (prior === 0) return null;
  return ((current - prior) / Math.abs(prior)) * 100;
}

export function detectAnomalies(data: FinancialStatement[]): AnomalyFlag[] {
  if (!data || data.length < 1) return [];

  const flags: AnomalyFlag[] = [];
  const sorted = [...data].sort((a, b) => a.fiscalYear - b.fiscalYear);
  const current = sorted[sorted.length - 1];
  const prior = sorted.length >= 2 ? sorted[sorted.length - 2] : null;
  const prior2 = sorted.length >= 3 ? sorted[sorted.length - 3] : null;

  let ruleCounter = 0;

  // ---- 规则 1：收入增长但经营现金流下降 ----
  if (prior) {
    const revGrowth = yoyPct(current.revenue, prior.revenue);
    const cfGrowth = yoyPct(current.operatingCashFlow, prior.operatingCashFlow);
    // 触发：收入增速 > 5% 且 经营现金流降幅 > 10%
    if (revGrowth !== null && revGrowth > 5 && cfGrowth !== null && cfGrowth < -10) {
      flags.push({
        id: `anomaly-${++ruleCounter}`,
        ruleId: 1,
        ruleName: '收入增长但经营现金流下降',
        severity: 'critical',
        description: `收入同比增长 ${revGrowth.toFixed(1)}%，但经营现金流同比下降 ${Math.abs(cfGrowth).toFixed(1)}%。收入增长未有效转化为现金流入。`,
        concern: '收入增长但现金流反而显著恶化，可能意味着公司放宽信用政策刺激销售（应收大量增加），或存在提前确认收入的嫌疑。',
      });
    }
  }

  // ---- 规则 2：应收增速显著超过收入增速 ----
  if (prior) {
    const arGrowth = yoyPct(current.accountsReceivable, prior.accountsReceivable);
    const revGrowth = yoyPct(current.revenue, prior.revenue);
    // 触发：应收增速 > 15% 且 应收增速 - 收入增速 > 15pp
    if (
      arGrowth !== null && revGrowth !== null &&
      arGrowth > 15 &&
      arGrowth - revGrowth > 15
    ) {
      const gap = arGrowth - revGrowth;
      flags.push({
        id: `anomaly-${++ruleCounter}`,
        ruleId: 2,
        ruleName: '应收增速显著超过收入增速',
        severity: 'critical',
        description: `应收账款同比增长 ${arGrowth.toFixed(1)}%，超过营业收入增速 ${revGrowth.toFixed(1)}% 达 ${gap.toFixed(1)} 个百分点。应收膨胀速度显著快于收入增长。`,
        concern: '应收增速远超收入增速（差距达 15 个百分点以上），意味着大量销售未能及时回款。可能原因包括：公司通过激进赊销拉动收入、下游客户付款能力恶化。极端情况下部分应收可能无法收回形成坏账。',
      });
    }
  }

  // ---- 规则 3：存货异常堆积 ----
  if (prior) {
    const invGrowth = yoyPct(current.inventory, prior.inventory);
    const revGrowth = yoyPct(current.revenue, prior.revenue);
    if (
      invGrowth !== null && revGrowth !== null &&
      invGrowth > 20 && revGrowth < 10
    ) {
      flags.push({
        id: `anomaly-${++ruleCounter}`,
        ruleId: 3,
        ruleName: '存货异常堆积',
        severity: 'warning',
        description: `存货同比增长 ${invGrowth.toFixed(1)}%，但收入仅增长 ${revGrowth.toFixed(1)}%。存货增速远超销售消化速度。`,
        concern: '存货增速远超收入增速，可能意味着产品滞销、市场需求下滑，或存货存在减值风险。存货堆积也占用大量营运资金。',
      });
    }
  }

  // ---- 规则 4：毛利率大幅波动 ----
  if (prior) {
    // 毛利率 = (revenue - cogs) / revenue * 100
    const gmCurrent = current.revenue > 0 ? ((current.revenue - current.costOfRevenue) / current.revenue) * 100 : null;
    const gmPrior = prior.revenue > 0 ? ((prior.revenue - prior.costOfRevenue) / prior.revenue) * 100 : null;
    if (gmCurrent !== null && gmPrior !== null) {
      const change = Math.abs(gmCurrent - gmPrior);
      if (change > 5) {
        flags.push({
          id: `anomaly-${++ruleCounter}`,
          ruleId: 4,
          ruleName: '毛利率大幅波动',
          severity: 'warning',
          description: `毛利率从 ${gmPrior.toFixed(1)}% 变动至 ${gmCurrent.toFixed(1)}%，波动幅度达 ${change.toFixed(1)} 个百分点。`,
          concern: '毛利率在正常经营中通常保持相对稳定。大幅波动可能意味着产品结构发生重大变化、原材料成本剧烈波动、定价策略突变、或成本核算口径调整。',
        });
      }
    }
  }

  // ---- 规则 5：其他应收/应付占比过高 ----
  if (current.totalAssets > 0) {
    const otherRecPct = (current.otherReceivables / current.totalAssets) * 100;
    if (otherRecPct > 10) {
      flags.push({
        id: `anomaly-${++ruleCounter}`,
        ruleId: 5,
        ruleName: '其他应收款占比过高',
        severity: 'warning',
        description: `其他应收款占总资产 ${otherRecPct.toFixed(1)}%，超出 10% 正常水平。`,
        concern: '其他应收款占比过高往往意味着存在非经营性资金占用（如大股东占款、关联方资金拆借），或隐藏实质性的关联交易。',
      });
    }
  }
  if (current.totalLiabilities > 0) {
    const otherPayPct = (current.otherPayables / current.totalLiabilities) * 100;
    if (otherPayPct > 15) {
      flags.push({
        id: `anomaly-${++ruleCounter}`,
        ruleId: 5,
        ruleName: '其他应付款占比过高',
        severity: 'warning',
        description: `其他应付款占总负债 ${otherPayPct.toFixed(1)}%，超出 15% 正常水平。`,
        concern: '其他应付款占比过高往往意味着存在非经营性资金往来或隐藏关联交易。',
      });
    }
  }

  // ---- 规则 6：经营现金流/净利润持续偏低 ----
  if (prior && current.netIncome > 0) {
    const cfRatio = current.operatingCashFlow / current.netIncome;
    if (cfRatio < 0.7) {
      // 检查上年是否也低于 0.7
      let priorLow = false;
      if (prior.netIncome > 0) {
        const priorCfRatio = prior.operatingCashFlow / prior.netIncome;
        priorLow = priorCfRatio < 0.7;
      }
      if (priorLow) {
        flags.push({
          id: `anomaly-${++ruleCounter}`,
          ruleId: 6,
          ruleName: '经营现金流/净利润持续偏低',
          severity: 'critical',
          description: `连续两年经营现金流/净利润比值分别为 ${(prior.operatingCashFlow / prior.netIncome).toFixed(2)} 和 ${cfRatio.toFixed(2)}，均低于 0.7。利润的现金含量持续偏低。`,
          concern: '利润没有相应的现金流入支撑，纸面利润的含金量存疑。持续多个年度说明这不是偶发性因素，而是经营模式或收入确认方式存在结构性问题。',
        });
      }
    }
  }

  // ---- 规则 7：流动比率偏低（分级） ----
  if (current.currentLiabilities > 0) {
    const cr = current.currentAssets / current.currentLiabilities;
    if (cr < 0.8) {
      flags.push({
        id: `anomaly-${++ruleCounter}`,
        ruleId: 7,
        ruleName: '流动比率严重偏低',
        severity: 'critical',
        description: `流动比率为 ${cr.toFixed(2)}，远低于 1，短期偿债能力严重不足。`,
        concern: '流动比率低于 0.8 意味着公司短期内可变现资产远不足以偿还到期债务，存在严重流动性风险。注意：不同行业合理水平差异较大（零售业通常偏低），需结合行业背景判断。',
      });
    } else if (cr < 1.0) {
      flags.push({
        id: `anomaly-${++ruleCounter}`,
        ruleId: 7,
        ruleName: '流动比率偏低',
        severity: 'warning',
        description: `流动比率为 ${cr.toFixed(2)}，略低于 1，短期偿债能力偏弱，需关注。`,
        concern: '流动比率低于 1 意味着流动资产不足以覆盖流动负债。注意：不同行业合理水平差异较大，零售、餐饮等现金收款行业流动比率偏低属正常，需结合行业背景判断。',
      });
    }
  }

  // ---- 规则 8：资产负债率过高 ----
  if (current.totalAssets > 0) {
    const dr = (current.totalLiabilities / current.totalAssets) * 100;
    if (dr > 70) {
      flags.push({
        id: `anomaly-${++ruleCounter}`,
        ruleId: 8,
        ruleName: '资产负债率过高',
        severity: 'warning',
        description: `资产负债率达 ${dr.toFixed(1)}%，超出 70% 警戒线。`,
        concern: '高杠杆意味着高财务风险。利息支出占比高会侵蚀利润，在经济下行或融资环境收紧时高杠杆企业面临的再融资压力显著更大。金融行业不适用此阈值。',
      });
    }
  }

  // ---- 规则 9：存贷双高 ----
  if (current.totalAssets > 0) {
    const cashPct = (current.cashEquivalents / current.totalAssets) * 100;
    const stLoanPct = (current.shortTermBorrowings / current.totalAssets) * 100;
    if (cashPct > 20 && stLoanPct > 15) {
      flags.push({
        id: `anomaly-${++ruleCounter}`,
        ruleId: 9,
        ruleName: '存贷双高',
        severity: 'critical',
        description: `货币资金占总资产 ${cashPct.toFixed(1)}%，同时短期借款占总资产 ${stLoanPct.toFixed(1)}%。账上大量现金却维持高额短期借款，存在"存贷双高"异常。`,
        concern: '公司账上有大量货币资金却同时借入高额短期借款并承担利息支出，商业逻辑上不自洽。可能原因：账面货币资金存在使用限制（如被质押、冻结）、货币资金真实性存疑、或大股东通过资金池占用上市公司资金。这是近年来 A 股财务造假案中最高频的预警信号之一。',
      });
    }
  }

  // 按严重程度排序：critical 优先
  flags.sort((a, b) => {
    const order = { critical: 0, warning: 1 };
    return order[a.severity] - order[b.severity];
  });

  return flags;
}
