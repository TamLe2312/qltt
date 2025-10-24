import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import Swal, { SweetAlertResult } from 'sweetalert2';
import { deleteApi, getApi } from '../../../utils';
import { Product } from '../../../types';
import Card from '../../../components/ui/data-display/Card';
import Table from '../../../components/ui/data-display/Table';
import Button from '../../../components/ui/form/Button';

const Products: React.FC = () => {
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    // Function GET Products
    const getProducts = () => getApi(`${process.env.REACT_APP_API_URL}/api/products`);

    // Lấy dữ liệu từ React Query
    const { data: apiResponse, isLoading } = useQuery({
        queryKey: ['products'],
        queryFn: getProducts,
    });

    const products = apiResponse?.data.items ?? [];

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

    // Định nghĩa giao diện bảng Products
    const columns = [
        {
            key: 'id',
            title: 'ID người dùng',
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
            render: (value: string) => (
                <span className="font-mono text-sm text-primary-600">{value}</span>
            ),
        },
        {
            key: 'name',
            title: 'Tên sản phẩm',
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
                    {/* <Button size="sm" variant="outline">
                        Sửa
                    </Button> */}
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
                <Table
                    data={products || []}
                    columns={columns}
                    loading={isLoading}
                    emptyMessage="Không có sản phẩm nào"
                />
            </Card>
        </div>
    );
};

export default Products;
