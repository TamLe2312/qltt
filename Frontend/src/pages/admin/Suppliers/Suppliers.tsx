import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getApi } from '../../../utils';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import Button from '../../../components/ui/form/Button';
import Card from 'antd/es/card/Card';
import Table from '../../../components/ui/data-display/Table';

const Suppliers: React.FC = () => {
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    // Function GET Suppliers
    const getSuppliers = () => getApi(`${process.env.REACT_APP_API_URL}/api/suppliers`);

    // Lấy dữ liệu từ ClientQuery
    const { data: apiResponse, isLoading, error } = useQuery({
        queryKey: ['suppliers'],
        queryFn: getSuppliers,
    });

    const suppliers = apiResponse?.data.items ?? [];

    // Định nghĩa giao diện bảng Suppliers
    const columns = [
        {
            key: 'id',
            title: 'ID chi nhánh',
            render: (value: string) => (
                <span className="font-mono text-sm text-primary-600">#{value}</span>
            ),
        },
        {
            key: 'name',
            title: 'Tên',
            render: (value: string) => (
                <div>
                    <p className="font-medium text-gray-600">{value}</p>
                </div>
            ),
        },
        {
            key: 'address',
            title: 'Địa chỉ',
            render: (value: any, item: any) => (
                <div>
                    <p className="font-medium text-gray-600">{item.street}, {item.ward}</p>
                    <p className="font-medium text-gray-600">{item.district}, {item.city}, {item.zipcode}</p>
                </div>
            ),
        },
        {
            key: 'contact',
            title: 'Liên hệ',
            render: (value: any, item: any) => (
                <div>
                    <p className="font-medium text-gray-600">{item.phone}</p>
                    <p className="font-medium text-gray-600">{item.email}</p>
                </div>
            ),
        },
        {
            key: 'actions',
            title: 'Hành động',
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
                    <h1 className="text-2xl font-bold text-gray-900">Nhà cung cấp</h1>
                    <p className="text-gray-600">Quản lý chi nhánh của bạn</p>
                </div>
                <Button onClick={() => null} >Tạo mới</Button>
            </div>

            {/* Suppliers Table */}
            <Card>
                <Table
                    data={suppliers || []}
                    columns={columns}
                    loading={isLoading}
                    emptyMessage="Không có chi nhánh nào"
                />
            </Card>
        </div>
    );
}

export default Suppliers;
