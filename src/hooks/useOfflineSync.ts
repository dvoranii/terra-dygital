import { useCallback, useEffect, useState } from "react";
import {
  INITIAL_NODES,
  INITIAL_SECURITY_EVENTS,
  type SecurityEvent,
} from "../data";
import {
  addEvent,
  clearEvents,
  countByNode,
  countEvents,
  getRecentEvents,
  type QueuedEvent,
} from "../lib/queueDB";

export type { QueuedEvent as QueueItem } from "../lib/queueDB";

const MAX_VISIBLE_QUEUE = 15;
const ENQUEUE_INTERVAL_MS = 2500;
const FLUSH_DURATION_MS = 1200;

export function useOfflineSync() {
  const [simulatedOffline, setSimulatedOffline] = useState(false);
  const [browserOnline, setBrowserOnline] = useState(() => navigator.onLine);
  const [isSyncing, setIsSyncing] = useState(false);
  const [flushCount, setFlushCount] = useState(0);
  const [queue, setQueue] = useState<QueuedEvent[]>([]);
  const [pendingCount, setPendingCount] = useState(0);
  const [queueByNode, setQueueByNode] = useState<Record<string, number>>({});
  const [securityEvents, setSecurityEvents] = useState<SecurityEvent[]>(
    INITIAL_SECURITY_EVENTS
  );

  const deviceOffline = !browserOnline;
  const isOffline = simulatedOffline || deviceOffline;

  const addSecurityEvent = useCallback(
    (type: SecurityEvent["type"], message: string) => {
      setSecurityEvents((prev) => [
        {
          id: `sec-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          timestamp: new Date().toLocaleTimeString(),
          type,
          message,
        },
        ...prev,
      ]);
    },
    []
  );

  // IndexedDB is the source of truth; mirror it into React state
  const refreshQueue = useCallback(async () => {
    try {
      const [items, count, byNode] = await Promise.all([
        getRecentEvents(MAX_VISIBLE_QUEUE),
        countEvents(),
        countByNode(),
      ]);
      setQueue(items);
      setPendingCount(count);
      setQueueByNode(byNode);
    } catch (err) {
      console.error("IndexedDB read failed", err);
    }
  }, []);

  useEffect(() => {
    void refreshQueue();
  }, [refreshQueue]);

  useEffect(() => {
    const goOnline = () => setBrowserOnline(true);
    const goOffline = () => setBrowserOnline(false);
    window.addEventListener("online", goOnline);
    window.addEventListener("offline", goOffline);
    return () => {
      window.removeEventListener("online", goOnline);
      window.removeEventListener("offline", goOffline);
    };
  }, []);

  // Offline: buffer events into IndexedDB, each charged to one node
  useEffect(() => {
    if (!isOffline) return;

    setIsSyncing(false);
    addSecurityEvent(
      "warning",
      "Connectivity lost: switching to local event buffering"
    );

    const interval = setInterval(async () => {
      const node =
        INITIAL_NODES[Math.floor(Math.random() * INITIAL_NODES.length)];
      const eventId = Math.floor(Math.random() * 9000) + 1000;
      try {
        await addEvent({
          id: crypto.randomUUID(),
          nodeId: node.id,
          text: `Event #${eventId} [${node.name}]: Telemetry log saved to IndexedDB (Offline Queue)`,
          createdAt: Date.now(),
        });
        await refreshQueue();
      } catch (err) {
        console.error("IndexedDB write failed", err);
      }
    }, ENQUEUE_INTERVAL_MS);

    return () => clearInterval(interval);
  }, [isOffline, addSecurityEvent, refreshQueue]);

  // Online: flush whatever is in IndexedDB (including leftovers from a refresh)
  useEffect(() => {
    if (isOffline) return;

    let cancelled = false;
    let timeout: ReturnType<typeof setTimeout> | undefined;

    (async () => {
      try {
        const count = await countEvents();
        if (cancelled || count === 0) return;

        setIsSyncing(true);
        timeout = setTimeout(async () => {
          await clearEvents();
          await refreshQueue();
          setIsSyncing(false);
          setFlushCount((c) => c + 1); // signals "a flush just completed"
          addSecurityEvent(
            "success",
            `Background Sync Engine: ${count} queued events flushed successfully via HTTPS`
          );
        }, FLUSH_DURATION_MS);
      } catch (err) {
        console.error("IndexedDB flush failed", err);
      }
    })();

    return () => {
      cancelled = true;
      clearTimeout(timeout);
    };
  }, [isOffline, addSecurityEvent, refreshQueue]);

  const toggleOffline = useCallback(() => setSimulatedOffline((v) => !v), []);

  return {
    isOffline,
    deviceOffline,
    isSyncing,
    flushCount,
    queue,
    pendingCount,
    queueByNode,
    securityEvents,
    toggleOffline,
  };
}
