import { ShieldAlert, ShieldCheck, Wifi, WifiOff } from "lucide-react";
import TerraLogo from "../assets/terra.svg";

interface HeaderProps {
  isOffline: boolean;
  deviceOffline: boolean;
  onToggle: () => void;
}

export default function Header({
  isOffline,
  deviceOffline,
  onToggle,
}: HeaderProps) {
  const connectionLabel = deviceOffline
    ? "OFFLINE (Device Network)"
    : isOffline
    ? "OFFLINE (Simulated Queue)"
    : "ONLINE (Live Sync)";

  return (
    <header className="sticky top-0 z-50 flex items-center justify-between border-b border-slate-800 bg-slate-900/85 px-6 py-3 backdrop-blur">
      <div className="flex items-center gap-4">
        <div className="flex items-center rounded-lg bg-white px-4 py-2 shadow-sm">
          <img
            src={TerraLogo}
            alt="Terra Dygital Logo"
            className="block h-16 w-auto object-contain"
          />
        </div>

        <div className="hidden border-l border-slate-800 pl-4 md:block">
          <div className="flex items-center gap-2">
            <h1 className="text-base font-bold tracking-tight text-white">
              TerraView Ops
            </h1>
            <span className="rounded border border-cyan-500/20 bg-cyan-500/10 px-1.5 py-0.5 font-mono text-[10px] font-normal text-cyan-400">
              v2.4
            </span>
          </div>
          <p className="text-xs text-slate-400">
            Enterprise Infrastructure &amp; Telemetry
          </p>
        </div>
      </div>

      <div className="flex items-center gap-6">
        <div className="flex items-center gap-3 rounded-lg border border-slate-800 bg-slate-950/80 px-3.5 py-1.5">
          <span className="text-xs font-medium text-slate-400">
            Network Connection:
          </span>
          <button
            onClick={onToggle}
            aria-pressed={isOffline}
            className={`flex items-center gap-1.5 rounded border px-3 py-1 text-xs font-semibold transition-all ${
              isOffline
                ? "border-amber-500/30 bg-amber-500/20 text-amber-400"
                : "border-emerald-500/30 bg-emerald-500/20 text-emerald-400"
            }`}
          >
            {isOffline ? <WifiOff size={13} /> : <Wifi size={13} />}
            {connectionLabel}
          </button>
        </div>

        <div
          role="status"
          className="flex items-center gap-2 border-l border-slate-800 pl-6"
        >
          {isOffline ? (
            <ShieldAlert className="text-amber-400" size={20} />
          ) : (
            <ShieldCheck className="text-cyan-400" size={20} />
          )}
          <span className="text-xs font-medium text-slate-300">
            SOC Status:{" "}
            <span
              className={`font-semibold transition-colors ${
                isOffline ? "text-amber-400" : "text-emerald-400"
              }`}
            >
              {isOffline ? "Degraded (Local Buffering)" : "Operational"}
            </span>
          </span>
        </div>
      </div>
    </header>
  );
}
