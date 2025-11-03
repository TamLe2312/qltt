import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { OrderFilters, OrderStatistics, GroupBy } from "../../../types";
import FiltersPanel from "./FiltersPanel";
import ReportChart from "./ReportChart";
import { postApi } from "../../../utils";
import Card from "../../ui/data-display/Card";
import CountUp from "react-countup";

const DEFAULT_FILTERS: { filters: OrderFilters; groupBy: GroupBy } = {
  filters: {
    branchId: 1,
  },
  groupBy: "month",
};

// Kiểu dữ liệu trả về từ API
interface OrdersStatisticsResponse {
  data: { items: OrderStatistics[] };
  status: string;
  message: string;
}

export default function ReportContainer() {
  const [filters, setFilters] = useState<OrderFilters>(DEFAULT_FILTERS.filters);
  const [groupBy, setGroupBy] = useState<GroupBy>(DEFAULT_FILTERS.groupBy);

  const normalizeFilters = (f: OrderFilters): OrderFilters => {
    const normalized = { ...f };
    if (normalized.status && !Array.isArray(normalized.status)) {
      normalized.status = [normalized.status];
    }

    Object.keys(normalized).forEach((k) => {
      if (
        normalized[k as keyof OrderFilters] === null ||
        normalized[k as keyof OrderFilters] === undefined ||
        normalized[k as keyof OrderFilters] === ""
      ) {
        delete normalized[k as keyof OrderFilters];
      }
    });

    return normalized;
  };

  const getOrders = async (): Promise<OrdersStatisticsResponse> => {
    const body = {
      filters: normalizeFilters(filters),
      groupBy,
    };
    return postApi<OrdersStatisticsResponse>(
      `${process.env.REACT_APP_API_URL}/api/orders/statistics`,
      body
    );
  };

  const {
    data: apiResponse,
    isLoading,
    isError,
  } = useQuery<OrdersStatisticsResponse, Error>({
    queryKey: ["orderStatistics", filters, groupBy],
    queryFn: getOrders,
  });

  const chartData: OrderStatistics[] = apiResponse?.data.items ?? [];

  return (
    <div>
      <FiltersPanel
        onChange={(newFilters: OrderFilters, newGroupBy?: GroupBy) => {
          setFilters(newFilters);
          if (newGroupBy) setGroupBy(newGroupBy);
        }}
      />

      <Card className="mt-6 p-4">
        {isLoading && <p>Loading...</p>}
        {isError && <p>Error loading data</p>}

        {!isLoading && !isError && <ReportChart data={chartData} />}

        {/* ✅ Box thống kê tổng quan */}
        {!isLoading && !isError && chartData.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 my-6">
            {/* Tổng đơn hàng */}
            <div className="bg-white rounded-2xl shadow p-4 flex flex-col items-center justify-center">
              <p className="text-sm text-gray-500">Tổng đơn hàng</p>
              <p className="text-2xl font-semibold text-blue-600 break-words text-center">
                <CountUp
                  end={chartData.reduce(
                    (sum, d) => sum + Number(d.total_orders),
                    0
                  )}
                  duration={2}
                  separator="."
                />
              </p>
            </div>

            {/* Tổng doanh thu */}
            <div className="bg-white rounded-2xl shadow p-4 flex flex-col items-center justify-center">
              <p className="text-sm text-gray-500">Tổng doanh thu</p>
              <p className="text-2xl font-semibold text-green-600 break-words text-center">
                <CountUp
                  end={chartData.reduce(
                    (sum, d) => sum + Number(d.total_amount),
                    0
                  )}
                  prefix="đ"
                  duration={2}
                  separator="."
                />
              </p>
            </div>

            {/* Trung bình doanh thu / đơn */}
            <div className="bg-white rounded-2xl shadow p-4 flex flex-col items-center justify-center">
              <p className="text-sm text-gray-500">
                Doanh thu trung bình / đơn
              </p>
              <p className="text-2xl font-semibold text-indigo-600 break-words text-center">
                {(() => {
                  const totalOrders = chartData.reduce(
                    (s, d) => s + Number(d.total_orders),
                    0
                  );
                  const totalAmount = chartData.reduce(
                    (s, d) => s + Number(d.total_amount),
                    0
                  );
                  return totalOrders > 0 ? (
                    <CountUp
                      end={totalAmount / totalOrders}
                      prefix="đ"
                      duration={2}
                      separator="."
                    />
                  ) : (
                    "-"
                  );
                })()}
              </p>
            </div>

            {/* Mức tăng/giảm gần nhất */}
            <div className="bg-white rounded-2xl shadow p-4 flex flex-col items-center justify-center">
              <p className="text-sm text-gray-500">Mức tăng trưởng</p>
              {(() => {
                if (chartData.length < 2) {
                  return (
                    <p className="text-2xl font-semibold text-gray-400">0%</p>
                  );
                }

                const last = chartData[chartData.length - 1];
                const prev = chartData[chartData.length - 2];

                const lastAmount = Number(last?.total_amount);
                const prevAmount = Number(prev?.total_amount);

                let change = 0;

                if (
                  !isNaN(lastAmount) &&
                  !isNaN(prevAmount) &&
                  prevAmount !== 0 &&
                  isFinite(lastAmount) &&
                  isFinite(prevAmount)
                ) {
                  change = ((lastAmount - prevAmount) / prevAmount) * 100;
                }

                const isPositive = change >= 0;

                return (
                  <p
                    className={`text-2xl font-semibold break-words text-center ${
                      change === 0
                        ? "text-gray-400"
                        : isPositive
                        ? "text-emerald-600"
                        : "text-red-600"
                    }`}
                  >
                    {`${change >= 0 ? "+" : ""}`}
                    <CountUp
                      end={change}
                      duration={2}
                      decimals={1}
                      decimal="."
                    />
                    %
                  </p>
                );
              })()}
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
