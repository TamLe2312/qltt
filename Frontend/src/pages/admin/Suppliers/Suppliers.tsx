import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { getApi, postApi, deleteApi } from "../../../utils";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import Button from "../../../components/ui/form/Button";
import TableServerPagination from "../../../components/ui/data-display/TableServerPagination";
import Modal from "../../../components/ui/data-display/Modal";
import Input from "../../../components/ui/form/Input";
import toast from "react-hot-toast";
import Swal from "sweetalert2";
import * as Yup from "yup";
import SearchInput from "../../../components/ui/search/SearchInput";

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
    const [searchParams, setSearchParams] = useSearchParams();

    // ========================
    // CONSTANTS & DEFAULT VALUES
    // ========================
    const DEFAULTS = {
        page: 1,
        pageSize: 20,
        sortKey: 'created_at',
        sortOrder: 'desc' as 'asc' | 'desc',
        search: '',
    };

    // ========================
    // STATE MANAGEMENT
    // ========================
    const [page, setPage] = useState(DEFAULTS.page);
    const [pageSize, setPageSize] = useState(DEFAULTS.pageSize);
    const [sortKey, setSortKey] = useState(DEFAULTS.sortKey);
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>(DEFAULTS.sortOrder);
    const [searchQuery, setSearchQuery] = useState(DEFAULTS.search);
    const [isSearchLoading, setIsSearchLoading] = useState(false);

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

    // ========================
    // ĐỒNG BỘ URL ↔ STATE (2 CHIỀU)
    // ========================
    useEffect(() => {
        const urlParams = {
            page: parseInt(searchParams.get('page') || String(DEFAULTS.page), 10),
            pageSize: parseInt(searchParams.get('page_size') || String(DEFAULTS.pageSize), 10),
            sortKey: searchParams.get('sort_field') || DEFAULTS.sortKey,
            sortOrder: (searchParams.get('sort_order') as 'asc' | 'desc') || DEFAULTS.sortOrder,
            search: searchParams.get('search') || DEFAULTS.search,
        };

        const stateParams = { page, pageSize, sortKey, sortOrder, search: searchQuery };

        const isUrlDifferent = Object.keys(urlParams).some(
            (key) => (urlParams as any)[key] !== (stateParams as any)[key]
        );

        if (isUrlDifferent) {
            setPage(urlParams.page);
            setPageSize(urlParams.pageSize);
            setSortKey(urlParams.sortKey);
            setSortOrder(urlParams.sortOrder);
            setSearchQuery(urlParams.search);
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
    }, [searchParams, page, pageSize, sortKey, sortOrder, searchQuery]);

    // ========================
    // API FUNCTIONS
    // ========================
    const getSuppliers = () => {
        const params: any = {
            page,
            page_size: pageSize,
            sort_field: sortKey,
            sort_order: sortOrder,
        };
        if (searchQuery) {
            params.search = searchQuery;
        }
        return getApi(`${process.env.REACT_APP_API_URL}/api/suppliers`, params);
    };

    // ========================
    // REACT QUERY - FETCH DATA
    // ========================
    const { data: apiResponse, isLoading } = useQuery({
        queryKey: ["suppliers", { page, pageSize, sortKey, sortOrder, searchQuery }],
        queryFn: getSuppliers,
    });

    const suppliers = apiResponse?.data?.items ?? [];
    const pagination = apiResponse?.data?.pagination;
    const total = pagination?.total ?? 0;

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

    // ========================
    // SEARCH HANDLERS
    // ========================
    const [query, setQuery] = useState("");

    const handleSearch = () => {
        if (!searchQuery.trim()) {
            toast.error('Vui lòng nhập từ khóa tìm kiếm');
            return;
        }

        setIsSearchLoading(true);
        setPage(1);

        const newParams: any = {
            page: '1',
            page_size: String(pageSize),
            sort_field: sortKey,
            sort_order: sortOrder,
        };

        if (searchQuery) {
            newParams.search = searchQuery;
        }

        setSearchParams(newParams, { replace: true });

        setTimeout(() => {
            setIsSearchLoading(false);
            toast.success(`Đang tìm kiếm: "${searchQuery}"`);
        }, 500);
    };

    const columns = [
        {
            key: "id",
            title: "ID",
            sortable: true,
            render: (value: string, item: any) => <span className="font-mono text-sm text-primary-600">#{item.id}</span>,
        },
        {
            key: "name",
            title: "Tên",
            sortable: true,
            render: (value: string, item: any) => <p className="font-medium text-gray-900">{item.name}</p>,
        },
        {
            key: "address",
            title: "Địa chỉ",
            render: (value: any, item: any) => (
                <div>
                    <p className="text-sm text-gray-600">{item.street}, {item.ward}</p>
                    <p className="text-sm text-gray-600">{item.district}, {item.city}, {item.zipcode}</p>
                </div>
            ),
        },
        {
            key: "contact",
            title: "Liên hệ",
            render: (value: any, item: any) => (
                <div>
                    <p className="text-sm text-gray-600">{item.phone}</p>
                    <p className="text-sm text-gray-600">{item.email}</p>
                </div>
            ),
        },
        {
            key: "created_at",
            title: "Ngày tạo",
            sortable: true,
            render: (value: string) => (
                <span className="text-sm text-gray-600">
                    {value ? new Date(value).toLocaleDateString('vi-VN') : '-'}
                </span>
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


    // ========================
    // RENDER COMPONENT
    // ========================
    return (
        <div className="space-y-6">
            {/* ================== HEADER SECTION ================== */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Nhà cung cấp</h1>
                    <p className="text-gray-600">Quản lý các nhà cung cấp của bạn</p>
                </div>
                <Button onClick={() => setIsModalOpen(true)}>Tạo mới</Button>
            </div>

            {/* ================== SEARCH SECTION ================== */}
            {/* <SearchInput
                searchQuery={query}
                setSearchQuery={setQuery}
                handleSearch={handleSearch}
            /> */}

            {/* ================== TABLE SECTION ================== */}
            <TableServerPagination
                data={suppliers}
                columns={columns}
                loading={isLoading}
                emptyMessage="Không tìm thấy nhà cung cấp nào"
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

            {/* ================== MODAL SECTION ================== */}
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
