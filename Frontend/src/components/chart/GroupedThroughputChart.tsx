import { Bar } from "react-chartjs-2";

const labels = ["SELECTs", "INSERTs", "UPDATEs", "DELETEs"];
const postgresData = [37.881965, 35.705991, 48.426407, 48.953743];
const sqlServerData = [39.011156, 35.436413, 47.678254, 48.851998];

export const data = {
  labels,
  datasets: [
    {
      label: "PostgreSQL (req/s)",
      data: postgresData,
      backgroundColor: "rgba(54, 162, 235, 0.6)", // Màu xanh
    },
    {
      label: "SQL Server (req/s)",
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
      text: "So sánh Thông lượng (Requests/giây) (Càng cao càng tốt)",
      font: { size: 16 },
    },
  },
  scales: {
    y: {
      beginAtZero: true,
      title: {
        display: true,
        text: "Số lượng Request / giây",
      },
    },
  },
};

export function GroupedThroughputChart() {
  return <Bar options={options} data={data} />;
}
