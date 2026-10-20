import {
  Compass,
  ScrollText,
  ShieldAlert,
  ShieldCheck,
  Wifi,
  WifiOff,
} from "lucide-react";
import TerraLogo from "../assets/terra.svg";

interface HeaderProps {
  isOffline: boolean;
  deviceOffline: boolean;
  onToggle: () => void;
  onOpenLog: () => void;
  onStartTour: () => void;
  logCount: number;
}

export default function Header({
  isOffline,
  deviceOffline,
  onToggle,
  onOpenLog,
  onStartTour,
  logCount,
}: HeaderProps) {
  const connectionLabel = deviceOffline
    ? "Offline (Device Network)"
    : isOffline
    ? "Offline (Simulated)"
    : "Online (Live Sync)";

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-[1600px] items-center justify-between gap-4 px-6 py-3">
        <div className="flex items-center gap-4">
          <img
            src={TerraLogo}
            alt="Terra Dygital"
            className="block h-9 w-auto"
          />

          <div className="hidden border-l border-slate-200 pl-4 md:block">
            <div className="flex items-center gap-2">
              <h1 className="font-display text-xl font-bold leading-none text-ink">
                TerraView Ops
              </h1>
              <span className="rounded border border-brand-100 bg-brand-50 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-brand-600">
                Concept demo
              </span>
            </div>
            <p className="mt-0.5 text-xs text-slate-500">
              Site monitoring that keeps working offline
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div role="status" className="hidden items-center gap-2 xl:flex">
            {isOffline ? (
              <ShieldAlert className="text-amber-500" size={18} />
            ) : (
              <ShieldCheck className="text-emerald-500" size={18} />
            )}
            <span className="text-xs font-medium text-slate-600">
              SOC Status:{" "}
              <span
                className={`font-semibold ${
                  isOffline ? "text-amber-600" : "text-emerald-600"
                }`}
              >
                {isOffline ? "Degraded (Local Buffering)" : "Operational"}
              </span>
            </span>
          </div>

          <button
            onClick={onStartTour}
            aria-label="Take a tour"
            className="flex items-center gap-2 rounded-md border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition-colors hover:border-brand-500 hover:text-brand-600"
          >
            <Compass size={14} className="text-brand-600" />
            <span className="hidden lg:inline">Take a tour</span>
          </button>

          <button
            data-tour="log"
            onClick={onOpenLog}
            className="flex items-center gap-2 rounded-md border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition-colors hover:border-brand-500 hover:text-brand-600"
          >
            <ScrollText size={14} className="text-brand-600" />
            Activity Log
            {logCount > 0 && (
              <span className="rounded-full bg-brand-50 px-1.5 py-0.5 font-mono text-[10px] text-brand-700">
                {logCount}
              </span>
            )}
          </button>

          <button
            data-tour="toggle"
            onClick={onToggle}
            aria-pressed={isOffline}
            className={`flex items-center gap-2 rounded-md px-4 py-2 text-xs font-semibold shadow-sm transition-colors ${
              isOffline
                ? "border border-amber-300 bg-amber-100 text-amber-800 hover:bg-amber-200"
                : "bg-brand-600 text-white hover:bg-brand-700"
            }`}
          >
            {isOffline ? <WifiOff size={14} /> : <Wifi size={14} />}
            {connectionLabel}
          </button>
        </div>
      </div>
    </header>
  );
}
