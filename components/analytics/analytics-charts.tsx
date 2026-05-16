"use client"

import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts"
import type { WeeklyPoint, FunnelPoint, PlatformPoint } from "@/services/analytics.service"
import { Legend } from "recharts"

const TOOLTIP_STYLE = {
  fontSize: 12,
  border: "1px solid var(--border)",
  borderRadius: 8,
  background: "var(--card)",
  color: "var(--foreground)",
}

const CURSOR_STYLE = { fill: "var(--foreground)", fillOpacity: 0.04 }

const TICK_STYLE = { fontSize: 11, fill: "var(--muted-foreground)" }

function Empty({ message }: { message: string }) {
  return (
    <div className="flex items-center justify-center h-full text-sm text-muted-foreground">
      {message}
    </div>
  )
}

export function ActivityChart({ data }: { data: WeeklyPoint[] }) {
  const hasData = data.some((d) => d.count > 0)
  if (!hasData) {
    return (
      <div className="h-60">
        <Empty message="No proposals submitted yet." />
      </div>
    )
  }

  return (
    <div className="h-60">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="var(--border)"
            vertical={false}
          />
          <XAxis
            dataKey="week"
            tick={TICK_STYLE}
            tickLine={false}
            axisLine={false}
            interval={2}
          />
          <YAxis
            allowDecimals={false}
            tick={TICK_STYLE}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip contentStyle={TOOLTIP_STYLE} cursor={CURSOR_STYLE} />
          <Bar
            dataKey="count"
            name="Proposals"
            fill="#6366f1"
            radius={[3, 3, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

export function RevenueChart({ data }: { data: WeeklyPoint[] }) {
  const hasData = data.some((d) => d.revenue > 0)
  if (!hasData) {
    return (
      <div className="h-60">
        <Empty message="No revenue recorded yet." />
      </div>
    )
  }

  return (
    <div className="h-60">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{ top: 4, right: 4, left: 8, bottom: 0 }}
        >
          <defs>
            <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#22c55e" stopOpacity={0.25} />
              <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="var(--border)"
            vertical={false}
          />
          <XAxis
            dataKey="week"
            tick={TICK_STYLE}
            tickLine={false}
            axisLine={false}
            interval={2}
          />
          <YAxis
            tick={TICK_STYLE}
            tickLine={false}
            axisLine={false}
            tickFormatter={(v: number) =>
              v >= 1000 ? `$${(v / 1000).toFixed(0)}k` : `$${v}`
            }
          />
          <Tooltip
            contentStyle={TOOLTIP_STYLE}
            cursor={CURSOR_STYLE}
            formatter={(v) => [`$${Number(v).toLocaleString()}`, "Revenue"]}
          />
          <Area
            type="monotone"
            dataKey="revenue"
            name="Revenue"
            stroke="#22c55e"
            fill="url(#revenueGrad)"
            strokeWidth={2}
            dot={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}

const FUNNEL_COLORS = ["#6366f1", "#f59e0b", "#22c55e"]

export function PlatformChart({ data }: { data: PlatformPoint[] }) {
  if (data.length === 0) {
    return (
      <div className="h-48">
        <Empty message="No multi-platform data yet." />
      </div>
    )
  }

  const height = Math.max(192, data.length * 52)

  return (
    <div style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 4, right: 16, left: 0, bottom: 4 }}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="var(--border)"
            horizontal={false}
          />
          <XAxis
            type="number"
            allowDecimals={false}
            tick={TICK_STYLE}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            type="category"
            dataKey="platform"
            tick={TICK_STYLE}
            tickLine={false}
            axisLine={false}
            width={80}
          />
          <Tooltip contentStyle={TOOLTIP_STYLE} cursor={CURSOR_STYLE} />
          <Legend
            wrapperStyle={{ fontSize: 12, color: "var(--muted-foreground)" }}
          />
          <Bar dataKey="sent" name="Sent" fill="#6366f1" radius={[0, 3, 3, 0]} />
          <Bar dataKey="won" name="Won" fill="#22c55e" radius={[0, 3, 3, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

export function FunnelChart({ data }: { data: FunnelPoint[] }) {
  const hasData = data.some((d) => d.count > 0)
  if (!hasData) {
    return (
      <div className="h-48">
        <Empty message="No applications to show." />
      </div>
    )
  }

  return (
    <div className="h-48">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 4, right: 16, left: 0, bottom: 0 }}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="var(--border)"
            horizontal={false}
          />
          <XAxis
            type="number"
            allowDecimals={false}
            tick={TICK_STYLE}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            type="category"
            dataKey="status"
            tick={TICK_STYLE}
            tickLine={false}
            axisLine={false}
            width={85}
          />
          <Tooltip contentStyle={TOOLTIP_STYLE} cursor={CURSOR_STYLE} />
          <Bar dataKey="count" name="Count" radius={[0, 3, 3, 0]}>
            {data.map((_, i) => (
              <Cell key={i} fill={FUNNEL_COLORS[i % FUNNEL_COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
