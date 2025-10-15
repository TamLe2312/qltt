import React, { useState } from "react";
import { User, UserAddress } from "../types";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import Table from "../components/ui/Table";
import { api } from "../services/api";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { handleToast } from "../hooks/toast";
import Modal from "../components/ui/Modal";
import Input from "../components/ui/Input";
import Select from "../components/ui/Select";
import ToggleSwitch from "../components/ui/ToggleSwtich";

const UserAddresses: React.FC = () => {
  const { data: userAddresses, isLoading } = useQuery({
    queryKey: ["UserAddresses"],
    queryFn: api.getUserAddresses,
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
  const [editingUserAddress, setEditingUserAddress] =
    useState<UserAddress | null>(null);
  const [formData, setFormData] = useState({
    user_id: "",
    street: "",
    ward: "",
    district: "",
    city: "",
    country: "",
    zipcode: "",
    is_default: false,
  });

  const queryClient = useQueryClient();

  const createUserAddressMutation = useMutation({
    mutationFn: api.createUserAddress,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["UserAddresses"] });
      handleToast("success", "User address created successfully");
      setIsModalOpen(false);
      resetForm();
    },
    onError: (error: any) => {
      handleToast(
        "error",
        `${error.response?.data?.error || "Failed to create user address"}`
      );
      console.error(error);
    },
  });

  const updateUserAddressMutation = useMutation({
    mutationFn: ({
      id,
      updates,
    }: {
      id: string;
      updates: Partial<UserAddress>;
    }) => api.updateUserAddress(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["UserAddresses"] });
      handleToast("success", "User address updated successfully");
      setIsModalOpen(false);
      resetForm();
    },
    onError: (error: any) => {
      handleToast(
        "error",
        `${error.response?.data?.error || "Failed to update user address"}`
      );
      console.error(error);
    },
  });

  const deleteUserAddressMutation = useMutation({
    mutationFn: api.deleteUserAddress,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["UserAddresses"] });
      handleToast("success", "User address deleted successfully");
    },
  });

  const resetForm = () => {
    setFormData({
      user_id: "",
      street: "",
      ward: "",
      district: "",
      city: "",
      country: "",
      zipcode: "",
      is_default: false,
    });
    setEditingUserAddress(null);
  };

  const handleEdit = (userAddress: UserAddress) => {
    setEditingUserAddress(userAddress);
    setFormData({
      user_id: userAddress.user_id,
      street: userAddress.street,
      ward: userAddress.ward,
      district: userAddress.district,
      city: userAddress.city,
      country: userAddress.country,
      zipcode: userAddress.zipcode,
      is_default: userAddress.is_default,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const userAddressData = {
      user_id: formData.user_id,
      street: formData.street,
      ward: formData.ward,
      district: formData.district,
      city: formData.city,
      country: formData.country,
      zipcode: formData.zipcode,
      is_default: formData.is_default,
    };

    if (editingUserAddress) {
      updateUserAddressMutation.mutate({
        id: editingUserAddress.id,
        updates: userAddressData,
      });
    } else {
      createUserAddressMutation.mutate(userAddressData);
    }
  };

  const columns = [
    {
      key: "id",
      title: "User ID",
      render: (value: string) => (
        <span className="font-mono text-sm text-primary-600">#{value}</span>
      ),
    },
    {
      key: "user_info",
      title: "User information",
      render: (value: string, item: UserAddress) => (
        <div>
          <p className="font-medium text-gray-600">{item.full_name}</p>
          <p className="font-mono text-primary-600">{item.username}</p>
        </div>
      ),
    },
    {
      key: "address",
      title: "Address",
      render: (value: string, item: UserAddress) => (
        <div>
          <p className="text-gray-600">
            {item.street}, {item.ward}, {item.district}, {item.city},{" "}
            {item.country}
          </p>
          <p className="font-mono text-primary-600">Zipcode: {item.zipcode}</p>
        </div>
      ),
    },
    {
      key: "actions",
      title: "Actions",
      render: (value: any, item: UserAddress) => (
        <div className="flex items-center space-x-2">
          <Button size="sm" variant="outline" onClick={() => handleEdit(item)}>
            Edit
          </Button>
          <Button
            size="sm"
            variant="danger"
            onClick={() => deleteUserAddressMutation.mutate(item.id)}
            isLoading={deleteUserAddressMutation.isPending}
          >
            Delete
          </Button>
        </div>
      ),
    },
  ];

  const { data: usersData, isLoading: isUsersLoading } = useQuery({
    queryKey: ["Users"],
    queryFn: api.getUsers,
  });

  const userOptions = React.useMemo(() => {
    const options =
      usersData?.data?.data?.map((r: any) => ({
        value: r.id,
        label: r.username,
      })) || [];
    return [{ value: "", label: "Select user" }, ...options];
  }, [usersData]);

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
          data={userAddresses?.data?.data || []}
          columns={columns}
          loading={isLoading}
          emptyMessage="No users found"
          total={userAddresses?.data?.total || 0}
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
        title={
          editingUserAddress ? "Edit User Address" : "Add New User Address"
        }
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              label="Street"
              value={formData.street}
              onChange={(e) =>
                setFormData({ ...formData, street: e.target.value })
              }
            />
            <Input
              label="Ward"
              value={formData.ward}
              onChange={(e) =>
                setFormData({ ...formData, ward: e.target.value })
              }
            />
            <Input
              label="District"
              value={formData.district}
              onChange={(e) =>
                setFormData({ ...formData, district: e.target.value })
              }
            />
            <Input
              label="City"
              value={formData.city}
              onChange={(e) =>
                setFormData({ ...formData, city: e.target.value })
              }
            />
            <Input
              label="Country"
              value={formData.country}
              onChange={(e) =>
                setFormData({ ...formData, country: e.target.value })
              }
            />
            <Input
              label="Zipcode"
              value={formData.zipcode}
              onChange={(e) =>
                setFormData({ ...formData, zipcode: e.target.value })
              }
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select
              label="User"
              options={userOptions}
              value={formData.user_id}
              onChange={(e) =>
                setFormData({ ...formData, user_id: e.target.value })
              }
              disabled={editingUserAddress !== null}
            />
            <ToggleSwitch
              label="Set as default address"
              checked={formData.is_default}
              onChange={(newCheckedState) =>
                setFormData({ ...formData, is_default: newCheckedState })
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
                createUserAddressMutation.isPending ||
                updateUserAddressMutation.isPending
              }
            >
              {editingUserAddress ? "Update User Address" : "Add User Address"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default UserAddresses;
