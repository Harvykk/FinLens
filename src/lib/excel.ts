// FinLens — Excel 解析与模板生成
import * as XLSX from 'xlsx';
import type { FinancialStatement, ParseError } from '@/types';

// 模板科目映射（与 FinancialStatement 字段对应）
const FIELD_MAP: { field: keyof FinancialStatement; label: string; report: string; required: boolean }[] = [
  // 利润表
  { field: 'revenue', label: '营业收入', report: '利润表', required: true },
  { field: 'costOfRevenue', label: '营业成本', report: '利润表', required: true },
  { field: 'sellingExpenses', label: '销售费用', report: '利润表', required: false },
  { field: 'adminExpenses', label: '管理费用', report: '利润表', required: false },
  { field: 'rdExpenses', label: '研发费用', report: '利润表', required: false },
  { field: 'financeExpenses', label: '财务费用（总额）', report: '利润表', required: false },
  { field: 'interestExpense', label: '其中：利息费用', report: '利润表', required: false },
  { field: 'incomeTax', label: '所得税费用', report: '利润表', required: false },
  { field: 'netIncome', label: '净利润', report: '利润表', required: true },
  // 资产负债表
  { field: 'totalAssets', label: '总资产', report: '资产负债表', required: true },
  { field: 'currentAssets', label: '流动资产', report: '资产负债表', required: true },
  { field: 'cashEquivalents', label: '货币资金', report: '资产负债表', required: true },
  { field: 'accountsReceivable', label: '应收账款', report: '资产负债表', required: true },
  { field: 'otherReceivables', label: '其他应收款', report: '资产负债表', required: false },
  { field: 'inventory', label: '存货', report: '资产负债表', required: true },
  { field: 'totalLiabilities', label: '总负债', report: '资产负债表', required: true },
  { field: 'currentLiabilities', label: '流动负债', report: '资产负债表', required: true },
  { field: 'shortTermBorrowings', label: '短期借款', report: '资产负债表', required: true },
  { field: 'accountsPayable', label: '应付账款', report: '资产负债表', required: true },
  { field: 'otherPayables', label: '其他应付款', report: '资产负债表', required: false },
  { field: 'totalEquity', label: '净资产（所有者权益）', report: '资产负债表', required: true },
  // 现金流量表
  { field: 'operatingCashFlow', label: '经营活动现金流量净额', report: '现金流量表', required: true },
];

/** 生成 Excel 模板文件（Blob），供下载使用 */
export function generateTemplate(): Blob {
  // 创建一个 workbook，含 3 年度各自的 sheet
  const wb = XLSX.utils.book_new();

  // 共用表头说明
  const headerRows = [
    ['FinLens 财务数据模板 — 使用说明'],
    [''],
    ['1. 在下表中填入各年度财务数据（金额单位：万元），蓝色行为表头，请勿修改'],
    ['2. "公司名称"行填写公司全称；"会计年度"行填写四位年份，如 2024'],
    ['3. 标 ★ 的科目为必填项，其余选填；空白选填项默认按 0 处理'],
    ['4. 资产 = 负债 + 净资产，请确保勾稽关系正确'],
    [''],
  ];

  // 生成单个年度的数据区域
  function makeYearSheet(yearHint: string, isFirst: boolean): (string | number)[][] {
    const rows: (string | number)[][] = [];

    if (isFirst) {
      rows.push(...headerRows);
    }

    rows.push(['公司名称', '（请填写）']);
    rows.push(['会计年度', yearHint]);
    rows.push(['报表类型', '科目名称', '金额（万元）', '必填']);

    let currentReport = '';
    for (const item of FIELD_MAP) {
      if (item.report !== currentReport) {
        currentReport = item.report;
        rows.push([`【${currentReport}】`, '', '', '']);
      }
      rows.push(['', item.label, '', item.required ? '★' : '']);
    }

    return rows;
  }

  // 生成 3 个年度的 sheet
  const years = [2022, 2023, 2024];
  for (const year of years) {
    const sheetData = makeYearSheet(String(year), year === years[0]);
    const ws = XLSX.utils.aoa_to_sheet(sheetData);

    // 设置列宽
    ws['!cols'] = [
      { wch: 15 }, // 报表类型
      { wch: 28 }, // 科目名称
      { wch: 18 }, // 金额
      { wch: 6 },  // 必填标记
    ];

    XLSX.utils.book_append_sheet(wb, ws, `${year}年`);
  }

  const buffer = XLSX.write(wb, { type: 'array', bookType: 'xlsx' });
  return new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
}

