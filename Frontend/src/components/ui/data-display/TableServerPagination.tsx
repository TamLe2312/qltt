import React, { useMemo, useState, useEffect } from "react";

interface Column<T> {
  key?: keyof T | string;
  title: string;
  render?: (value: any, item: T) => React.ReactNode;
  width?: string;
  align?: "left" | "center" | "right";
  sortable?: boolean;
  sortAccessor?: (
    item: T
  ) => string | number | Date | boolean | null | undefined;
}

interface TableServerPaginationProps<T> {
  data?: T[];
  columns: Column<T>[];
  loading?: boolean;
  emptyMessage?: string;
  onRowClick?: (item: T) => void;
  className?: string;
  getRowKey?: (item: T, index: number) => React.Key;

  page?: number;
  limit?: number;
  total?: number;
  onPageChange?: (page: number) => void;
  onLimitChange?: (size: number) => void;

  sortBy?: string;
  sortOrder?: "asc" | "desc";
  onSortChange?: (key: string, order: "asc" | "desc") => void;

  /** Giữ nguyên dữ liệu khi đang loading, chỉ hiển thị overlay */
  preserveDataWhileLoading?: boolean;
}

function TableServerPagination<T extends Record<string, any>>({
  data = [],
  columns,
  loading = false,
  preserveDataWhileLoading = true,
  emptyMessage = "No data available",
  onRowClick,
  className = "",
  getRowKey,

  page = 1,
  limit = 20,
  total = 0,
  onPageChange,
  onLimitChange,

  sortBy,
  sortOrder = "asc",
  onSortChange,
}: TableServerPaginationProps<T>) {
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const [cachedData, setCachedData] = useState<T[]>(data);

  // console.log("loading: ", loading);

  useEffect(() => {
    if (!loading && data && data.length > 0) setCachedData(data);
  }, [data, loading]);

  const displayData = useMemo(
    () =>
      preserveDataWhileLoading && cachedData.length > 0
        ? cachedData
        : data ?? [],
    [data, cachedData, preserveDataWhileLoading]
  );

  const handleHeaderClick = (col: Column<T>) => {
    if (!col.sortable || !col.key) return;
    const key = typeof col.key === "string" ? col.key : String(col.key);
    if (sortBy === key) {
      onSortChange?.(key, sortOrder === "asc" ? "desc" : "asc");
    } else {
      onSortChange?.(key, "asc");
    }
  };

  const isEmpty = !loading && displayData.length === 0;

  return (
    <div
      className={`relative bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden ${className}`}
    >
      {/* Table */}
      <div className="overflow-x-auto transition-all duration-300">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {columns.map((column, index) => {
                const isSortable = !!column.sortable && !!column.key;
                const key = column.key
                  ? typeof column.key === "string"
                    ? column.key
                    : String(column.key)
                  : undefined;
                const isActive = sortBy === key;
                const arrow = !isSortable ? null : (
                  <span
                    className={`ml-1 inline-block transition-transform ${
                      isActive && sortOrder === "desc" ? "rotate-180" : ""
                    }`}
                  >
                    <svg
                      className="w-3 h-3 text-gray-400"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 6l6 6H4l6-6z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </span>
                );

                return (
                  <th
                    key={index}
                    className={`px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider ${
                      column.align === "center"
                        ? "text-center"
                        : column.align === "right"
                        ? "text-right"
                        : "text-left"
                    } ${
                      isSortable
                        ? "cursor-pointer select-none hover:text-gray-700"
                        : ""
                    }`}
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
            {isEmpty ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-6 py-8 text-center text-gray-500"
                >
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              displayData.map((item, rowIndex) => (
                <tr
                  key={getRowKey ? getRowKey(item, rowIndex) : rowIndex}
                  className={`hover:bg-gray-50 ${
                    onRowClick ? "cursor-pointer" : ""
                  }`}
                  onClick={() => onRowClick?.(item)}
                >
                  {columns.map((column, colIndex) => {
                    const value = column.key
                      ? item[column.key as keyof T]
                      : undefined;
                    return (
                      <td
                        key={colIndex}
                        className={`px-6 py-4 whitespace-nowrap text-sm ${
                          column.align === "center"
                            ? "text-center"
                            : column.align === "right"
                            ? "text-right"
                            : "text-left"
                        }`}
                      >
                        {column.render ? column.render(value, item) : value}
                      </td>
                    );
                  })}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Loading overlay */}
      {loading && (
        <div className="absolute inset-0 bg-white/60 backdrop-blur-sm flex flex-col items-center justify-center z-20 transition-opacity duration-200">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-gray-500 border-b-transparent"></div>
          <p className="mt-2 text-sm text-gray-600">Loading...</p>
        </div>
      )}

      {/* Pagination */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 border-t border-gray-200 text-sm">
        <div className="text-gray-600">
          {total === 0 ? (
            "0 results"
          ) : (
            <>
              Showing{" "}
              <span className="font-medium">{(page - 1) * limit + 1}</span> to{" "}
              <span className="font-medium">
                {Math.min(page * limit, total)}
              </span>{" "}
              of <span className="font-medium">{total}</span> results
            </>
          )}
        </div>

        <div className="flex items-center gap-3">
          <select
            className="border border-gray-300 rounded-md px-2 py-1 text-sm"
            value={limit}
            onChange={(e) => onLimitChange?.(parseInt(e.target.value))}
          >
            {[5, 10, 20, 50].map((size) => (
              <option key={size} value={size}>
                {size} / page
              </option>
            ))}
          </select>

          <div className="inline-flex gap-2">
            <button
              className="px-3 py-1 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              disabled={page <= 1}
              onClick={() => onPageChange?.(page - 1)}
            >
              Prev
            </button>
            <span className="px-2 text-gray-500">
              Page {page} / {totalPages}
            </span>
            <button
              className="px-3 py-1 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              disabled={page >= totalPages}
              onClick={() => onPageChange?.(page + 1)}
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TableServerPagination;
