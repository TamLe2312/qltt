import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { getApi, postApi, deleteApi } from "../../../utils";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import Button from "../../../components/ui/form/Button";
import Card from "antd/es/card/Card";
import Table from "../../../components/ui/data-display/Table";
import Modal from "../../../components/ui/data-display/Modal";
import Input from "../../../components/ui/form/Input";
import toast from "react-hot-toast";
import Swal from "sweetalert2";
import * as Yup from "yup";

// === Schema validate form ===
const SupplierFormSchema = Yup.object({
    name: Yup.string().required("Vui lòng nhập tên nhà cung cấp"),
    email: Yup.string().email("Email không hợp lệ").required("Vui lòng nhập email"),
    phone: Yup.string()
        .required("Vui lòng nhập số điện thoại")
        .matches(/^[0-9]{10}$/, "Số điện thoại không hợp lệ"),
    street: Yup.string().required("Vui lòng nhập đường"),
    ward: Yup.string().required("Vui lòng nhập phường"),
    district: Yup.string().required("Vui lòng nhập quận/huyện"),
    city: Yup.string().required("Vui lòng nhập thành phố"),
    country: Yup.string().required("Vui lòng nhập quốc gia"),
    zipcode: Yup.string().required("Vui lòng nhập mã bưu chính"),
});

const Suppliers: React.FC = () => {
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        street: "",
        ward: "",
        district: "",
        city: "",
        country: "",
        zipcode: "",
    });
    const [errors, setErrors] = useState<Record<string, string>>({});

    const getSuppliers = () => getApi(`${process.env.REACT_APP_API_URL}/api/suppliers`);
    const { data: apiResponse, isLoading } = useQuery({
        queryKey: ["suppliers"],
        queryFn: getSuppliers,
    });
    const suppliers = apiResponse?.data.items ?? [];

    const createSupplierMutation = useMutation({
        mutationFn: (data: any) => postApi(`${process.env.REACT_APP_API_URL}/api/suppliers/create`, data),
        onSuccess: () => {
            toast.success("Nhà cung cấp được tạo thành công");
            setIsModalOpen(false);
            resetForm();
            queryClient.invalidateQueries({ queryKey: ["suppliers"] });
        },
        onError: (err: any) => {
            toast.error(err.response?.data?.message || "Tạo nhà cung cấp thất bại");
        },
    });

    const deleteSupplierMutation = useMutation({
        mutationFn: (id: string) => deleteApi(`${process.env.REACT_APP_API_URL}/api/suppliers/delete/${id}`),
        onSuccess: () => {
            toast.success("Nhà cung cấp đã được xóa");
            queryClient.invalidateQueries({ queryKey: ["suppliers"] });
        },
        onError: () => {
            toast.error("Xóa nhà cung cấp thất bại");
        },
    });

    const resetForm = () => {
        setFormData({
            name: "",
            email: "",
            phone: "",
            street: "",
            ward: "",
            district: "",
            city: "",
            country: "",
            zipcode: "",
        });
        setErrors({});
    };

    const handleValidateField = async (field: string, value: any) => {
        try {
            await SupplierFormSchema.validateAt(field, { ...formData, [field]: value });
            setErrors((prev) => ({ ...prev, [field]: "" }));
        } catch (err: unknown) {
            if (err instanceof Yup.ValidationError && err.path) {
                const yupErr = err as Yup.ValidationError;
                setErrors((prev) => ({ ...prev, [field]: yupErr.message }));
            }
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await SupplierFormSchema.validate(formData, { abortEarly: false });
            createSupplierMutation.mutate(formData);
        } catch (err) {
            if (err instanceof Yup.ValidationError) {
                const errorObj: Record<string, string> = {};
                err.inner.forEach((e) => {
                    if (e.path) errorObj[e.path] = e.message;
                });
                setErrors(errorObj);
            }
        }
    };

    const confirmDeleteSupplier = (id: string) => {
        Swal.fire({
            title: "Bạn có chắc chắn?",
            text: "Hành động này không thể hoàn tác!",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#d33",
            cancelButtonColor: "#3085d6",
            confirmButtonText: "Có, xóa ngay!",
        }).then((result) => {
            if (result.isConfirmed) deleteSupplierMutation.mutate(id);
        });
    };

    const columns = [
        {
            key: "id",
            title: "ID",
            render: (value: string, item: any) => <span className="font-mono text-sm text-primary-600">#{item.id}</span>,
        },
        {
            key: "name",
            title: "Tên",
            render: (value: string, item: any) => <p className="font-medium text-gray-600">{item.name}</p>,
        },
        {
            key: "address",
            title: "Địa chỉ",
            render: (value: any, item: any) => (
                <div>
                    <p>{item.street}, {item.ward}</p>
                    <p>{item.district}, {item.city}, {item.zipcode}</p>
                </div>
            ),
        },
        {
            key: "contact",
            title: "Liên hệ",
            render: (value: any, item: any) => (
                <div>
                    <p>{item.phone}</p>
                    <p>{item.email}</p>
                </div>
            ),
        },
        {
            key: "actions",
            title: "Hành động",
            render: (value: any, item: any) => (
                <div className="flex items-center space-x-2">
                    <Button size="sm"
                        variant="outline"
                        className="text-red-600 border-red-600 hover:bg-red-50"
                        onClick={() => confirmDeleteSupplier(item.id)}>Xóa
                    </Button>
                </div>
            ),
        },
    ];

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Nhà cung cấp</h1>
                    <p className="text-gray-600">Quản lý chi nhánh của bạn</p>
                </div>
                <Button onClick={() => setIsModalOpen(true)}>Tạo mới</Button>
            </div>

            <Card>
                <Table
                    data={suppliers || []}
                    columns={columns}
                    loading={isLoading}
                    emptyMessage="Không có chi nhánh nào"
                />
            </Card>

            {/* Modal thêm nhà cung cấp */}
            <Modal
                isOpen={isModalOpen}
                onClose={() => { setIsModalOpen(false); resetForm(); }}
                title="Thêm nhà cung cấp mới"
                size="xl"
            >
                <form onSubmit={handleSubmit} className="space-y-4 p-4 max-h-[80vh] md:max-h-full overflow-y-auto md:overflow-visible">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {Object.keys(formData).map((field) => (
                            <Input
                                key={field}
                                label={field.charAt(0).toUpperCase() + field.slice(1)}
                                value={formData[field as keyof typeof formData]}
                                onChange={(e) => setFormData({ ...formData, [field]: e.target.value })}
                                onBlur={(e) => handleValidateField(field, e.target.value)}
                                error={errors[field]}
                                required
                            />
                        ))}
                    </div>

                    <div className="flex justify-end space-x-3 pt-4 sticky bottom-0 bg-white md:sticky-0 md:bg-transparent p-2 md:p-0">
                        <Button type="button" variant="secondary" onClick={() => { setIsModalOpen(false); resetForm(); }}>
                            Hủy
                        </Button>
                        <Button type="submit" isLoading={createSupplierMutation.isPending}>
                            Thêm nhà cung cấp
                        </Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default Suppliers;
