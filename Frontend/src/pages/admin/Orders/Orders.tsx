import React, { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate, useSearchParams } from "react-router-dom";
import { formatDate, getApi } from "../../../utils";
import { Order } from "../../../types";
import Button from "../../../components/ui/form/Button";
import Card from "../../../components/ui/data-display/Card";
import Table from "../../../components/ui/data-display/Table";

const Orders: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const currentBranchId = searchParams.get("branch_id");
  useEffect(() => {
    if (!currentBranchId) {
      navigate("/admin/orders?branch_id=1", { replace: true });
    }
  }, [currentBranchId, navigate]);

  const handleBranchChange = (id: string) => {
    setSearchParams({ branch_id: id });
  };
  // Function GET Orders
  const getOrders = async () =>
    await getApi(`${process.env.REACT_APP_API_URL}/api/orders`, {
      branch_id: currentBranchId,
    });

  const {
    data: apiResponse,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["orders", currentBranchId],
    queryFn: getOrders,
    enabled: !!currentBranchId,
  });

  const orders = apiResponse?.data.items ?? [];
  // console.log('Orders: ', orders);

  // Màu tùy chỉnh cho trạng thái Order
  const getStatusColor = (status: Order["status"]) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "confirmed":
        return "bg-indigo-100 text-indigo-800";
      case "processing":
        return "bg-blue-100 text-blue-800";
      case "shipped":
        return "bg-purple-100 text-purple-800";
      case "delivered":
        return "bg-green-100 text-green-800";
      case "canceled":
        return "bg-red-100 text-red-800";
      case "failed":
        return "bg-pink-100 text-pink-800";
      case "refunded":
        return "bg-teal-100 text-teal-800";
      case "completed":
        return "bg-lime-100 text-lime-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Định nghĩa giao diện bảng Orders
  const columns = [
    {
      key: "id",
      title: "Mã đơn hàng",
      render: (value: string, item: Order) => (
        <div>
          <p className="font-mono text-sm text-primary-600">#{value}</p>
          <p className="font-mono text-sm text-primary-600">{`Mã code: ${item.order_code}`}</p>
        </div>
      ),
    },
    {
      key: "username",
      title: "Tên khách hàng",
      render: (value: string) => (
        <div>
          <p className="font-medium text-gray-600">{value}</p>
        </div>
      ),
    },
    {
      key: "branch_name",
      title: "Chi nhánh",
      render: (value: string, item: Order) => (
        <div>
          <p className="font-medium text-gray-600">{value}</p>
        </div>
      ),
    },
    {
      key: "created_at",
      title: "Ngày đặt hàng",
      render: (value: any) => (
        <div>
          <p className="font-medium text-gray-600">
            <span className="font-medium text-blue-600">
              {formatDate(value)}
            </span>
          </p>
        </div>
      ),
    },
    {
      key: "status",
      title: "Trạng thái",
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
      title: "Hành động",
      render: (value: any, item: Order) => (
        <div className="flex items-center space-x-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() =>
              navigate(
                `/admin/orders/${item.id}/products?branch_id=${currentBranchId}`
              )
            }
          >
            Xem
          </Button>
        </div>
      ),
    },
  ];
  const branchOptions = [
    { id: "1", name: "Chi nhánh 1" },
    { id: "2", name: "Chi nhánh 2" },
    { id: "3", name: "Chi nhánh 3" },
  ];
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className={"flex items-center justify-between"}>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Đơn hàng</h1>
          <p className="text-gray-600">Quản lý đơn hàng của bạn</p>
          <div className="space-x-2">
            {branchOptions.map((branch) => (
              <Button
                key={branch.id}
                className={"mt-2"}
                onClick={() => handleBranchChange(branch.id)}
              >
                {branch.name}
              </Button>
            ))}
          </div>
        </div>
        <div className="space-x-2">
          <Button onClick={() => navigate(`/admin/orders/create`)}>
            Tạo mới
          </Button>
          <Button onClick={() => navigate(`/admin/orders/statistics`)}>
            Thống kê
          </Button>
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
};

export default Orders;
