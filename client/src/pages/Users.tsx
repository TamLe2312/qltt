import React, { useState } from "react";
import { User } from "../types";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import Table from "../components/ui/Table";
import { api } from "../services/api";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { handleToast } from "../hooks/toast";
import Modal from "../components/ui/Modal";
import Input from "../components/ui/Input";
import Select from "../components/ui/Select";
import { useNavigate } from "react-router-dom";

const Users: React.FC = () => {
  const { data: users, isLoading } = useQuery({
    queryKey: ["Users"],
    queryFn: api.getUsers,
  });

  const { data: rolesData, isLoading: isRolesLoading } = useQuery({
    queryKey: ["Roles"],
    queryFn: api.getRoles,
  });

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [sort, setSort] = useState<{
    key: string;
    order: "asc" | "desc";
  } | null>(null);
  const navigate = useNavigate();

  const handlePageSizeChange = (newSize: number) => {
    setPageSize(newSize);
    setPage(1);
  };

  const getStatusColor = (status: User["status"]) => {
    switch (status) {
      case "active":
        return "bg-yellow-100 text-yellow-800";
      case "inactive":
        return "bg-blue-100 text-blue-800";
      case "blocked":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    full_name: "",
    email: "",
    phone: "",
    status: "active" as User["status"],
    role_id: "",
    role_name: "",
  });

  const queryClient = useQueryClient();

  const createUserMutation = useMutation({
    mutationFn: api.createUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["Users"] });
      handleToast("success", "User created successfully");
      setIsModalOpen(false);
      resetForm();
    },
    onError: (error: any) => {
      handleToast(
        "error",
        `${error.response?.data?.error || "Failed to create user"}`
      );
      console.error(error);
    },
  });

  const updateUserMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<User> }) =>
      api.updateUser(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      handleToast("success", "User updated successfully");
      setIsModalOpen(false);
      resetForm();
    },
    onError: (error: any) => {
      handleToast(
        "error",
        `${error.response?.data?.error || "Failed to update user"}`
      );
      console.error(error);
    },
  });

  const resetForm = () => {
    setFormData({
      username: "",
      password: "",
      full_name: "",
      email: "",
      phone: "",
      status: "active",
      role_id: "",
      role_name: "",
    });
    setEditingUser(null);
  };

  const goToUserDetails = (id: string, isEdit = false) => {
    navigate(`/admin/users/${id}${isEdit ? "?mode=edit" : ""}`);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const userData = {
      username: formData.username,
      password: formData.password,
      full_name: formData.full_name,
      email: formData.email,
      phone: formData.phone,
      status: formData.status,
      role_id: formData.role_id,
    };

    if (editingUser) {
      updateUserMutation.mutate({
        id: editingUser.id,
        updates: userData,
      });
    } else {
      createUserMutation.mutate(userData);
    }
  };

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
      key: "user_info",
      title: "User information",
      render: (value: string, item: User) => (
        <div>
          <p className="font-medium text-gray-600">{item.full_name}</p>
          <p className="font-mono text-primary-600">{item.username}</p>
        </div>
      ),
    },
    {
      key: "role_name",
      title: "Role",
      sortable: true,
      sortAccessor: (item: User) => item.role_name,
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
            onClick={() => goToUserDetails(item.id, true)}
          >
            Modify
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => goToUserDetails(item.id)}
          >
            Details
          </Button>
        </div>
      ),
    },
  ];

  const roleOptions = React.useMemo(() => {
    const options =
      rolesData?.data?.map((r: any) => ({ value: r.id, label: r.name })) || [];
    return [{ value: "", label: "Select role" }, ...options];
  }, [rolesData]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className={"flex items-center justify-between"}>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Users</h1>
          <p className="text-gray-600">Manage your users</p>
        </div>
        <div className="space-x-2">
          <Button onClick={() => setIsModalOpen(true)}>Add User</Button>
          <Button>Export Report</Button>
        </div>
      </div>

      {/* Users Table */}
      <Card>
        <Table
          data={users?.data?.data || []}
          columns={columns}
          loading={isLoading}
          emptyMessage="No users found"
          total={users?.data?.total || 0}
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
        title={editingUser ? "Edit User" : "Add New User"}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              label="Username"
              value={formData.username}
              onChange={(e) =>
                setFormData({ ...formData, username: e.target.value })
              }
            />
            <Input
              label="Password"
              type="password"
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
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
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Full Name"
              value={formData.full_name}
              onChange={(e) =>
                setFormData({ ...formData, full_name: e.target.value })
              }
            />

            <Input
              label="Phone"
              value={formData.phone}
              onChange={(e) =>
                setFormData({ ...formData, phone: e.target.value })
              }
            />
            <Select
              label="Status"
              value={formData.status}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  status: e.target.value as User["status"],
                })
              }
              options={[
                { value: "", label: "Select status" },
                { value: "active", label: "Active" },
                { value: "inactive", label: "Inactive" },
                { value: "blocked", label: "Blocked" },
              ]}
            />
            <Select
              label="Role"
              value={formData.role_id}
              onChange={(e) =>
                setFormData({ ...formData, role_id: e.target.value })
              }
              options={roleOptions}
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
                createUserMutation.isPending || updateUserMutation.isPending
              }
            >
              {editingUser ? "Update User" : "Add User"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Users;
