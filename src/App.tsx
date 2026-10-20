import { useMemo, useState } from "react";
import Header from "./components/Header";
import HeroBand from "./components/HeroBand";
import NodeGrid from "./components/NodeGrid";
import ThroughputChart from "./components/ThroughputChart";
import OfflineQueuePanel from "./components/OfflineQueuePanel";
import SecurityFeed from "./components/SecurityFeed";
import ActivityLogDrawer from "./components/ActivityLogDrawer";
import TourFinale from "./components/TourFinale";
import { useOfflineSync } from "./hooks/useOfflineSync";
import { useLiveMetrics } from "./hooks/useLiveMetrics";
import { useActivityLog } from "./hooks/useActivityLog";
import { useProductTour } from "./hooks/useProductTour";
import { INITIAL_NODES, type ClientNode } from "./data";

export default function App() {
  const [logOpen, setLogOpen] = useState(false);
  const { entries, log, clear } = useActivityLog();
  const { startTour, finaleOpen, closeFinale } = useProductTour();

  const {
    isOffline,
    deviceOffline,
    isSyncing,
    flushCount,
    queue,
    pendingCount,
    queueByNode,
    securityEvents,
    toggleOffline,
  } = useOfflineSync(log);

  const { traffic, nodeMetrics } = useLiveMetrics(isOffline, flushCount);

  const nodes = useMemo<ClientNode[]>(
    () =>
      INITIAL_NODES.map((n) => ({
        ...n,
        status: isOffline ? ("Degraded" as const) : ("Operational" as const),
        latency: nodeMetrics[n.id].latency,
        packetLoss: nodeMetrics[n.id].packetLoss,
        queueCount: queueByNode[n.id] ?? 0,
      })),
    [isOffline, nodeMetrics, queueByNode]
  );

  return (
    <div className="flex min-h-screen flex-col bg-page font-sans text-slate-700">
      <Header
        isOffline={isOffline}
        deviceOffline={deviceOffline}
        onToggle={toggleOffline}
        onOpenLog={() => setLogOpen(true)}
        onStartTour={startTour}
        logCount={entries.length}
      />

      <HeroBand
        nodes={nodes}
        pendingCount={pendingCount}
        isOffline={isOffline}
      />

      <main className="mx-auto w-full max-w-[1600px] flex-1 space-y-6 p-6">
        <div data-tour="nodes">
          <NodeGrid nodes={nodes} isOffline={isOffline} />
        </div>

        <div data-tour="chart">
          <ThroughputChart data={traffic} />
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div data-tour="queue">
            <OfflineQueuePanel
              queue={queue}
              pendingCount={pendingCount}
              isOffline={isOffline}
              isSyncing={isSyncing}
            />
          </div>
          <div data-tour="feed">
            <SecurityFeed events={securityEvents} />
          </div>
        </div>
      </main>

      <ActivityLogDrawer
        open={logOpen}
        entries={entries}
        onClose={() => setLogOpen(false)}
        onClear={clear}
      />

      <TourFinale open={finaleOpen} onClose={closeFinale} />
    </div>
  );
}
