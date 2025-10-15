import Card from "../../components/ui/Card";
import { useForm, Controller, SubmitHandler } from "react-hook-form";
import Input from "../../components/ui/Input";
import { yupResolver } from "@hookform/resolvers/yup";
import * as Yup from "yup";
import React, { useEffect } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import { api } from "../../services/api";
import Button from "../../components/ui/Button";
import { handleToast } from "../../hooks/toast";

const schema = Yup.object({
  username: Yup.string().required("Username is required"),
  password: Yup.string().required("Password is required"),
  email: Yup.string().email("Invalid email").required("Email is required"),
  phone: Yup.string().required("Phone number is required"),
  zipcode: Yup.string().required("Zipcode is required"),
  street: Yup.string().required("Street is required"),
  ward: Yup.string().required("Ward is required"),
  district: Yup.string().required("District is required"),
  city: Yup.string().required("City is required"),
  country: Yup.string().required("Country is required"),
  full_name: Yup.string().required("Full name is required"),
  status: Yup.string()
    .oneOf(["active", "inactive", "blocked"])
    .required("Status is required"),
  role_name: Yup.string().required("Role is required"),
  is_default: Yup.boolean().required("Default status is required"),
}).required();

type UserFormFields = Yup.InferType<typeof schema>;

const UserDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const mode = searchParams.get("mode") || "view";

  const isViewMode = mode === "view";
  const isEditMode = mode === "edit";
  const isCreateMode = !id;

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<UserFormFields>({
    resolver: yupResolver(schema, { context: { id } }),
    mode: "onBlur",
    reValidateMode: "onBlur",
    defaultValues: {
      username: "",
      email: "",
      phone: "",
      password: "",
      zipcode: "",
      street: "",
      ward: "",
      district: "",
      city: "",
      country: "",
      is_default: false,
      full_name: "",
      status: "active",
      role_name: "",
    },
  });

  const { data: userDetails, isLoading } = useQuery({
    queryKey: ["UserDetails", id],
    queryFn: () => api.userDetails(id!),
    enabled: !!id,
  });

  useEffect(() => {
    if (id && userDetails) {
      reset(userDetails.data);
    }

    if (!id) {
      reset();
    }
  }, [id, reset, userDetails]);

  const onSubmit: SubmitHandler<UserFormFields> = (data) => {
    if (isEditMode) {
    }
  };

  const deleteUserMutation = useMutation({
    mutationFn: (id: string) => api.deleteUser(id),
    onSuccess: () => {
      handleToast("success", "User deleted successfully");
      navigate("/admin/users");
    },
    onError: (error) => {
      handleToast("error", `Error deleting user: ${error.message}`);
    },
  });

  if (isLoading) {
    return <div>Loading user details...</div>;
  }

  return (
    <div className="space-y-6">
      <Card title={isViewMode ? `View User (ID: ${id})` : "Create New User"}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Controller
              name="username"
              control={control}
              render={({ field }) => (
                <Input
                  label="Username"
                  placeholder="Enter username"
                  error={errors.username?.message}
                  {...field}
                  ref={field.ref}
                  disabled={isViewMode}
                />
              )}
            />

            <Controller
              name="email"
              control={control}
              render={({ field }) => (
                <Input
                  label="Email"
                  placeholder="Enter email"
                  error={errors.email?.message}
                  {...field}
                  ref={field.ref}
                  disabled={isViewMode}
                />
              )}
            />
            {!isViewMode && (
              <Controller
                name="password"
                control={control}
                render={({ field }) => (
                  <Input
                    label={isEditMode ? "New Password (optional)" : "Password"}
                    type="password"
                    placeholder={
                      isEditMode
                        ? "Leave blank to keep old password"
                        : "Enter password"
                    }
                    error={errors.password?.message}
                    {...field}
                    value={field.value || ""}
                    ref={field.ref}
                  />
                )}
              />
            )}
            <Controller
              name="full_name"
              control={control}
              render={({ field }) => (
                <Input
                  label="Full Name"
                  placeholder="Enter full name"
                  error={errors.full_name?.message}
                  {...field}
                  ref={field.ref}
                  disabled={isViewMode}
                />
              )}
            />
            <Controller
              name="phone"
              control={control}
              render={({ field }) => (
                <Input
                  label="Phone"
                  placeholder="Enter phone number"
                  error={errors.phone?.message}
                  {...field}
                  ref={field.ref}
                  disabled={isViewMode}
                />
              )}
            />
            <Controller
              name="role_name"
              control={control}
              render={({ field }) => (
                <Input
                  label="Role"
                  placeholder="Enter role"
                  error={errors.role_name?.message}
                  {...field}
                  ref={field.ref}
                  disabled={isViewMode}
                />
              )}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Controller
              name="zipcode"
              control={control}
              render={({ field }) => (
                <Input
                  label="Zipcode"
                  placeholder="Enter zipcode"
                  error={errors.zipcode?.message}
                  {...field}
                  ref={field.ref}
                  disabled={isViewMode}
                />
              )}
            />
            <Controller
              name="street"
              control={control}
              render={({ field }) => (
                <Input
                  label="Street"
                  placeholder="Enter street"
                  error={errors.street?.message}
                  {...field}
                  ref={field.ref}
                  disabled={isViewMode}
                />
              )}
            />
            <Controller
              name="ward"
              control={control}
              render={({ field }) => (
                <Input
                  label="Ward"
                  placeholder="Enter ward"
                  error={errors.ward?.message}
                  {...field}
                  ref={field.ref}
                  disabled={isViewMode}
                />
              )}
            />
            <Controller
              name="district"
              control={control}
              render={({ field }) => (
                <Input
                  label="District"
                  placeholder="Enter district"
                  error={errors.district?.message}
                  {...field}
                  ref={field.ref}
                  disabled={isViewMode}
                />
              )}
            />

            <Controller
              name="city"
              control={control}
              render={({ field }) => (
                <Input
                  label="City"
                  placeholder="Enter city"
                  error={errors.city?.message}
                  {...field}
                  ref={field.ref}
                  disabled={isViewMode}
                />
              )}
            />
            <Controller
              name="country"
              control={control}
              render={({ field }) => (
                <Input
                  label="Country"
                  placeholder="Enter country"
                  error={errors.country?.message}
                  {...field}
                  ref={field.ref}
                  disabled={isViewMode}
                />
              )}
            />
          </div>

          <div className="mt-4">
            <Controller
              name="is_default"
              control={control}
              render={({ field }) => (
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="is_default"
                    checked={field.value}
                    onChange={(e) => field.onChange(e.target.checked)}
                    className="h-4 w-4 text-primary-600 border-gray-300 rounded"
                    disabled={isViewMode}
                  />
                  <label htmlFor="is_default" className="text-gray-700">
                    Set as Default Address
                  </label>
                </div>
              )}
            />
          </div>

          <div className="mt-6">
            {isViewMode ? (
              <Button
                size="sm"
                variant="danger"
                onClick={() => deleteUserMutation.mutate(id!)}
                isLoading={deleteUserMutation.isPending}
              >
                Delete
              </Button>
            ) : (
              <Button size="sm" variant="outline">
                Edit
              </Button>
            )}
          </div>
        </form>
      </Card>
    </div>
  );
};

export default UserDetails;
