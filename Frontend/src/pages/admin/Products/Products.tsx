import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Swal, { SweetAlertResult } from 'sweetalert2';
import { deleteApi, getApi } from '../../../utils';
import { Product } from '../../../types';
import Card from '../../../components/ui/data-display/Card';
import Button from '../../../components/ui/form/Button';
import TableServerPagination from '../../../components/ui/data-display/TableServerPagination';
import SearchInput from '../../../components/ui/search/SearchInput';
import DropdownSelect from '../../../components/ui/form/DropdownSelect';
import toast from 'react-hot-toast';

// ============================================================
// COMPONENT: Products
// Màn hình quản lý sản phẩm (hiển thị, tìm kiếm, lọc theo danh mục, sắp xếp, phân trang, xóa)
// ============================================================

const Products: React.FC = () => {
    // ============================================================
    // Hook & Khởi tạo
    // ============================================================
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

    const [page, setPage] = useState(DEFAULTS.page);
    const [pageSize, setPageSize] = useState(DEFAULTS.pageSize);
    const [sortKey, setSortKey] = useState(DEFAULTS.sortKey);
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>(DEFAULTS.sortOrder);
    const [searchQuery, setSearchQuery] = useState(DEFAULTS.search);
    const [appliedSearch, setAppliedSearch] = useState(DEFAULTS.search);
    const [isSearchLoading, setIsSearchLoading] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState<string | number | null>(null);

    // ============================================================
    // Gọi API: Lấy danh mục sản phẩm để filter
    // ============================================================
    const { data: categoriesData, isLoading: loadingCategories } = useQuery({
        queryKey: ['categories'],
        queryFn: () => getApi(`${process.env.REACT_APP_API_URL}/api/categories`),
    });

    const categories = categoriesData?.data?.items ?? [];

    // ============================================================
    // Đồng bộ giữa URL ↔ state (khi user đổi URL hoặc state thay đổi)
    // ============================================================
    useEffect(() => {
        const urlParams = {
            page: parseInt(searchParams.get('page') || String(DEFAULTS.page), 10),
            pageSize: parseInt(searchParams.get('page_size') || String(DEFAULTS.pageSize), 10),
            sortKey: searchParams.get('sort_field') || DEFAULTS.sortKey,
            sortOrder: (searchParams.get('sort_order') as 'asc' | 'desc') || DEFAULTS.sortOrder,
            search: searchParams.get('search') || DEFAULTS.search,
            categoryId: searchParams.get('category_id') || null,
        };

        const stateParams = {
            page,
            pageSize,
            sortKey,
            sortOrder,
            search: appliedSearch,
            categoryId: selectedCategory ? String(selectedCategory) : null,
        };

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
            setSelectedCategory(urlParams.categoryId);
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
    }, [searchParams, page, pageSize, sortKey, sortOrder, appliedSearch, selectedCategory]);

    // ============================================================
    // Gọi API: Lấy danh sách sản phẩm
    // ============================================================
    const getProducts = async () => {
        const params: any = {
            page,
            page_size: pageSize,
            sort_field: sortKey,
            sort_order: sortOrder,
        };
        if (appliedSearch) params.search = appliedSearch;
        if (selectedCategory) params.category_id = selectedCategory;

        // Giả lập delay để xem hiệu ứng loading
        // await new Promise((resolve) => setTimeout(resolve, 800));

        return getApi(`${process.env.REACT_APP_API_URL}/api/products`, params);
    };

    // ============================================================
    // React Query: Lấy danh sách sản phẩm
    // ============================================================
    const { data: apiResponse, isLoading, refetch } = useQuery({
        queryKey: ['products', { page, pageSize, sortKey, sortOrder, appliedSearch, selectedCategory }],
        queryFn: getProducts,
    });

    const products = apiResponse?.data?.items ?? [];
    const pagination = apiResponse?.data?.pagination;
    const total = pagination?.total ?? 0;

    // ============================================================
    // Gọi API: Xoá sản phẩm
    // ============================================================
    const deleteProduct = async (id: string | number) => {
        return deleteApi(`${process.env.REACT_APP_API_URL}/api/products/${id}`);
    };

    const { mutate: handleDelete } = useMutation({
        mutationFn: deleteProduct,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['products'] });
            Swal.fire('Đã xóa!', 'Sản phẩm đã được xóa.', 'success');
        },
        onError: () => {
            Swal.fire('Lỗi!', 'Xóa sản phẩm thất bại.', 'error');
        },
    });

    // ============================================================
    // Hàm xử lý sự kiện người dùng
    // ============================================================
    const confirmDelete = (id: string | number) => {
        Swal.fire({
            title: 'Bạn có chắc chắn?',
            text: 'Hành động này không thể hoàn tác!',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Có, xóa ngay!',
        }).then((result: SweetAlertResult) => {
            if (result.isConfirmed) {
                handleDelete(id);
            }
        });
    };

    const handlePageChange = (newPage: number) => {
        setPage(newPage);
        setSearchParams(
            {
                page: String(newPage),
                page_size: String(pageSize),
                sort_field: sortKey,
                sort_order: sortOrder,
                ...(appliedSearch ? { search: appliedSearch } : {}),
                ...(selectedCategory ? { category_id: String(selectedCategory) } : {}),
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
                ...(selectedCategory ? { category_id: String(selectedCategory) } : {}),
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
                ...(selectedCategory ? { category_id: String(selectedCategory) } : {}),
            },
            { replace: true }
        );
    };

    // ============================================================
    // Xử lý tìm kiếm
    // ============================================================
    const handleSearch = async () => {
        if (!searchQuery.trim()) {
            toast.error('Vui lòng nhập từ khóa tìm kiếm');
            return;
        }

        setIsSearchLoading(true);
        setPage(1);
        setAppliedSearch(searchQuery);
        setSearchParams(
            {
                page: '1',
                page_size: String(pageSize),
                sort_field: sortKey,
                sort_order: sortOrder,
                search: searchQuery,
                ...(selectedCategory ? { category_id: String(selectedCategory) } : {}),
            },
            { replace: true }
        );

        await refetch();
        setIsSearchLoading(false);
    };

    const handleResetSearch = async () => {
        if (!appliedSearch && !searchQuery && !selectedCategory) return;
        setSearchQuery('');
        setAppliedSearch('');
        setSelectedCategory(null);
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
        toast.success('Đã hiển thị lại tất cả sản phẩm');
    };

    // ============================================================
    // Cấu hình bảng hiển thị sản phẩm
    // ============================================================
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
            key: 'avatar',
            title: 'Ảnh đại diện',
            render: (value: string, item: Product) => (
                <div className="flex items-center">
                    {item.avatar ? (
                        <img src={item.avatar} alt={item.name} className="w-10 h-10 rounded-full" />
                    ) : (
                        <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                            <span className="text-sm font-medium text-primary-700">
                                {item.name.charAt(0)}
                            </span>
                        </div>
                    )}
                </div>
            ),
        },
        {
            key: 'name',
            title: 'Tên sản phẩm',
            sortable: true,
            render: (value: string, item: Product) => (
                <div>
                    <p className="font-medium text-gray-600">{value}</p>
                    <span className="font-mono text-sm text-primary-600">{item.sku}</span>
                </div>
            ),
        },
        {
            key: 'category_name',
            title: 'Danh mục',
            render: (value: string) => (
                <span className="font-medium text-sm text-gray-600">{value}</span>
            ),
        },
        {
            key: 'unit_of_measure',
            title: 'Đơn vị tính',
            render: (value: string) => (
                <p className="font-medium text-gray-600">{value}</p>
            ),
        },
        {
            key: 'price',
            title: 'Giá',
            sortable: true,
            render: (value: string) => (
                <p className="font-medium text-gray-600">{value}</p>
            ),
        },
        {
            key: 'actions',
            title: 'Hành động',
            render: (value: any, item: Product) => (
                <div className="flex items-center space-x-2">
                    <Button
                        size="sm"
                        variant="outline"
                        className="text-red-600 border-red-600 hover:bg-red-50"
                        onClick={() => confirmDelete(item.id)}
                    >
                        Xóa
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
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Sản phẩm</h1>
                    <p className="text-gray-600">Quản lý sản phẩm của bạn</p>
                </div>
                <div className="flex items-center gap-2">
                    <Button onClick={() => navigate('/admin/products/create')}>Tạo mới</Button>
                </div>
            </div>

            {/* Search + Filter + Table */}
            <Card>
                <div className="flex items-start gap-2 w-full mb-3">
                    <div className="w-64">
                        <DropdownSelect
                            data={categories}
                            value={selectedCategory}
                            onChange={(val) => {
                                setSelectedCategory(val);
                                setPage(1);
                                setSearchParams(
                                    {
                                        page: '1',
                                        page_size: String(pageSize),
                                        sort_field: sortKey,
                                        sort_order: sortOrder,
                                        ...(appliedSearch ? { search: appliedSearch } : {}),
                                        ...(val ? { category_id: String(val) } : {}),
                                    },
                                    { replace: true }
                                );
                            }}
                            loading={loadingCategories}
                            placeholder="Chọn danh mục"
                            defaultOptionLabel="Tất cả danh mục"
                        />
                    </div>

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
                    data={products}
                    columns={columns}
                    loading={isLoading}
                    emptyMessage="Không có sản phẩm nào"
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

export default Products;
    