import { Server } from "lucide-react";
import type { ClientNode } from "../data";

interface NodeGridProps {
  nodes: ClientNode[];
  isOffline: boolean;
}

export default function NodeGrid({ nodes, isOffline }: NodeGridProps) {
  return (
    <section>
      <div className="mb-3 flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400">
          <Server size={14} className="text-cyan-400" />
          Global Environment Status
        </h2>
        <span className="text-xs text-slate-500">
          {nodes.length} Active Nodes Monitored
        </span>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {nodes.map((node) => (
          <div
            key={node.id}
            className={`rounded-xl border bg-slate-900 p-4 transition-all ${
              isOffline
                ? "border-amber-500/30 shadow-lg shadow-amber-950/20"
                : "border-slate-800"
            }`}
          >
            <div className="mb-3 flex items-start justify-between">
              <div>
                <h3 className="text-sm font-semibold text-slate-100">
                  {node.name}
                </h3>
                <p className="text-xs text-slate-500">{node.type}</p>
              </div>
              <span
                className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold ${
                  node.status === "Operational"
                    ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-400"
                    : "border-amber-500/20 bg-amber-500/10 text-amber-400"
                }`}
              >
                {node.status}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 border-t border-slate-800/60 pt-2 text-xs">
              <Metric label="LATENCY" value={`${node.latency} ms`} />
              <Metric label="PACKET LOSS" value={`${node.packetLoss}%`} />
              <Metric
                label="LOCAL QUEUE"
                value={`${node.queueCount} events`}
                accent
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
  accent = false,
}: {
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div>
      <span className="block text-[10px] text-slate-500">{label}</span>
      <span
        className={`font-mono font-semibold ${
          accent ? "text-amber-400" : "text-slate-200"
        }`}
      >
        {value}
      </span>
    </div>
  );
}
