import React, { useState } from "react";
import Button from "../components/ui/Button";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Table from "../components/ui/Table";
import Card from "../components/ui/Card";
import { Branch } from "../types";
import { useNavigate } from "react-router-dom";
import { api } from "../services/api";

const Branches: React.FC = () => {
  // Lấy dữ liệu từ ClientQuery
  const {
    data: branches,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["branches"],
    queryFn: api.getBranches,
  });

  // Điều hướng
  const navigate = useNavigate();
  const goToBranchCreate = () => {
    navigate(`/admin/branch-create`);
  };

  // Định nghĩa giao diện bảng Branches
  const columns = [
    {
      key: "id",
      title: "Branch ID",
      render: (value: string) => (
        <span className="font-mono text-sm text-primary-600">#{value}</span>
      ),
    },
    {
      key: "name",
      title: "name",
      render: (value: string) => (
        <div>
          <p className="font-medium text-gray-600">{value}</p>
        </div>
      ),
    },
    {
      key: "shipping_address",
      title: "Shipping address",
      render: (value: any, item: Branch) => (
        <div>
          <p className="font-medium text-gray-600">
            {item.street}, {item.ward}, {item.district}
          </p>
          <p className="font-medium text-gray-600">
            {item.city}, {item.zipcode}
          </p>
        </div>
      ),
    },
    {
      key: "contact",
      title: "Contact",
      render: (value: any, item: Branch) => (
        <div>
          <p className="font-medium text-gray-600">{item.phone}</p>
          <p className="font-medium text-gray-600">{item.email}</p>
        </div>
      ),
    },
    {
      key: "actions",
      title: "Actions",
      render: (value: any, item: Branch) => (
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
          <h1 className="text-2xl font-bold text-gray-900">Branches</h1>
          <p className="text-gray-600">Manage your branch</p>
        </div>
        <Button onClick={() => goToBranchCreate()}>New</Button>
      </div>

      {/* Branches Table */}
      <Card>
        <Table
          data={branches || []}
          columns={columns}
          loading={isLoading}
          emptyMessage="No branches found"
        />
      </Card>
    </div>
  );
};

export default Branches;
