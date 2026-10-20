import { useCallback, useEffect, useRef, useState } from "react";
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
import type { LogFn } from "./useActivityLog";

export type { QueuedEvent as QueueItem } from "../lib/queueDB";

const MAX_VISIBLE_QUEUE = 15;
const ENQUEUE_INTERVAL_MS = 2500;
const FLUSH_DURATION_MS = 1200;

const errMessage = (err: unknown) =>
  err instanceof Error ? err.message : String(err);

export function useOfflineSync(log: LogFn) {
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

  // Latest value for log messages without re-triggering effects
  const deviceOfflineRef = useRef(deviceOffline);
  useEffect(() => {
    deviceOfflineRef.current = deviceOffline;
  }, [deviceOffline]);

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
      log("error", "storage", `IndexedDB read failed: ${errMessage(err)}`);
    }
  }, [log]);

  useEffect(() => {
    void refreshQueue();
  }, [refreshQueue]);

  // Log once per page load if events survived from a previous session
  const startupLogged = useRef(false);
  useEffect(() => {
    if (startupLogged.current) return;
    startupLogged.current = true;
    (async () => {
      try {
        const count = await countEvents();
        if (count > 0) {
          log(
            "info",
            "queue",
            `Session restored: ${count} queued events recovered from IndexedDB`
          );
        }
      } catch (err) {
        log("error", "storage", `IndexedDB read failed: ${errMessage(err)}`);
      }
    })();
  }, [log]);

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

  // Log the moment connectivity comes back
  const prevOffline = useRef(isOffline);
  useEffect(() => {
    if (prevOffline.current && !isOffline) {
      log("success", "network", "Connectivity restored");
    }
    prevOffline.current = isOffline;
  }, [isOffline, log]);

  // Offline: buffer events into IndexedDB, each charged to one node
  useEffect(() => {
    if (!isOffline) return;

    setIsSyncing(false);
    const source = deviceOfflineRef.current
      ? "device network offline"
      : "simulated outage";
    addSecurityEvent(
      "warning",
      "Connectivity lost: switching to local event buffering"
    );
    log(
      "warning",
      "network",
      `Connectivity lost (${source}). Local buffering enabled.`
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
        log("info", "queue", `Buffered event #${eventId} for ${node.name}`);
      } catch (err) {
        console.error("IndexedDB write failed", err);
        log("error", "storage", `IndexedDB write failed: ${errMessage(err)}`);
      }
    }, ENQUEUE_INTERVAL_MS);

    return () => clearInterval(interval);
  }, [isOffline, addSecurityEvent, refreshQueue, log]);

  // Online: flush whatever is in IndexedDB (including leftovers from a refresh)
  useEffect(() => {
    if (isOffline) return;

    let cancelled = false;
    let flushing = false;
    let timeout: ReturnType<typeof setTimeout> | undefined;

    (async () => {
      try {
        const count = await countEvents();
        if (cancelled || count === 0) return;

        flushing = true;
        setIsSyncing(true);
        log("info", "sync", `Sync started: ${count} queued events`);

        timeout = setTimeout(async () => {
          try {
            await clearEvents();
            await refreshQueue();
            flushing = false;
            setIsSyncing(false);
            setFlushCount((c) => c + 1);
            addSecurityEvent(
              "success",
              `Background Sync Engine: ${count} queued events flushed successfully via HTTPS`
            );
            log(
              "success",
              "sync",
              `Sync complete: ${count} events flushed (simulated endpoint)`
            );
          } catch (err) {
            flushing = false;
            setIsSyncing(false);
            log("error", "sync", `Sync failed: ${errMessage(err)}`);
          }
        }, FLUSH_DURATION_MS);
      } catch (err) {
        console.error("IndexedDB flush failed", err);
        log("error", "storage", `IndexedDB flush failed: ${errMessage(err)}`);
      }
    })();

    return () => {
      cancelled = true;
      clearTimeout(timeout);
      if (flushing) {
        log(
          "warning",
          "sync",
          "Sync interrupted: connection lost mid-flush. Events kept in queue for retry."
        );
      }
    };
  }, [isOffline, addSecurityEvent, refreshQueue, log]);

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
