"use client";

import { useState } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { TrendingUp, DollarSign } from "lucide-react";

const chartData7Days = [
  { label: "Mon", revenue: 1850, appointments: 8 },
  { label: "Tue", revenue: 2400, appointments: 11 },
  { label: "Wed", revenue: 3100, appointments: 14 },
  { label: "Thu", revenue: 2900, appointments: 12 },
  { label: "Fri", revenue: 4200, appointments: 18 },
  { label: "Sat", revenue: 3800, appointments: 16 },
  { label: "Sun", revenue: 2100, appointments: 9 },
];

const chartData30Days = [
  { label: "Week 1", revenue: 14200, appointments: 54 },
  { label: "Week 2", revenue: 18900, appointments: 68 },
  { label: "Week 3", revenue: 21500, appointments: 82 },
  { label: "Week 4", revenue: 24800, appointments: 95 },
];

const chartData12Months = [
  { label: "Jan", revenue: 18200, appointments: 80 },
  { label: "Feb", revenue: 21400, appointments: 92 },
  { label: "Mar", revenue: 24800, appointments: 104 },
  { label: "Apr", revenue: 22100, appointments: 98 },
  { label: "May", revenue: 26900, appointments: 115 },
  { label: "Jun", revenue: 29400, appointments: 128 },
  { label: "Jul", revenue: 28450, appointments: 124 },
  { label: "Aug", revenue: 31200, appointments: 135 },
  { label: "Sep", revenue: 33500, appointments: 142 },
  { label: "Oct", revenue: 35800, appointments: 150 },
  { label: "Nov", revenue: 38200, appointments: 162 },
  { label: "Dec", revenue: 42100, appointments: 180 },
];

export function RevenueChart() {
  const [range, setRange] = useState<"7D" | "30D" | "12M">("7D");

  const getData = () => {
    switch (range) {
      case "7D":
        return chartData7Days;
      case "30D":
        return chartData30Days;
      case "12M":
        return chartData12Months;
    }
  };

  const data = getData();

  return (
    <div className="rounded-2xl border border-border/60 bg-card/70 p-6 shadow-sm backdrop-blur-md">
      {/* Chart Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 border-b border-border/40 pb-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-500">
            <DollarSign className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-foreground">Revenue Analytics Overview</h3>
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-500">
                <TrendingUp className="h-3 w-3" />
                +14.2%
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              Analytical financial performance breakdown
            </p>
          </div>
        </div>

        {/* Date Range Toggle Pills */}
        <div className="flex items-center rounded-xl border border-border/60 bg-muted/40 p-1 self-start sm:self-auto">
          {(["7D", "30D", "12M"] as const).map((r) => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={`rounded-lg px-3 py-1 text-xs font-semibold transition-all ${
                range === r
                  ? "bg-card text-foreground shadow-xs border border-border/50"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {r === "7D" ? "7 Days" : r === "30D" ? "30 Days" : "12 Months"}
            </button>
          ))}
        </div>
      </div>

      {/* Recharts Area Container */}
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#4F46E5" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(148, 163, 184, 0.15)" />
            <XAxis
              dataKey="label"
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 11, fill: "var(--muted-foreground, #94a3b8)" }}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickFormatter={(val) => `$${val}`}
              tick={{ fontSize: 11, fill: "var(--muted-foreground, #94a3b8)" }}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="rounded-xl border border-border/80 bg-card p-3 shadow-xl text-xs space-y-1">
                      <p className="font-bold text-foreground">
                        {payload[0].payload.label}
                      </p>
                      <p className="font-semibold text-primary">
                        Revenue: ${payload[0].value?.toLocaleString()}
                      </p>
                      <p className="text-[11px] text-muted-foreground">
                        Appointments: {payload[0].payload.appointments}
                      </p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Area
              type="monotone"
              dataKey="revenue"
              stroke="#4F46E5"
              strokeWidth={2.5}
              fillOpacity={1}
              fill="url(#colorRevenue)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
