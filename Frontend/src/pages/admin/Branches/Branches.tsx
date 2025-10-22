import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getApi } from '../../../utils';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import Button from '../../../components/ui/form/Button';
import Card from 'antd/es/card/Card';
import Table from '../../../components/ui/data-display/Table';

const Branches: React.FC = () => {
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    // Function GET Branches
    const getBranches = () => getApi(`${process.env.REACT_APP_API_URL}/api/branches`);

    // Lấy dữ liệu từ ClientQuery
    const { data: apiResponse, isLoading, error } = useQuery({
        queryKey: ['branches'],
        queryFn: getBranches,
    });

    const branches = apiResponse?.data.items ?? [];

    // Định nghĩa giao diện bảng Branches
    const columns = [
        {
            key: 'id',
            title: 'ID',
            render: (value: string) => (
                <span className="font-mono text-sm text-primary-600">#{value}</span>
            ),
        },
        {
            key: 'name',
            title: 'Tên chi nhánh',
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
            <Card>
                <Table
                    data={branches || []}
                    columns={columns}
                    loading={isLoading}
                    emptyMessage="Không tìm thấy chi nhánh nào"
                />
            </Card>
        </div>
    );
}

export default Branches;
