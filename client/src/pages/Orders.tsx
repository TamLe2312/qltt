import React, { useState } from "react";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import Table from "../components/ui/Table";
import { Order } from "../types";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import Modal from "../components/ui/Modal";
import { useForm } from "react-hook-form";
import * as Yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { api } from "../services/api";

const Orders: React.FC = () => {
  // State quản lý Modal
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  // Điều hướng
  const navigate = useNavigate();
  const goToOrderDetails = (order_id: string) => {
    navigate(`/orders/orderDetails/${order_id}`);
  };

  // Lấy dữ liệu từ ClientQuery
  const {
    data: orders,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["Orders"],
    queryFn: api.getOrders,
  });

  // Màu tùy chỉnh cho trạng thái Order
  const getStatusColor = (status: Order["status"]) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "processing":
        return "bg-blue-100 text-blue-800";
      case "shipped":
        return "bg-purple-100 text-purple-800";
      case "delivered":
        return "bg-green-100 text-green-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Định nghĩa giao diện bảng Orders
  const columns = [
    {
      key: "id",
      title: "Order ID",
      render: (value: string, item: Order) => (
        <div>
          <p className="font-mono text-sm text-primary-600">#{value}</p>
          <p className="font-mono text-sm text-primary-600">{`Code: ${item.order_code}`}</p>
        </div>
      ),
    },
    {
      key: "user_name",
      title: "User name",
      render: (value: string) => (
        <div>
          <p className="font-medium text-gray-600">{value}</p>
        </div>
      ),
    },
    {
      key: "branch_name",
      title: "Branch",
      render: (value: string) => (
        <div>
          <p className="font-medium text-gray-600">{value}</p>
        </div>
      ),
    },
    {
      key: "shipping_address",
      title: "Shipping address",
      render: (value: any, item: Order) => (
        <div>
          <p className="font-medium text-gray-600">
            {item.shipping_street}, {item.shipping_ward},{" "}
            {item.shipping_district}
          </p>
          <p className="font-medium text-gray-600">
            {item.shipping_city}, {item.shipping_zipcode}
          </p>
        </div>
      ),
    },
    {
      key: "status",
      title: "Status",
      render: (value: Order["status"]) => (
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
            value
          )}`}
        >
          {value.charAt(0).toUpperCase() + value.slice(1)}
        </span>
      ),
    },
    {
      key: "actions",
      title: "Actions",
      render: (value: any, item: Order) => (
        <div className="flex items-center space-x-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => goToOrderDetails(item.id)}
          >
            Details
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className={"flex items-center justify-between"}>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
          <p className="text-gray-600">Manage your orders</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)}>New</Button>
      </div>

      {/* Orders Table */}
      <Card>
        <Table
          data={orders?.data || []}
          columns={columns}
          loading={isLoading}
          emptyMessage="No orders found"
        />
      </Card>

      {/* Orders Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
        }}
        title={"Add new order"}
        size="lg"
      >
        <div>Modal</div>
      </Modal>
    </div>
  );
};

export default Orders;
