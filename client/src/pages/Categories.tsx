import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import { api } from "../services/api";
import Table from "../components/ui/Table";
import Modal from "../components/ui/Modal";
import React, { useState } from "react";
import { Category } from "../types";
import { handleToast } from "../hooks/toast";
import Input from "../components/ui/Input";
import Select from "../components/ui/Select";

const Categories: React.FC = () => {
  const { data: categories, isLoading } = useQuery({
    queryKey: ["categories"],
    queryFn: api.getCategories,
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
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    parent_id: "",
    parent_name: "",
  });

  const queryClient = useQueryClient();

  const createCategoryMutation = useMutation({
    mutationFn: api.createCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      handleToast("success", "Category created successfully");
      setIsModalOpen(false);
      resetForm();
    },
    onError: (error: any) => {
      handleToast(
        "error",
        `${error.response?.data?.error || "Failed to create category"}`
      );
      console.error(error);
    },
  });

  const updateCategoryMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<Category> }) =>
      api.updateCategory(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      handleToast("success", "Category updated successfully");
      setIsModalOpen(false);
      resetForm();
    },
    onError: (error: any) => {
      handleToast(
        "error",
        `${error.response?.data?.error || "Failed to update category"}`
      );
      console.error(error);
    },
  });

  const deleteCategoryMutation = useMutation({
    mutationFn: api.deleteCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      handleToast("success", "Category deleted successfully");
    },
  });

  const resetForm = () => {
    setFormData({
      name: "",
      parent_id: "",
      parent_name: "",
    });
    setEditingCategory(null);
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      parent_id: category.parent_id || "",
      parent_name: category.parent_name || "",
    });
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const categoryData = {
      name: formData.name,
      parent_id: formData.parent_id || null,
      parent_name: formData.parent_name || null,
    };

    if (editingCategory) {
      updateCategoryMutation.mutate({
        id: editingCategory.id,
        updates: categoryData,
      });
    } else {
      createCategoryMutation.mutate(categoryData);
    }
  };

  const columns = [
    {
      key: "id",
      title: "Category ID",
      sortable: true,
      render: (value: string) => (
        <span className="font-mono text-sm text-primary-600">#{value}</span>
      ),
    },
    {
      key: "name",
      title: "Category Name",
      sortable: true,
      render: (value: string) => (
        <span className="font-mono text-sm text-primary-600">{value}</span>
      ),
    },
    {
      key: "parent_name",
      title: "Parent Category",
      render: (value: string) => (
        <div>
          <p className="font-medium text-gray-600">{value}</p>
        </div>
      ),
    },
    {
      key: "actions",
      title: "Actions",
      render: (value: any, item: Category) => (
        <div className="flex items-center space-x-2">
          <Button size="sm" variant="outline" onClick={() => handleEdit(item)}>
            Edit
          </Button>
          <Button
            size="sm"
            variant="danger"
            onClick={() => deleteCategoryMutation.mutate(item.id)}
            isLoading={deleteCategoryMutation.isPending}
          >
            Delete
          </Button>
        </div>
      ),
    },
  ];

  const categoryOptions = React.useMemo(() => {
    const optionsFromApi =
      categories?.data?.data.map((p: any) => ({
        value: p.id,
        label: p.name,
      })) || [];

    return [{ value: "", label: "—ROOT—" }, ...optionsFromApi];
  }, [categories]);

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div className={"flex items-center justify-between"}>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Categories</h1>
            <p className="text-gray-600">Manage your categories</p>
          </div>
          <div className="space-x-2">
            <Button onClick={() => setIsModalOpen(true)}>Add Category</Button>
            <Button>Export Report</Button>
          </div>
        </div>

        {/* Categories Table */}
        <Card>
          <Table
            columns={columns}
            data={categories?.data?.data || []}
            loading={isLoading}
            emptyMessage="No categories found"
            total={categories?.data?.total || 0}
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
          title={editingCategory ? "Edit Category" : "Add New Category"}
          size="lg"
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Category Name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
              />
              <Select
                label="Category Parent"
                value={formData.parent_id}
                onChange={(e) =>
                  setFormData({ ...formData, parent_id: e.target.value })
                }
                options={categoryOptions}
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
                  createCategoryMutation.isPending ||
                  updateCategoryMutation.isPending
                }
              >
                {editingCategory ? "Update Category" : "Add Category"}
              </Button>
            </div>
          </form>
        </Modal>
      </div>
    </>
  );
};

export default Categories;
