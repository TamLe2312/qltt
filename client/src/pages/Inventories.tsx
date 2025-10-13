import React, { useState } from "react";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import Table from "../components/ui/Table";
import { Inventory } from "../types";
import { api } from "../services/api";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { handleToast } from "../hooks/toast";
import Modal from "../components/ui/Modal";
import Input from "../components/ui/Input";
import Select from "../components/ui/Select";

const Inventories: React.FC = () => {
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

  const { data: inventories, isLoading } = useQuery({
    queryKey: ["inventories", page, pageSize, sort],
    queryFn: () =>
      api.getInventories({
        page,
        limit: pageSize,
        sortBy: sort?.key,
        sortOrder: sort?.order,
      }),
  });

  const { data: productsData, isLoading: isProductsLoading } = useQuery({
    queryKey: ["products"],
    queryFn: api.getProducts,
  });
  const { data: branchesData, isLoading: isBranchesLoading } = useQuery({
    queryKey: ["branches"],
    queryFn: api.getBranches,
  });
  const { data: suppliersData, isLoading: isSuppliersLoading } = useQuery({
    queryKey: ["suppliers"],
    queryFn: api.getSuppliers,
  });

  const isDropdownDataLoading =
    isProductsLoading || isBranchesLoading || isSuppliersLoading;

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingInventory, setEditingInventory] = useState<Inventory | null>(
    null
  );
  const [formData, setFormData] = useState({
    product_id: "",
    sku: "",
    branch_id: "",
    quantity: 0,
    reserved_stock: 0,
    supplier_id: "",
  });

  const queryClient = useQueryClient();

  const createInventoryMutation = useMutation({
    mutationFn: api.createInventory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inventories"] });
      handleToast("success", "Inventory created successfully");
      setIsModalOpen(false);
      resetForm();
    },
    onError: (error: any) => {
      handleToast(
        "error",
        `${error.response?.data?.error || "Failed to create inventory"}`
      );
      console.error(error);
    },
  });

  const updateInventoryMutation = useMutation({
    mutationFn: ({
      id,
      updates,
    }: {
      id: string;
      updates: Partial<Inventory>;
    }) => api.updateInventory(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inventories"] });
      handleToast("success", "Inventory updated successfully");
      setIsModalOpen(false);
      resetForm();
    },
    onError: (error: any) => {
      handleToast(
        "error",
        `${error.response?.data?.error || "Failed to update supplier"}`
      );
      console.error(error);
    },
  });

  const deleteInventoryMutation = useMutation({
    mutationFn: api.deleteInventory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inventories"] });
      handleToast("success", "Inventory deleted successfully");
    },
  });

  const resetForm = () => {
    setFormData({
      product_id: "",
      sku: "",
      branch_id: "",
      quantity: 0,
      reserved_stock: 0,
      supplier_id: "",
    });
    setEditingInventory(null);
  };

  const handleEdit = (inventory: Inventory) => {
    setEditingInventory(inventory);
    setFormData({
      product_id: inventory.product_id,
      sku: inventory.sku,
      branch_id: inventory.branch_id,
      quantity: inventory.quantity,
      reserved_stock: inventory.reserved_stock,
      supplier_id: inventory.supplier_id,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const supplierData = {
      product_id: formData.product_id,
      branch_id: formData.branch_id,
      quantity: formData.quantity,
      reserved_stock: formData.reserved_stock,
      supplier_id: formData.supplier_id,
    };

    if (editingInventory) {
      updateInventoryMutation.mutate({
        id: editingInventory.id,
        updates: supplierData,
      });
    } else {
      createInventoryMutation.mutate(supplierData);
    }
  };

  const productOptions = React.useMemo(
    () =>
      productsData?.data?.map((p: any) => ({ value: p.id, label: p.name })) ||
      [],
    [productsData]
  );
  const branchOptions = React.useMemo(
    () =>
      branchesData?.data?.map((b: any) => ({ value: b.id, label: b.name })) ||
      [],
    [branchesData]
  );

  const supplierOptions = React.useMemo(
    () =>
      suppliersData?.data?.map((s: any) => ({ value: s.id, label: s.name })) ||
      [],
    [suppliersData]
  );

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
      key: "supplier_name",
      title: "Supplier name",
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
      key: "reserved_stock",
      title: "Reserved Stock",
      render: (value: number) => (
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
      key: "actions",
      title: "Actions",
      render: (value: any, item: Inventory) => (
        <div className="flex items-center space-x-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleEdit(item)}
            disabled={isDropdownDataLoading}
          >
            Edit
          </Button>
          <Button
            size="sm"
            variant="danger"
            onClick={() => deleteInventoryMutation.mutate(item.id)}
            isLoading={deleteInventoryMutation.isPending}
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
          <h1 className="text-2xl font-bold text-gray-900">Inventories</h1>
          <p className="text-gray-600">Manage your inventories</p>
        </div>
        <div className="space-x-2">
          <Button onClick={() => setIsModalOpen(true)}>Add Inventory</Button>
          <Button>Export Report</Button>
        </div>
      </div>

      {/* Orders Table */}
      <Card>
        <Table
          data={inventories?.data?.data || []}
          columns={columns}
          loading={isLoading}
          emptyMessage="No orders found"
          total={inventories?.data?.total || 0}
          page={page}
          pageSize={pageSize}
          onPageChange={(newPage: number) => setPage(newPage)}
          handlePageSizeChange={handlePageSizeChange}
          onSortChange={(key: string, order: "asc" | "desc") => {
            setSort({ key, order });
            setPage(1);
          }}
        />
      </Card>

      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          resetForm();
        }}
        title={editingInventory ? "Edit Inventory" : "Add New Inventory"}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select
              label="Product Name"
              value={formData.product_id}
              onChange={(e) => {
                setFormData({ ...formData, product_id: e.target.value });
              }}
              options={productOptions}
            />
            <Select
              label="Branch Name"
              value={formData.branch_id}
              onChange={(e) =>
                setFormData({ ...formData, branch_id: e.target.value })
              }
              options={branchOptions}
            />
            <Input
              label="Quantity"
              type="number"
              value={formData.quantity}
              onChange={(e) =>
                setFormData({ ...formData, quantity: Number(e.target.value) })
              }
            />
            <Select
              label="Supplier Name"
              value={formData.supplier_id}
              onChange={(e) =>
                setFormData({ ...formData, supplier_id: e.target.value })
              }
              options={supplierOptions}
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
                createInventoryMutation.isPending ||
                updateInventoryMutation.isPending
              }
            >
              {editingInventory ? "Update Inventory" : "Add Inventory"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Inventories;
