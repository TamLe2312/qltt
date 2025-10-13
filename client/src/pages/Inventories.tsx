import React, { useState } from "react";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import Table from "../components/ui/Table";
import { Inventory } from "../types";
import { useQuery } from "@tanstack/react-query";
import { api } from "../services/api";

const Inventories: React.FC = () => {
  // Lấy dữ liệu từ ClientQuery
  const {
    data: inventories,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["Inventories"],
    queryFn: api.getInventories,
  });

  // Định nghĩa giao diện bảng Orders
  const columns = [
    {
      key: "id",
      title: "Inventory ID",
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
      key: "sku",
      title: "SKU",
      render: (value: string) => (
        <div>
          <p className="font-medium text-gray-600">{value}</p>
        </div>
      ),
    },
    {
      key: "branch_name",
      title: "Branch name",
      render: (value: string) => (
        <div>
          <p className="font-medium text-gray-600">{value}</p>
        </div>
      ),
    },
    {
      key: "quantity",
      title: "Quantity",
      render: (value: number) => (
        <div>
          <p className="font-medium text-gray-600">{value}</p>
        </div>
      ),
    },
    {
      key: "actions",
      title: "Actions",
      render: (value: any, item: Inventory) => (
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
      <div className={"flex items-center justify-between"}>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Inventories</h1>
          <p className="text-gray-600">Manage your inventories</p>
        </div>
        <Button>Export Report</Button>
      </div>

      {/* Orders Table */}
      <Card>
        <Table
          data={inventories || []}
          columns={columns}
          loading={isLoading}
          emptyMessage="No orders found"
        />
      </Card>
    </div>
  );
};

export default Inventories;
