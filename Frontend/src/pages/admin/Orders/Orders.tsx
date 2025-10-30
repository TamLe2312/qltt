import React, { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate, useSearchParams } from "react-router-dom";
import { formatDate, getApi } from "../../../utils";
import { Order } from "../../../types";
import Button from "../../../components/ui/form/Button";
import toast from "react-hot-toast";
import SearchInput from "../../../components/ui/search/SearchInput";
import TableServerPagination from "../../../components/ui/data-display/TableServerPagination";

const Orders: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

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

  const [currentBranchId, setCurrentBranchId] = useState(
    searchParams.get("branch_id") || DEFAULTS.branch_id
  );
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
      branch_id: currentBranchId,
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
      setCurrentBranchId(urlParams.branch_id);
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
          branch_id: currentBranchId,
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
    currentBranchId,
  ]);
  // Function GET Orders
  const getOrders = () => {
    const params: any = {
      branch_id: currentBranchId,
      page,
      limit: limit,
      sortBy: sortBy,
      sortOrder: sortOrder,
    };
    if (searchQuery) {
      params.search = searchQuery;
    }
    return getApi(`${process.env.REACT_APP_API_URL}/api/orders`, params);
  };

  const {
    data: apiResponse,
    isLoading,
    error,
  } = useQuery({
    queryKey: [
      "orders",
      currentBranchId,
      page,
      limit,
      sortBy,
      sortOrder,
      searchQuery,
    ],
    queryFn: getOrders,
    enabled: !!currentBranchId,
  });

  const orders = apiResponse?.data.items ?? [];
  const pagination = apiResponse?.data?.pagination;
  const total = pagination?.total ?? 0;

  // console.log('Orders: ', orders);

  // Màu tùy chỉnh cho trạng thái Order
  const getStatusColor = (status: Order["status"]) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "confirmed":
        return "bg-indigo-100 text-indigo-800";
      case "processing":
        return "bg-blue-100 text-blue-800";
      case "shipped":
        return "bg-purple-100 text-purple-800";
      case "delivered":
        return "bg-green-100 text-green-800";
      case "canceled":
        return "bg-red-100 text-red-800";
      case "failed":
        return "bg-pink-100 text-pink-800";
      case "refunded":
        return "bg-teal-100 text-teal-800";
      case "completed":
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
      branch_id: currentBranchId,
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
      render: (value: Order["status"]) => (
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
            value
          )}`}
        >
          {value.charAt(0).toUpperCase() + value.slice(1)}
        </span>
      ),
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
                `/admin/orders/${item.id}/products?branch_id=${currentBranchId}`
              )
            }
          >
            Xem
          </Button>
        </div>
      ),
    },
  ];

  const branchOptions = [
    { id: "1", name: "Chi nhánh 1" },
    { id: "2", name: "Chi nhánh 2" },
    { id: "3", name: "Chi nhánh 3" },
  ];
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className={"flex items-center justify-between"}>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Đơn hàng</h1>
          <p className="text-gray-600">Quản lý đơn hàng của bạn</p>
          <div className="space-x-2">
            {branchOptions.map((branch) => (
              <Button
                key={branch.id}
                className={"mt-2"}
                onClick={() => handleBranchChange(branch.id)}
              >
                {branch.name}
              </Button>
            ))}
          </div>
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

      {/* Orders Table */}
      <SearchInput
        query={query}
        setQuery={setQuery}
        handleSearch={handleSearch}
        handleClear={handleClear}
      />
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
    </div>
  );
};

export default Orders;
