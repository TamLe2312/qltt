import React, { useMemo, useState } from 'react';

interface Column<T> {
  key: keyof T | string;
  title: string;
  render?: (value: any, item: T) => React.ReactNode;
  width?: string;
  align?: 'left' | 'center' | 'right';
  sortable?: boolean;
  // Optional accessor for sorting when display value is formatted or nested
  sortAccessor?: (item: T) => string | number | Date | boolean | null | undefined;
}

interface TableProps<T> {
  data: T[];
  columns: Column<T>[];
  loading?: boolean;
  emptyMessage?: string;
  onRowClick?: (item: T) => void;
  className?: string;
  // Provide a stable key for each row to ensure correct reordering animations
  getRowKey?: (item: T, index: number) => React.Key;
  // Sorting
  defaultSort?: { key: string; order: 'asc' | 'desc' };
  onSortChange?: (key: string, order: 'asc' | 'desc') => void;
  // Pagination (client-side). If not provided, internal pagination will be used.
  page?: number;
  pageSize?: number;
  total?: number; // total items (defaults to data.length for client-side pagination)
  onPageChange?: (page: number) => void;
}

function Table<T extends Record<string, any>>({
  data,
  columns,
  loading = false,
  emptyMessage = 'No data available',
  onRowClick,
  className = '',
  getRowKey,
  defaultSort,
  onSortChange,
  page,
  pageSize,
  total,
  onPageChange,
}: TableProps<T>) {
  // Internal pagination fallback
  const [internalPage, setInternalPage] = useState<number>(1);
  const [internalPageSize] = useState<number>(pageSize || 10);
  const activePage = page ?? internalPage;
  const activePageSize = pageSize ?? internalPageSize;

  // Sorting state
  const [sortKey, setSortKey] = useState<string | undefined>(defaultSort?.key);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>(defaultSort?.order || 'asc');

  // const handleHeaderClick = (col: Column<T>) => {
  //   if (!col.sortable) return;
  //   const key = (typeof col.key === 'string' ? col.key : String(col.key)) as string;
  //   setSortKey(prevKey => {
  //     if (prevKey === key) {
  //       const toggled = sortOrder === 'asc' ? 'desc' : 'asc';
  //       setSortOrder(toggled);
  //       onSortChange?.(key, toggled);
  //       return prevKey;
  //     } else {
  //       setSortOrder('asc');
  //       onSortChange?.(key, 'asc');
  //       // Reset to first page on new sort for better UX
  //       if (!onPageChange) setInternalPage(1);
  //       return key;
  //     }
  //   });
  // };

  const handleHeaderClick = (col: Column<T>) => {
  if (!col.sortable) return;
  const key = (typeof col.key === 'string' ? col.key : String(col.key)) as string;

  if (sortKey === key) {
    // Nếu đang cùng cột -> chỉ đảo chiều
    const toggled = sortOrder === 'asc' ? 'desc' : 'asc';
    setSortOrder(toggled);
    onSortChange?.(key, toggled);
  } else {
    // Nếu sang cột khác -> đặt sortKey và sortOrder cùng lúc (bắt buộc)
    setSortKey(key);
    setSortOrder('asc');

    // ⚠️ KHẮC PHỤC LỖI: gọi onSortChange ngay sau khi set state, không nằm trong callback
    // vì React batch state khiến lần click đầu bị “bỏ qua”
    onSortChange?.(key, 'asc');

    if (!onPageChange) setInternalPage(1);
  }
};


  const sortedData: T[] = useMemo(() => {
    if (!sortKey) return data;
    const column = columns.find(c => (typeof c.key === 'string' ? c.key : String(c.key)) === sortKey);
    if (!column) return data;
    const accessor = (item: T) => {
      if (column.sortAccessor) return column.sortAccessor(item);
      const key = column.key as keyof T;
      return item[key] as unknown as any;
    };
    const copy = [...data];
    copy.sort((a, b) => {
      const va = accessor(a);
      const vb = accessor(b);
      if (va == null && vb == null) return 0;
      if (va == null) return sortOrder === 'asc' ? -1 : 1;
      if (vb == null) return sortOrder === 'asc' ? 1 : -1;
      const na = va instanceof Date ? va.getTime() : (va as any);
      const nb = vb instanceof Date ? vb.getTime() : (vb as any);
      if (na < nb) return sortOrder === 'asc' ? -1 : 1;
      if (na > nb) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
    return copy;
  }, [data, sortKey, sortOrder, columns]);

  const totalItems = total ?? sortedData.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / activePageSize));
  const pageClamped = Math.min(Math.max(1, activePage), totalPages);

  const paginatedData: T[] = useMemo(() => {
    const start = (pageClamped - 1) * activePageSize;
    const end = start + activePageSize;
    // If external pagination provided (total > data.length), assume data already sliced
    if (total && total > data.length) return sortedData;
    return sortedData.slice(start, end);
  }, [sortedData, pageClamped, activePageSize, total, data.length]);

  const changePage = (next: number) => {
    if (onPageChange) {
      onPageChange(Math.min(Math.max(1, next), totalPages));
    } else {
      setInternalPage(Math.min(Math.max(1, next), totalPages));
    }
  };
  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-2 text-sm text-gray-500">Loading...</p>
        </div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-8 text-center">
          <p className="text-gray-500">{emptyMessage}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden ${className}`}>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {columns.map((column, index) => {
                const isSortable = !!column.sortable;
                const key = (typeof column.key === 'string' ? column.key : String(column.key)) as string;
                const isActive = sortKey === key;
                const arrow = !isSortable
                  ? null
                  : (
                    <span className={`ml-1 inline-block transition-transform ${isActive && sortOrder === 'desc' ? 'rotate-180' : ''}`}>
                      {/* chevron up */}
                      <svg className="w-3 h-3 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 6l6 6H4l6-6z" clipRule="evenodd" />
                      </svg>
                    </span>
                  );
                return (
                  <th
                    key={index}
                    className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${
                      column.align === 'center' ? 'text-center' : 
                      column.align === 'right' ? 'text-right' : 'text-left'
                    } ${isSortable ? 'cursor-pointer select-none hover:text-gray-700' : ''}`}
                    style={{ width: column.width }}
                    onClick={() => handleHeaderClick(column)}
                  >
                    <span className="inline-flex items-center">
                      {column.title}
                      {arrow}
                    </span>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {paginatedData.map((item, rowIndex) => (
              <tr
                key={getRowKey ? getRowKey(item, rowIndex) : rowIndex}
                className={`hover:bg-gray-50 ${onRowClick ? 'cursor-pointer' : ''}`}
                onClick={() => onRowClick?.(item)}
              >
                {columns.map((column, colIndex) => {
                  const value = typeof column.key === 'string' 
                    ? item[column.key] 
                    : item[column.key as keyof T];
                  
                  return (
                    <td
                      key={colIndex}
                      className={`px-6 py-4 whitespace-nowrap text-sm ${
                        column.align === 'center' ? 'text-center' : 
                        column.align === 'right' ? 'text-right' : 'text-left'
                      }`}
                    >
                      {column.render ? column.render(value, item) : value}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200 text-sm">
        <div className="text-gray-600">
          {totalItems === 0 ? (
            '0 results'
          ) : (
            <>
              Showing <span className="font-medium">{(pageClamped - 1) * activePageSize + 1}</span>
              {' '}to{' '}
              <span className="font-medium">{Math.min(pageClamped * activePageSize, totalItems)}</span>
              {' '}of{' '}
              <span className="font-medium">{totalItems}</span> results
            </>
          )}
        </div>
        <div className="inline-flex gap-2">
          <button
            className="px-3 py-1 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            disabled={pageClamped <= 1}
            onClick={() => changePage(pageClamped - 1)}
          >
            Prev
          </button>
          <span className="px-2 text-gray-500">Page {pageClamped} / {totalPages}</span>
          <button
            className="px-3 py-1 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            disabled={pageClamped >= totalPages}
            onClick={() => changePage(pageClamped + 1)}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}

export default Table;
