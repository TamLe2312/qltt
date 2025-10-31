import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import Swal from 'sweetalert2';
import toast from 'react-hot-toast';
import * as Yup from 'yup';

import { getApi, postApi, deleteApi } from '../../../utils';
import Card from '../../../components/ui/data-display/Card';
import TableServerPagination from '../../../components/ui/data-display/TableServerPagination';
import Button from '../../../components/ui/form/Button';
import Input from '../../../components/ui/form/Input';
import DropdownSelect from '../../../components/ui/form/DropdownSelect';
import Modal from '../../../components/ui/data-display/Modal';
import SearchInput from '../../../components/ui/search/SearchInput';

// ===== Schema validate form =====
const InventoryFormSchema = Yup.object({
    product_id: Yup.string().required('Vui lòng chọn sản phẩm'),
    branch_id: Yup.string().required('Vui lòng chọn chi nhánh'),
    quantity: Yup.number().min(1, 'Số lượng phải lớn hơn 0').required('Vui lòng nhập số lượng'),
    supplier_id: Yup.string().required('Vui lòng chọn nhà cung cấp'),
});

const Inventories: React.FC = () => {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [searchParams, setSearchParams] = useSearchParams();

    const DEFAULTS = {
        page: 1,
        pageSize: 20,
        sortKey: 'created_at',
        sortOrder: 'desc' as 'asc' | 'desc',
        search: '',
    };

    // ===== State hiển thị / filter =====
    const [page, setPage] = useState(DEFAULTS.page);
    const [pageSize, setPageSize] = useState(DEFAULTS.pageSize);
    const [sortKey, setSortKey] = useState(DEFAULTS.sortKey);
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>(DEFAULTS.sortOrder);
    const [searchQuery, setSearchQuery] = useState(DEFAULTS.search);
    const [appliedSearch, setAppliedSearch] = useState(DEFAULTS.search);
    const [selectedBranch, setSelectedBranch] = useState<string | null>(null);
    const [isSearchLoading, setIsSearchLoading] = useState(false);

    // ===== Modal + form =====
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({
        product_id: '',
        branch_id: '',
        supplier_id: '',
        quantity: 1,
        reserved_stock: 0,
    });
    const [errors, setErrors] = useState<Record<string, string>>({});

    // ===== Đồng bộ URL → state (chỉ chạy 1 lần khi mount) =====
    useEffect(() => {
        const urlPage = parseInt(searchParams.get('page') || String(DEFAULTS.page), 10);
        const urlPageSize = parseInt(searchParams.get('page_size') || String(DEFAULTS.pageSize), 10);
        const urlSortKey = searchParams.get('sort_field') || DEFAULTS.sortKey;
        const urlSortOrder = (searchParams.get('sort_order') as 'asc' | 'desc') || DEFAULTS.sortOrder;
        const urlSearch = searchParams.get('search') || DEFAULTS.search;
        const urlBranch = searchParams.get('branch_id') || null;

        setPage(urlPage);
        setPageSize(urlPageSize);
        setSortKey(urlSortKey);
        setSortOrder(urlSortOrder);
        setAppliedSearch(urlSearch);
        setSearchQuery(urlSearch);
        setSelectedBranch(urlBranch);
    }, []);

    // ===== API dropdown =====
    const { data: productsResponse } = useQuery({ queryKey: ['products'], queryFn: () => getApi(`${process.env.REACT_APP_API_URL}/api/products`) });
    const products = productsResponse?.data.items ?? [];

    const { data: branchesResponse } = useQuery({ queryKey: ['branches'], queryFn: () => getApi(`${process.env.REACT_APP_API_URL}/api/branches`) });
    const branches = branchesResponse?.data.items ?? [];

    const { data: suppliersResponse } = useQuery({ queryKey: ['suppliers'], queryFn: () => getApi(`${process.env.REACT_APP_API_URL}/api/suppliers`) });
    const suppliers = suppliersResponse?.data.items ?? [];

    // ===== API lấy danh sách kho =====
    const getInventories = async () => {
        const params: any = {
            page,
            page_size: pageSize,
            sort_field: sortKey,
            sort_order: sortOrder,
        };
        if (appliedSearch) params.search = appliedSearch;
        if (selectedBranch) params.branch_id = selectedBranch;

        return getApi(`${process.env.REACT_APP_API_URL}/api/inventories`, params);
    };

    const { data: inventoriesResponse, isLoading, refetch } = useQuery({
        queryKey: ['inventories', { page, pageSize, sortKey, sortOrder, appliedSearch, selectedBranch }],
        queryFn: getInventories,
    });

    const inventories = inventoriesResponse?.data?.items ?? [];
    const total = inventoriesResponse?.data?.pagination?.total ?? 0;

    // ===== Xử lý phân trang / sort =====
    const buildParams = (overrides = {}) => ({
        page: String(page),
        page_size: String(pageSize),
        sort_field: sortKey,
        sort_order: sortOrder,
        ...(appliedSearch ? { search: appliedSearch } : {}),
        ...(selectedBranch ? { branch_id: selectedBranch } : {}),
        ...overrides,
    });

    const cleanParams = (params: Record<string, any>) => {
        const cleaned: Record<string, string> = {};
        Object.entries(params).forEach(([k, v]) => {
            if (v !== null && v !== undefined && v !== '') cleaned[k] = String(v);
        });
        return cleaned;
    };

    const handlePageChange = (newPage: number) => {
        setPage(newPage);
        setSearchParams(cleanParams(buildParams({ page: String(newPage) })), { replace: true });
    };

    const handlePageSizeChange = (newSize: number) => {
        setPageSize(newSize);
        setPage(1);
        setSearchParams(cleanParams(buildParams({ page: '1', page_size: String(newSize) })), { replace: true });
    };

    const handleSortChange = (key: string, order: 'asc' | 'desc') => {
        setSortKey(key);
        setSortOrder(order);
        setPage(1);
        setSearchParams(cleanParams(buildParams({ page: '1', sort_field: key, sort_order: order })), { replace: true });
    };

    // ===== Tìm kiếm =====
    const handleSearch = async () => {
        setIsSearchLoading(true);
        setPage(1);
        setAppliedSearch(searchQuery);
        setSearchParams(
            {
                page: '1',
                page_size: String(pageSize),
                sort_field: sortKey,
                sort_order: sortOrder,
                search: searchQuery,
                ...(selectedBranch ? { branch_id: String(selectedBranch) } : {}),
            },
            { replace: true }
        );
        await refetch();
        setIsSearchLoading(false);
    };

    const handleResetSearch = async () => {
        if (!appliedSearch && !searchQuery && !selectedBranch) return;
        setSearchQuery('');
        setAppliedSearch('');
        setSelectedBranch(null);
        setPage(1);
        setSearchParams(
            {
                page: '1',
                page_size: String(pageSize),
                sort_field: sortKey,
                sort_order: sortOrder,
            },
            { replace: true }
        );
        await refetch();
        toast.success('Đã hiển thị lại tất cả kho hàng');
    };

    // ===== Mutation tạo mới =====
    const createInventoryMutation = useMutation({
        mutationFn: (data: any) => postApi(`${process.env.REACT_APP_API_URL}/api/inventories/create`, data),
        onSuccess: () => {
            toast.success('Tạo kho hàng thành công');
            setIsModalOpen(false);
            setFormData({ product_id: '', branch_id: '', supplier_id: '', quantity: 1, reserved_stock: 0 });
            setErrors({});
            queryClient.invalidateQueries({ queryKey: ['inventories'] });
        },
        onError: (err: any) => {
            toast.error(err.response?.data?.message || 'Tạo thất bại');
        },
    });

    // ===== Mutation xóa =====
    const deleteInventoryMutation = useMutation({
        mutationFn: (id: string) => deleteApi(`${process.env.REACT_APP_API_URL}/api/inventories/delete/${id}`),
        onSuccess: () => {
            toast.success('Xóa kho hàng thành công');
            queryClient.invalidateQueries({ queryKey: ['inventories'] });
        },
        onError: () => toast.error('Xóa kho hàng thất bại'),
    });

    const confirmDeleteInventory = (id: string) => {
        Swal.fire({
            title: 'Bạn có chắc chắn?',
            text: "Hành động này không thể hoàn tác!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Xóa',
            cancelButtonText: 'Hủy',
        }).then((result) => {
            if (result.isConfirmed) deleteInventoryMutation.mutate(id);
        });
    };

    // ===== Validate form =====
    const handleValidate = async () => {
        try {
            await InventoryFormSchema.validate(formData, { abortEarly: false });
            setErrors({});
            return true;
        } catch (err) {
            if (err instanceof Yup.ValidationError) {
                const errorObj: Record<string, string> = {};
                err.inner.forEach((e) => e.path && (errorObj[e.path] = e.message));
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

    // ===== Bảng =====
    const columns = [
        { key: 'id', title: 'ID', sortable: true, render: (v: string) => <span className="font-mono text-sm text-primary-600">#{v}</span> },
        { key: 'branch_name', title: 'Chi nhánh', sortable: true, render: (v: string) => <p className="font-medium text-gray-600">{v}</p> },
        { key: 'product_name', title: 'Sản phẩm', sortable: true, render: (v: string, item: any) => <div><p>{v}</p><p className="text-blue-600 text-sm font-mono">SKU: {item.sku}</p></div> },
        { key: 'quantity', title: 'Tồn kho', sortable: true, render: (v: any, item: any) => <div><p>{v}</p><p className="text-blue-600 text-sm">Đặt: {item.reserved_stock}</p></div> },
        { key: 'actions', title: 'Hành động', render: (_: any, item: any) => <Button variant="outline" size="sm" className="text-red-600" onClick={() => confirmDeleteInventory(item.id)}>Xóa</Button> },
    ];

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold">Kho hàng</h1>
                    <p>Quản lý kho hàng của bạn</p>
                </div>
                <Button onClick={() => setIsModalOpen(true)}>Tạo mới</Button>
            </div>

            {/* Search + Filter + Table */}
            <Card>
                <div className="flex items-start gap-2 w-full mb-3">
                    <div className="w-64">
                        <DropdownSelect
                            data={branches}
                            value={selectedBranch}
                            onChange={(val) => {
                                setSelectedBranch(val !== null ? String(val) : null);
                                setPage(1);
                                setSearchParams(
                                    {
                                        page: '1',
                                        page_size: String(pageSize),
                                        sort_field: sortKey,
                                        sort_order: sortOrder,
                                        ...(appliedSearch ? { search: appliedSearch } : {}),
                                        ...(val !== null ? { branch_id: String(val) } : {}),
                                    },
                                    { replace: true }
                                );
                            }}
                            placeholder="Chọn chi nhánh"
                            defaultOptionLabel="Tất cả chi nhánh"
                        />
                    </div>

                    <SearchInput
                        searchQuery={searchQuery}
                        setSearchQuery={setSearchQuery}
                        handleSearch={handleSearch}
                        isSearchLoading={isSearchLoading}
                    />

                    <Button
                        variant="outline"
                        className="h-10 px-3 flex-none"
                        onClick={handleResetSearch}
                    >
                        X
                    </Button>
                </div>

                <TableServerPagination
                    data={inventories}
                    columns={columns}
                    loading={isLoading}
                    emptyMessage="Không có kho hàng nào"
                    page={page}
                    pageSize={pageSize}
                    total={total}
                    onPageChange={handlePageChange}
                    onPageSizeChange={handlePageSizeChange}
                    sortKey={sortKey}
                    sortOrder={sortOrder}
                    onSortChange={handleSortChange}
                    preserveDataWhileLoading={false}
                />
            </Card>

            {/* Modal thêm kho */}
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Thêm kho hàng mới" size="lg">
                <form onSubmit={handleSubmit} className="space-y-4 p-4 overflow-y-auto max-h-[80vh]">
                    <div className="grid md:grid-cols-2 gap-4">
                        <DropdownSelect
                            data={products}
                            value={formData.product_id}
                            onChange={(val) => setFormData({ ...formData, product_id: val !== null ? String(val) : '' })}
                            labelKey="name"
                            valueKey="id"
                            placeholder="Chọn sản phẩm"
                        />
                        {errors.product_id && <p className="text-red-600">{errors.product_id}</p>}

                        <DropdownSelect
                            data={branches}
                            value={formData.branch_id}
                            onChange={(val) => setFormData({ ...formData, branch_id: val !== null ? String(val) : '' })}
                            labelKey="name"
                            valueKey="id"
                            placeholder="Chọn chi nhánh"
                        />
                        {errors.branch_id && <p className="text-red-600">{errors.branch_id}</p>}

                        <DropdownSelect
                            data={suppliers}
                            value={formData.supplier_id}
                            onChange={(val) => setFormData({ ...formData, supplier_id: val !== null ? String(val) : '' })}
                            labelKey="name"
                            valueKey="id"
                            placeholder="Chọn nhà cung cấp"
                        />
                        {errors.supplier_id && <p className="text-red-600">{errors.supplier_id}</p>}

                        <Input
                            type="number"
                            value={formData.quantity}
                            onChange={(e) => setFormData({ ...formData, quantity: Number(e.target.value) })}
                        />
                        {errors.quantity && <p className="text-red-600">{errors.quantity}</p>}
                    </div>

                    <div className="flex justify-end gap-2 pt-4">
                        <Button variant="secondary" type="button" onClick={() => setIsModalOpen(false)}>Hủy</Button>
                        <Button type="submit" isLoading={createInventoryMutation.isPending}>Lưu</Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default Inventories;
