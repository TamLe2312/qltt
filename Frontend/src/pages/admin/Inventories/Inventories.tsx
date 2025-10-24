import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getApi, postApi, deleteApi } from '../../../utils';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import Button from '../../../components/ui/form/Button';
import Card from 'antd/es/card/Card';
import Table from '../../../components/ui/data-display/Table';
import Modal from '../../../components/ui/data-display/Modal';
import Input from '../../../components/ui/form/Input';
import toast from 'react-hot-toast';
import DropdownSelect from '../../../components/ui/form/DropdownSelect';
import Swal from 'sweetalert2';
import * as Yup from "yup";

// === Schema validate form ===
const InventoryFormSchema = Yup.object({
    product_id: Yup.string().required("Vui lòng chọn sản phẩm"),
    branch_id: Yup.string().required("Vui lòng chọn chi nhánh"),
    quantity: Yup.number().min(1, "Số lượng phải lớn hơn 0").required("Vui lòng nhập số lượng"),
    supplier_id: Yup.string().required("Vui lòng chọn nhà cung cấp"),
});

const Inventories: React.FC = () => {
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    // === Lấy danh sách kho ===
    const getInventories = () => getApi(`${process.env.REACT_APP_API_URL}/api/inventories`);
    const { data: inventoriesResponse, isLoading: isInventoriesLoading } = useQuery({
        queryKey: ['inventories'],
        queryFn: getInventories,
    });
    const inventories = inventoriesResponse?.data.items ?? [];

    // === Modal + form state ===
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({
        product_id: '',
        branch_id: '',
        quantity: 1,
        reserved_stock: 0,
        supplier_id: '',
    });

    const [errors, setErrors] = useState<Record<string, string>>({});

    // === Fetch dữ liệu dropdown ===
    const getProducts = () => getApi(`${process.env.REACT_APP_API_URL}/api/products`);
    const { data: productsResponse, isLoading: isProductsLoading } = useQuery({
        queryKey: ['products'],
        queryFn: getProducts,
    });
    const products = productsResponse?.data.items ?? productsResponse?.data.items ?? [];

    const getBranches = () => getApi(`${process.env.REACT_APP_API_URL}/api/branches`);
    const { data: branchesResponse, isLoading: isBranchesLoading } = useQuery({
        queryKey: ['branches'],
        queryFn: getBranches,
    });
    const branches = branchesResponse?.data.items ?? branchesResponse?.data.items ?? [];

    const getSuppliers = () => getApi(`${process.env.REACT_APP_API_URL}/api/suppliers`);
    const { data: suppliersResponse, isLoading: isSuppliersLoading } = useQuery({
        queryKey: ['suppliers'],
        queryFn: getSuppliers,
    });
    const suppliers = suppliersResponse?.data.items ?? suppliersResponse?.data.items ?? [];

    // === Mutation tạo mới ===
    const createInventoryMutation = useMutation({
        mutationFn: (data: any) => postApi(`${process.env.REACT_APP_API_URL}/api/inventories/create`, data),
        onSuccess: () => {
            toast.success('Tạo kho hàng thành công');
            setIsModalOpen(false);
            setFormData({
                product_id: '',
                branch_id: '',
                quantity: 0,
                reserved_stock: 0,
                supplier_id: '',
            });
            setErrors({});
            queryClient.invalidateQueries({ queryKey: ['inventories'] });
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Tạo thất bại');
        },
    });

    // === Mutation xóa kho ===
    const deleteInventoryMutation = useMutation({
        mutationFn: (id: string) =>
            deleteApi(`${process.env.REACT_APP_API_URL}/api/inventories/delete/${id}`),
        onSuccess: () => {
            toast.success('Xóa kho hàng thành công');
            queryClient.invalidateQueries({ queryKey: ['inventories'] });
        },
        onError: () => {
            toast.error('Xóa kho hàng thất bại');
        },
    });

    const confirmDeleteInventory = (id: string) => {
        Swal.fire({
            title: 'Bạn có chắc chắn?',
            text: "Bạn sẽ không thể hoàn tác hành động này!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Có, xóa ngay!'
        }).then((result) => {
            if (result.isConfirmed) {
                deleteInventoryMutation.mutate(id);
            }
        });
    };

    // === Validate form trước khi submit ===
    const handleValidate = async () => {
        try {
            await InventoryFormSchema.validate(formData, { abortEarly: false });
            setErrors({});
            return true;
        } catch (err) {
            if (err instanceof Yup.ValidationError) {
                const errorObj: Record<string, string> = {};
                err.inner.forEach((e) => {
                    if (e.path) errorObj[e.path] = e.message;
                });
                setErrors(errorObj);
            }
            return false;
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const isValid = await handleValidate();
        if (!isValid) return;
        createInventoryMutation.mutate(formData);
    };

    // === Định nghĩa bảng ===
    const columns = [
        {
            key: 'id',
            title: 'ID',
            render: (value: string) => (
                <span className="font-mono text-sm text-primary-600">#{value}</span>
            ),
        },
        {
            key: 'branch_name',
            title: 'Chi nhánh',
            render: (value: string) => <p className="font-medium text-gray-600">{value}</p>,
        },
        {
            key: 'product_name',
            title: 'Sản phẩm',
            render: (value: string, item: any) => (
                <div>
                    <p className="font-medium text-gray-600">{value}</p>
                    <p className="text-blue-600 text-sm font-mono">SKU: {item.sku}</p>
                </div>
            ),
        },
        {
            key: 'quantity',
            title: 'Tồn kho',
            render: (value: any, item: any) => (
                <div>
                    <p>{value}</p>
                    <p className="text-blue-600 text-sm">Đặt: {item.reserved_stock}</p>
                </div>
            ),
        },
        {
            key: 'actions',
            title: 'Hành động',
            render: (value: any, item: any) => (
                <div className="flex items-center space-x-2">
                    <Button
                        size="sm"
                        variant="outline"
                        className="text-red-600 border-red-600 hover:bg-red-50"
                        onClick={() => confirmDeleteInventory(item.id)}
                    >
                        Xóa
                    </Button>
                </div>
            ),
        },
    ];

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Kho hàng</h1>
                    <p className="text-gray-600">Quản lý kho hàng của bạn</p>
                </div>
                <Button onClick={() => setIsModalOpen(true)}>Tạo mới</Button>
            </div>

            <Card>
                <Table
                    data={inventories || []}
                    columns={columns}
                    loading={isInventoriesLoading}
                    emptyMessage="Không tìm thấy kho hàng nào"
                />
            </Card>

            {/* Modal thêm kho */}
            {/* Modal thêm kho */}
            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title="Thêm kho hàng mới"
                size="lg" // rộng hơn modal
            >
                <form onSubmit={handleSubmit} className="space-y-4 p-4 max-h-[80vh] md:max-h-full overflow-y-auto md:overflow-visible">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-36">
                        <div>
                            <DropdownSelect
                                data={products}
                                value={formData.product_id}
                                onChange={(val) =>
                                    setFormData({ ...formData, product_id: String(val || '') })
                                }
                                labelKey="name"
                                valueKey="id"
                                placeholder="Chọn sản phẩm"
                                loading={isProductsLoading}
                            />
                            {errors.product_id && <p className="text-red-600 text-sm mt-1">{errors.product_id}</p>}
                        </div>

                        <div>
                            <DropdownSelect
                                data={branches}
                                value={formData.branch_id}
                                onChange={(val) =>
                                    setFormData({ ...formData, branch_id: String(val || '') })
                                }
                                labelKey="name"
                                valueKey="id"
                                placeholder="Chọn chi nhánh"
                                loading={isBranchesLoading}
                            />
                            {errors.branch_id && <p className="text-red-600 text-sm mt-1">{errors.branch_id}</p>}
                        </div>

                        <div>
                            <DropdownSelect
                                data={suppliers}
                                value={formData.supplier_id}
                                onChange={(val) =>
                                    setFormData({ ...formData, supplier_id: String(val || '') })
                                }
                                labelKey="name"
                                valueKey="id"
                                placeholder="Chọn nhà cung cấp"
                                loading={isSuppliersLoading}
                            />
                            {errors.supplier_id && <p className="text-red-600 text-sm mt-1">{errors.supplier_id}</p>}
                        </div>

                        <div>
                            <Input
                                // label="Số lượng"
                                type="number"
                                value={formData.quantity}
                                onChange={(e) =>
                                    setFormData({ ...formData, quantity: Number(e.target.value) })
                                }
                            />
                            {errors.quantity && <p className="text-red-600 text-sm mt-1">{errors.quantity}</p>}
                        </div>
                    </div>

                    <div className="flex justify-end space-x-2 pt-4">
                        <Button
                            type="button"
                            variant="secondary"
                            onClick={() => setIsModalOpen(false)}
                        >
                            Hủy
                        </Button>
                        <Button
                            type="submit"
                            isLoading={createInventoryMutation.isPending}
                        >
                            Lưu
                        </Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default Inventories;
