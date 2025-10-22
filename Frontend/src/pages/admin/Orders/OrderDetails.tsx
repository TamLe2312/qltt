import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';
import { getApi } from '../../../utils';
import { OrderDetail } from '../../../types';
import Button from '../../../components/ui/form/Button';
import Card from '../../../components/ui/data-display/Card';
import Table from '../../../components/ui/data-display/Table';

const OrderDetails: React.FC = () => {

    // Function GET OrderDetails
    const { id } = useParams();
    const getOrderDetails = () => getApi(`${process.env.REACT_APP_API_URL}/api/orders/${id}/products`);

    // Lấy dữ liệu từ ClientQuery
    const { data: apiResponse, isLoading, error } = useQuery({
        queryKey: ['orderDetails'],
        queryFn: getOrderDetails,
    });

    const orderDetails = apiResponse?.data.items ?? [];

    // Định nghĩa giao diện bảng OrderDetails
    const columns = [
        {
            key: 'product_id',
            title: 'Product ID',
            render: (value: string) => (
                <span className="font-mono text-sm text-primary-600">#{value}</span>
            ),
        },
        {
            key: 'product_name',
            title: 'Product name',
            render: (value: string) => (
                <span className="font-mono text-sm text-primary-600">{value}</span>
            ),
        },
        {
            key: 'quantity',
            title: 'Quantity',
            render: (value: number) => (
                <div>
                    <p className="font-medium text-gray-600">{value}</p>
                </div>
            ),
        },
        {
            key: 'unit_price',
            title: 'Unit price',
            render: (value: string) => (
                <div>
                    <p className="font-medium text-gray-600">{value}</p>
                </div>
            ),
        },
        {
            key: 'subtotal',
            title: 'subtotal',
            render: (value: string) => (
                <div>
                    <p className="font-medium text-gray-600">{value}</p>
                </div>
            ),
        }
    ]

    return (
        <div className="space-y-6">
            {/* Header */}
            {/* <div className={"flex items-center justify-between"}>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
                    <p className="text-gray-600">Manage your orders</p>
                </div>
                <Button>Export Report</Button>
            </div> */}

            {/* Orders Table */}
            <Card>
                <Table
                    data={orderDetails || []}
                    columns={columns}
                    loading={isLoading}
                    emptyMessage="No orders found"
                />
            </Card>
        </div>
    );
}

export default OrderDetails;