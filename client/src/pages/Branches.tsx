import React, { useState } from "react";
import Button from "../components/ui/Button";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Table from "../components/ui/Table";
import Card from "../components/ui/Card";
import { Branch } from "../types";
import { api } from "../services/api";
import { handleToast } from "../hooks/toast";
import Modal from "../components/ui/Modal";
import Input from "../components/ui/Input";

const Branches: React.FC = () => {
  const { data: branches, isLoading } = useQuery({
    queryKey: ["branches"],
    queryFn: api.getBranches,
  });

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [sort, setSort] = useState<{
    key: string;
    order: "asc" | "desc";
  } | null>(null);

  const handlePageSizeChange = (newSize: number) => {
    setPageSize(newSize);
    setPage(1);
  };

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBranch, setEditingBranch] = useState<Branch | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    street: "",
    ward: "",
    district: "",
    city: "",
    country: "",
    zipcode: "",
    email: "",
    phone: "",
  });

  const queryClient = useQueryClient();

  const createBranchMutation = useMutation({
    mutationFn: api.createBranch,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["branches"] });
      handleToast("success", "Branch created successfully");
      setIsModalOpen(false);
      resetForm();
    },
    onError: (error: any) => {
      handleToast(
        "error",
        `${error.response?.data?.error || "Failed to create branch"}`
      );
      console.error(error);
    },
  });

  const updateBranchMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<Branch> }) =>
      api.updateBranch(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["branches"] });
      handleToast("success", "Branch updated successfully");
      setIsModalOpen(false);
      resetForm();
    },
    onError: (error: any) => {
      handleToast(
        "error",
        `${error.response?.data?.error || "Failed to update branch"}`
      );
      console.error(error);
    },
  });

  const deleteBranchMutation = useMutation({
    mutationFn: api.deleteBranch,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["branches"] });
      handleToast("success", "Branch deleted successfully");
    },
  });

  const resetForm = () => {
    setFormData({
      name: "",
      street: "",
      ward: "",
      district: "",
      city: "",
      country: "",
      zipcode: "",
      email: "",
      phone: "",
    });
    setEditingBranch(null);
  };

  const handleEdit = (branch: Branch) => {
    setEditingBranch(branch);
    setFormData({
      name: branch.name,
      street: branch.street,
      ward: branch.ward,
      district: branch.district,
      city: branch.city,
      country: branch.country,
      zipcode: branch.zipcode,
      email: branch.email,
      phone: branch.phone,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const branchData = {
      name: formData.name,
      street: formData.street,
      ward: formData.ward,
      district: formData.district,
      city: formData.city,
      country: formData.country,
      zipcode: formData.zipcode,
      email: formData.email,
      phone: formData.phone,
    };

    if (editingBranch) {
      updateBranchMutation.mutate({
        id: editingBranch.id,
        updates: branchData,
      });
    } else {
      createBranchMutation.mutate(branchData);
    }
  };

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
      key: "contact_info",
      title: "Contact information",
      render: (value: string, item: Branch) => (
        <div>
          <p className="font-medium text-gray-600">{item.email}</p>
          <p className="font-mono text-primary-600">{item.phone}</p>
        </div>
      ),
    },
    {
      key: "address",
      title: "Address",
      render: (value: string, item: Branch) => (
        <div>
          <p className="font-medium text-gray-600">
            {item.street}, {item.ward}, {item.district}, {item.city},{" "}
            {item.country}, {item.zipcode}
          </p>
        </div>
      ),
    },
    {
      key: "actions",
      title: "Actions",
      render: (value: any, item: Branch) => (
        <div className="flex items-center space-x-2">
          <Button size="sm" variant="outline" onClick={() => handleEdit(item)}>
            Edit
          </Button>
          <Button
            size="sm"
            variant="danger"
            onClick={() => deleteBranchMutation.mutate(item.id)}
            isLoading={deleteBranchMutation.isPending}
          >
            Delete
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
        <div className="space-x-2">
          <Button onClick={() => setIsModalOpen(true)}>Add Branch</Button>
          <Button>Export Report</Button>
        </div>
      </div>

      {/* Branches Table */}
      <Card>
        <Table
          data={branches?.data || []}
          columns={columns}
          loading={isLoading}
          emptyMessage="No branches found"
        />
      </Card>

      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          resetForm();
        }}
        title={editingBranch ? "Edit Branch" : "Add New Branch"}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-2">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
            <Input
              label="Branch Name"
              type="text"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
            />
            <Input
              label="Email"
              type="email"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
            />
            <Input
              label="Phone"
              type="text"
              value={formData.phone}
              onChange={(e) =>
                setFormData({ ...formData, phone: e.target.value })
              }
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            <Input
              label="Street"
              type="text"
              value={formData.street}
              onChange={(e) =>
                setFormData({ ...formData, street: e.target.value })
              }
            />
            <Input
              label="Ward"
              type="text"
              value={formData.ward}
              onChange={(e) =>
                setFormData({ ...formData, ward: e.target.value })
              }
            />
            <Input
              label="District"
              type="text"
              value={formData.district}
              onChange={(e) =>
                setFormData({ ...formData, district: e.target.value })
              }
            />
            <Input
              label="City"
              type="text"
              value={formData.city}
              onChange={(e) =>
                setFormData({ ...formData, city: e.target.value })
              }
            />
            <Input
              label="Country"
              type="text"
              value={formData.country}
              onChange={(e) =>
                setFormData({ ...formData, country: e.target.value })
              }
            />
            <Input
              label="Zipcode"
              type="text"
              value={formData.zipcode}
              onChange={(e) =>
                setFormData({ ...formData, zipcode: e.target.value })
              }
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setIsModalOpen(false);
                resetForm();
              }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              isLoading={
                createBranchMutation.isPending || updateBranchMutation.isPending
              }
            >
              {editingBranch ? "Update Branch" : "Add Branch"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Branches;
