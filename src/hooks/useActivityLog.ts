import { useCallback, useEffect, useState } from "react";
import {
  addLogEntry,
  clearLogEntries,
  getLogEntries,
  MAX_LOGS,
  type LogCategory,
  type LogEntry,
  type LogLevel,
} from "../lib/queueDB";

export type LogFn = (
  level: LogLevel,
  category: LogCategory,
  message: string
) => void;

export function useActivityLog() {
  const [entries, setEntries] = useState<LogEntry[]>([]);

  // Load persisted entries, merging with anything logged before the load finished
  useEffect(() => {
    getLogEntries(MAX_LOGS)
      .then((loaded) => {
        setEntries((prev) => {
          const seen = new Set(prev.map((e) => e.id));
          return [...prev, ...loaded.filter((e) => !seen.has(e.id))]
            .sort((a, b) => b.createdAt - a.createdAt)
            .slice(0, MAX_LOGS);
        });
      })
      .catch((err) => console.error("Failed to load activity log", err));
  }, []);

  const log = useCallback<LogFn>((level, category, message) => {
    const entry: LogEntry = {
      id: crypto.randomUUID(),
      createdAt: Date.now(),
      level,
      category,
      message,
    };
    setEntries((prev) => [entry, ...prev].slice(0, MAX_LOGS));
    addLogEntry(entry).catch((err) =>
      console.error("Failed to persist log entry", err)
    );
  }, []);

  const clear = useCallback(async () => {
    try {
      await clearLogEntries();
      setEntries([]);
    } catch (err) {
      console.error("Failed to clear activity log", err);
    }
  }, []);

  return { entries, log, clear };
}
