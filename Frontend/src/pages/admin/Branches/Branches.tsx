import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { getApi } from '../../../utils';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import Button from '../../../components/ui/form/Button';
import Input from '../../../components/ui/form/Input';
import TableServerPagination from '../../../components/ui/data-display/TableServerPagination';
import toast from 'react-hot-toast';
import { Branch } from '../../../types';

const Branches: React.FC = () => {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [searchParams, setSearchParams] = useSearchParams();

    const DEFAULTS = {
        page: 1,
        pageSize: 20,
        sortKey: 'created_at',
        sortOrder: 'desc' as 'asc' | 'desc',
        search: '',
    };

    // ---- state hiển thị / filter
    const [page, setPage] = useState(DEFAULTS.page);
    const [pageSize, setPageSize] = useState(DEFAULTS.pageSize);
    const [sortKey, setSortKey] = useState(DEFAULTS.sortKey);
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>(DEFAULTS.sortOrder);
    const [searchQuery, setSearchQuery] = useState(DEFAULTS.search);

    // ---- đồng bộ 2 chiều: URL ↔ state
    useEffect(() => {
        const urlParams = {
            page: parseInt(searchParams.get('page') || String(DEFAULTS.page), 10),
            pageSize: parseInt(searchParams.get('page_size') || String(DEFAULTS.pageSize), 10),
            sortKey: searchParams.get('sort_field') || DEFAULTS.sortKey,
            sortOrder: (searchParams.get('sort_order') as 'asc' | 'desc') || DEFAULTS.sortOrder,
            search: searchParams.get('search') || DEFAULTS.search,
        };

        const stateParams = { page, pageSize, sortKey, sortOrder, search: searchQuery };

        const isUrlDifferent = Object.keys(urlParams).some(
            (key) => (urlParams as any)[key] !== (stateParams as any)[key]
        );

        // Nếu URL khác: URL là nguồn thay đổi → đồng bộ state
        if (isUrlDifferent) {
            setPage(urlParams.page);
            setPageSize(urlParams.pageSize);
            setSortKey(urlParams.sortKey);
            setSortOrder(urlParams.sortOrder);
            setSearchQuery(urlParams.search);
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
    }, [searchParams, page, pageSize, sortKey, sortOrder, searchQuery]);

    // Function GET Branches
    const getBranches = () => {
        const params: any = {
            page,
            page_size: pageSize,
            sort_field: sortKey,
            sort_order: sortOrder,
        };
        if (searchQuery) {
            params.search = searchQuery;
        }
        return getApi(`${process.env.REACT_APP_API_URL}/api/branches`, params);
    };

    // Lấy dữ liệu từ ClientQuery
    const { data: apiResponse, isLoading } = useQuery({
        queryKey: ['branches', { page, pageSize, sortKey, sortOrder, searchQuery }],
        queryFn: getBranches,
    });

    const branches = apiResponse?.data?.items ?? [];
    const pagination = apiResponse?.data?.pagination;
    const total = pagination?.total ?? 0;

    const handlePageChange = (newPage: number) => {
        setPage(newPage);
        setSearchParams(
            {
                page: String(newPage),
                page_size: String(pageSize),
                sort_field: sortKey,
                sort_order: sortOrder,
            },
            { replace: true }
        );
    };

    const handlePageSizeChange = (newSize: number) => {
        setPageSize(newSize);
        setPage(1); // Reset to first page
        setSearchParams(
            {
                page: '1',
                page_size: String(newSize),
                sort_field: sortKey,
                sort_order: sortOrder,
            },
            { replace: true }
        );
    };

    const handleSortChange = (key: string, order: 'asc' | 'desc') => {
        setSortKey(key);
        setSortOrder(order);
        setPage(1); // Reset to first page
        setSearchParams(
            {
                page: '1',
                page_size: String(pageSize),
                sort_field: key,
                sort_order: order,
            },
            { replace: true }
        );
    };

    // Định nghĩa giao diện bảng Branches
    const columns = [
        {
            key: 'id',
            title: 'ID',
            sortable: true,
            render: (value: string) => (
                <span className="font-mono text-sm text-primary-600">#{value}</span>
            ),
        },
        {
            key: 'name',
            title: 'Tên chi nhánh',
            sortable: true,
            render: (value: string) => (
                <div>
                    <p className="font-medium text-gray-900">{value}</p>
                </div>
            ),
        },
        {
            key: 'address',
            title: 'Địa chỉ',
            render: (value: any, item: any) => (
                <div>
                    <p className="text-sm text-gray-600">{item.street}, {item.ward}</p>
                    <p className="text-sm text-gray-600">{item.district}, {item.city}, {item.zipcode}</p>
                </div>
            ),
        },
        {
            key: 'contact',
            title: 'Liên hệ',
            render: (value: any, item: any) => (
                <div>
                    <p className="text-sm text-gray-600">{item.phone}</p>
                    <p className="text-sm text-gray-600">{item.email}</p>
                </div>
            ),
        },
        {
            key: 'created_at',
            title: 'Ngày tạo',
            sortable: true,
            render: (value: string) => (
                <span className="text-sm text-gray-600">
                    {value ? new Date(value).toLocaleDateString('vi-VN') : '-'}
                </span>
            ),
        },
        {
            key: 'actions',
            title: 'Hành động',
            render: (value: any, item: Branch) => (
                <div className="flex items-center space-x-2">
                    <Button
                        size="sm"
                        variant="outline"
                        onClick={() => navigate(`/admin/orders?branch_id=${item.id}`)}
                    >
                        Đơn hàng
                    </Button>
                    <Button
                        size="sm"
                        variant="outline"
                        onClick={() => navigate(`/admin/inventories?branch_id=${item.id}`)}
                    >
                        Sản phẩm
                    </Button>
                </div>
            ),
        },
    ]

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className={"flex items-center justify-between"}>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Chi nhánh</h1>
                    <p className="text-gray-600">Quản lý các chi nhánh của bạn</p>
                </div>
            </div>

            {/* Branches Table */}
            <TableServerPagination
                data={branches}
                columns={columns}
                loading={isLoading}
                emptyMessage="Không tìm thấy chi nhánh nào"
                page={page}
                pageSize={pageSize}
                total={total}
                onPageChange={handlePageChange}
                onPageSizeChange={handlePageSizeChange}
                sortKey={sortKey}
                sortOrder={sortOrder}
                onSortChange={handleSortChange}
                preserveDataWhileLoading={true}
            />
        </div>
    );
}

export default Branches;
