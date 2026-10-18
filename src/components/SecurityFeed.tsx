import {
  AlertTriangle,
  CheckCircle2,
  ShieldCheck,
  XCircle,
} from "lucide-react";
import type { SecurityEvent } from "../data";

export default function SecurityFeed({ events }: { events: SecurityEvent[] }) {
  return (
    <section className="flex h-[280px] flex-col rounded-xl border border-slate-800 bg-slate-900 p-5">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400">
          <ShieldCheck size={14} className="text-emerald-400" />
          SOC Security Feed (NIST CSF Aligned) → SOC Security Feed (NIST
          CSF-inspired)
        </h2>
        <span className="rounded border border-emerald-500/20 bg-emerald-500/10 px-2 py-0.5 text-[10px] text-emerald-400">
          Audit Ready → Audit Trail
        </span>
      </div>

      <div className="flex-1 space-y-2 overflow-y-auto rounded-lg border border-slate-800 bg-slate-950 p-3 text-xs">
        {events.map((event) => (
          <div
            key={event.id}
            className="flex items-center justify-between rounded border border-slate-800 bg-slate-900/60 p-2"
          >
            <div className="flex items-center gap-2">
              {event.type === "success" && (
                <CheckCircle2 size={14} className="text-emerald-400" />
              )}
              {event.type === "warning" && (
                <AlertTriangle size={14} className="text-amber-400" />
              )}
              {event.type === "error" && (
                <XCircle size={14} className="text-rose-400" />
              )}
              <span className="text-slate-300">{event.message}</span>
            </div>
            <span className="font-mono text-[10px] text-slate-500">
              {event.timestamp}
            </span>
          </div>
        ))}
      </div>

      <div className="mt-3 text-right text-xs text-slate-500">
        24/7 SOC Oversight Enabled
      </div>
    </section>
  );
}
