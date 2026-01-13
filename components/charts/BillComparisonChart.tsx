"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { MonthlyUsage } from "@/lib/types";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "Maj", "Jun", "Jul", "Avg", "Sep", "Okt", "Nov", "Dec"];

interface BillComparisonChartProps {
  preSolar: MonthlyUsage;
  postSolar: MonthlyUsage;
}

export function BillComparisonChart({ preSolar, postSolar }: BillComparisonChartProps) {
  const data = MONTHS.map((month, index) => ({
    name: month,
    "Bez solara": preSolar[index + 1] || 0,
    "Sa solarom": postSolar[index + 1] || 0,
  }));

  return (
    <div className="w-full h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{ top: 10, right: 10, left: 10, bottom: 10 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis
            dataKey="name"
            tick={{ fill: "#64748b", fontSize: 12 }}
            axisLine={{ stroke: "#cbd5e1" }}
          />
          <YAxis
            tick={{ fill: "#64748b", fontSize: 12 }}
            axisLine={{ stroke: "#cbd5e1" }}
            tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "white",
              border: "1px solid #e2e8f0",
              borderRadius: "8px",
              boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
            }}
            formatter={(value: number) => [`${value.toLocaleString("sr-RS")} RSD`, ""]}
            labelStyle={{ fontWeight: "bold", marginBottom: "4px" }}
          />
          <Legend
            wrapperStyle={{ paddingTop: "20px" }}
            iconType="circle"
          />
          <Bar
            dataKey="Bez solara"
            fill="#f8d26a"
            radius={[4, 4, 0, 0]}
            maxBarSize={40}
          />
          <Bar
            dataKey="Sa solarom"
            fill="#102e5d"
            radius={[4, 4, 0, 0]}
            maxBarSize={40}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
