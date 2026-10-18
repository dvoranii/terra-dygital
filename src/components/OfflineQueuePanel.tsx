import { Database, RefreshCw } from "lucide-react";
import type { QueueItem } from "../hooks/useOfflineSync";

interface OfflineQueuePanelProps {
  queue: QueueItem[];
  pendingCount: number;
  isOffline: boolean;
  isSyncing: boolean;
}

export default function OfflineQueuePanel({
  queue,
  pendingCount,
  isOffline,
  isSyncing,
}: OfflineQueuePanelProps) {
  return (
    <section className="flex h-[280px] flex-col rounded-xl border border-slate-800 bg-slate-900 p-5">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400">
          <Database size={14} className="text-amber-400" />
          Offline Sync Queue (IndexedDB Simulation)
        </h2>
        {isSyncing && (
          <span className="flex items-center gap-1 text-xs text-cyan-400">
            <RefreshCw size={12} className="animate-spin" />
            Syncing to cloud...
          </span>
        )}
      </div>

      <div className="flex-1 space-y-2 overflow-y-auto rounded-lg border border-slate-800 bg-slate-950 p-3 font-mono text-xs">
        {queue.length === 0 ? (
          <div className="flex h-full items-center justify-center italic text-slate-600">
            Queue empty. All client telemetry synced to server.
          </div>
        ) : (
          queue.map((item) => (
            <div
              key={item.id}
              className="rounded border border-amber-500/10 bg-amber-500/5 p-2 text-amber-400/90"
            >
              {item.text}
            </div>
          ))
        )}
      </div>

      <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
        <span>
          Status: {isOffline ? "Buffering Events Locally" : "Live Sync Active"}
        </span>
        <span>
          Pending Queue Size:{" "}
          <strong className="text-amber-400">{pendingCount}</strong> items
        </span>
      </div>
    </section>
  );
}
