import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import TableServerPagination from '../../components/ui/data-display/TableServerPagination';

interface Category {
    id: string;
    name: string;
    parent_id: string | null;
}

// -------------------- MOCK DATA --------------------
const MOCK_DATA: Category[] = [
    { id: '1', name: 'Thực phẩm tươi sống', parent_id: null },
    { id: '2', name: 'Đồ uống', parent_id: null },
    { id: '3', name: 'Hàng gia dụng', parent_id: null },
    { id: '4', name: 'Đồ điện tử', parent_id: null },
    { id: '5', name: 'Thời trang', parent_id: null },
    { id: '6', name: 'Sách', parent_id: null },
    { id: '7', name: 'Văn phòng phẩm', parent_id: null },
    { id: '8', name: 'Đồ chơi', parent_id: null },
    { id: '9', name: 'Phụ kiện', parent_id: null },
];

// -------------------- GIẢ LẬP FETCH --------------------
async function mockFetch({
    page,
    pageSize,
    sortKey,
    sortOrder,
}: {
    page: number;
    pageSize: number;
    sortKey: string;
    sortOrder: 'asc' | 'desc';
}) {
    console.log('🔄 Fetching...', { page, pageSize, sortKey, sortOrder });
    await new Promise((r) => setTimeout(r, 800));

    let data = [...MOCK_DATA];
    if (sortKey) {
        data.sort((a: any, b: any) =>
            sortOrder === 'asc'
                ? a[sortKey].localeCompare(b[sortKey])
                : b[sortKey].localeCompare(a[sortKey])
        );
    }

    const start = (page - 1) * pageSize;
    const items = data.slice(start, start + pageSize);
    return { items, total: data.length };
}

const DEFAULTS = {
    page: 1,
    pageSize: 5,
    sortKey: 'name',
    sortOrder: 'asc' as const,
};

// -------------------- COMPONENT DEMO --------------------
export default function Demo() {
    const [searchParams, setSearchParams] = useSearchParams();

    // ---- state hiển thị / filter
    const [page, setPage] = useState(DEFAULTS.page);
    const [pageSize, setPageSize] = useState(DEFAULTS.pageSize);
    const [sortKey, setSortKey] = useState(DEFAULTS.sortKey);
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>(DEFAULTS.sortOrder);

    // ---- đồng bộ 2 chiều: URL ↔ state
    useEffect(() => {
        const urlParams = {
            page: parseInt(searchParams.get('page') || String(DEFAULTS.page), 10),
            pageSize: parseInt(searchParams.get('page_size') || String(DEFAULTS.pageSize), 10),
            sortKey: searchParams.get('sort_field') || DEFAULTS.sortKey,
            sortOrder: (searchParams.get('sort_order') as 'asc' | 'desc') || DEFAULTS.sortOrder,
        };

        const stateParams = { page, pageSize, sortKey, sortOrder };

        const isUrlDifferent = Object.keys(urlParams).some(
            (key) => (urlParams as any)[key] !== (stateParams as any)[key]
        );

        // Nếu URL khác: URL là nguồn thay đổi → đồng bộ state
        if (isUrlDifferent) {
            setPage(urlParams.page);
            setPageSize(urlParams.pageSize);
            setSortKey(urlParams.sortKey);
            setSortOrder(urlParams.sortOrder);
            return;
        }

        // Nếu URL trống: lần mount đầu tiên → ghi mặc định lên URL
        if (searchParams.toString() === '') {
            setSearchParams(
                {
                    page: String(page),
                    page_size: String(pageSize),
                    sort_field: sortKey,
                    sort_order: sortOrder,
                },
                { replace: true }
            );
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchParams, page, pageSize, sortKey, sortOrder]);

    // ---- React Query fetch
    const { data, isLoading } = useQuery({
        queryKey: ['categories', { page, pageSize, sortKey, sortOrder }],
        queryFn: () => mockFetch({ page, pageSize, sortKey, sortOrder }),
    });

    return (
        <div className="p-6">
            <h2 className="text-lg font-semibold mb-4">
                Category Table — React Query + URL Sync
            </h2>

            <TableServerPagination<Category>
                data={data?.items ?? []}
                columns={[
                    { key: 'id', title: 'ID', width: '80px' },
                    { key: 'name', title: 'Tên danh mục', sortable: true },
                    { key: 'parent_id', title: 'Parent ID', align: 'center' },
                ]}
                page={page}
                pageSize={pageSize}
                total={data?.total ?? 0}
                sortKey={sortKey}
                sortOrder={sortOrder}
                onPageChange={setPage}
                onPageSizeChange={(size) => {
                    setPageSize(size);
                    setPage(1);
                }}
                onSortChange={(key, order) => {
                    setSortKey(key);
                    setSortOrder(order);
                    setPage(1);
                }}
                loading={isLoading}
                preserveDataWhileLoading
            />
        </div>
    );
}
