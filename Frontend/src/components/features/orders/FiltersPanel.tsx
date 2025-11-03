import { useState } from "react";
import { DatePicker, Select, InputNumber, Form, Spin, Button } from "antd";
import { useQuery } from "@tanstack/react-query";
import dayjs from "dayjs";
import type { OrderFilters as BaseOrderFilters, GroupBy } from "../../../types";
import { formatCurrency, getApi } from "../../../utils";

const { RangePicker } = DatePicker;
const { Option } = Select;

// 🔹 Bổ sung groupBy vào type tạm thời
interface OrderFilters extends BaseOrderFilters {
  groupBy?: GroupBy;
}

interface FiltersPanelProps {
  onChange: (filters: OrderFilters, groupBy?: GroupBy) => void;
}

export default function FiltersPanel({ onChange }: FiltersPanelProps) {
  const defaultState = {
    filters: {
      branchId: 1,
    },
    groupBy: "month" as GroupBy,
  };

  const [filters, setFilters] = useState<OrderFilters>(defaultState.filters);
  const [groupBy, setGroupBy] = useState<GroupBy>(defaultState.groupBy);
  const [tempTotals, setTempTotals] = useState<{
    minTotal?: number | null;
    maxTotal?: number | null;
  }>({});
  const [errors, setErrors] = useState<{
    minTotal?: string;
    maxTotal?: string;
  }>({});

  // ✅ API: Lấy danh sách chi nhánh
  const getBranches = () =>
    getApi(`${process.env.REACT_APP_API_URL}/api/branches`);
  const {
    data: branchesResponse,
    isLoading: branchesLoading,
    error: branchesError,
  } = useQuery({
    queryKey: ["branches"],
    queryFn: getBranches,
  });
  const branches = branchesResponse?.data.items ?? [];

  // ✅ API: Lấy danh sách user
  const getUsers = () => getApi(`${process.env.REACT_APP_API_URL}/api/users`);
  const {
    data: usersResponse,
    isLoading: usersLoading,
    error: usersError,
  } = useQuery({
    queryKey: ["users"],
    queryFn: getUsers,
  });
  const users = usersResponse?.data.items ?? [];

  const handleChange = (key: keyof OrderFilters, value: any) => {
    const newFilters = { ...filters, [key]: value };

    if (key === "groupBy") {
      setGroupBy(value as GroupBy);
      onChange({ ...filters }, value as GroupBy);
    } else {
      setFilters(newFilters);
      onChange(newFilters, groupBy);
    }
  };

  const handleBlur = (field: "minTotal" | "maxTotal") => {
    const min = tempTotals.minTotal ?? filters.minTotal;
    const max = tempTotals.maxTotal ?? filters.maxTotal;
    const newErrors: typeof errors = {};

    if (
      min !== undefined &&
      max !== undefined &&
      min !== null &&
      max !== null &&
      min > max
    ) {
      newErrors.minTotal = "Min Total không được lớn hơn Max Total";
      newErrors.maxTotal = "Max Total không được nhỏ hơn Min Total";
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      const newFilters = {
        ...filters,
        minTotal: min ?? undefined,
        maxTotal: max ?? undefined,
      };

      setFilters(newFilters);

      onChange(newFilters, newFilters.groupBy);
    }
  };

  // ✅ Hàm reset toàn bộ bộ lọc về mặc định
  const handleReset = () => {
    setFilters(defaultState.filters);
    setGroupBy(defaultState.groupBy);
    setTempTotals({});
    setErrors({});
    onChange(defaultState.filters, defaultState.groupBy);
  };

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
        gap: "1rem",
        alignItems: "start",
      }}
    >
      {/* Cột trái */}
      <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        {/* 1️⃣ Khoảng thời gian */}
        <RangePicker
          style={{ width: "100%" }}
          value={
            filters.startDate && filters.endDate
              ? [dayjs(filters.startDate), dayjs(filters.endDate)]
              : undefined
          }
          onChange={(dates) => {
            const startDate = dates?.[0]?.format("YYYY-MM-DD");
            const endDate = dates?.[1]?.format("YYYY-MM-DD");

            const newFilters = {
              ...filters,
              startDate: startDate,
              endDate: endDate,
            };
            setFilters(newFilters);
            onChange(newFilters, groupBy);
          }}
        />

        {/* 2️⃣ Branch */}
        {branchesLoading ? (
          <Spin />
        ) : (
          <Select
            placeholder="Chọn chi nhánh"
            allowClear
            value={filters.branchId}
            onChange={(value) => handleChange("branchId", value)}
            style={{ width: "100%" }}
          >
            {branches.map((branch: any) => (
              <Option key={branch.id} value={branch.id}>
                {branch.name}
              </Option>
            ))}
          </Select>
        )}
        {branchesError && (
          <p style={{ color: "red", fontSize: 12 }}>
            Không thể tải danh sách chi nhánh
          </p>
        )}

        {/* 3️⃣ Min Total */}
        <Form.Item
          validateStatus={errors.minTotal ? "error" : ""}
          help={
            errors.minTotal
              ? errors.minTotal
              : formatCurrency(tempTotals.minTotal)
          }
          style={{ marginBottom: 0 }}
        >
          <InputNumber
            style={{ width: "100%" }}
            placeholder="Min Total"
            value={tempTotals.minTotal ?? filters.minTotal}
            onChange={(value) =>
              setTempTotals((prev) => ({ ...prev, minTotal: value }))
            }
            onBlur={() => handleBlur("minTotal")}
          />
        </Form.Item>

        {/* 4️⃣ Group By */}
        <Select
          placeholder="Nhóm theo"
          allowClear
          value={groupBy}
          onChange={(value) => handleChange("groupBy", value)}
          style={{ width: "100%" }}
        >
          <Option value="day">Theo ngày</Option>
          <Option value="month">Theo tháng</Option>
          <Option value="quarter">Theo quý</Option>
          <Option value="year">Theo năm</Option>
        </Select>
      </div>

      {/* Cột phải */}
      <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        {/* 5️⃣ Trạng thái */}
        <Select
          mode="multiple"
          allowClear
          placeholder="Trạng thái"
          value={filters.status || []}
          onChange={(values) => handleChange("status", values)}
          style={{ width: "100%" }}
        >
          <Option value="Pending">Pending</Option>
          <Option value="Confirmed">Confirmed</Option>
          <Option value="Processing">Processing</Option>
          <Option value="Shipped">Shipped</Option>
          <Option value="Delivered">Delivered</Option>
          <Option value="Completed">Completed</Option>
          <Option value="Canceled">Canceled</Option>
          <Option value="Failed">Failed</Option>
          <Option value="Refunded">Refunded</Option>
        </Select>

        {/* 6️⃣ User */}
        {usersLoading ? (
          <Spin />
        ) : (
          <Select
            placeholder="Chọn người dùng"
            allowClear
            value={filters.userId}
            onChange={(value) => handleChange("userId", value)}
            style={{ width: "100%" }}
            showSearch
            optionFilterProp="children"
          >
            {users.map((user: any) => (
              <Option key={user.id} value={user.id}>
                {user.full_name || user.name || `User #${user.id}`}
              </Option>
            ))}
          </Select>
        )}
        {usersError && (
          <p style={{ color: "red", fontSize: 12 }}>
            Không thể tải danh sách người dùng
          </p>
        )}

        {/* 7️⃣ Max Total */}
        <Form.Item
          validateStatus={errors.maxTotal ? "error" : ""}
          help={
            errors.maxTotal
              ? errors.maxTotal
              : formatCurrency(tempTotals.maxTotal)
          }
          style={{ marginBottom: 0 }}
        >
          <InputNumber
            style={{ width: "100%" }}
            placeholder="Max Total"
            value={tempTotals.maxTotal ?? filters.maxTotal}
            onChange={(value) =>
              setTempTotals((prev) => ({ ...prev, maxTotal: value }))
            }
            onBlur={() => handleBlur("maxTotal")}
          />
        </Form.Item>
        <div style={{ gridColumn: "1 / -1", textAlign: "right" }}>
          <Button onClick={handleReset}>Reset bộ lọc</Button>
        </div>
      </div>

      {/* 🔹 Nút Reset */}
      {/* <div style={{ gridColumn: '1 / -1', textAlign: 'right' }}>
                <Button onClick={handleReset}>Reset bộ lọc</Button>
            </div> */}
    </div>
  );
}
