import React, { useState } from "react";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import Table from "../components/ui/Table";
import { Product } from "../types";
import { useQuery } from "@tanstack/react-query";
import { api } from "../services/api";

const Products: React.FC = () => {
  // Lấy dữ liệu từ ClientQuery
  const {
    data: products,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["Products"],
    queryFn: api.getProducts,
  });

  // Định nghĩa giao diện bảng Products
  const columns = [
    {
      key: "id",
      title: "User ID",
      render: (value: string) => (
        <span className="font-mono text-sm text-primary-600">#{value}</span>
      ),
    },
    {
      key: "avatar",
      title: "Avatar",
      render: (value: string, item: Product) => (
        <div className="flex items-center">
          {item.avatar ? (
            <img
              src={item.avatar}
              alt={item.name}
              className="w-10 h-10 rounded-full"
            />
          ) : (
            <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
              <span className="text-sm font-medium text-primary-700">
                {item.name.charAt(0)}
              </span>
            </div>
          )}
        </div>
      ),
    },
    {
      key: "sku",
      title: "SKU",
      render: (value: string) => (
        <span className="font-mono text-sm text-primary-600">{value}</span>
      ),
    },
    {
      key: "name",
      title: "Product name",
      render: (value: string) => (
        <div>
          <p className="font-medium text-gray-600">{value}</p>
        </div>
      ),
    },
    {
      key: "unit_of_measure",
      title: "Unit of measure",
      render: (value: string) => (
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
      render: (value: any, item: Product) => (
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
          <h1 className="text-2xl font-bold text-gray-900">Products</h1>
          <p className="text-gray-600">Manage your products</p>
        </div>
        <Button>Export Report</Button>
      </div>

      {/* Products Table */}
      <Card>
        <Table
          data={products?.data || []}
          columns={columns}
          loading={isLoading}
          emptyMessage="No products found"
        />
      </Card>
    </div>
  );
};

export default Products;
