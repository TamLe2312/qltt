import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { getApi, putApi, formatDate } from "../../../utils";
import { OrderDetail } from "../../../types";
import toast from "react-hot-toast";
import Button from "../../../components/ui/form/Button";
import Card from "../../../components/ui/data-display/Card";
import Table from "../../../components/ui/data-display/Table";
import DropdownSelect from "../../../components/ui/form/DropdownSelect";
import { loginSuccess, logout, User } from "../../../store/slices/authSlice";
import { jwtDecode } from "jwt-decode";
import { useDispatch } from "react-redux";
interface DecodedToken extends User {
  iat: number;
  exp: number;
}
interface OrderWithRelations {
  id: string;
  order_code: string;
  user_id: string;
  branch_id: string;
  status:
    | "Pending"
    | "Confirmed"
    | "Processing"
    | "Shipped"
    | "Delivered"
    | "Canceled"
    | "Failed"
    | "Refunded"
    | "Completed";
  total_amount: string;
  created_at: string;
  updated_at: string | null;
  user_name: string;
  branch_name: string;
  note?: string;
}

const STATUS_FLOW: Record<string, string[]> = {
  Pending: ["Confirmed", "Canceled", "Failed"],
  Confirmed: ["Processing", "Canceled"],
  Processing: ["Shipped", "Canceled", "Failed"],
  Shipped: ["Delivered", "Canceled", "Failed"],
  Delivered: ["Completed", "Refunded"],
  canceled: ["Refunded"],
  completed: ["Refunded"],
  failed: [],
  refunded: [],
};

const ALL_STATUS_LABELS: Record<string, string> = {
  Pending: "Pending",
  Confirmed: "Confirmed",
  Processing: "Processing",
  Shipped: "Shipped",
  Delivered: "Delivered",
  Canceled: "Canceled",
  Failed: "Failed",
  Refunded: "Refunded",
  Completed: "Completed",
};

