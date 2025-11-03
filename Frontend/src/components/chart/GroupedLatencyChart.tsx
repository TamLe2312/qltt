import { Bar } from "react-chartjs-2";

const labels = ["SELECTs", "INSERTs", "UPDATEs", "DELETEs"];
const postgresData = [4.62, 61.84, 65.49, 61.9];
const sqlServerData = [10.94, 75, 71.93, 63.6];

export const data = {
  labels,
  datasets: [
    {
      label: "PostgreSQL (ms)",
      data: postgresData,
      backgroundColor: "rgba(54, 162, 235, 0.6)", // Màu xanh
    },
    {
      label: "SQL Server (ms)",
      data: sqlServerData,
      backgroundColor: "rgba(255, 99, 132, 0.6)", // Màu đỏ
    },
  ],
};

export const options = {
  responsive: true,
  plugins: {
    legend: {
      position: "top" as const,
    },
    title: {
      display: true,
      text: "So sánh Độ trễ p(95) (Càng thấp càng tốt)",
      font: { size: 16 },
    },
  },
  scales: {
    y: {
      beginAtZero: true,
      title: {
        display: true,
        text: "Thời gian phản hồi (ms)",
      },
    },
  },
};

export function GroupedLatencyChart() {
  return <Bar options={options} data={data} />;
}
