import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { getApi } from "../../../utils";
import { useQuery } from "@tanstack/react-query";
import TableServerPagination from "../../../components/ui/data-display/TableServerPagination";
import toast from "react-hot-toast";
import SearchInput from "../../../components/ui/search/SearchInput";

const Branches: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const DEFAULTS = {
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
  const [query, setQuery] = useState(searchParams.get("search") || "");
  useEffect(() => {
    const urlParams = {
      page: parseInt(searchParams.get("page") || String(DEFAULTS.page), 10),
      limit: parseInt(searchParams.get("limit") || String(DEFAULTS.limit), 10),
      sortBy: searchParams.get("sortBy") || DEFAULTS.sortBy,
      sortOrder:
        (searchParams.get("sortOrder") as "asc" | "desc") || DEFAULTS.sortOrder,
      search: searchParams.get("search") || DEFAULTS.search,
    };

    const stateParams = {
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
      setPage(urlParams.page);
      setLimit(urlParams.limit);
      setSortBy(urlParams.sortBy);
      setSortOrder(urlParams.sortOrder);
      setSearchQuery(urlParams.search);
      return;
    }

    if (searchParams.toString() === "") {
      setSearchParams(
        {
          page: String(page),
          limit: String(limit),
          sortBy: sortBy,
          sortOrder: sortOrder,
        },
        { replace: true }
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, page, limit, sortBy, sortOrder, searchQuery]);
  // Function GET Branches
  const getBranches = () => {
    const params: any = {
      page,
      limit,
      sortBy: sortBy,
      sortOrder: sortOrder,
    };
    if (searchQuery) {
      params.search = searchQuery;
    }
    return getApi(`${process.env.REACT_APP_API_URL}/api/branches`, params);
  };

  const { data: apiResponse, isLoading } = useQuery({
    queryKey: ["branches", page, limit, sortBy, sortOrder, searchQuery],
    queryFn: getBranches,
  });

  const branches = apiResponse?.data.items ?? [];
  const pagination = apiResponse?.data?.pagination;
  const total = pagination?.total ?? 0;

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

  const handleSearch = () => {
    if (!query.trim()) {
      toast.error("Vui lòng nhập từ khóa tìm kiếm");
      return;
    }
    setPage(1);

    const newParams = {
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
    delete currentParams.search; // Xóa key 'search'

    setSearchParams(currentParams, { replace: true });
  };

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
      key: "name",
      title: "Tên chi nhánh",
      sortable: true,
      render: (value: string) => (
        <div>
          <p className="font-medium text-gray-600">{value}</p>
        </div>
      ),
    },
    {
      key: "address",
      title: "Địa chỉ",
      render: (value: any, item: any) => (
        <div>
          <p className="font-medium text-gray-600">
            {item.street}, {item.ward}
          </p>
          <p className="font-medium text-gray-600">
            {item.district}, {item.city}, {item.zipcode}
          </p>
        </div>
      ),
    },
    {
      key: "contact",
      title: "Liên hệ",
      render: (value: any, item: any) => (
        <div>
          <p className="font-medium text-gray-600">{item.phone}</p>
          <p className="font-medium text-gray-600">{item.email}</p>
        </div>
      ),
    },
    {
      key: "created_at",
      title: "Ngày tạo",
      sortable: true,
      render: (value: string) => (
        <span className="text-sm text-gray-600">
          {value ? new Date(value).toLocaleDateString("vi-VN") : "-"}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className={"flex items-center justify-between"}>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Chi nhánh</h1>
          <p className="text-gray-600">Quản lý các chi nhánh của bạn</p>
        </div>
      </div>
      <SearchInput
        query={query}
        setQuery={setQuery}
        handleSearch={handleSearch}
        handleClear={handleClear}
      />
      {/* Branches Table */}
      <TableServerPagination
        data={branches}
        columns={columns}
        loading={isLoading}
        emptyMessage="Không tìm thấy chi nhánh nào"
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

export default Branches;
