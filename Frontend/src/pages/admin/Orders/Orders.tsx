import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { formatDate, getApi } from '../../../utils';
import { Order } from '../../../types';
import Button from '../../../components/ui/form/Button';
import Card from '../../../components/ui/data-display/Card';
import Table from '../../../components/ui/data-display/Table';

const Orders: React.FC = () => {

    // // State quản lý Modal
    // const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

    // Điều hướng
    const navigate = useNavigate();

    // Function GET Orders
    const getOrders = async () => await getApi(`${process.env.REACT_APP_API_URL}/api/orders`);

    // Lấy dữ liệu từ ClientQuery
    const { data: apiResponse, isLoading, error } = useQuery({
        queryKey: ['orders'],
        queryFn: getOrders,
    });

    const orders = apiResponse?.data.items ?? [];
    // console.log('Orders: ', orders);

    // Màu tùy chỉnh cho trạng thái Order
    const getStatusColor = (status: Order['status']) => {
        switch (status) {
            case 'pending':
                return 'bg-yellow-100 text-yellow-800';
            case 'processing':
                return 'bg-blue-100 text-blue-800';
            case 'shipped':
                return 'bg-purple-100 text-purple-800';
            case 'delivered':
                return 'bg-green-100 text-green-800';
            case 'cancelled':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    // Định nghĩa giao diện bảng Orders
    const columns = [
        {
            key: 'id',
            title: 'Mã đơn hàng',
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
            render: (value: string) => (
                <div>
                    <p className="font-medium text-gray-600">{value}</p>
                </div>
            ),
        },
        {
            key: 'branch_name',
            title: 'Chi nhánh',
            render: (value: string, item: Order) => (
                <div>
                    <p className="font-medium text-gray-600">{value}</p>
                </div>
            ),
        },
        {
            key: 'created_at',
            title: 'Ngày đặt hàng',
            render: (value: any) => (
                <div>
                    <p className="font-medium text-gray-600"><span className="font-medium text-blue-600">{formatDate(value)}</span></p>
                </div>
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
    ]

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className={"flex items-center justify-between"}>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Đơn hàng</h1>
                    <p className="text-gray-600">Quản lý đơn hàng của bạn</p>
                </div>
                <div className='space-x-2'>
                    <Button onClick={() => navigate(`/admin/orders/create`)} >Tạo mới</Button>
                    <Button onClick={() => navigate(`/admin/orders/statistics`)} >Thống kê</Button>
                </div>
            </div>

            {/* Orders Table */}
            <Card>
                <Table
                    data={orders || []}
                    columns={columns}
                    loading={isLoading}
                    emptyMessage="Không tìm thấy đơn hàng nào"
                />
            </Card>
        </div>
    );
}

export default Orders;
