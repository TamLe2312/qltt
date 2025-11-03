import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

// Import 2 component biểu đồ nhóm
import { GroupedLatencyChart } from "../../../components/chart/GroupedLatencyChart";
import { GroupedThroughputChart } from "../../../components/chart/GroupedThroughputChart";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

function PerformanceChart() {
  return (
    <div style={{ padding: "20px", maxWidth: "1000px", margin: "auto" }}>
      <h1>Báo cáo Tổng hợp Hiệu suất (PostgreSQL vs SQL Server)</h1>

      <div
        style={{
          border: "1px solid #eee",
          padding: "15px",
          marginBottom: "30px",
        }}
      >
        <GroupedThroughputChart />
      </div>

      <div style={{ border: "1px solid #eee", padding: "15px" }}>
        <GroupedLatencyChart />
      </div>
    </div>
  );
}

export default PerformanceChart;