/** 下载模板 */
export function downloadTemplate(): void {
  const blob = generateTemplate();
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'FinLens_财务数据模板.xlsx';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/** 解析上传的 Excel 文件，返回 FinancialStatement[] 和错误列表 */
export function parseExcelFile(file: File): Promise<{
  statements: FinancialStatement[];
  errors: ParseError[];
}> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onerror = () => {
      reject(new Error('文件读取失败，请确认文件未损坏。'));
    };

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target!.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const statements: FinancialStatement[] = [];
        const errors: ParseError[] = [];

        // 读取每个 sheet（一个 sheet 对应一个年度）
        for (const sheetName of workbook.SheetNames) {
          const ws = workbook.Sheets[sheetName];
          const json = XLSX.utils.sheet_to_json<(string | number)[]>(ws, { header: 1 });

          // 尝试从 sheet 名或内容解析年度
          const yearMatch = sheetName.match(/(\d{4})/);
          let fiscalYear = yearMatch ? parseInt(yearMatch[1]) : 0;

          // 解析结构化数据
          const stmt = parseSheetRows(json, sheetName, errors);

          // 从 sheet 名推断年度
          if (fiscalYear > 0) {
            stmt.fiscalYear = fiscalYear;
          }

          statements.push(stmt);
        }

        // 获取公司名（从第一个 sheet 的第一行）
        if (statements.length > 0 && workbook.SheetNames.length > 0) {
          const firstWs = workbook.Sheets[workbook.SheetNames[0]];
          const json = XLSX.utils.sheet_to_json<(string | number)[]>(firstWs, { header: 1 });
          for (const row of json) {
            if (Array.isArray(row) && row.length >= 2 && String(row[0]).includes('公司名称')) {
              const name = String(row[1] || '').trim();
              if (name && name !== '（请填写）') {
                for (const s of statements) s.companyName = name;
              }
              break;
            }
          }
        }

        // 赋默认公司名
        for (const s of statements) {
          if (!s.companyName) s.companyName = '未命名公司';
        }

        // 如果只有一个 sheet，无法判断年度
        if (statements.length === 1 && statements[0].fiscalYear === 0) {
          statements[0].fiscalYear = new Date().getFullYear();
        }

        resolve({ statements, errors });
      } catch (err: any) {
        reject(new Error(`Excel 解析失败：${err.message || '文件格式不正确，请使用下载的模板填写后上传。'}`));
      }
    };

    reader.readAsArrayBuffer(file);
  });
}

/** 解析单 sheet 的行数据 */
function parseSheetRows(
  rows: (string | number)[][],
  sheetName: string,
  errors: ParseError[],
): FinancialStatement {
  // 初始化默认值
  const stmt: FinancialStatement = {
    companyName: '',
    fiscalYear: 0,
    revenue: 0,
    costOfRevenue: 0,
    sellingExpenses: 0,
    adminExpenses: 0,
    rdExpenses: 0,
    financeExpenses: 0,
    interestExpense: 0,
    incomeTax: 0,
    netIncome: 0,
    totalAssets: 0,
    currentAssets: 0,
    cashEquivalents: 0,
    accountsReceivable: 0,
    otherReceivables: 0,
    inventory: 0,
    totalLiabilities: 0,
    currentLiabilities: 0,
    shortTermBorrowings: 0,
    accountsPayable: 0,
    otherPayables: 0,
    totalEquity: 0,
    operatingCashFlow: 0,
  };

  // 建立科目标签到字段的映射
  const labelToField = new Map<string, keyof FinancialStatement>();
  const labelToRequired = new Map<string, boolean>();
  for (const item of FIELD_MAP) {
    labelToField.set(item.label, item.field);
    labelToRequired.set(item.label, item.required);
  }

  // 遍历行，匹配科目
  for (let rowIdx = 0; rowIdx < rows.length; rowIdx++) {
    const row = rows[rowIdx];
    if (!Array.isArray(row) || row.length < 2) continue;

    // 跳过说明行和表头
    const firstCell = String(row[0] || '').trim();
    const secondCell = String(row[1] || '').trim();

    if (firstCell === '公司名称' || firstCell === '会计年度' || firstCell === '报表类型') continue;
    if (firstCell.startsWith('【') || firstCell === 'FinLens') continue;
    if (secondCell === '科目名称' || secondCell === '（请填写）' || secondCell === '') continue;

    const label = secondCell;
    const field = labelToField.get(label);
    if (!field) continue;

    // 解析金额（第三列）
    const rawVal = row[2];
    let numVal = 0;
    if (rawVal !== undefined && rawVal !== null && rawVal !== '') {
      numVal = Number(rawVal);
      if (isNaN(numVal)) {
        errors.push({
          row: rowIdx + 1,
          field: label,
          message: `"${sheetName}"中第${rowIdx + 1}行"${label}"的值"${String(rawVal)}"不是有效数字，请填写数值后重新上传。`,
        });
        continue;
      }
    }

    // 必填检查
    if (labelToRequired.get(label) && (rawVal === undefined || rawVal === null || rawVal === '')) {
      errors.push({
        row: rowIdx + 1,
        field: label,
        message: `"${sheetName}"中第${rowIdx + 1}行"${label}"为空，此为必填科目，请补填后重新上传。`,
      });
    }

    (stmt as any)[field] = numVal;
  }

  // 解析公司名和年度
  for (const row of rows) {
    if (!Array.isArray(row) || row.length < 2) continue;
    const firstCell = String(row[0] || '').trim();
    if (firstCell === '公司名称') {
      const name = String(row[1] || '').trim();
      if (name && name !== '（请填写）') stmt.companyName = name;
    }
    if (firstCell === '会计年度') {
      const year = parseInt(String(row[1]));
      if (!isNaN(year) && year >= 2000 && year <= 2100) stmt.fiscalYear = year;
    }
  }

  return stmt;
}

/** 验证勾稽关系（资产 = 负债 + 权益） */
export function validateBalanceSheet(stmt: FinancialStatement): string | null {
  const diff = Math.abs(stmt.totalAssets - (stmt.totalLiabilities + stmt.totalEquity));
  const tolerance = Math.max(stmt.totalAssets * 0.001, 1); // 0.1% 或 1 万元

  if (diff > tolerance) {
    const expectedEquity = stmt.totalAssets - stmt.totalLiabilities;
    return `${stmt.fiscalYear}年度资产负债表不平衡：总资产 ${stmt.totalAssets.toLocaleString()} 万元 ≠ 总负债 ${stmt.totalLiabilities.toLocaleString()} + 净资产 ${stmt.totalEquity.toLocaleString()} = ${(stmt.totalLiabilities + stmt.totalEquity).toLocaleString()} 万元，差额 ${diff.toFixed(0)} 万元。请检查数据后重新上传。`;
  }
  return null;
}
