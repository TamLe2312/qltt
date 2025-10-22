import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { OrderFilters, OrderStatistics, GroupBy } from '../../../types';
import FiltersPanel from './FiltersPanel';
import ReportChart from './ReportChart';
import { formatCurrency, postApi } from '../../../utils';
// ✅ Bộ lọc mặc định
const DEFAULT_FILTERS: { filters: OrderFilters; groupBy: GroupBy } = {
    filters: {},
    groupBy: 'month',
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

    // Function POST Orders Statistics
    const getOrders = async (): Promise<OrdersStatisticsResponse> =>
        postApi<OrdersStatisticsResponse>(
            `${process.env.REACT_APP_API_URL}/api/orders/statistics`,
            { filters, groupBy }
        );

    // Lấy dữ liệu từ TanStack Query
    const { data: apiResponse, isLoading, isError } = useQuery<
        OrdersStatisticsResponse,
        Error
    >({
        queryKey: ['orderStatistics', filters, groupBy],
        queryFn: getOrders,
    });


    // ✅ Truy cập đúng items
    const chartData: OrderStatistics[] = apiResponse?.data.items ?? [];

    return (
        <div>
            <FiltersPanel
                onChange={(newFilters: OrderFilters, newGroupBy?: GroupBy) => {
                    setFilters(newFilters);
                    if (newGroupBy) setGroupBy(newGroupBy);
                }}
            />

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
                            {chartData
                                .reduce((sum, d) => sum + Number(d.total_orders), 0)
                                .toLocaleString()}
                        </p>
                    </div>

                    {/* Tổng doanh thu */}
                    <div className="bg-white rounded-2xl shadow p-4 flex flex-col items-center justify-center">
                        <p className="text-sm text-gray-500">Tổng doanh thu</p>
                        <p className="text-2xl font-semibold text-green-600 break-words text-center">
                            {formatCurrency(
                                chartData.reduce((sum, d) => sum + Number(d.total_amount), 0)
                            )}
                        </p>
                    </div>

                    {/* Trung bình doanh thu / đơn */}
                    <div className="bg-white rounded-2xl shadow p-4 flex flex-col items-center justify-center">
                        <p className="text-sm text-gray-500">Doanh thu trung bình / đơn</p>
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
                                return totalOrders > 0
                                    ? formatCurrency(totalAmount / totalOrders)
                                    : '-';
                            })()}
                        </p>
                    </div>

                    {/* Mức tăng/giảm gần nhất */}
                    <div className="bg-white rounded-2xl shadow p-4 flex flex-col items-center justify-center">
                        <p className="text-sm text-gray-500">Mức tăng trưởng</p>
                        <p
                            className={`text-2xl font-semibold break-words text-center ${(() => {
                                if (chartData.length < 2) return 'text-gray-400';
                                const last = chartData[chartData.length - 1];
                                const prev = chartData[chartData.length - 2];
                                const change =
                                    ((Number(last.total_amount) - Number(prev.total_amount)) /
                                        Number(prev.total_amount)) *
                                    100;
                                return change >= 0 ? 'text-emerald-600' : 'text-red-600';
                            })()}`}
                        >
                            {(() => {
                                if (chartData.length < 2) return 'N/A';
                                const last = chartData[chartData.length - 1];
                                const prev = chartData[chartData.length - 2];
                                const change =
                                    ((Number(last.total_amount) - Number(prev.total_amount)) /
                                        Number(prev.total_amount)) *
                                    100;
                                return `${change >= 0 ? '+' : ''}${change.toFixed(1)}%`;
                            })()}
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}
