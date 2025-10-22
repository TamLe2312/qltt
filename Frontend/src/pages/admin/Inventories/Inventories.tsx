import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getApi } from '../../../utils';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import Button from '../../../components/ui/form/Button';
import Card from 'antd/es/card/Card';
import Table from '../../../components/ui/data-display/Table';

const Inventories: React.FC = () => {
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    // Function GET Inventories
    const getInventories = () => getApi(`${process.env.REACT_APP_API_URL}/api/inventories`);

    // Lấy dữ liệu từ ClientQuery
    const { data: apiResponse, isLoading, error } = useQuery({
        queryKey: ['inventories'],
        queryFn: getInventories,
    });

    const inventories = apiResponse?.data.items ?? [];

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'active':
                return 'bg-yellow-100 text-yellow-800';
            case 'inactive':
                return 'bg-blue-100 text-blue-800';
            case 'out_of_stock':
                return 'bg-purple-100 text-purple-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    // Định nghĩa giao diện bảng Inventories
    const columns = [
        {
            key: 'id',
            title: 'ID',
            render: (value: string) => (
                <span className="font-mono text-sm text-primary-600">#{value}</span>
            ),
        },
        {
            key: 'branch_name',
            title: 'Chi nhánh',
            render: (value: string) => (
                <div>
                    <p className="font-medium text-gray-600">{value}</p>
                </div>
            ),
        },
        {
            key: 'product_name',
            title: 'Sản phẩm',
            render: (value: string, item: any) => (
                <div>
                    <p className="font-medium text-gray-600">{value}</p>
                    <p className="font-medium text-gray-600">SKU: <span className="font-medium text-blue-600">{item.sku}</span></p>
                </div>
            ),
        },
        {
            key: 'supplier_name',
            title: 'Nhà cung cấp',
            render: (value: string) => (
                <div>
                    <p className="font-medium text-gray-600">{value}</p>
                </div>
            ),
        },
        {
            key: 'quantity',
            title: 'Tồn kho',
            render: (value: any, item: any) => (
                <div>
                    <p className="font-medium text-gray-600">{value}</p>
                    <p className="font-medium text-gray-600">Đã đặt: <span className="font-medium text-blue-600">{item.reserved_stock}</span></p>
                </div>
            ),
        },
        {
            key: 'status',
            title: 'Trạng thái',
            render: (value: string) => (
                <div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(value)}`}>
                        {value.charAt(0).toUpperCase() + value.slice(1)}
                    </span>
                </div>
            ),
        },
        {
            key: 'actions',
            title: 'Thao tác',
            render: (value: any, item: any) => (
                <div className="flex items-center space-x-2">
                    <Button
                        size="sm"
                        variant="outline"
                    // onClick={() => handleViewOrder(item)}
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
                    <h1 className="text-2xl font-bold text-gray-900">Kho hàng</h1>
                    <p className="text-gray-600">Quản lý kho hàng của bạn</p>
                </div>
                <Button onClick={() => null} >Mới</Button>
            </div>

            {/* Inventories Table */}
            <Card>
                <Table
                    data={inventories || []}
                    columns={columns}
                    loading={isLoading}
                    emptyMessage="Không tìm thấy kho hàng nào"
                />
            </Card>
        </div>
    );
}

export default Inventories;
