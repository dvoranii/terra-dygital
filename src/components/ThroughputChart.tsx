import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import type { TrafficPoint } from "../hooks/useLiveMetrics";

const THROUGHPUT_COLOR = "#1f6bdc"; // brand-600
const API_COLOR = "#14b8a6"; // teal, echoes the logo gradient

export default function ThroughputChart({ data }: { data: TrafficPoint[] }) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-500">
            02 / Throughput
          </p>
          <h2 className="mt-1 font-display text-2xl font-bold text-ink">
            Network &amp; API Activity (Live)
          </h2>
        </div>

        <div className="flex items-center gap-4 text-xs font-medium text-slate-600">
          <span className="flex items-center gap-1.5">
            <span
              className="h-2 w-2 rounded-full"
              style={{ backgroundColor: THROUGHPUT_COLOR }}
            />
            Throughput (Mbps)
          </span>
          <span className="flex items-center gap-1.5">
            <span
              className="h-2 w-2 rounded-full"
              style={{ backgroundColor: API_COLOR }}
            />
            API Requests / sec
          </span>
        </div>
      </div>

      <div className="h-[240px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis
              dataKey="time"
              stroke="#cbd5e1"
              tick={{ fill: "#64748b" }}
              tickLine={false}
              fontSize={11}
            />
            <YAxis
              stroke="#cbd5e1"
              tick={{ fill: "#64748b" }}
              tickLine={false}
              fontSize={11}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#ffffff",
                border: "1px solid #e2e8f0",
                borderRadius: "8px",
                fontSize: "12px",
                color: "#334155",
                boxShadow: "0 4px 12px rgba(15, 27, 61, 0.08)",
              }}
            />
            <Line
              type="monotone"
              dataKey="throughput"
              stroke={THROUGHPUT_COLOR}
              strokeWidth={2.5}
              dot={false}
              isAnimationActive={false}
            />
            <Line
              type="monotone"
              dataKey="apiRequests"
              stroke={API_COLOR}
              strokeWidth={2.5}
              dot={false}
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
