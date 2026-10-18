import { useMemo } from "react";
import Header from "./components/Header";
import NodeGrid from "./components/NodeGrid";
import ThroughputChart from "./components/ThroughputChart";
import OfflineQueuePanel from "./components/OfflineQueuePanel";
import SecurityFeed from "./components/SecurityFeed";
import { useOfflineSync } from "./hooks/useOfflineSync";
import { useLiveMetrics } from "./hooks/useLiveMetrics";
import { INITIAL_NODES, type ClientNode } from "./data";

export default function App() {
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
  } = useOfflineSync();

  const { traffic, nodeMetrics } = useLiveMetrics(isOffline, flushCount);

  // Nodes are derived: static identity + live metrics + persisted queue counts
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
    <div className="flex min-h-screen flex-col bg-slate-950 font-sans text-slate-100">
      <Header
        isOffline={isOffline}
        deviceOffline={deviceOffline}
        onToggle={toggleOffline}
      />

      <main className="mx-auto w-full max-w-[1600px] flex-1 space-y-6 p-6">
        <NodeGrid nodes={nodes} isOffline={isOffline} />
        <ThroughputChart data={traffic} />

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <OfflineQueuePanel
            queue={queue}
            pendingCount={pendingCount}
            isOffline={isOffline}
            isSyncing={isSyncing}
          />
          <SecurityFeed events={securityEvents} />
        </div>
      </main>
    </div>
  );
}
