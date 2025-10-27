import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Swal, { SweetAlertResult } from 'sweetalert2';
import { deleteApi, getApi } from '../../../utils';
import { Product } from '../../../types';
import Card from '../../../components/ui/data-display/Card';
import Button from '../../../components/ui/form/Button';
import TableServerPagination from '../../../components/ui/data-display/TableServerPagination';

const Products: React.FC = () => {
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

    // ---- Đồng bộ URL ↔ state
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

        if (isUrlDifferent) {
            setPage(urlParams.page);
            setPageSize(urlParams.pageSize);
            setSortKey(urlParams.sortKey);
            setSortOrder(urlParams.sortOrder);
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
    }, [searchParams, page, pageSize, sortKey, sortOrder, searchQuery]);

    // Function GET Products
    const getProducts = () => {
        const params: any = {
            page,
            page_size: pageSize,
            sort_field: sortKey,
            sort_order: sortOrder,
        };
        if (searchQuery) params.search = searchQuery;
        return getApi(`${process.env.REACT_APP_API_URL}/api/products`, params);
    };

    // Lấy dữ liệu từ React Query
    const { data: apiResponse, isLoading } = useQuery({
        queryKey: ['products', { page, pageSize, sortKey, sortOrder, searchQuery }],
        queryFn: getProducts,
    });

    const products = apiResponse?.data?.items ?? [];
    const pagination = apiResponse?.data?.pagination;
    const total = pagination?.total ?? 0;

    // Hàm gọi API xoá
    const deleteProduct = async (id: string | number) => {
        return deleteApi(`${process.env.REACT_APP_API_URL}/api/products/${id}`);
    };

    // Mutation xoá sản phẩm
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

    // Hàm xác nhận xoá
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
            },
            { replace: true }
        );
    };

    // Định nghĩa giao diện bảng Products
    const columns = [
        {
            key: 'id',
            title: 'ID người dùng',
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
            key: 'sku',
            title: 'SKU',
            sortable: true,
            render: (value: string) => (
                <span className="font-mono text-sm text-primary-600">{value}</span>
            ),
        },
        {
            key: 'name',
            title: 'Tên sản phẩm',
            sortable: true,
            render: (value: string) => (
                <div>
                    <p className="font-medium text-gray-600">{value}</p>
                </div>
            ),
        },
        {
            key: 'unit_of_measure',
            title: 'Đơn vị tính',
            render: (value: string) => (
                <div>
                    <p className="font-medium text-gray-600">{value}</p>
                </div>
            ),
        },
        {
            key: 'price',
            title: 'Giá',
            sortable: true,
            render: (value: string) => (
                <div>
                    <p className="font-medium text-gray-600">{value}</p>
                </div>
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

            {/* Products Table */}
            <Card>
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
                    preserveDataWhileLoading={true}
                />
            </Card>
        </div>
    );
};

export default Products;
