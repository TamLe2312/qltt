import React from "react";
import { useForm, Controller, SubmitHandler } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { toast } from "react-hot-toast";
import { getApi, postApi } from "../../../utils";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import Card from "../../../components/ui/data-display/Card";
import Input from "../../../components/ui/form/Input";
import DropdownSelect from "../../../components/ui/form/DropdownSelect";
import ImagePickerField from "../../../components/common/ImagePickerField";
import Button from "../../../components/ui/form/Button";
import { useNavigate } from "react-router-dom";

type Category = {
  id: string | number;
  name: string;
};

type ProductFormValues = {
  name: string;
  short_description?: string;
  description?: string;
  status: "available" | "out_of_stock";
  price: number | string;
  unit_of_measure: string;
  category_id: string;
  avatar: File[];
  images: File[];
};

const validationSchema = yup.object({
  name: yup
    .string()
    .required("Tên sản phẩm là bắt buộc")
    .min(3, "Tên tối thiểu 3 ký tự")
    .max(100, "Tên tối đa 100 ký tự"),
  short_description: yup
    .string()
    .required("Mô tả ngắn là bắt buộc")
    .max(255, "Mô tả ngắn tối đa 255 ký tự"),
  description: yup
    .string()
    .required("Mô tả chi tiết là bắt buộc")
    .max(1000, "Mô tả tối đa 1000 ký tự"),
  status: yup
    .string()
    .oneOf(["available", "out_of_stock"], "Trạng thái không hợp lệ")
    .required("Vui lòng chọn trạng thái"),
  price: yup
    .number()
    .typeError("Giá phải là số")
    .required("Giá là bắt buộc")
    .moreThan(0, "Giá phải > 0")
    .max(1000000000, "Giá quá lớn"),
  unit_of_measure: yup.string().required("Vui lòng nhập đơn vị tính"),
  category_id: yup.string().required("Vui lòng chọn danh mục"),
  avatar: yup
    .array()
    .min(1, "Chọn 1 ảnh avatar")
    .max(1, "Chỉ được chọn 1 ảnh avatar")
    .test("avatarType", "Avatar phải là ảnh", (files) =>
      Array.isArray(files) && files[0]?.type?.startsWith("image/")
    )
    .test("avatarSize", "Avatar < 5MB", (files) =>
      Array.isArray(files) && files[0]?.size / 1024 / 1024 <= 5
    ),
  images: yup
    .array()
    .min(1, "Phải chọn ít nhất 1 ảnh")
    .max(5, "Chỉ được chọn tối đa 5 ảnh")
    .test("fileTypeAll", "Chỉ chọn file ảnh", (files) =>
      Array.isArray(files) ? files.every((f) => f?.type?.startsWith("image/")) : false
    )
    .test("fileSizeAll", "Mỗi ảnh phải nhỏ hơn 5MB", (files) =>
      Array.isArray(files) ? files.every((f) => f?.size / 1024 / 1024 <= 5) : false
    ),
}) as yup.ObjectSchema<ProductFormValues>;


