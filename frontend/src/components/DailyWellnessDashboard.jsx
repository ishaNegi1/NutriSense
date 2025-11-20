import React from "react";
import { Radar, Line, Pie } from "react-chartjs-2";
import {
  Chart,
  RadarController,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  Title,
  ArcElement,
} from "chart.js";

Chart.register(
  RadarController,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  Title,
  ArcElement
);

export default function DailyWellnessDashboard({ data }) {
  return (
    <div className="space-y-8">

      {/* Top Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Left side: Radar + Line */}
        <div className="lg:col-span-2 space-y-6">

          {/* Radar */}
          <Card title="Daily Health Radar">
            <div className="max-w-[500px] mx-auto">
              <Radar data={radarConfig(data.dailyRadar)} />
            </div>
          </Card>

          {/* Line Chart */}
          <Card title="Mood & Energy (Last 14 Days)">
            <div className="max-w-[600px] mx-auto">
              <Line data={lineConfig(data.trends)} />
            </div>
          </Card>

        </div>

        {/* Right side: Pie + Heatmap + Growth */}
        <div className="space-y-6">

          {/* Pie Chart */}
          <Card title="Diet Breakdown">
            <div className="max-w-[350px] mx-auto">
              <Pie data={pieConfig(data.dietBreakdown)} />
            </div>
          </Card>

          {/* Heatmap */}
          <Card title="Weekly Heatmap (Last 28 Days)">
            <HeatmapGrid days={data.weeklyQuality} />
          </Card>

          {/* Growth */}
          <Card title="Mini Growth Trend">
            <ul className="text-sm">
              {data.recentGrowth.map((g, i) => (
                <li key={i} className="flex justify-between py-1 border-b border-gray-200">
                  <span>{g.date}</span>
                  <span>{g.weight} kg</span>
                </li>
              ))}
            </ul>
          </Card>

        </div>
      </div>

      {/* Bottom Summary */}
      <Card title="Monthly Summary">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Summary label="Avg Health Score" value={data.monthlySummary.avgHealthScore} />
          <Summary label="Healthy Days" value={data.monthlySummary.healthyDays} />
          <Summary label="Junk Days" value={data.monthlySummary.junkDays} />
          <Summary label="Avg Sleep (hrs)" value={data.monthlySummary.avgSleep} />
        </div>
      </Card>
    </div>
  );
}

/* ------------------------ UI Components ------------------------ */

function Card({ title, children }) {
  return (
    <div className="bg-white border border-gray-300 rounded-lg p-4 shadow-sm">
      <h2 className="text-lg font-medium text-gray-700 mb-3">{title}</h2>
      {children}
    </div>
  );
}

function Summary({ label, value }) {
  return (
    <div className="border border-gray-300 rounded-lg p-3 bg-white text-center">
      <div className="text-sm text-gray-600">{label}</div>
      <div className="text-xl font-semibold text-green-700">{value}</div>
    </div>
  );
}

function HeatmapGrid({ days }) {
  return (
    <div className="grid grid-cols-7 gap-1">
      {days.map((d, i) => (
        <div
          key={i}
          title={`${d.date} • ${d.quality}`}
          className={`h-8 w-8 rounded-md flex items-center justify-center text-xs
            ${
              d.quality === "good"
                ? "bg-green-200 text-green-700"
                : d.quality === "mixed"
                ? "bg-yellow-200 text-yellow-700"
                : "bg-red-200 text-red-700"
            }
          `}
        >
          {new Date(d.date).getDate()}
        </div>
      ))}
    </div>
  );
}

/* ------------------------ Chart Configs ------------------------ */

function radarConfig(d) {
  return {
    labels: ["Diet", "Sleep", "Energy", "Activity", "Mood"],
    datasets: [
      {
        label: "Today",
        data: [d.diet, d.sleep, d.energy, d.activity, d.mood],
        borderColor: "#16a34a",
        backgroundColor: "rgba(34,197,94,0.25)",
        borderWidth: 2,
      },
    ],
  };
}

function pieConfig(p) {
  return {
    labels: ["Healthy", "Balanced", "Junk"],
    datasets: [
      {
        data: [p.healthy, p.balanced, p.junk],
        backgroundColor: ["#16a34a", "#facc15", "#dc2626"],
      },
    ],
  };
}

function lineConfig(trends) {
  return {
    labels: trends.map((t) => t.date),
    datasets: [
      {
        label: "Energy",
        data: trends.map((x) => x.energy),
        borderColor: "#16a34a",
        borderWidth: 2,
        tension: 0.4,
      },
      {
        label: "Mood",
        data: trends.map((x) => x.mood),
        borderColor: "#0ea5e9",
        borderWidth: 2,
        tension: 0.4,
      },
    ],
  };
}
