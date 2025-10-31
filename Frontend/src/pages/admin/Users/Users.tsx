import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { getApi, deleteApi, postApi } from '../../../utils';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import Button from '../../../components/ui/form/Button';
import TableServerPagination from '../../../components/ui/data-display/TableServerPagination';
import { User } from '../../../types';
import Modal from '../../../components/ui/data-display/Modal';
import Input from '../../../components/ui/form/Input';
import DropdownSelect from '../../../components/ui/form/DropdownSelect';
import Swal from 'sweetalert2';
import toast from 'react-hot-toast';
import * as Yup from "yup";
import Card from '../../../components/ui/data-display/Card';

// Schema validate form
const UserFormSchema = Yup.object({
    username: Yup.string().required("Tên đăng nhập là bắt buộc"),
    password: Yup.string().required("Mật khẩu là bắt buộc").min(6, "Mật khẩu tối thiểu 6 ký tự"),
    full_name: Yup.string().required("Họ và tên là bắt buộc"),
    email: Yup.string().email("Email không hợp lệ").required("Email là bắt buộc"),
    phone: Yup.string().required("Số điện thoại là bắt buộc"),
    status: Yup.string().oneOf(["active", "inactive"], "Trạng thái không hợp lệ").required("Trạng thái là bắt buộc"),
    role_id: Yup.string().oneOf(["4", "5", "6"], "Vai trò không hợp lệ").required("Vai trò là bắt buộc"),
});

