import { useRef, useEffect } from 'react';
import {
    Chart,
    ChartConfiguration,
    ChartData,
    BarController,
    BarElement,
    LineController,
    LineElement,
    PointElement,
    CategoryScale,
    LinearScale,
    Tooltip,
    Legend,
} from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { OrderStatistics } from '../../../types';

// ✅ Hàm format tiền tệ
const formatCurrency = (amount: number, currency = 'VND'): string => {
    if (isNaN(amount)) return '-';
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency,
        maximumFractionDigits: 0,
    }).format(amount);
};

interface ReportChartProps {
    data: OrderStatistics[];
}

// ✅ Đăng ký Chart.js component + plugin
Chart.register(
    BarController,
    BarElement,
    LineController,
    LineElement,
    PointElement,
    CategoryScale,
    LinearScale,
    Tooltip,
    Legend,
    ChartDataLabels
);

export default function ReportChart({ data }: ReportChartProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const chartRef = useRef<Chart | null>(null);

    useEffect(() => {
        if (canvasRef.current) {
            // Hủy chart cũ
            if (chartRef.current) chartRef.current.destroy();

            // Chuẩn bị dữ liệu
            const chartData: ChartData<'bar' | 'line'> = {
                labels: data.map(d => new Date(d.period).toLocaleDateString('vi-VN')),
                datasets: [
                    {
                        type: 'bar' as const,
                        label: 'Tổng đơn hàng',
                        data: data.map(d => d.total_orders),
                        backgroundColor: 'rgba(54, 162, 235, 0.5)',
                        yAxisID: 'y-orders',
                    },
                    {
                        type: 'line' as const,
                        label: 'Tổng doanh thu',
                        data: data.map(d => d.total_amount),
                        borderColor: 'green',
                        backgroundColor: 'green',
                        fill: false,
                        yAxisID: 'y-revenue',
                        datalabels: {
                            display: true,
                            color: 'green',
                            align: 'top',
                            offset: 6,
                            font: { weight: 'bold' },
                            formatter: (value: any) => {
                                if (value == null || isNaN(Number(value))) return '-';
                                return formatCurrency(Number(value));
                            },
                        },
                    },
                ],
            };

            const config: ChartConfiguration<'bar' | 'line'> = {
                type: 'bar',
                data: chartData,
                options: {
                    responsive: true,
                    plugins: {
                        legend: { display: true },
                        tooltip: {
                            enabled: true,
                            callbacks: {
                                label: (context) => {
                                    const label = context.dataset.label ?? '';
                                    const raw = context.parsed?.y;
                                    if (raw == null || isNaN(Number(raw))) return `${label}: -`;
                                    const value = Number(raw);
                                    return label.toLowerCase().includes('doanh thu')
                                        ? `${label}: ${formatCurrency(value)}`
                                        : `${label}: ${value.toLocaleString()}`;
                                },
                            },
                        },
                        datalabels: {},
                    },
                    scales: {
                        'y-orders': {
                            type: 'linear',
                            position: 'left',
                            beginAtZero: true,
                            title: { display: true, text: 'Số đơn hàng' },
                        },
                        'y-revenue': {
                            type: 'linear',
                            position: 'right',
                            beginAtZero: true,
                            title: { display: true, text: 'Doanh thu (₫)' },
                            ticks: {
                                callback: (value) => {
                                    if (value == null || isNaN(Number(value as any))) return '';
                                    return formatCurrency(Number(value));
                                },
                            },
                        },
                        x: {
                            ticks: {
                                autoSkip: true,
                                maxRotation: 45,
                                minRotation: 0,
                            },
                        },
                    },
                },
            };

            chartRef.current = new Chart(canvasRef.current, config);
        }

        return () => {
            if (chartRef.current) chartRef.current.destroy();
        };
    }, [data]);

    return <canvas ref={canvasRef} />;
}
