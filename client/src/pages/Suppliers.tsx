import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../services/api";
import { Supplier } from "../types";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import Table from "../components/ui/Table";
import Modal from "../components/ui/Modal";
import Input from "../components/ui/Input";
import { handleToast } from "../hooks/toast";

const Suppliers: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [formData, setFormData] = useState({
    street: "",
    ward: "",
    district: "",
    city: "",
    country: "",
    zipcode: "",
    email: "",
    phone: "",
    name: "",
  });

  const queryClient = useQueryClient();

  const { data: suppliers, isLoading } = useQuery({
    queryKey: ["suppliers"],
    queryFn: api.getSuppliers,
  });

  const createSupplierMutation = useMutation({
    mutationFn: api.createSupplier,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["suppliers"] });
      handleToast("success", "Supplier created successfully");
      setIsModalOpen(false);
      resetForm();
    },
  });

  const updateSupplierMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<Supplier> }) =>
      api.updateSupplier(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["suppliers"] });
      setIsModalOpen(false);
      resetForm();
    },
  });

  const deleteSupplierMutation = useMutation({
    mutationFn: api.deleteSupplier,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["suppliers"] });
      handleToast("success", "Supplier deleted successfully");
    },
  });

  const resetForm = () => {
    setFormData({
      street: "",
      ward: "",
      district: "",
      city: "",
      country: "",
      zipcode: "",
      email: "",
      phone: "",
      name: "",
    });
    setEditingSupplier(null);
  };

  const handleEdit = (supplier: Supplier) => {
    setEditingSupplier(supplier);
    setFormData({
      name: supplier.name,
      email: supplier.email,
      phone: supplier.phone,
      street: supplier.street,
      ward: supplier.ward,
      district: supplier.district,
      city: supplier.city,
      country: supplier.country,
      zipcode: supplier.zipcode,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const supplierData = {
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      street: formData.street,
      ward: formData.ward,
      district: formData.district,
      city: formData.city,
      country: formData.country,
      zipcode: formData.zipcode,
    };

    if (editingSupplier) {
      updateSupplierMutation.mutate({
        id: editingSupplier.id,
        updates: supplierData,
      });
    } else {
      createSupplierMutation.mutate(supplierData);
    }
  };

  const columns = [
    {
      key: "name",
      title: "Name",
      render: (value: string, item: Supplier) => (
        <div>
          <p className="font-medium text-gray-900">{value}</p>
          <p className="text-sm text-gray-500">{item.name}</p>
        </div>
      ),
    },
    {
      key: "email",
      title: "Email",
      render: (value: string) => (
        <p className="text-sm text-gray-500">{value}</p>
      ),
    },
    {
      key: "phone",
      title: "Phone",
      render: (value: string) => (
        <p className="text-sm text-gray-500">{value}</p>
      ),
    },
    {
      key: "actions",
      title: "Actions",
      render: (value: any, item: Supplier) => (
        <div className="flex items-center space-x-2">
          <Button size="sm" variant="outline" onClick={() => handleEdit(item)}>
            Edit
          </Button>
          <Button
            size="sm"
            variant="danger"
            onClick={() => deleteSupplierMutation.mutate(item.id)}
            isLoading={deleteSupplierMutation.isPending}
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Suppliers</h1>
          <p className="text-gray-600">Manage your supplier</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)}>Add Supplier</Button>
      </div>

      {/* Suppliers Table */}
      <Card>
        <Table
          data={suppliers || []}
          columns={columns}
          loading={isLoading}
          emptyMessage="No suppliers found"
        />
      </Card>

      {/* Add/Edit Supplier Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          resetForm();
        }}
        title={editingSupplier ? "Edit Supplier" : "Add New Supplier"}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Supplier Name"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              required
            />
            <Input
              label="Email"
              type="email"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              required
            />
            <Input
              label="Phone"
              value={formData.phone}
              onChange={(e) =>
                setFormData({ ...formData, phone: e.target.value })
              }
              required
            />
            <Input
              label="Street"
              value={formData.street}
              onChange={(e) =>
                setFormData({ ...formData, street: e.target.value })
              }
              required
            />
            <Input
              label="Ward"
              value={formData.ward}
              onChange={(e) =>
                setFormData({ ...formData, ward: e.target.value })
              }
              required
            />
            <Input
              label="District"
              value={formData.district}
              onChange={(e) =>
                setFormData({ ...formData, district: e.target.value })
              }
              required
            />
            <Input
              label="City"
              value={formData.city}
              onChange={(e) =>
                setFormData({ ...formData, city: e.target.value })
              }
              required
            />
            <Input
              label="Country"
              value={formData.country}
              onChange={(e) =>
                setFormData({ ...formData, country: e.target.value })
              }
              required
            />
            <Input
              label="Zipcode"
              value={formData.zipcode}
              onChange={(e) =>
                setFormData({ ...formData, zipcode: e.target.value })
              }
              required
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
                createSupplierMutation.isPending ||
                updateSupplierMutation.isPending
              }
            >
              {editingSupplier ? "Update Supplier" : "Add Supplier"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Suppliers;
