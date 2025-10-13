import React, { useMemo, useState, useEffect, useCallback } from 'react';

interface Column<T> {
    key?: keyof T | string; // Cho phép cột không có key (vd: actions)
    title: string;
    render?: (value: any, item: T) => React.ReactNode;
    width?: string;
    align?: 'left' | 'center' | 'right';
    sortable?: boolean;
    sortAccessor?: (item: T) => string | number | Date | boolean | null | undefined;
}

interface TableServerPaginationProps<T> {
    data?: T[];
    columns: Column<T>[];
    loading?: boolean;
    emptyMessage?: string;
    onRowClick?: (item: T) => void;
    className?: string;
    getRowKey?: (item: T, index: number) => React.Key;

    // Server-side pagination
    serverPagination?: boolean;
    fetchData?: (params: {
        page: number;
        pageSize: number;
        sortKey?: string;
        sortOrder?: 'asc' | 'desc';
    }) => Promise<{ total: number; data: T[] }>;

    page?: number;
    pageSize?: number;
    total?: number;
    onPageChange?: (page: number) => void;

    // Sorting
    defaultSort?: { key: string; order: 'asc' | 'desc' };
    onSortChange?: (key: string, order: 'asc' | 'desc') => void;
}

function TableServerPagination<T extends Record<string, any>>({
    data = [],
    columns,
    loading: loadingProp = false,
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
    serverPagination = false,
    fetchData,
}: TableServerPaginationProps<T>) {
    const [internalPage, setInternalPage] = useState<number>(1);
    const [internalPageSize] = useState<number>(pageSize || 10);
    const activePage = page ?? internalPage;
    const activePageSize = pageSize ?? internalPageSize;

    const [sortKey, setSortKey] = useState<string | undefined>(defaultSort?.key);
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>(defaultSort?.order || 'asc');

    console.log(sortKey, sortOrder)

    const [tableData, setTableData] = useState<T[]>(data);
    const [totalItems, setTotalItems] = useState(total ?? data.length);
    const [loading, setLoading] = useState(loadingProp);

    // ✅ Sửa lỗi: dùng useCallback để tránh stale closure
    const loadData = useCallback(async () => {
        if (!serverPagination || !fetchData) return;
        setLoading(true);
        try {
            const result = await fetchData({
                page: activePage,
                pageSize: activePageSize,
                sortKey,
                sortOrder,
            });
            setTableData(result.data);
            setTotalItems(result.total);
        } finally {
            setLoading(false);
        }
    }, [serverPagination, fetchData, activePage, activePageSize, sortKey, sortOrder]);

    useEffect(() => {
        if (serverPagination) loadData();
    }, [loadData, serverPagination]);

    const handleHeaderClick = (col: Column<T>) => {
        if (!col.sortable || !col.key) return;
        const key = (typeof col.key === 'string' ? col.key : String(col.key)) as string;

        if (sortKey === key) {
            const toggled = sortOrder === 'asc' ? 'desc' : 'asc';
            setSortOrder(toggled);
            onSortChange?.(key, toggled);
        } else {
            setSortKey(key);
            setSortOrder('asc');
            onSortChange?.(key, 'asc');
            if (!onPageChange) setInternalPage(1);
        }
    };

    const totalPages = Math.max(1, Math.ceil(totalItems / activePageSize));
    const pageClamped = Math.min(Math.max(1, activePage), totalPages);

    const changePage = (next: number) => {
        if (onPageChange) onPageChange(Math.min(Math.max(1, next), totalPages));
        else setInternalPage(Math.min(Math.max(1, next), totalPages));
    };

    const displayData: T[] = useMemo(() => {
        if (serverPagination) return tableData;
        let sortedData = [...data];
        if (sortKey) {
            const column = columns.find(c => (typeof c.key === 'string' ? c.key : String(c.key)) === sortKey);
            if (column) {
                const accessor = (item: T) => (column.sortAccessor ? column.sortAccessor(item) : item[column.key as keyof T]);
                sortedData.sort((a, b) => {
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
            }
        }
        const start = (pageClamped - 1) * activePageSize;
        return sortedData.slice(start, start + activePageSize);
    }, [serverPagination, tableData, data, sortKey, sortOrder, pageClamped, activePageSize, columns]);

    if (!loading && displayData.length === 0) {
        return (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="p-8 text-center">
                    <p className="text-gray-500">{emptyMessage}</p>
                </div>
            </div>
        );
    }

    return (
        <div
            className={`relative bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden ${className}`}
            style={{ minHeight: loading ? 280 : undefined }} // ✅ giữ chiều cao khi loading lần đầu
        >
            <div className="overflow-x-auto overflow-y-hidden transition-all duration-300">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            {columns.map((column, index) => {
                                const isSortable = !!column.sortable && !!column.key;
                                const key = column.key ? (typeof column.key === 'string' ? column.key : String(column.key)) : undefined;
                                const isActive = sortKey === key;
                                const arrow = !isSortable ? null : (
                                    <span className={`ml-1 inline-block transition-transform ${isActive && sortOrder === 'desc' ? 'rotate-180' : ''}`}>
                                        <svg className="w-3 h-3 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M10 6l6 6H4l6-6z" clipRule="evenodd" />
                                        </svg>
                                    </span>
                                );
                                return (
                                    <th
                                        key={index}
                                        className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${column.align === 'center'
                                            ? 'text-center'
                                            : column.align === 'right'
                                                ? 'text-right'
                                                : 'text-left'
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
                        {displayData.map((item, rowIndex) => (
                            <tr
                                key={getRowKey ? getRowKey(item, rowIndex) : rowIndex}
                                className={`hover:bg-gray-50 ${onRowClick ? 'cursor-pointer' : ''}`}
                                onClick={() => onRowClick?.(item)}
                            >
                                {columns.map((column, colIndex) => {
                                    const value = column.key ? item[column.key as keyof T] : undefined;
                                    return (
                                        <td
                                            key={colIndex}
                                            className={`px-6 py-4 whitespace-nowrap text-sm ${column.align === 'center'
                                                ? 'text-center'
                                                : column.align === 'right'
                                                    ? 'text-right'
                                                    : 'text-left'
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

            {loading && (
                <div className="absolute inset-0 bg-white/70 flex flex-col items-center justify-center z-10">
                    <div className="animate-spin rounded-full h-8 w-8 border-2 border-b-transparent border-gray-600"></div>
                    <p className="mt-2 text-sm text-gray-600">Loading...</p>
                </div>
            )}

            <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200 text-sm">
                <div className="text-gray-600">
                    {totalItems === 0 ? (
                        '0 results'
                    ) : (
                        <>
                            Showing <span className="font-medium">{(pageClamped - 1) * activePageSize + 1}</span> to{' '}
                            <span className="font-medium">{Math.min(pageClamped * activePageSize, totalItems)}</span> of{' '}
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
                    <span className="px-2 text-gray-500">
                        Page {pageClamped} / {totalPages}
                    </span>
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

export default TableServerPagination;
