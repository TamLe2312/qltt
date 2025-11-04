import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { getApi, postApi, deleteApi, formatDate } from "../../../utils";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import Button from "../../../components/ui/form/Button";
import Modal from "../../../components/ui/data-display/Modal";
import Input from "../../../components/ui/form/Input";
import toast from "react-hot-toast";
import DropdownSelect from "../../../components/ui/form/DropdownSelect";
import Swal from "sweetalert2";
import * as Yup from "yup";
import SearchInput from "../../../components/ui/search/SearchInput";
import TableServerPagination from "../../../components/ui/data-display/TableServerPagination";
import Card from "../../../components/ui/data-display/Card";

// === Schema validate form ===
const InventoryFormSchema = Yup.object({
  product_id: Yup.string().required("Vui lòng chọn sản phẩm"),
  branch_id: Yup.string().required("Vui lòng chọn chi nhánh"),
  quantity: Yup.number()
    .min(1, "Số lượng phải lớn hơn 0")
    .required("Vui lòng nhập số lượng"),
  supplier_id: Yup.string().required("Vui lòng chọn nhà cung cấp"),
});

const Inventories: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedBranch, setSelectedBranch] = useState<string | null>(null);

  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const handleBranchChange = (id: string) => {
    setSearchParams({ branch_id: id });
  };
  const DEFAULTS = {
    branch_id: "1",
    page: 1,
    limit: 20,
    sortBy: "created_at",
    sortOrder: "desc" as "asc" | "desc",
    search: "",
  };

  const [page, setPage] = useState(DEFAULTS.page);
  const [limit, setLimit] = useState(DEFAULTS.limit);
  const [sortBy, setSortBy] = useState(DEFAULTS.sortBy);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">(
    DEFAULTS.sortOrder
  );
  const [searchQuery, setSearchQuery] = useState(DEFAULTS.search);
  const [query, setQuery] = useState("");
  useEffect(() => {
    const urlParams = {
      branch_id: searchParams.get("branch_id") || DEFAULTS.branch_id,
      page: parseInt(searchParams.get("page") || String(DEFAULTS.page), 10),
      limit: parseInt(searchParams.get("limit") || String(DEFAULTS.limit), 10),
      sortBy: searchParams.get("sortBy") || DEFAULTS.sortBy,
      sortOrder:
        (searchParams.get("sortOrder") as "asc" | "desc") || DEFAULTS.sortOrder,
      search: searchParams.get("search") || DEFAULTS.search,
    };

    const stateParams = {
      branch_id: selectedBranch,
      page,
      limit,
      sortBy,
      sortOrder,
      search: searchQuery,
    };

    const isUrlDifferent = Object.keys(urlParams).some(
      (key) => (urlParams as any)[key] !== (stateParams as any)[key]
    );

    if (isUrlDifferent) {
      setSelectedBranch(urlParams.branch_id);
      setPage(urlParams.page);
      setLimit(urlParams.limit);
      setSortBy(urlParams.sortBy);
      setSortOrder(urlParams.sortOrder);
      setSearchQuery(urlParams.search);
      return;
    }

    const isMissingDefaults =
      !searchParams.get("branch_id") ||
      !searchParams.get("page") ||
      !searchParams.get("limit");

    if (searchParams.toString() === "" || isMissingDefaults) {
      setSearchParams(
        {
          branch_id: String(selectedBranch),
          page: String(page),
          limit: String(limit),
          sortBy: sortBy,
          sortOrder: sortOrder,
        },
        { replace: true }
      );
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    searchParams,
    page,
    limit,
    sortBy,
    sortOrder,
    searchQuery,
    selectedBranch,
  ]);

  // === Lấy danh sách kho ===
  const getInventories = () => {
    const params: any = {
      branch_id: selectedBranch,
      page,
      limit: limit,
      sortBy: sortBy,
      sortOrder: sortOrder,
    };
    if (searchQuery) {
      params.search = searchQuery;
    }
    return getApi(`${process.env.REACT_APP_API_URL}/api/inventories`, params);
  };

  const { data: inventoriesResponse, isLoading } = useQuery({
    queryKey: [
      "inventories",
      selectedBranch,
      page,
      limit,
      sortBy,
      sortOrder,
      searchQuery,
    ],
    enabled: !!selectedBranch,
    queryFn: getInventories,
  });
  const inventories = inventoriesResponse?.data.items ?? [];
  const pagination = inventoriesResponse?.data?.pagination;
  const total = pagination?.total ?? 0;

  // === Modal + form state ===
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    product_id: "",
    branch_id: "",
    quantity: 1,
    reserved_stock: 0,
    supplier_id: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // === Fetch dữ liệu dropdown ===
  const getProducts = () =>
    getApi(`${process.env.REACT_APP_API_URL}/api/products`);
  const { data: productsResponse, isLoading: isProductsLoading } = useQuery({
    queryKey: ["products"],
    queryFn: getProducts,
  });

  const products =
    productsResponse?.data.items ?? productsResponse?.data.items ?? [];

  const getBranches = () =>
    getApi(`${process.env.REACT_APP_API_URL}/api/branches`);
  const { data: branchesResponse, isLoading: isBranchesLoading } = useQuery({
    queryKey: ["branches"],
    queryFn: getBranches,
  });
  const branches =
    branchesResponse?.data.items ?? branchesResponse?.data.items ?? [];

  const getSuppliers = () =>
    getApi(`${process.env.REACT_APP_API_URL}/api/suppliers`);
  const { data: suppliersResponse, isLoading: isSuppliersLoading } = useQuery({
    queryKey: ["suppliers"],
    queryFn: getSuppliers,
  });
  const suppliers =
    suppliersResponse?.data.items ?? suppliersResponse?.data.items ?? [];

  // === Mutation tạo mới ===
  const createInventoryMutation = useMutation({
    mutationFn: (data: any) =>
      postApi(`${process.env.REACT_APP_API_URL}/api/inventories/create`, data),
    onSuccess: () => {
      toast.success("Tạo kho hàng thành công");
      setIsModalOpen(false);
      setFormData({
        product_id: "",
        branch_id: "",
        quantity: 0,
        reserved_stock: 0,
        supplier_id: "",
      });
      setErrors({});
      queryClient.invalidateQueries({ queryKey: ["inventories"] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Tạo thất bại");
    },
  });

  // === Mutation xóa kho ===
  const deleteInventoryMutation = useMutation({
    mutationFn: (id: string) =>
      deleteApi(
        `${process.env.REACT_APP_API_URL}/api/inventories/delete/${id}`
      ),
    onSuccess: () => {
      toast.success("Xóa kho hàng thành công");
      queryClient.invalidateQueries({ queryKey: ["inventories"] });
    },
    onError: () => {
      toast.error("Xóa kho hàng thất bại");
    },
  });

  const confirmDeleteInventory = (id: string) => {
    Swal.fire({
      title: "Bạn có chắc chắn?",
      text: "Bạn sẽ không thể hoàn tác hành động này!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Có, xóa ngay!",
    }).then((result) => {
      if (result.isConfirmed) {
        deleteInventoryMutation.mutate(id);
      }
    });
  };

  const buildParams = (overrides = {}) => ({
    page: String(page),
    limit: String(limit),
    sortBy: sortBy,
    sortOrder: sortOrder,
    ...(selectedBranch ? { branch_id: selectedBranch } : {}),
    ...overrides,
  });

  const cleanParams = (params: Record<string, any>) => {
    const cleaned: Record<string, string> = {};
    Object.entries(params).forEach(([k, v]) => {
      if (v !== null && v !== undefined && v !== "") cleaned[k] = String(v);
    });
    return cleaned;
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

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    setSearchParams(
      {
        page: String(newPage),
        limit: String(limit),
        sortBy: sortBy,
        sortOrder: sortOrder,
      },
      { replace: true }
    );
  };

  const handleLimitChange = (newLimit: number) => {
    setLimit(newLimit);
    setPage(1);
    setSearchParams(
      {
        page: "1",
        limit: String(newLimit),
        sortBy: sortBy,
        sortOrder: sortOrder,
      },
      { replace: true }
    );
  };

  const handleSortChange = (key: string, order: "asc" | "desc") => {
    setSortBy(key);
    setSortOrder(order);
    setPage(1);
    setSearchParams(
      {
        page: "1",
        limit: String(limit),
        sortBy: key,
        sortOrder: order,
      },
      { replace: true }
    );
  };
  const handleSearch = () => {
    if (!query.trim()) {
      toast.error("Vui lòng nhập từ khóa tìm kiếm");
      return;
    }

    setPage(1);

    const newParams = {
      branch_id: String(selectedBranch),
      page: "1",
      limit: String(limit),
      sortBy: sortBy,
      sortOrder: sortOrder,
      search: query,
    };

    setSearchParams(newParams, { replace: true });
  };

  const handleClear = () => {
    setQuery("");

    const currentParams = Object.fromEntries(searchParams.entries());
    delete currentParams.search;

    setSearchParams(currentParams, { replace: true });
  };
  // === Định nghĩa bảng ===
  const columns = [
    {
      key: "id",
      title: "ID",
      sortable: true,
      render: (value: string) => (
        <span className="font-mono text-sm text-primary-600">#{value}</span>
      ),
    },
    {
      key: "branch_name",
      title: "Chi nhánh",
      render: (value: string) => (
        <p className="font-medium text-gray-600">{value}</p>
      ),
    },
    {
      key: "supplier_name",
      title: "Nhà cung cấp",
      sortable: true,
      render: (value: string) => (
        <p className="font-medium text-gray-600">{value}</p>
      ),
    },
    {
      key: "product_name",
      title: "Sản phẩm",
      render: (value: string, item: any) => (
        <div>
          <p className="font-medium text-gray-600">{value}</p>
          <p className="text-blue-600 text-sm font-mono">SKU: {item.sku}</p>
        </div>
      ),
    },
    {
      key: "quantity",
      title: "Tồn kho",
      sortable: true,
      render: (value: any, item: any) => (
        <div>
          <p>{value}</p>
          <p className="text-blue-600 text-sm">Đặt: {item.reserved_stock}</p>
        </div>
      ),
    },
    {
      key: "created_at",
      title: "Ngày đặt hàng",
      sortable: true,
      render: (value: any) => (
        <div>
          <p className="font-medium text-gray-600">
            <span className="font-medium text-blue-600">
              {formatDate(value)}
            </span>
          </p>
        </div>
      ),
    },
    {
      key: "actions",
      title: "Hành động",
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
        <div className="flex items-start gap-2 w-full mb-3">
          <div className="w-64">
            {" "}
            <DropdownSelect
              data={branches}
              value={selectedBranch}
              onChange={(val) => {
                const newVal = val ? String(val) : null;
                setSelectedBranch(newVal);
                setPage(1);
                const params = buildParams({
                  page: "1",
                  branch_id: newVal || undefined,
                });
                setSearchParams(cleanParams(params), { replace: true });
              }}
              placeholder="Chọn chi nhánh"
            />
          </div>

          <SearchInput
            query={query}
            setQuery={setQuery}
            handleSearch={handleSearch}
            handleClear={handleClear}
          />
        </div>
        <TableServerPagination
          data={inventories || []}
          columns={columns}
          loading={isLoading}
          emptyMessage="Không tìm thấy sản phẩm nào"
          page={page}
          limit={limit}
          total={total}
          onPageChange={handlePageChange}
          onLimitChange={handleLimitChange}
          sortBy={sortBy}
          sortOrder={sortOrder}
          onSortChange={handleSortChange}
          preserveDataWhileLoading={true}
        />
      </Card>
      {/* Modal thêm kho */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Thêm kho hàng mới"
        size="lg" // rộng hơn modal
      >
        <form
          onSubmit={handleSubmit}
          className="space-y-4 p-4 max-h-[80vh] md:max-h-full overflow-y-auto md:overflow-visible"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-36">
            <div>
              <DropdownSelect
                data={products}
                value={formData.product_id}
                onChange={(val) =>
                  setFormData({ ...formData, product_id: String(val || "") })
                }
                labelKey="name"
                valueKey="id"
                placeholder="Chọn sản phẩm"
                loading={isProductsLoading}
              />
              {errors.product_id && (
                <p className="text-red-600 text-sm mt-1">{errors.product_id}</p>
              )}
            </div>

            <div>
              <DropdownSelect
                data={branches}
                value={formData.branch_id}
                onChange={(val) =>
                  setFormData({ ...formData, branch_id: String(val || "") })
                }
                labelKey="name"
                valueKey="id"
                placeholder="Chọn chi nhánh"
                loading={isBranchesLoading}
              />
              {errors.branch_id && (
                <p className="text-red-600 text-sm mt-1">{errors.branch_id}</p>
              )}
            </div>

            <div>
              <DropdownSelect
                data={suppliers}
                value={formData.supplier_id}
                onChange={(val) =>
                  setFormData({ ...formData, supplier_id: String(val || "") })
                }
                labelKey="name"
                valueKey="id"
                placeholder="Chọn nhà cung cấp"
                loading={isSuppliersLoading}
              />
              {errors.supplier_id && (
                <p className="text-red-600 text-sm mt-1">
                  {errors.supplier_id}
                </p>
              )}
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
              {errors.quantity && (
                <p className="text-red-600 text-sm mt-1">{errors.quantity}</p>
              )}
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
            <Button type="submit" isLoading={createInventoryMutation.isPending}>
              Lưu
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Inventories;
