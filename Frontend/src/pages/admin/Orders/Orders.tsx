import React, { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate, useSearchParams } from "react-router-dom";
import { formatDate, getApi } from "../../../utils";
import { Order } from "../../../types";
import Button from "../../../components/ui/form/Button";
import toast from "react-hot-toast";
import SearchInput from "../../../components/ui/search/SearchInput";
import TableServerPagination from "../../../components/ui/data-display/TableServerPagination";
import Card from "../../../components/ui/data-display/Card";
import DropdownSelect from "../../../components/ui/form/DropdownSelect";

const Orders: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const [selectedBranch, setSelectedBranch] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const statusOptions = [
    { id: "Pending", name: "Chờ xác nhận" },
    { id: "Confirmed", name: "Đã xác nhận" },
    { id: "Processing", name: "Đang xử lý" },
    { id: "Shipped", name: "Đã giao" },
    { id: "Delivered", name: "Đã giao hàng" },
    { id: "Completed", name: "Hoàn tất" },
    { id: "Canceled", name: "Đã hủy" },
    { id: "Failed", name: "Thất bại" },
    { id: "Refunded", name: "Đã hoàn tiền" },
  ];

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
      status: searchParams.get("status") || null,
      user_id: searchParams.get("user_id") || null,
    };

    const stateParams = {
      page,
      limit,
      sortBy,
      sortOrder,
      search: searchQuery,
      status: selectedStatus,
      branch_id: selectedBranch,
      user_id: selectedUser,
    };

    const isUrlDifferent = Object.keys(urlParams).some(
      (key) => (urlParams as any)[key] !== (stateParams as any)[key]
    );

    if (isUrlDifferent) {
      setPage(urlParams.page);
      setLimit(urlParams.limit);
      setSortBy(urlParams.sortBy);
      setSortOrder(urlParams.sortOrder);
      setSearchQuery(urlParams.search);
      setSelectedStatus(urlParams.status);
      setSelectedBranch(urlParams.branch_id);
      setSelectedUser(urlParams.user_id);
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
    selectedStatus,
    selectedBranch,
    selectedUser,
  ]);
  // Function GET Orders
  const getOrders = () => {
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
    if (selectedStatus) params.status = selectedStatus;
    if (selectedUser) params.user_id = selectedUser;
    return getApi(`${process.env.REACT_APP_API_URL}/api/orders`, params);
  };

  const {
    data: apiResponse,
    isLoading,
    error,
  } = useQuery({
    queryKey: [
      "orders",
      page,
      limit,
      sortBy,
      sortOrder,
      searchQuery,
      selectedStatus,
      selectedBranch,
      selectedUser,
    ],
    queryFn: getOrders,
    enabled: !!selectedBranch,
  });

  const orders = apiResponse?.data.items ?? [];
  const pagination = apiResponse?.data?.pagination;
  const total = pagination?.total ?? 0;

  // console.log('Orders: ', orders);

  // Màu tùy chỉnh cho trạng thái Order
  const getStatusColor = (status: Order["status"]) => {
    switch (status) {
      case "Pending":
        return "bg-yellow-100 text-yellow-800";
      case "Confirmed":
        return "bg-indigo-100 text-indigo-800";
      case "Processing":
        return "bg-blue-100 text-blue-800";
      case "Shipped":
        return "bg-purple-100 text-purple-800";
      case "Delivered":
        return "bg-green-100 text-green-800";
      case "Canceled":
        return "bg-red-100 text-red-800";
      case "Failed":
        return "bg-pink-100 text-pink-800";
      case "Refunded":
        return "bg-teal-100 text-teal-800";
      case "Completed":
        return "bg-lime-100 text-lime-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
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

  const { data: apiBranchesResponse } = useQuery({
    queryKey: ["branches"],
    queryFn: () => getApi(`${process.env.REACT_APP_API_URL}/api/branches`),
  });

  const branchOptions = apiBranchesResponse?.data?.items ?? [];

  const { data: apiUsersResponse } = useQuery({
    queryKey: ["users"],
    queryFn: () => getApi(`${process.env.REACT_APP_API_URL}/api/users`),
  });
  const userOptions = apiUsersResponse?.data?.items ?? [];

  // ============================================================
  // Helpers
  // ============================================================
  const buildParams = (overrides = {}) => ({
    page: String(page),
    limit: String(limit),
    sortBy: sortBy,
    sortOrder: sortOrder,
    ...(selectedStatus ? { status: selectedStatus } : {}),
    ...(selectedBranch ? { branch_id: selectedBranch } : {}),
    ...(selectedUser ? { user_id: selectedUser } : {}),
    ...overrides,
  });

  const cleanParams = (params: Record<string, any>) => {
    const cleaned: Record<string, string> = {};
    Object.entries(params).forEach(([k, v]) => {
      if (v !== null && v !== undefined && v !== "") cleaned[k] = String(v);
    });
    return cleaned;
  };
  // Định nghĩa giao diện bảng Orders
  const columns = [
    {
      key: "id",
      title: "Mã đơn hàng",
      sortable: true,
      render: (value: string, item: Order) => (
        <div>
          <p className="font-mono text-sm text-primary-600">#{value}</p>
          <p className="font-mono text-sm text-primary-600">{`Mã code: ${item.order_code}`}</p>
        </div>
      ),
    },
    {
      key: "username",
      title: "Tên khách hàng",
      sortable: true,
      render: (value: string) => (
        <div>
          <p className="font-medium text-gray-600">{value}</p>
        </div>
      ),
    },
    {
      key: "branch_name",
      title: "Chi nhánh",
      render: (value: string, item: Order) => (
        <div>
          <p className="font-medium text-gray-600">{value}</p>
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
      key: "status",
      title: "Trạng thái",
      sortable: true,
      render: (value: Order["status"]) => {
        const status = statusOptions.find((option) => option.id === value);
        const displayName = status?.name ?? value;
        return (
          <span
            className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
              value
            )}`}
          >
            {displayName}
          </span>
        );
      },
    },
    {
      key: "actions",
      title: "Hành động",
      render: (value: any, item: Order) => (
        <div className="flex items-center space-x-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() =>
              navigate(
                `/admin/orders/${item.id}/products?branch_id=${selectedBranch}`
              )
            }
          >
            Xem
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className={"flex items-center justify-between"}>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Đơn hàng</h1>
          <p className="text-gray-600">Quản lý đơn hàng của bạn</p>
        </div>
        <div className="space-x-2">
          <Button onClick={() => navigate(`/admin/orders/create`)}>
            Tạo mới
          </Button>
          <Button onClick={() => navigate(`/admin/orders/statistics`)}>
            Thống kê
          </Button>
        </div>
      </div>
      <Card>
        <div className="flex flex-wrap items-start gap-2 w-full mb-4">
          <div className="w-48">
            <DropdownSelect
              data={statusOptions}
              value={selectedStatus}
              onChange={(val) => {
                const newVal = val ? String(val) : null;
                setSelectedStatus(newVal);
                setPage(1);
                const params = buildParams({
                  page: "1",
                  status: newVal || undefined,
                });
                setSearchParams(cleanParams(params), { replace: true });
              }}
              placeholder="Chọn trạng thái"
              defaultOptionLabel="Tất cả trạng thái"
            />
          </div>

          <div className="w-56">
            <DropdownSelect
              data={branchOptions}
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

          <div className="w-56">
            <DropdownSelect
              valueKey="id"
              labelKey="full_name"
              data={userOptions}
              value={selectedUser}
              onChange={(val) => {
                const newVal = val ? String(val) : null;
                setSelectedUser(newVal);
                setPage(1);
                const params = buildParams({
                  page: "1",
                  user_id: newVal || undefined,
                });
                setSearchParams(cleanParams(params), { replace: true });
              }}
              placeholder="Chọn khách hàng"
              defaultOptionLabel="Tất cả khách hàng"
            />
          </div>
          <div className="flex-1 min-w-[250px]">
            <SearchInput
              query={query}
              setQuery={setQuery}
              handleSearch={handleSearch}
              handleClear={handleClear}
            />
          </div>
        </div>
        <TableServerPagination
          data={orders || []}
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
    </div>
  );
};

export default Orders;
