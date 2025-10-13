import React, { useState } from "react";
import { User } from "../types";
import { useQuery } from "@tanstack/react-query";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import Table from "../components/ui/Table";
import { api } from "../services/api";

const Users: React.FC = () => {
  // Lấy dữ liệu từ ClientQuery
  const {
    data: users,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["Users"],
    queryFn: api.getUsers,
  });

  //
  const [sortedKey, setSortedKey] = useState<string | undefined>();
  const [sortedOrder, setSortedOrder] = useState<"asc" | "desc">("asc");

  // Màu tùy chỉnh cho trạng thái Order
  const getStatusColor = (status: User["status"]) => {
    switch (status) {
      case "active":
        return "bg-yellow-100 text-yellow-800";
      case "inactive":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Định nghĩa giao diện bảng Users
  const columns = [
    {
      key: "id",
      title: "User ID",
      sortable: true,
      sortAccessor: (item: User) => item.id,
      render: (value: string) => (
        <span className="font-mono text-sm text-primary-600">#{value}</span>
      ),
    },
    {
      key: "customer_code",
      title: "Code",
      render: (value: string) => (
        <span className="font-mono text-sm text-primary-600">{value}</span>
      ),
    },
    {
      key: "full_name",
      title: "User name",
      sortable: true,
      sortAccessor: (item: User) => item.full_name,
      render: (value: string) => (
        <div>
          <p className="font-medium text-gray-600">{value}</p>
        </div>
      ),
    },
    {
      key: "contact_info",
      title: "Contact information",
      render: (value: string, item: User) => (
        <div>
          <p className="font-medium text-gray-600">{item.email}</p>
          <p className="font-mono text-primary-600">{item.phone}</p>
        </div>
      ),
    },
    {
      key: "status",
      title: "Status",
      render: (value: User["status"]) => (
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
      render: (value: any, item: User) => (
        <div className="flex items-center space-x-2">
          <Button
            size="sm"
            variant="outline"
            // onClick={() => handleOpenOrderModal(item)}
          >
            Modify
          </Button>
          <Button
            size="sm"
            variant="outline"
            // onClick={() => goToOrderDetails(item.id)}
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
          <h1 className="text-2xl font-bold text-gray-900">Users</h1>
          <p className="text-gray-600">Manage your users</p>
        </div>
        <Button>Export Report</Button>
      </div>

      {/* Users Table */}
      <Card>
        <Table
          data={users || []}
          columns={columns}
          loading={isLoading}
          emptyMessage="No users found"
        />
      </Card>
    </div>
  );
};

export default Users;
