// FinLens — 通用数据表格（支持横向滚动）
interface Column<T> {
  key: string;
  header: string;
  render: (row: T, index: number) => React.ReactNode;
  align?: 'left' | 'right' | 'center';
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyField: keyof T;
  emptyText?: string;
}

export default function DataTable<T extends Record<string, unknown>>({
  columns,
  data,
  keyField,
  emptyText = '暂无数据',
}: DataTableProps<T>) {
  if (data.length === 0) {
    return (
      <div className="text-center py-8 text-finlens-text-secondary text-sm">
        {emptyText}
      </div>
    );
  }

  return (
    <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
      <table className="w-full min-w-[500px] text-sm">
        <thead>
          <tr className="border-b border-finlens-border">
            {columns.map(col => (
              <th
                key={col.key}
                className={`py-3 px-3 text-xs font-medium text-finlens-text-secondary uppercase tracking-wider ${
                  col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : 'text-left'
                }`}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, idx) => (
            <tr key={String(row[keyField])} className="border-b border-finlens-border/50 hover:bg-finlens-bg-alt/50 transition-colors">
              {columns.map(col => (
                <td
                  key={col.key}
                  className={`py-2.5 px-3 ${
                    col.align === 'right' ? 'text-right tabular-nums' : col.align === 'center' ? 'text-center' : 'text-left'
                  }`}
                >
                  {col.render(row, idx)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
