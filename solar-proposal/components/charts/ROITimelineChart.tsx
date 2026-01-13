"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";

interface ROITimelineChartProps {
  systemCost: number;
  annualSavings: number;
  breakEvenYears: number;
}

export function ROITimelineChart({
  systemCost,
  annualSavings,
  breakEvenYears,
}: ROITimelineChartProps) {
  // Generate 25 years of cumulative savings data
  const data = [];
  for (let year = 0; year <= 25; year++) {
    const cumulativeSavings = year * annualSavings;
    const netPosition = cumulativeSavings - systemCost;
    data.push({
      year: `God. ${year}`,
      yearNum: year,
      "Kumulativna ušteda": cumulativeSavings,
      "Neto pozicija": netPosition,
      "Cena sistema": systemCost,
    });
  }

  return (
    <div className="w-full h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{ top: 10, right: 10, left: 10, bottom: 10 }}
        >
          <defs>
            <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="colorLoss" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis
            dataKey="year"
            tick={{ fill: "#64748b", fontSize: 11 }}
            axisLine={{ stroke: "#cbd5e1" }}
            interval={4}
          />
          <YAxis
            tick={{ fill: "#64748b", fontSize: 12 }}
            axisLine={{ stroke: "#cbd5e1" }}
            tickFormatter={(value) => {
              if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
              if (value >= 1000) return `${(value / 1000).toFixed(0)}k`;
              if (value <= -1000000) return `${(value / 1000000).toFixed(1)}M`;
              if (value <= -1000) return `${(value / 1000).toFixed(0)}k`;
              return value;
            }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "white",
              border: "1px solid #e2e8f0",
              borderRadius: "8px",
              boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
            }}
            formatter={(value: number, name: string) => [
              `${value.toLocaleString("sr-RS")} RSD`,
              name,
            ]}
          />
          <ReferenceLine
            y={0}
            stroke="#94a3b8"
            strokeWidth={2}
            strokeDasharray="5 5"
            label={{
              value: "Tačka pokrića",
              fill: "#64748b",
              fontSize: 11,
              position: "right",
            }}
          />
          <Area
            type="monotone"
            dataKey="Neto pozicija"
            stroke="#22c55e"
            strokeWidth={3}
            fill="url(#colorProfit)"
            dot={false}
            activeDot={{ r: 6, fill: "#22c55e" }}
          />
          <ReferenceLine
            x={`God. ${breakEvenYears}`}
            stroke="#f8d26a"
            strokeWidth={2}
            strokeDasharray="5 5"
            label={{
              value: `Povrat: ${breakEvenYears} god.`,
              fill: "#102e5d",
              fontSize: 11,
              position: "top",
            }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
