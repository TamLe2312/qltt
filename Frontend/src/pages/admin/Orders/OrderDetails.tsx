import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useParams, useNavigate } from 'react-router-dom';
import { getApi, formatDate } from '../../../utils';
import { OrderDetail } from '../../../types';
import Button from '../../../components/ui/form/Button';
import Card from '../../../components/ui/data-display/Card';
import Table from '../../../components/ui/data-display/Table';
import DropdownSelect from '../../../components/ui/form/DropdownSelect';

interface OrderWithRelations {
    id: string;
    order_code: string;
    user_id: string;
    branch_id: string;
    status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
    total_amount: string;
    created_at: string;
    updated_at: string | null;
    user_name: string;
    branch_name: string;
    note?: string;
}

const OrderDetails: React.FC = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [status, setStatus] = useState<string>('');

    // === Fetch chi tiết đơn hàng ===
    const getOrder = async () => getApi(`${process.env.REACT_APP_API_URL}/api/orders/${id}`);
    const { data: orderResponse, isLoading: isOrderLoading } = useQuery({
        queryKey: ['order', id],
        queryFn: getOrder,
    });
    const order: OrderWithRelations | null = orderResponse?.data ?? null;

    // === Fetch chi tiết sản phẩm ===
    const getOrderDetails = async () => getApi(`${process.env.REACT_APP_API_URL}/api/orders/${id}/products`);
    const { data: detailsResponse, isLoading: isDetailsLoading } = useQuery({
        queryKey: ['orderDetails', id],
        queryFn: getOrderDetails,
    });
    const orderDetails: OrderDetail[] = detailsResponse?.data.items ?? [];

    // === Màu trạng thái ===
    const getStatusColor = (status: OrderWithRelations['status']) => {
        switch (status) {
            case 'pending': return 'bg-yellow-100 text-yellow-800';
            case 'processing': return 'bg-blue-100 text-blue-800';
            case 'shipped': return 'bg-purple-100 text-purple-800';
            case 'delivered': return 'bg-green-100 text-green-800';
            case 'cancelled': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const columns = [
        { key: 'product_id', title: 'Product ID', render: (v: string) => <span className="font-mono text-sm text-primary-600">#{v}</span> },
        { key: 'product_name', title: 'Product name', render: (v: string) => <span className="font-medium text-gray-700">{v}</span> },
        { key: 'quantity', title: 'Quantity', render: (v: number) => <span className="font-medium text-gray-700">{v}</span> },
        { key: 'unit_price', title: 'Unit price', render: (v: number) => <span className="font-medium text-gray-700">{v}</span> },
        { key: 'subtotal', title: 'Subtotal', render: (v: number) => <span className="font-medium text-gray-700">{v}</span> },
    ];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-2">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Chi tiết đơn hàng</h1>
                    <p className="text-gray-600">Thông tin chi tiết đơn hàng #{id}</p>
                </div>
                <Button variant="outline" onClick={() => navigate('/admin/orders')}>
                    Quay lại
                </Button>
            </div>

            {/* Thông tin chính */}
            {order && (
                <Card className="p-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
                        <div>
                            <p className="text-sm text-gray-500">Mã đơn hàng</p>
                            <p className="font-mono text-primary-600 font-medium">{order.id}</p>
                            <p className="font-mono text-sm text-gray-600">Code: {order.order_code}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Khách hàng</p>
                            <p className="font-medium text-gray-700">{order.user_name}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Chi nhánh</p>
                            <p className="font-medium text-gray-700">{order.branch_name}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Ngày đặt</p>
                            <p className="font-medium text-blue-600">{formatDate(order.created_at)}</p>
                        </div>

                        <div>
                            <p className="text-sm text-gray-500">Tổng tiền</p>
                            <p className="font-medium text-gray-700">{Number(order.total_amount).toLocaleString()} VNĐ</p>
                        </div>

                        <div className="sm:col-span-2 md:col-span-1">
                            <p className="text-sm text-gray-500 mb-1">Trạng thái</p>
                            <DropdownSelect
                                value={status !== '' ? status : order?.status ?? 'pending'}
                                onChange={(val) => setStatus(String(val))}
                                placeholder="Chọn trạng thái"
                                data={[
                                    { value: 'pending', label: 'Pending' },
                                    { value: 'processing', label: 'Processing' },
                                    { value: 'shipped', label: 'Shipped' },
                                    { value: 'delivered', label: 'Delivered' },
                                    { value: 'cancelled', label: 'Cancelled' },
                                ]}
                                labelKey="label" 
                                valueKey="value" 
                            />

                        </div>

                        {order.note && (
                            <div className="md:col-span-4">
                                <p className="text-sm text-gray-500">Ghi chú</p>
                                <p className="font-medium text-gray-700">{order.note}</p>
                            </div>
                        )}
                    </div>
                </Card>
            )}

            {/* Danh sách sản phẩm */}
            <Card>
                <Table
                    data={orderDetails}
                    columns={columns}
                    loading={isDetailsLoading || isOrderLoading}
                    emptyMessage="Không tìm thấy sản phẩm nào"
                />
            </Card>
        </div>
    );
};

export default OrderDetails;
