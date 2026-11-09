"use client";

import type { ReactNode } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { ProjectAnalytics } from "@/lib/dal/analytics";

const STATUS_META = [
  { key: "todo", label: "To Do", color: "#94a3b8" },
  { key: "in-progress", label: "In Progress", color: "#3b82f6" },
  { key: "in-review", label: "In Review", color: "#a855f7" },
  { key: "done", label: "Done", color: "#22c55e" },
] as const;

const PRIORITY_META = [
  { key: "low", label: "Low", color: "#94a3b8" },
  { key: "medium", label: "Medium", color: "#3b82f6" },
  { key: "high", label: "High", color: "#f97316" },
  { key: "urgent", label: "Urgent", color: "#ef4444" },
] as const;

function formatDay(date: string): string {
  return new Date(`${date}T00:00:00Z`).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });
}

interface TooltipProps {
  active?: boolean;
  payload?: { name?: string; value?: number }[];
  label?: string;
}

function ChartTooltip({ active, payload, label }: TooltipProps) {
  if (!active || !payload || payload.length === 0) return null;
  const item = payload[0];
  return (
    <div className="rounded-md border bg-card px-2.5 py-1.5 text-xs shadow-sm">
      <p className="font-medium">{label ?? item.name}</p>
      <p className="text-muted-foreground">{item.value}</p>
    </div>
  );
}

interface ChartCardProps {
  title: string;
  summary: string;
  rows: { label: string; value: number }[];
  children: ReactNode;
}

function ChartCard({ title, summary, rows, children }: ChartCardProps) {
  return (
    <figure className="rounded-xl border bg-card p-5">
      <figcaption className="mb-4 text-sm font-semibold">{title}</figcaption>
      <div
        role="img"
        aria-label={summary}
        className="h-56 text-muted-foreground"
      >
        {children}
      </div>
      <table className="sr-only">
        <caption>{title}</caption>
        <thead>
          <tr>
            <th scope="col">Category</th>
            <th scope="col">Count</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.label}>
              <th scope="row">{row.label}</th>
              <td>{row.value}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </figure>
  );
}

interface AnalyticsChartsProps {
  byStatus: ProjectAnalytics["byStatus"];
  byPriority: ProjectAnalytics["byPriority"];
  trend: ProjectAnalytics["trend"];
}

export default function AnalyticsCharts({
  byStatus,
  byPriority,
  trend,
}: AnalyticsChartsProps) {
  const statusData = STATUS_META.map((s) => ({
    name: s.label,
    value: byStatus[s.key],
    color: s.color,
  }));
  const priorityData = PRIORITY_META.map((p) => ({
    name: p.label,
    value: byPriority[p.key],
    color: p.color,
  }));
  const trendData = trend.map((t) => ({
    name: formatDay(t.date),
    completed: t.completed,
  }));

  const totalCompleted = trend.reduce((sum, t) => sum + t.completed, 0);

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      <ChartCard
        title="Tasks by status"
        summary={`Tasks by status: ${statusData
          .map((s) => `${s.name} ${s.value}`)
          .join(", ")}`}
        rows={statusData.map((s) => ({ label: s.name, value: s.value }))}
      >
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={statusData.filter((s) => s.value > 0)}
              dataKey="value"
              nameKey="name"
              innerRadius={50}
              outerRadius={80}
              paddingAngle={2}
            >
              {statusData
                .filter((s) => s.value > 0)
                .map((s) => (
                  <Cell key={s.name} fill={s.color} />
                ))}
            </Pie>
            <Tooltip content={<ChartTooltip />} />
          </PieChart>
        </ResponsiveContainer>
      </ChartCard>

      <ChartCard
        title="Tasks by priority"
        summary={`Tasks by priority: ${priorityData
          .map((p) => `${p.name} ${p.value}`)
          .join(", ")}`}
        rows={priorityData.map((p) => ({ label: p.name, value: p.value }))}
      >
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={priorityData} margin={{ left: -20, right: 8 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" strokeOpacity={0.2} />
            <XAxis dataKey="name" tick={{ fill: "currentColor", fontSize: 12 }} tickLine={false} axisLine={false} />
            <YAxis allowDecimals={false} tick={{ fill: "currentColor", fontSize: 12 }} tickLine={false} axisLine={false} />
            <Tooltip content={<ChartTooltip />} cursor={{ fill: "currentColor", fillOpacity: 0.08 }} />
            <Bar dataKey="value" radius={[4, 4, 0, 0]}>
              {priorityData.map((p) => (
                <Cell key={p.name} fill={p.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      <div className="lg:col-span-2">
        <ChartCard
          title="Tasks completed, last 14 days"
          summary={`${totalCompleted} tasks completed in the last 14 days`}
          rows={trendData.map((t) => ({ label: t.name, value: t.completed }))}
        >
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={trendData} margin={{ left: -20, right: 8 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" strokeOpacity={0.2} />
              <XAxis dataKey="name" tick={{ fill: "currentColor", fontSize: 12 }} tickLine={false} axisLine={false} interval="preserveStartEnd" />
              <YAxis allowDecimals={false} tick={{ fill: "currentColor", fontSize: 12 }} tickLine={false} axisLine={false} />
              <Tooltip content={<ChartTooltip />} />
              <Area type="monotone" dataKey="completed" stroke="#22c55e" fill="#22c55e" fillOpacity={0.2} strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
    </div>
  );
}