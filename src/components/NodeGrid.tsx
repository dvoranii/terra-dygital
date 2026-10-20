import type { ClientNode } from "../data";

interface NodeGridProps {
  nodes: ClientNode[];
  isOffline: boolean;
}

export default function NodeGrid({ nodes, isOffline }: NodeGridProps) {
  return (
    <section>
      <div className="mb-4 flex items-end justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-500">
            01 / Sites
          </p>
          <h2 className="mt-1 font-display text-2xl font-bold text-ink">
            Global Environment Status
          </h2>
        </div>
        <span className="text-xs text-slate-500">
          {nodes.length} sites monitored
        </span>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {nodes.map((node) => (
          <div
            key={node.id}
            className={`rounded-xl border p-5 shadow-sm transition-colors ${
              isOffline
                ? "border-amber-300 bg-amber-50/60"
                : "border-slate-200 bg-white"
            }`}
          >
            <div className="mb-4 flex items-start justify-between gap-3">
              <div>
                <h3 className="font-display text-lg font-bold leading-tight text-ink">
                  {node.name}
                </h3>
                <p className="mt-0.5 text-xs text-slate-500">{node.type}</p>
              </div>
              <span
                className={`shrink-0 rounded-full border px-2.5 py-0.5 text-[10px] font-semibold ${
                  node.status === "Operational"
                    ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                    : "border-amber-300 bg-amber-100 text-amber-800"
                }`}
              >
                {node.status}
              </span>
            </div>

            <div
              className={`grid grid-cols-3 gap-3 border-t pt-4 ${
                isOffline ? "border-amber-200" : "border-slate-100"
              }`}
            >
              <Metric label="Latency" value={`${node.latency} ms`} />
              <Metric label="Packet Loss" value={`${node.packetLoss}%`} />
              <Metric
                label="Local Queue"
                value={`${node.queueCount}`}
                unit="events"
                highlight={node.queueCount > 0}
              />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function Metric({
  label,
  value,
  unit,
  highlight = false,
}: {
  label: string;
  value: string;
  unit?: string;
  highlight?: boolean;
}) {
  return (
    <div>
      <span className="block text-[10px] font-semibold uppercase tracking-wide text-slate-500">
        {label}
      </span>
      <span
        className={`font-display text-2xl font-bold tabular-nums ${
          highlight ? "text-amber-600" : "text-ink"
        }`}
      >
        {value}
      </span>
      {unit && <span className="ml-1 text-xs text-slate-500">{unit}</span>}
    </div>
  );
}
