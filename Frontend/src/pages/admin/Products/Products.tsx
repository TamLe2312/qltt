import React, { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate, useSearchParams } from "react-router-dom";
import Swal, { SweetAlertResult } from "sweetalert2";
import { deleteApi, getApi } from "../../../utils";
import { Product } from "../../../types";
import Button from "../../../components/ui/form/Button";
import TableServerPagination from "../../../components/ui/data-display/TableServerPagination";
import SearchInput from "../../../components/ui/search/SearchInput";
import toast from "react-hot-toast";

const Products: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const DEFAULTS = {
    page: 1,
    limit: 20,
    sortBy: "created_at",
    sortOrder: "desc" as "asc" | "desc",
    search: "",
    category: "",
  };

  const [page, setPage] = useState(DEFAULTS.page);
  const [limit, setLimit] = useState(DEFAULTS.limit);
  const [sortBy, setSortBy] = useState(DEFAULTS.sortBy);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">(
    DEFAULTS.sortOrder
  );
  const [searchQuery, setSearchQuery] = useState(DEFAULTS.search);
  const [category, setCategory] = useState(DEFAULTS.category);
  const [query, setQuery] = useState("");
  useEffect(() => {
    const urlParams = {
      page: parseInt(searchParams.get("page") || String(DEFAULTS.page), 10),
      limit: parseInt(searchParams.get("limit") || String(DEFAULTS.limit), 10),
      sortBy: searchParams.get("sortBy") || DEFAULTS.sortBy,
      sortOrder:
        (searchParams.get("sortOrder") as "asc" | "desc") || DEFAULTS.sortOrder,
      search: searchParams.get("search") || DEFAULTS.search,
      category: searchParams.get("category") || DEFAULTS.category,
    };

    const stateParams = {
      page,
      limit,
      sortBy,
      sortOrder,
      search: searchQuery,
      category,
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
      setCategory(urlParams.category);
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
  // Function GET Products
  const getProducts = () => {
    const params: any = {
      page,
      limit: limit,
      sortBy: sortBy,
      sortOrder: sortOrder,
    };
    if (searchQuery) {
      params.search = searchQuery;
    }
    if (category) {
      params.category = category;
    }
    return getApi(`${process.env.REACT_APP_API_URL}/api/products`, params);
  };

  // Lấy dữ liệu từ React Query
  const { data: apiResponse, isLoading } = useQuery({
    queryKey: [
      "products",
      page,
      limit,
      sortBy,
      sortOrder,
      searchQuery,
      category,
    ],
    queryFn: getProducts,
  });

  const products = apiResponse?.data.items ?? [];
  const pagination = apiResponse?.data?.pagination;
  const total = pagination?.total ?? 0;
  // Hàm gọi API xoá
  const deleteProduct = async (id: string | number) => {
    return deleteApi(
      `${process.env.REACT_APP_API_URL}/api/products/delete/${id}`
    );
  };

  // Mutation xoá sản phẩm
  const { mutate: handleDelete } = useMutation({
    mutationFn: deleteProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      Swal.fire("Đã xóa!", "Sản phẩm đã được xóa.", "success");
    },
    onError: () => {
      Swal.fire("Lỗi!", "Xóa sản phẩm thất bại.", "error");
    },
  });

  // Hàm xác nhận xoá
  const confirmDelete = (id: string | number) => {
    Swal.fire({
      title: "Bạn có chắc chắn?",
      text: "Hành động này không thể hoàn tác!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Có, xóa ngay!",
    }).then((result: SweetAlertResult) => {
      if (result.isConfirmed) {
        handleDelete(id);
      }
    });
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
    const currentParams = Object.fromEntries(searchParams.entries());
    currentParams.search = query;

    setSearchParams(currentParams, { replace: true });
  };

  const handleClear = () => {
    setQuery("");

    const currentParams = Object.fromEntries(searchParams.entries());
    delete currentParams.search;

    setSearchParams(currentParams, { replace: true });
  };

  // Định nghĩa giao diện bảng Products
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
      key: "avatar",
      title: "Ảnh",
      render: (value: string, item: Product) => (
        <div className="flex items-center">
          {item.avatar ? (
            <img
              src={`${process.env.REACT_APP_API_URL}/images/${item.avatar}`}
              alt={item.name}
              className="w-10 h-10 rounded-full"
            />
          ) : (
            <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
              <span className="text-sm font-medium text-primary-700">
                {item.name.charAt(0)}
              </span>
            </div>
          )}
        </div>
      ),
    },
    {
      key: "sku",
      title: "SKU",
      sortable: true,
      render: (value: string) => (
        <span className="font-mono text-sm text-primary-600">{value}</span>
      ),
    },
    {
      key: "name",
      title: "Tên sản phẩm",
      sortable: true,
      render: (value: string) => (
        <div>
          <p className="font-medium text-gray-600">{value}</p>
        </div>
      ),
    },
    {
      key: "unit_of_measure",
      title: "Đơn vị tính",
      render: (value: string) => (
        <div>
          <p className="font-medium text-gray-600">{value}</p>
        </div>
      ),
    },
    {
      key: "price",
      title: "Giá",
      sortable: true,
      render: (value: string) => (
        <div>
          <p className="font-medium text-gray-600">{value}</p>
        </div>
      ),
    },
    {
      key: "category_name",
      title: "Danh mục",
      sortable: true,
      render: (value: string) => (
        <div>
          <p className="font-medium text-gray-600">{value}</p>
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
    {
      key: "actions",
      title: "Hành động",
      render: (value: any, item: Product) => (
        <div className="flex items-center space-x-2">
          {/* <Button size="sm" variant="outline">
                        Sửa
                    </Button> */}
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Sản phẩm</h1>
          <p className="text-gray-600">Quản lý sản phẩm của bạn</p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={() => navigate("/admin/products/create")}>
            Tạo mới
          </Button>
        </div>
      </div>
      <SearchInput
        query={query}
        setQuery={setQuery}
        handleSearch={handleSearch}
        handleClear={handleClear}
      />
      <TableServerPagination
        data={products || []}
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

export default Products;
