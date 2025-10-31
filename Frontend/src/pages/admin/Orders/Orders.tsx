// ============================
// FILE: Orders.tsx
// ============================
import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { getApi, formatDate } from '../../../utils';
import { Order } from '../../../types';
import Card from '../../../components/ui/data-display/Card';
import Button from '../../../components/ui/form/Button';
import TableServerPagination from '../../../components/ui/data-display/TableServerPagination';
import SearchInput from '../../../components/ui/search/SearchInput';
import DropdownSelect from '../../../components/ui/form/DropdownSelect';
import toast from 'react-hot-toast';

// ============================================================
// COMPONENT: Orders
// ============================================================
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

    // ============================================================
    // State
    // ============================================================
    const [page, setPage] = useState(DEFAULTS.page);
    const [pageSize, setPageSize] = useState(DEFAULTS.pageSize);
    const [sortKey, setSortKey] = useState(DEFAULTS.sortKey);
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>(DEFAULTS.sortOrder);
    const [searchQuery, setSearchQuery] = useState(DEFAULTS.search);
    const [appliedSearch, setAppliedSearch] = useState(DEFAULTS.search);
    const [isSearchLoading, setIsSearchLoading] = useState(false);
    const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
    const [selectedBranch, setSelectedBranch] = useState<string | null>(null);
    const [selectedUser, setSelectedUser] = useState<string | null>(null); // ✅ filter user

    // ============================================================
    // Danh sách trạng thái
    // ============================================================
    const statusOptions = [
        { id: 'pending', name: 'Chờ xác nhận' },
        { id: 'confirmed', name: 'Đã xác nhận' },
        { id: 'processing', name: 'Đang xử lý' },
        { id: 'shipped', name: 'Đã giao' },
        { id: 'delivered', name: 'Đã giao hàng' },
        { id: 'completed', name: 'Hoàn tất' },
        { id: 'canceled', name: 'Đã hủy' },
        { id: 'failed', name: 'Thất bại' },
        { id: 'refunded', name: 'Đã hoàn tiền' },
    ];

    // ============================================================
    // Đồng bộ giữa URL ↔ state
    // ============================================================
    useEffect(() => {
        const urlParams = {
            page: parseInt(searchParams.get('page') || String(DEFAULTS.page), 10),
            pageSize: parseInt(searchParams.get('page_size') || String(DEFAULTS.pageSize), 10),
            sortKey: searchParams.get('sort_field') || DEFAULTS.sortKey,
            sortOrder: (searchParams.get('sort_order') as 'asc' | 'desc') || DEFAULTS.sortOrder,
            search: searchParams.get('search') || DEFAULTS.search,
            status: searchParams.get('status') || null,
            branch_id: searchParams.get('branch_id') || null,
            user_id: searchParams.get('user_id') || null,
        };

        const stateParams = {
            page,
            pageSize,
            sortKey,
            sortOrder,
            search: appliedSearch,
            status: selectedStatus,
            branch_id: selectedBranch,
            user_id: selectedUser,
        };

        const isDifferent = Object.keys(urlParams).some(
            (key) => (urlParams as any)[key] !== (stateParams as any)[key]
        );

        if (isDifferent) {
            setPage(urlParams.page);
            setPageSize(urlParams.pageSize);
            setSortKey(urlParams.sortKey);
            setSortOrder(urlParams.sortOrder);
            setAppliedSearch(urlParams.search);
            setSearchQuery(urlParams.search);
            setSelectedStatus(urlParams.status);
            setSelectedBranch(urlParams.branch_id);
            setSelectedUser(urlParams.user_id);
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
    }, [searchParams, page, pageSize, sortKey, sortOrder, appliedSearch, selectedStatus, selectedBranch, selectedUser]);

    // ============================================================
    // API: Lấy danh sách đơn hàng
    // ============================================================
    const getOrders = async () => {
        const params: any = {
            page,
            page_size: pageSize,
            sort_field: sortKey,
            sort_order: sortOrder,
        };
        if (appliedSearch) params.search = appliedSearch;
        if (selectedStatus) params.status = selectedStatus;
        if (selectedBranch) params.branch_id = selectedBranch;
        if (selectedUser) params.user_id = selectedUser; // ✅ filter user

        return getApi(`${process.env.REACT_APP_API_URL}/api/orders`, params);
    };

    const { data: apiResponse, isLoading, refetch } = useQuery({
        queryKey: ['orders', { page, pageSize, sortKey, sortOrder, appliedSearch, selectedStatus, selectedBranch, selectedUser }],
        queryFn: getOrders,
    });

    const orders = apiResponse?.data?.items ?? [];
    const pagination = apiResponse?.data?.pagination;
    const total = pagination?.total ?? 0;

    // ============================================================
    // API Branches & Users
    // ============================================================
    const { data: apiBranchesResponse } = useQuery({
        queryKey: ['branches'],
        queryFn: () => getApi(`${process.env.REACT_APP_API_URL}/api/branches`),
    });
    const branchOptions = apiBranchesResponse?.data?.items ?? [];

    const { data: apiUsersResponse } = useQuery({
        queryKey: ['users'],
        queryFn: () => getApi(`${process.env.REACT_APP_API_URL}/api/users`),
    });
    const userOptions = apiUsersResponse?.data?.items ?? [];

    // ============================================================
    // Helpers
    // ============================================================
    const buildParams = (overrides = {}) => ({
        page: String(page),
        page_size: String(pageSize),
        sort_field: sortKey,
        sort_order: sortOrder,
        ...(appliedSearch ? { search: appliedSearch } : {}),
        ...(selectedStatus ? { status: selectedStatus } : {}),
        ...(selectedBranch ? { branch_id: selectedBranch } : {}),
        ...(selectedUser ? { user_id: selectedUser } : {}), // ✅ filter user
        ...overrides,
    });

    const cleanParams = (params: Record<string, any>) => {
        const cleaned: Record<string, string> = {};
        Object.entries(params).forEach(([k, v]) => {
            if (v !== null && v !== undefined && v !== '') cleaned[k] = String(v);
        });
        return cleaned;
    };

    const handlePageChange = (newPage: number) => {
        setPage(newPage);
        setSearchParams(cleanParams(buildParams({ page: String(newPage) })), { replace: true });
    };

    const handlePageSizeChange = (newSize: number) => {
        setPageSize(newSize);
        setPage(1);
        setSearchParams(cleanParams(buildParams({ page: '1', page_size: String(newSize) })), { replace: true });
    };

    const handleSortChange = (key: string, order: 'asc' | 'desc') => {
        setSortKey(key);
        setSortOrder(order);
        setPage(1);
        setSearchParams(cleanParams(buildParams({ page: '1', sort_field: key, sort_order: order })), { replace: true });
    };

    const handleSearch = async () => {
        if (!searchQuery.trim()) {
            toast.error('Vui lòng nhập từ khóa tìm kiếm');
            return;
        }
        setIsSearchLoading(true);
        setPage(1);
        setAppliedSearch(searchQuery);
        setSearchParams(cleanParams(buildParams({ page: '1', search: searchQuery })), { replace: true });
        await refetch();
        setIsSearchLoading(false);
    };

    const handleResetSearch = async () => {
        if (!appliedSearch && !searchQuery && !selectedStatus && !selectedBranch && !selectedUser) return;
        setSearchQuery('');
        setAppliedSearch('');
        setSelectedStatus(null);
        setSelectedBranch(null);
        setSelectedUser(null);
        setPage(1);
        setSearchParams(cleanParams({
            page: '1',
            page_size: String(pageSize),
            sort_field: sortKey,
            sort_order: sortOrder,
        }), { replace: true });
        await refetch();
        toast.success('Đã hiển thị lại tất cả đơn hàng');
    };

    // ============================================================
    // Cấu hình bảng
    // ============================================================
    const columns = [
        {
            key: 'order_code',
            title: 'Mã đơn hàng',
            sortable: true,
            render: (value: string) => <p className="font-mono text-sm text-primary-600">{value}</p>,
        },
        { key: 'user_name', title: 'Khách hàng' },
        { key: 'branch_name', title: 'Chi nhánh' },
        {
            key: 'total_amount',
            title: 'Tổng tiền',
            render: (value: string) => <p className="font-medium text-gray-600">{Number(value).toLocaleString()} ₫</p>,
        },
        {
            key: 'status',
            title: 'Trạng thái',
            render: (value: string) => (
                <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                    {value}
                </span>
            ),
        },
        {
            key: 'created_at',
            title: 'Ngày tạo',
            render: (value: string) => <p className="text-gray-600">{formatDate(value)}</p>,
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

    // ============================================================
    // JSX Render
    // ============================================================
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Đơn hàng</h1>
                    <p className="text-gray-600">Quản lý đơn hàng của bạn</p>
                </div>
                <Button onClick={() => navigate('/admin/orders/create')}>Tạo mới</Button>
            </div>

            <Card>
                {/* Hàng bộ lọc và tìm kiếm */}
                <div className="flex flex-wrap items-start gap-2 w-full mb-4">
                    <div className="w-48">
                        <DropdownSelect
                            data={statusOptions}
                            value={selectedStatus}
                            onChange={(val) => {
                                const newVal = val ? String(val) : null;
                                setSelectedStatus(newVal);
                                setPage(1);
                                const params = buildParams({ page: '1', status: newVal || undefined });
                                setSearchParams(cleanParams(params), { replace: true });
                            }}
                            placeholder="Chọn trạng thái"
                            defaultOptionLabel="Tất cả trạng thái"
                        />
                    </div>

                    <div className="w-56">
                        <DropdownSelect
                            data={branchOptions}
                            value={selectedBranch}
                            onChange={(val) => {
                                const newVal = val ? String(val) : null;
                                setSelectedBranch(newVal);
                                setPage(1);
                                const params = buildParams({ page: '1', branch_id: newVal || undefined });
                                setSearchParams(cleanParams(params), { replace: true });
                            }}
                            placeholder="Chọn chi nhánh"
                            defaultOptionLabel="Tất cả chi nhánh"
                        />
                    </div>

                    <div className="w-56">
                        <DropdownSelect
                            valueKey="id"
                            labelKey="full_name"
                            data={userOptions}
                            value={selectedUser}
                            onChange={(val) => {
                                const newVal = val ? String(val) : null;
                                setSelectedUser(newVal);
                                setPage(1);
                                const params = buildParams({ page: '1', user_id: newVal || undefined });
                                setSearchParams(cleanParams(params), { replace: true });
                            }}
                            placeholder="Chọn khách hàng"
                            defaultOptionLabel="Tất cả khách hàng"
                        />
                    </div>

                    <div className="flex-1 min-w-[250px]">
                        <SearchInput
                            searchQuery={searchQuery}
                            setSearchQuery={setSearchQuery}
                            handleSearch={handleSearch}
                            isSearchLoading={isSearchLoading}
                        />
                    </div>

                    <Button variant="outline" className="h-10 px-3 flex-none" onClick={handleResetSearch}>
                        X
                    </Button>
                </div>

                <TableServerPagination
                    data={orders}
                    columns={columns}
                    loading={isLoading}
                    emptyMessage="Không có đơn hàng nào"
                    page={page}
                    pageSize={pageSize}
                    total={total}
                    onPageChange={handlePageChange}
                    onPageSizeChange={handlePageSizeChange}
                    sortKey={sortKey}
                    sortOrder={sortOrder}
                    onSortChange={handleSortChange}
                    preserveDataWhileLoading={false}
                />
            </Card>
        </div>
    );
};

export default Orders;