const ProductCreate: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const getCategories = async () => {
    return await getApi(`${process.env.REACT_APP_API_URL}/api/categories`);
  };

  const { data: apiResponse, isLoading: loadingCategories } = useQuery({
    queryKey: ["categories"],
    queryFn: getCategories,
  });

  const categories = apiResponse?.data.items ?? [];

  const {
    control,
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<ProductFormValues>({
    resolver: yupResolver(validationSchema),
    defaultValues: {
      name: "",
      short_description: "",
      description: "",
      status: "available",
      price: "",
      unit_of_measure: "",
      category_id: "",
      avatar: [],
      images: [],
    },
    mode: "onBlur",
    reValidateMode: "onBlur",
  });

  const onSubmit: SubmitHandler<ProductFormValues> = async (values) => {
    const formData = new FormData();
    formData.set("name", values.name);
    formData.set("short_description", values.short_description || "");
    formData.set("description", values.description || "");
    formData.set("status", values.status);
    formData.set("price", String(values.price));
    formData.set("unit_of_measure", values.unit_of_measure);
    formData.set("category_id", String(values.category_id));
    values.avatar?.[0] &&
      formData.append("avatar", values.avatar[0], values.avatar[0].name || "avatar.jpg");
    values.images?.forEach((file, idx) =>
      formData.append("images", file, file.name || `image_${idx}.jpg`)
    );

    try {
      await postApi(`${process.env.REACT_APP_API_URL}/api/products/create`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      await queryClient.invalidateQueries({ queryKey: ["products"] });
      toast.success("Tạo sản phẩm thành công 🎉");
      reset();

      navigate("/admin/products");
    } catch (error: any) {
      console.error("Lỗi khi tạo sản phẩm:", error);
      toast.error("Lỗi khi tạo sản phẩm. Vui lòng thử lại!");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tạo sản phẩm</h1>
          <p className="text-gray-600">Nhập thông tin sản phẩm và tải ảnh</p>
        </div>
      </div>

      <Card>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Input
                label="Tên sản phẩm"
                placeholder="Ví dụ: Áo thun basic"
                error={errors.name?.message}
                {...register("name")}
              />
            </div>

            <div>
              <Input
                label="Giá"
                placeholder="Ví dụ: 199000"
                type="number"
                step="0.01"
                error={errors.price?.message as string | undefined}
                {...register("price", { valueAsNumber: true })}
              />
            </div>

            <div>
              <Input
                label="Đơn vị tính"
                placeholder="VD: cái, hộp, kg..."
                error={errors.unit_of_measure?.message}
                {...register("unit_of_measure")}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Trạng thái</label>
              <Controller
                name="status"
                control={control}
                render={({ field }) => (
                  <DropdownSelect
                    data={[
                      { id: "available", name: "Còn hàng" },
                      { id: "out_of_stock", name: "Hết hàng" },
                    ]}
                    value={field.value || null}
                    valueKey="id"
                    labelKey="name"
                    placeholder="Chọn trạng thái"
                    onChange={(val) => field.onChange(val || "available")}
                  />
                )}
              />
              {errors.status && <p className="text-red-600 text-sm mt-1">{errors.status.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Danh mục</label>
              <Controller
                name="category_id"
                control={control}
                render={({ field }) => (
                  <DropdownSelect
                    data={categories}
                    value={field.value ?? null}
                    valueKey="id"
                    labelKey="name"
                    placeholder="Chọn danh mục"
                    loading={loadingCategories}
                    disabled={loadingCategories}
                    defaultOptionLabel="-- Chọn danh mục --"
                    onChange={(val) => {
                      field.onChange(val != null ? Number(val) : null);
                    }}
                  />
                )}
              />

              {errors.category_id && (
                <p className="mt-1 h-5 text-sm text-red-600">{errors.category_id.message}</p>
              )}
            </div>
          </div>

          <div>
            <Input
              label="Mô tả ngắn"
              placeholder="Ví dụ: Áo thun cotton mềm mại, thoáng mát..."
              error={errors.short_description?.message}
              {...register("short_description")}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả chi tiết</label>
            <textarea
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent ${errors.description ? "border-red-300 focus:ring-red-500" : "border-gray-300"
                }`}
              rows={4}
              placeholder="Mô tả sản phẩm..."
              {...register("description")}
            />
            {errors.description && (
              <p className="mt-1 h-5 text-sm text-red-600">{errors.description.message}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Avatar</label>
              <Controller
                name="avatar"
                control={control}
                render={({ field }) => (
                  <ImagePickerField
                    name={field.name}
                    control={control}
                    multiple={false}
                    maxCount={1}
                    minHeight={120}
                    hideErrorMessage
                  />
                )}
              />
              {errors.avatar && (
                <p className="text-red-600 text-sm mt-1">{errors.avatar.message as string}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Ảnh sản phẩm</label>
              <Controller
                name="images"
                control={control}
                render={({ field }) => (
                  <ImagePickerField
                    name={field.name}
                    control={control}
                    multiple
                    maxCount={5}
                    minHeight={120}
                    hideErrorMessage
                  />
                )}
              />
              {errors.images && (
                <p className="text-red-600 text-sm mt-1">{errors.images.message as string}</p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button type="submit" isLoading={isSubmitting}>
              Tạo sản phẩm
            </Button>
            <Button type="button" variant="secondary" onClick={() => window.history.back()}>
              Hủy
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default ProductCreate;