const Users: React.FC = () => {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [searchParams, setSearchParams] = useSearchParams();

    const DEFAULTS = {
        page: 1,
        pageSize: 20,
        sortKey: 'created_at',
        sortOrder: 'desc' as 'asc' | 'desc',
    };

    // ---- state hiển thị / filter
    const [page, setPage] = useState(DEFAULTS.page);
    const [pageSize, setPageSize] = useState(DEFAULTS.pageSize);
    const [sortKey, setSortKey] = useState(DEFAULTS.sortKey);
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>(DEFAULTS.sortOrder);

    // ---- đồng bộ 2 chiều: URL ↔ state
    useEffect(() => {
        const urlParams = {
            page: parseInt(searchParams.get('page') || String(DEFAULTS.page), 10),
            pageSize: parseInt(searchParams.get('page_size') || String(DEFAULTS.pageSize), 10),
            sortKey: searchParams.get('sort_field') || DEFAULTS.sortKey,
            sortOrder: (searchParams.get('sort_order') as 'asc' | 'desc') || DEFAULTS.sortOrder,
        };

        const stateParams = { page, pageSize, sortKey, sortOrder };

        const isUrlDifferent = Object.keys(urlParams).some(
            (key) => (urlParams as any)[key] !== (stateParams as any)[key]
        );

        if (isUrlDifferent) {
            setPage(urlParams.page);
            setPageSize(urlParams.pageSize);
            setSortKey(urlParams.sortKey);
            setSortOrder(urlParams.sortOrder);
            return;
        }

        if (searchParams.toString() === '') {
            setSearchParams(
                {
                    page: String(page),
                    page_size: String(pageSize),
                    sort_field: sortKey,
                    sort_order: sortOrder,
                },
                { replace: true }
            );
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchParams, page, pageSize, sortKey, sortOrder]);

    // Function GET Users
    const getUsers = () => {
        const params = {
            page,
            page_size: pageSize,
            sort_field: sortKey,
            sort_order: sortOrder,
        };
        return getApi(`${process.env.REACT_APP_API_URL}/api/users`, params);
    };

    // Lấy dữ liệu từ ClientQuery
    const { data: apiResponse, isLoading } = useQuery({
        queryKey: ['users', { page, pageSize, sortKey, sortOrder }],
        queryFn: getUsers,
    });

    const users = apiResponse?.data?.items ?? [];
    const pagination = apiResponse?.data?.pagination;
    const total = pagination?.total ?? 0;

    const getStatusColor = (status: User['status']) => {
        switch (status) {
            case 'active':
                return 'bg-blue-100 text-blue-800';
            case 'inactive':
                return 'bg-yellow-100 text-yellow-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    // Mutation xóa user sử dụng deleteApi
    const deleteUserMutation = useMutation({
        mutationFn: (id: string) =>
            deleteApi(`${process.env.REACT_APP_API_URL}/api/users/delete/${id}`),
        onSuccess: () => {
            toast.success("Xóa người dùng thành công");
            queryClient.invalidateQueries({ queryKey: ['users'] });
        },
        onError: () => {
            toast.error("Xóa người dùng thất bại");
        },
    });

    const confirmDelete = (id: string) => {
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
                deleteUserMutation.mutate(id);
            }
        });
    };

    const handlePageChange = (newPage: number) => {
        setPage(newPage);
        setSearchParams(
            {
                page: String(newPage),
                page_size: String(pageSize),
                sort_field: sortKey,
                sort_order: sortOrder,
            },
            { replace: true }
        );
    };

    const handlePageSizeChange = (newSize: number) => {
        setPageSize(newSize);
        setPage(1);
        setSearchParams(
            {
                page: '1',
                page_size: String(newSize),
                sort_field: sortKey,
                sort_order: sortOrder,
            },
            { replace: true }
        );
    };

    const handleSortChange = (key: string, order: 'asc' | 'desc') => {
        setSortKey(key);
        setSortOrder(order);
        setPage(1);
        setSearchParams(
            {
                page: '1',
                page_size: String(pageSize),
                sort_field: key,
                sort_order: order,
            },
            { replace: true }
        );
    };

    const columns = [
        {
            key: 'id',
            title: 'ID',
            sortable: true,
            render: (value: string) => (
                <span className="font-mono text-sm text-primary-600">#{value}</span>
            ),
        },
        {
            key: 'full_name',
            title: 'Tên',
            sortable: true,
            render: (value: string, item: any) => (
                <div>
                    <p className="font-medium text-blue-600">{value}</p>
                    <p className="text-sm text-gray-600">{item.username}</p>
                </div>
            ),
        },
        {
            key: 'email',
            title: 'Thông tin',
            sortable: true,
            render: (value: any, item: any) => (
                <div>
                    <p className="text-sm text-blue-600">{value}</p>
                    <p className="text-sm text-gray-600">{item.phone}</p>
                </div>
            ),
        },
        {
            key: 'role',
            title: 'Vai trò',
            render: (value: any) => (
                <div>
                    <p className="text-sm text-gray-600">{value === "4" ? "Admin" : value === "5" ? "Nhân viên" : "Khách hàng"}</p>
                </div>
            ),
        },
        {
            key: 'status',
            title: 'Trạng thái',
            sortable: true,
            render: (value: any) => (
                <div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(value)}`}>
                        {value.charAt(0).toUpperCase() + value.slice(1)}
                    </span>
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
                        onClick={() => navigate(`/admin/orders?user_id=${item.id}`)}
                    >
                        Đơn hàng
                    </Button>
                    <Button
                        size="sm"
                        variant="outline"
                        className="text-red-600 border-red-600 hover:bg-red-50"
                        onClick={() => confirmDelete(item.id)}
                    >
                        Xóa
                    </Button>
                </div>
            ),
        },
    ];

    // Modal & Form state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({
        username: "",
        password: "",
        full_name: "",
        email: "",
        phone: "",
        status: "active" as User["status"],
        role_id: "6", // Customer mặc định
    });

    const [errors, setErrors] = useState<Record<string, string>>({});

    const resetForm = () => {
        setFormData({
            username: "",
            password: "",
            full_name: "",
            email: "",
            phone: "",
            status: "active",
            role_id: "6",
        });
        setErrors({});
    };

    const statusOptions = [
        { value: "active", label: "Hoạt động" },
        { value: "inactive", label: "Không hoạt động" },
    ];

    const roleOptions = [
        { value: "4", label: "Admin" },
        { value: "5", label: "Nhân viên" },
        { value: "6", label: "Khách hàng" },
    ];

    // Mutation tạo user mới
    const createUserMutation = useMutation({
        mutationFn: (newUser: typeof formData) =>
            postApi(`${process.env.REACT_APP_API_URL}/api/users/create`, newUser),
        onSuccess: () => {
            toast.success("Tạo người dùng thành công!");
            queryClient.invalidateQueries({ queryKey: ['users'] });
            setIsModalOpen(false);
            resetForm();
        },
        onError: () => {
            toast.error("Tạo người dùng thất bại");
        },
    });


    // Validate form
    const handleValidate = async () => {
        try {
            await UserFormSchema.validate(formData, { abortEarly: false });
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

        createUserMutation.mutate(formData);
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Người dùng</h1>
                    <p className="text-gray-600">Quản lý chi nhánh của bạn</p>
                </div>
                <Button onClick={() => setIsModalOpen(true)}>Tạo mới</Button>
            </div>

            {/* Users Table */}
            <Card>
                <TableServerPagination
                    data={users}
                    columns={columns}
                    loading={isLoading}
                    emptyMessage="Không tìm thấy người dùng nào"
                    page={page}
                    pageSize={pageSize}
                    total={total}
                    onPageChange={handlePageChange}
                    onPageSizeChange={handlePageSizeChange}
                    sortKey={sortKey}
                    sortOrder={sortOrder}
                    onSortChange={handleSortChange}
                    preserveDataWhileLoading={true}
                />
            </Card>

            {/* Modal */}
            <Modal
                isOpen={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false);
                    resetForm();
                }}
                title="Người dùng mới"
                size="lg"
            >
                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Row 1 */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <Input
                            label="Tên đăng nhập"
                            value={formData.username}
                            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                            error={errors.username}
                        />
                        <Input
                            label="Mật khẩu"
                            type="password"
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            error={errors.password}
                        />
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Trạng thái</label>
                            <DropdownSelect
                                labelKey="label"
                                valueKey="value"
                                value={formData.status}
                                placeholder="Chọn trạng thái"
                                data={statusOptions}
                                onChange={(val) => setFormData({ ...formData, status: val as User["status"] })}
                            />
                            {errors.status && <p className="mt-1 text-red-600 text-sm">{errors.status}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Vai trò</label>
                            <DropdownSelect
                                labelKey="label"
                                valueKey="value"
                                value={formData.role_id}
                                placeholder="Chọn vai trò"
                                data={roleOptions}
                                onChange={(val) => setFormData({ ...formData, role_id: String(val ?? "") })}
                            />
                            {errors.role_id && <p className="mt-1 text-red-600 text-sm">{errors.role_id}</p>}
                        </div>
                    </div>

                    {/* Row 2 */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                        <Input
                            label="Họ và tên"
                            value={formData.full_name}
                            onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                            error={errors.full_name}
                        />
                        <Input
                            label="Số điện thoại"
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            error={errors.phone}
                        />
                        <Input
                            label="Email"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            error={errors.email}
                        />
                    </div>

                    {/* Submit / Cancel */}
                    <div className="flex justify-end space-x-3 pt-4">
                        <Button type="button" variant="secondary" onClick={() => { setIsModalOpen(false); resetForm(); }}>
                            Hủy
                        </Button>
                        <Button type="submit">Xác nhận</Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default Users;
