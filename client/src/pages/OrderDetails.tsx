import React, { useState } from "react";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import Table from "../components/ui/Table";
import { Order, OrderDetail } from "../types";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router-dom";

const OrderDetails: React.FC = () => {
  // Function GET OrderDetails
  const { id } = useParams();
  // const getOrderDetails = () => getApi<OrderDetail[]>(`http://localhost:3000/api/orders/orderDetails/${id}`);

  // Lấy dữ liệu từ ClientQuery
  // const { data: orderDetails, isLoading, error } = useQuery({
  //     queryKey: ['orderDetails'],
  //     queryFn: getOrderDetails,
  // });

  // Định nghĩa giao diện bảng OrderDetails
  const columns = [
    {
      key: "id",
      title: "Order detail ID",
      render: (value: string) => (
        <span className="font-mono text-sm text-primary-600">#{value}</span>
      ),
    },
    {
      key: "product_name",
      title: "Product name",
      render: (value: string) => (
        <span className="font-mono text-sm text-primary-600">{value}</span>
      ),
    },
    {
      key: "quantity",
      title: "Quantity ID",
      render: (value: number) => (
        <div>
          <p className="font-medium text-gray-600">{value}</p>
        </div>
      ),
    },
    {
      key: "price",
      title: "Price",
      render: (value: string) => (
        <div>
          <p className="font-medium text-gray-600">{value}</p>
        </div>
      ),
    },
    {
      key: "actions",
      title: "Actions",
      render: (value: any, item: OrderDetail) => (
        <div className="flex items-center space-x-2">
          <Button
            size="sm"
            variant="outline"
            // onClick={() => handleViewOrder(item)}
          >
            View
          </Button>
        </div>
      ),
    },
  ];

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
      {/* <Card>
                <Table
                    data={orderDetails || []}
                    columns={columns}
                    loading={isLoading}
                    emptyMessage="No orders found"
                />
            </Card> */}
    </div>
  );
};

export default OrderDetails;
