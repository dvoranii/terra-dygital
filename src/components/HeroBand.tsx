import type { ClientNode } from "../data";

interface HeroBandProps {
  nodes: ClientNode[];
  pendingCount: number;
  isOffline: boolean;
}

export default function HeroBand({
  nodes,
  pendingCount,
  isOffline,
}: HeroBandProps) {
  const avgLatency = Math.round(
    nodes.reduce((sum, n) => sum + n.latency, 0) / nodes.length
  );
  const avgLoss = (
    nodes.reduce((sum, n) => sum + n.packetLoss, 0) / nodes.length
  ).toFixed(1);

  const stats = [
    { label: "Sites Monitored", value: String(nodes.length) },
    { label: "Avg Latency", value: `${avgLatency} ms` },
    { label: "Avg Packet Loss", value: `${avgLoss}%` },
    { label: "Queued Events", value: String(pendingCount) },
  ];

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-navy-950 via-navy-900 to-navy-800 text-white">
      {/* Subtle grid texture */}
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.04)_1px,transparent_1px)] bg-[size:40px_40px]" />

      <div className="relative mx-auto max-w-[1600px] px-6 py-12 md:py-16">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-400">
          Live Site Monitoring
        </p>
        <h2 className="mt-3 max-w-3xl font-display text-4xl font-bold leading-tight md:text-5xl">
          Stay visible when the link drops.
        </h2>
        <p className="mt-4 max-w-2xl text-sm leading-relaxed text-slate-300 md:text-base">
          TerraView Ops buffers telemetry locally during an outage, shows the
          degraded state honestly, and syncs with an audit trail when
          connectivity returns.
        </p>

        {isOffline && (
          <p className="mt-5 inline-flex items-center gap-2 rounded-full border border-amber-400/40 bg-amber-400/10 px-3 py-1 text-xs font-medium text-amber-300">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-amber-300" />
            Offline mode: events are being buffered locally
          </p>
        )}

        <div
          data-tour="stats"
          className="mt-10 grid grid-cols-2 gap-y-8 md:grid-cols-4"
        >
          {stats.map((s) => (
            <div key={s.label} className="border-l border-white/15 pl-6">
              <div className="font-display text-4xl font-bold tabular-nums md:text-5xl">
                {s.value}
              </div>
              <div className="mt-1 text-xs text-slate-300">{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