const OrderDetails: React.FC = () => {
  const { id } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const currentBranchId = searchParams.get("branch_id");
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [status, setStatus] = useState<string>("");
  const [initialStatus, setInitialStatus] = useState<string>("");

  // === Fetch chi tiết đơn hàng ===
  const getOrder = async () =>
    getApi(`${process.env.REACT_APP_API_URL}/api/orders/${id}`, {
      branch_id: currentBranchId,
    });
  const { data: orderResponse, isLoading: isOrderLoading } = useQuery({
    queryKey: ["order", id, currentBranchId],
    queryFn: getOrder,
    enabled: !!id && !!currentBranchId,
  });
  const order: OrderWithRelations | null = orderResponse?.data ?? null;

  // === Đồng bộ status khi order thay đổi từ API ===
  useEffect(() => {
    if (order && order.status) {
      setStatus(order.status);
      setInitialStatus(order.status); // lưu trạng thái ban đầu
    }
  }, [order]);

  // === Fetch chi tiết sản phẩm ===
  const getOrderDetails = async () =>
    getApi(`${process.env.REACT_APP_API_URL}/api/orders/${id}/products`, {
      branch_id: currentBranchId,
    });
  const { data: detailsResponse, isLoading: isDetailsLoading } = useQuery({
    queryKey: ["orderDetails", id, currentBranchId],
    queryFn: getOrderDetails,
    enabled: !!id && !!currentBranchId,
  });
  const orderDetails: OrderDetail[] = detailsResponse?.data.items ?? [];

  // === Mutation đổi trạng thái ===
  const changeStatusMutation = useMutation({
    mutationFn: (newStatus: string) =>
      putApi(
        `${process.env.REACT_APP_API_URL}/api/orders/${id}/status`,
        {
          status: newStatus,
        },
        {
          params: {
            branch_id: currentBranchId,
          },
        }
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["order", id] });
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      toast.success("Đổi trạng thái thành công!");
    },
    onError: (err: unknown) => {
      console.error("Change order status failed", err);
      toast.error("Không thể thay đổi trạng thái. Kiểm tra flow trạng thái!");
    },
  });

  // === Xử lý khi chọn dropdown ===
  const handleChangeStatus = (newStatus: string) => {
    setStatus(newStatus);
  };

  const handleUpdateStatus = () => {
    if (status === initialStatus) {
      toast("Bạn chưa chọn trạng thái khác so với ban đầu!", { icon: "⚠️" });
      return;
    }
    changeStatusMutation.mutate(status);
  };

  // === Lấy các trạng thái hợp lệ dựa trên trạng thái hiện tại ===
  const getAvailableStatuses = (current: string) => {
    const nextStatuses = STATUS_FLOW[current] || [];
    const options = nextStatuses.map((s) => ({
      value: s,
      label: ALL_STATUS_LABELS[s],
    }));
    if (!options.find((o) => o.value === current)) {
      options.unshift({ value: current, label: ALL_STATUS_LABELS[current] });
    }
    return options;
  };

  const columns = [
    {
      key: "product_id",
      title: "Product ID",
      render: (v: string) => (
        <span className="font-mono text-sm text-primary-600">#{v}</span>
      ),
    },
    {
      key: "product_name",
      title: "Product name",
      render: (v: string) => (
        <span className="font-medium text-gray-700">{v}</span>
      ),
    },
    {
      key: "quantity",
      title: "Quantity",
      render: (v: number) => (
        <span className="font-medium text-gray-700">{v}</span>
      ),
    },
    {
      key: "unit_price",
      title: "Unit price",
      render: (v: number) => (
        <span className="font-medium text-gray-700">{v}</span>
      ),
    },
    {
      key: "subtotal",
      title: "Subtotal",
      render: (v: number) => (
        <span className="font-medium text-gray-700">{v}</span>
      ),
    },
  ];

  const dispatch = useDispatch();
  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      try {
        const decodedUser = jwtDecode<DecodedToken>(token);
        if (decodedUser.exp * 1000 > Date.now()) {
          if (decodedUser.role !== "Admin") {
            toast.error("Không có quyền truy cập. Yêu cầu quyền Admin.");
            navigate(-1);
            return;
          }
          dispatch(loginSuccess(decodedUser));
        } else {
          toast.error("Token đã hết hạn.");
          localStorage.removeItem("accessToken");
          dispatch(logout());
        }
      } catch (error) {
        toast.error("Token không hợp lệ.");
        localStorage.removeItem("accessToken");
        dispatch(logout());
      }
    } else {
      navigate("/");
    }
  }, [dispatch, navigate]);
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-2">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Chi tiết đơn hàng
          </h1>
          <p className="text-gray-600">Thông tin chi tiết đơn hàng #{id}</p>
        </div>
        <Button variant="outline" onClick={() => navigate("/admin/orders")}>
          Quay lại
        </Button>
      </div>

      {/* Thông tin chính */}
      {order && (
        <Card className="p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            <div>
              <p className="text-sm text-gray-500">Mã đơn hàng</p>
              <p className="font-mono text-primary-600 font-medium">
                {order.id}
              </p>
              <p className="font-mono text-sm text-gray-600">
                Code: {order.order_code}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Khách hàng</p>
              <p className="font-medium text-gray-700">{order.user_name}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Chi nhánh</p>
              <p className="font-medium text-gray-700">{order.branch_name}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Ngày đặt</p>
              <p className="font-medium text-blue-600">
                {formatDate(order.created_at)}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-500">Tổng tiền</p>
              <p className="font-medium text-gray-700">
                {Number(order.total_amount).toLocaleString()} VNĐ
              </p>
            </div>

            <div className="sm:col-span-2 md:col-span-1 flex items-center gap-2">
              <DropdownSelect
                value={status}
                onChange={(val) => handleChangeStatus(String(val))}
                placeholder="Chọn trạng thái"
                data={getAvailableStatuses(order.status)}
                labelKey="label"
                valueKey="value"
                className="flex-1"
              />
              <Button
                className="h-[38px] flex-shrink-0"
                onClick={handleUpdateStatus}
                disabled={changeStatusMutation.isPending}
              >
                {changeStatusMutation.isPending
                  ? "Đang đổi..."
                  : "Đổi trạng thái"}
              </Button>
            </div>

            {order.note && (
              <div className="md:col-span-4">
                <p className="text-sm text-gray-500">Ghi chú</p>
                <p className="font-medium text-gray-700">{order.note}</p>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Danh sách sản phẩm */}
      <Card>
        <Table
          data={orderDetails}
          columns={columns}
          loading={isDetailsLoading || isOrderLoading}
          emptyMessage="Không tìm thấy sản phẩm nào"
        />
      </Card>
    </div>
  );
};

export default OrderDetails;
