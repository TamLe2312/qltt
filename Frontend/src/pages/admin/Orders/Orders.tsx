import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { formatDate, getApi } from '../../../utils';
import { Order } from '../../../types';
import Button from '../../../components/ui/form/Button';
import Card from '../../../components/ui/data-display/Card';
import TableServerPagination from '../../../components/ui/data-display/TableServerPagination';
import SearchInput from '../../../components/ui/search/SearchInput';
import toast from "react-hot-toast";

const Orders: React.FC = () => {
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();

    const DEFAULTS = {
        page: 1,
        pageSize: 20,
        sortKey: 'created_at',
        sortOrder: 'desc' as 'asc' | 'desc',
        search: '',
    };

    // ========================
    // STATE
    // ========================
    const [page, setPage] = useState(DEFAULTS.page);
    const [pageSize, setPageSize] = useState(DEFAULTS.pageSize);
    const [sortKey, setSortKey] = useState(DEFAULTS.sortKey);
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>(DEFAULTS.sortOrder);
    const [searchQuery, setSearchQuery] = useState(DEFAULTS.search);
    const [appliedSearch, setAppliedSearch] = useState(DEFAULTS.search); // ✅ chỉ fetch khi nhấn tìm kiếm

    // ========================
    // URL SYNC
    // ========================
    useEffect(() => {
        const urlParams = {
            page: parseInt(searchParams.get('page') || String(DEFAULTS.page), 10),
            pageSize: parseInt(searchParams.get('page_size') || String(DEFAULTS.pageSize), 10),
            sortKey: searchParams.get('sort_field') || DEFAULTS.sortKey,
            sortOrder: (searchParams.get('sort_order') as 'asc' | 'desc') || DEFAULTS.sortOrder,
            search: searchParams.get('search') || DEFAULTS.search,
        };

        const stateParams = { page, pageSize, sortKey, sortOrder, search: appliedSearch };

        const isUrlDifferent = Object.keys(urlParams).some(
            (key) => (urlParams as any)[key] !== (stateParams as any)[key]
        );

        if (isUrlDifferent) {
            setPage(urlParams.page);
            setPageSize(urlParams.pageSize);
            setSortKey(urlParams.sortKey);
            setSortOrder(urlParams.sortOrder);
            setAppliedSearch(urlParams.search);
            setSearchQuery(urlParams.search);
            return;
        }

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
    }, [searchParams, page, pageSize, sortKey, sortOrder, appliedSearch]);

    // ========================
    // API FETCH FUNCTION
    // ========================
    const getOrders = async () => {
        const params: any = {
            page,
            page_size: pageSize,
            sort_field: sortKey,
            sort_order: sortOrder,
        };
        if (appliedSearch) params.search = appliedSearch;
        return getApi(`${process.env.REACT_APP_API_URL}/api/orders`, params);
    };

    // ========================
    // TANSTACK QUERY
    // ========================
    const { data: apiResponse, isLoading, refetch } = useQuery({
        queryKey: ['orders', { page, pageSize, sortKey, sortOrder, appliedSearch }],
        queryFn: getOrders,
    });

    const orders = apiResponse && Array.isArray(apiResponse.data?.items) ? apiResponse.data.items : [];
    const pagination = apiResponse?.data?.pagination;
    const total = pagination?.total ?? 0;

    // ========================
    // HANDLERS
    // ========================
    const handlePageChange = (newPage: number) => {
        setPage(newPage);
        setSearchParams(
            {
                page: String(newPage),
                page_size: String(pageSize),
                sort_field: sortKey,
                sort_order: sortOrder,
                ...(appliedSearch ? { search: appliedSearch } : {}),
            },
            { replace: true }
        );
    };

    const handlePageSizeChange = (newSize: number) => {
        setPageSize(newSize);
        setPage(1);
        setSearchParams(
            {
                page: '1',
                page_size: String(newSize),
                sort_field: sortKey,
                sort_order: sortOrder,
                ...(appliedSearch ? { search: appliedSearch } : {}),
            },
            { replace: true }
        );
    };

    const handleSortChange = (key: string, order: 'asc' | 'desc') => {
        setSortKey(key);
        setSortOrder(order);
        setPage(1);
        setSearchParams(
            {
                page: '1',
                page_size: String(pageSize),
                sort_field: key,
                sort_order: order,
                ...(appliedSearch ? { search: appliedSearch } : {}),
            },
            { replace: true }
        );
    };

    // ========================
    // SEARCH HANDLERS
    // ========================
    const [isSearchLoading, setIsSearchLoading] = useState(false);

    const handleSearch = async () => {
        if (!searchQuery.trim()) {
            toast.error('Vui lòng nhập từ khóa tìm kiếm');
            return;
        }

        setIsSearchLoading(true);
        setPage(1);
        setAppliedSearch(searchQuery); // ✅ Áp dụng từ khóa chính thức
        setSearchParams(
            {
                page: '1',
                page_size: String(pageSize),
                sort_field: sortKey,
                sort_order: sortOrder,
                search: searchQuery,
            },
            { replace: true }
        );

        await refetch();
        setIsSearchLoading(false);
    };

    const handleResetSearch = async () => {
        if (!appliedSearch && !searchQuery) return;
        setSearchQuery('');
        setAppliedSearch('');
        setPage(1);
        setSearchParams(
            {
                page: '1',
                page_size: String(pageSize),
                sort_field: sortKey,
                sort_order: sortOrder,
            },
            { replace: true }
        );
        await refetch();
        toast.success('Đã hiển thị lại tất cả đơn hàng');
    };

    // ========================
    // STATUS COLOR
    // ========================
    const getStatusColor = (status: Order['status']) => {
        switch (status) {
            case 'pending': return 'bg-yellow-100 text-yellow-800';
            case 'confirmed': return 'bg-indigo-100 text-indigo-800';
            case 'processing': return 'bg-blue-100 text-blue-800';
            case 'shipped': return 'bg-purple-100 text-purple-800';
            case 'delivered': return 'bg-green-100 text-green-800';
            case 'canceled': return 'bg-red-100 text-red-800';
            case 'failed': return 'bg-pink-100 text-pink-800';
            case 'refunded': return 'bg-teal-100 text-teal-800';
            case 'completed': return 'bg-lime-100 text-lime-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    // ========================
    // TABLE COLUMNS
    // ========================
    const columns = [
        {
            key: 'id',
            title: 'Mã đơn hàng',
            sortable: true,
            render: (value: string, item: Order) => (
                <div>
                    <p className="font-mono text-sm text-primary-600">#{value}</p>
                    <p className="font-mono text-sm text-primary-600">{`Mã code: ${item.order_code}`}</p>
                </div>
            ),
        },
        {
            key: 'user_name',
            title: 'Tên khách hàng',
            sortable: true,
            render: (value: string) => <p className="font-medium text-gray-600">{value}</p>,
        },
        {
            key: 'branch_name',
            title: 'Chi nhánh',
            sortable: true,
            render: (value: string) => <p className="font-medium text-gray-600">{value}</p>,
        },
        {
            key: 'created_at',
            title: 'Ngày đặt hàng',
            sortable: true,
            render: (value: any) => (
                <p className="font-medium text-gray-600">
                    <span className="font-medium text-blue-600">{formatDate(value)}</span>
                </p>
            ),
        },
        {
            key: 'status',
            title: 'Trạng thái',
            render: (value: Order['status']) => (
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(value)}`}>
                    {value.charAt(0).toUpperCase() + value.slice(1)}
                </span>
            ),
        },
        {
            key: 'actions',
            title: 'Hành động',
            render: (value: any, item: Order) => (
                <div className="flex items-center space-x-2">
                    <Button
                        size="sm"
                        variant="outline"
                        onClick={() => navigate(`/admin/orders/${item.id}/products`)}
                    >
                        Xem
                    </Button>
                </div>
            ),
        },
    ];

    // ========================
    // UI
    // ========================
    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Đơn hàng</h1>
                    <p className="text-gray-600">Quản lý đơn hàng của bạn</p>
                </div>
                <div className="space-x-2">
                    <Button onClick={() => navigate(`/admin/orders/create`)}>Tạo mới</Button>
                    <Button onClick={() => navigate(`/admin/orders/statistics`)}>Thống kê</Button>
                </div>
            </div>

            {/* Content */}
            <Card>
                <div className="flex items-start gap-2 w-full">
                    <SearchInput
                        searchQuery={searchQuery}
                        setSearchQuery={setSearchQuery}
                        handleSearch={handleSearch}
                        isSearchLoading={isSearchLoading}
                    />
                    <Button
                        variant="outline"
                        className="h-10 px-3 flex-none"
                        onClick={handleResetSearch}
                    >
                        X
                    </Button>
                </div>


                <TableServerPagination
                    data={orders}
                    columns={columns}
                    loading={isLoading}
                    emptyMessage="Không tìm thấy đơn hàng nào"
                    page={page}
                    pageSize={pageSize}
                    total={total}
                    onPageChange={handlePageChange}
                    onPageSizeChange={handlePageSizeChange}
                    sortKey={sortKey}
                    sortOrder={sortOrder}
                    onSortChange={handleSortChange}
                    preserveDataWhileLoading={false} // ✅ đảm bảo kết quả rỗng không hiển thị dữ liệu cũ
                />
            </Card>
        </div>
    );
};

export default Orders;
