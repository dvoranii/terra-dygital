import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Download,
  Info,
  Trash2,
  X,
  XCircle,
} from "lucide-react";
import type { LogCategory, LogEntry, LogLevel } from "../lib/queueDB";

type Filter = "all" | "issues" | LogCategory;

const FILTERS: { id: Filter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "issues", label: "Warnings & Errors" },
  { id: "network", label: "Network" },
  { id: "queue", label: "Queue" },
  { id: "sync", label: "Sync" },
  { id: "storage", label: "Storage" },
];

const LEVEL_STYLES: Record<
  LogLevel,
  { icon: typeof Info; color: string; badge: string }
> = {
  info: {
    icon: Info,
    color: "text-sky-600",
    badge: "border-sky-200 bg-sky-50 text-sky-700",
  },
  success: {
    icon: CheckCircle2,
    color: "text-emerald-600",
    badge: "border-emerald-200 bg-emerald-50 text-emerald-700",
  },
  warning: {
    icon: AlertTriangle,
    color: "text-amber-600",
    badge: "border-amber-200 bg-amber-50 text-amber-700",
  },
  error: {
    icon: XCircle,
    color: "text-rose-600",
    badge: "border-rose-200 bg-rose-50 text-rose-700",
  },
};

const formatStamp = (ms: number) =>
  new Date(ms).toLocaleString([], {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

interface ActivityLogDrawerProps {
  open: boolean;
  entries: LogEntry[];
  onClose: () => void;
  onClear: () => void;
}

export default function ActivityLogDrawer({
  open,
  entries,
  onClose,
  onClear,
}: ActivityLogDrawerProps) {
  const [filter, setFilter] = useState<Filter>("all");

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const visible = useMemo(() => {
    if (filter === "all") return entries;
    if (filter === "issues") {
      return entries.filter(
        (e) => e.level === "warning" || e.level === "error"
      );
    }
    return entries.filter((e) => e.category === filter);
  }, [entries, filter]);

  const exportJson = () => {
    const blob = new Blob([JSON.stringify(entries, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `terraview-activity-log-${new Date()
      .toISOString()
      .slice(0, 19)
      .replace(/[:T]/g, "-")}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60]">
      <button
        aria-label="Close activity log"
        onClick={onClose}
        className="absolute inset-0 cursor-default bg-navy-950/60 backdrop-blur-sm"
      />

      <aside
        role="dialog"
        aria-label="Activity log"
        className="absolute right-0 top-0 flex h-full w-full max-w-md flex-col bg-white shadow-2xl"
      >
        <div className="flex items-center justify-between bg-gradient-to-br from-navy-950 to-navy-800 px-5 py-4 text-white">
          <div>
            <h2 className="font-display text-xl font-bold leading-none">
              Activity Log
            </h2>
            <p className="mt-1 text-xs text-slate-300">
              {entries.length} entries · stored locally in this browser
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="rounded p-1 text-slate-300 transition-colors hover:bg-white/10 hover:text-white"
          >
            <X size={18} />
          </button>
        </div>

        <div className="flex flex-wrap gap-1.5 border-b border-slate-200 bg-white px-5 py-3">
          {FILTERS.map((f) => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              aria-pressed={filter === f.id}
              className={`rounded-full border px-2.5 py-1 text-[11px] font-medium transition-colors ${
                filter === f.id
                  ? "border-brand-600 bg-brand-600 text-white"
                  : "border-slate-200 bg-white text-slate-600 hover:border-brand-500 hover:text-brand-600"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        <div className="flex-1 space-y-2 overflow-y-auto bg-page px-5 py-4">
          {visible.length === 0 ? (
            <div className="flex h-full items-center justify-center text-center text-xs italic text-slate-500">
              {entries.length === 0
                ? "No activity yet. Toggle the network connection to generate entries."
                : "No entries match this filter."}
            </div>
          ) : (
            visible.map((entry) => {
              const style = LEVEL_STYLES[entry.level];
              const Icon = style.icon;
              return (
                <div
                  key={entry.id}
                  className="rounded-lg border border-slate-200 bg-white p-3 shadow-sm"
                >
                  <div className="mb-1 flex items-center justify-between gap-2">
                    <span className="flex items-center gap-1.5">
                      <Icon size={13} className={style.color} />
                      <span
                        className={`rounded border px-1.5 py-0.5 font-mono text-[10px] uppercase ${style.badge}`}
                      >
                        {entry.category}
                      </span>
                    </span>
                    <span className="font-mono text-[10px] text-slate-500">
                      {formatStamp(entry.createdAt)}
                    </span>
                  </div>
                  <p className="text-xs leading-relaxed text-slate-700">
                    {entry.message}
                  </p>
                </div>
              );
            })
          )}
        </div>

        <div className="flex items-center justify-between border-t border-slate-200 bg-white px-5 py-3">
          <button
            onClick={exportJson}
            disabled={entries.length === 0}
            className="flex items-center gap-1.5 rounded-md border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 transition-colors hover:border-brand-500 hover:text-brand-600 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Download size={13} />
            Export JSON
          </button>
          <button
            onClick={onClear}
            disabled={entries.length === 0}
            className="flex items-center gap-1.5 rounded-md border border-rose-300 px-3 py-1.5 text-xs font-semibold text-rose-600 transition-colors hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Trash2 size={13} />
            Clear log
          </button>
        </div>
      </aside>
    </div>
  );
}
