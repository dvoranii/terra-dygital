import { openDB, type DBSchema, type IDBPDatabase } from "idb";

export interface QueuedEvent {
  id: string;
  nodeId?: string;
  text: string;
  createdAt: number;
}

export type LogLevel = "info" | "success" | "warning" | "error";
export type LogCategory = "network" | "queue" | "sync" | "storage";

export interface LogEntry {
  id: string;
  createdAt: number;
  level: LogLevel;
  category: LogCategory;
  message: string;
}

export const MAX_LOGS = 500;

interface TerraDB extends DBSchema {
  events: {
    key: string;
    value: QueuedEvent;
    indexes: { "by-created": number };
  };
  logs: {
    key: string;
    value: LogEntry;
    indexes: { "by-created": number };
  };
}

let dbPromise: Promise<IDBPDatabase<TerraDB>> | null = null;

function getDb() {
  dbPromise ??= openDB<TerraDB>("terraview-ops", 2, {
    upgrade(db, oldVersion) {
      if (oldVersion < 1) {
        const events = db.createObjectStore("events", { keyPath: "id" });
        events.createIndex("by-created", "createdAt");
      }
      if (oldVersion < 2) {
        const logs = db.createObjectStore("logs", { keyPath: "id" });
        logs.createIndex("by-created", "createdAt");
      }
    },
  });
  return dbPromise;
}

/* ---------- Offline event queue ---------- */

export async function addEvent(event: QueuedEvent): Promise<void> {
  const db = await getDb();
  await db.put("events", event);
}

export async function countEvents(): Promise<number> {
  const db = await getDb();
  return db.count("events");
}

/** Newest first */
export async function getRecentEvents(limit: number): Promise<QueuedEvent[]> {
  const db = await getDb();
  const index = db.transaction("events").store.index("by-created");
  const results: QueuedEvent[] = [];

  let cursor = await index.openCursor(null, "prev");
  while (cursor && results.length < limit) {
    results.push(cursor.value);
    cursor = await cursor.continue();
  }
  return results;
}

export async function clearEvents(): Promise<void> {
  const db = await getDb();
  await db.clear("events");
}

/** Pending event counts grouped by node id */
export async function countByNode(): Promise<Record<string, number>> {
  const db = await getDb();
  const all = await db.getAll("events");
  const counts: Record<string, number> = {};
  for (const e of all) {
    if (e.nodeId) counts[e.nodeId] = (counts[e.nodeId] ?? 0) + 1;
  }
  return counts;
}

/* ---------- Activity log ---------- */

export async function addLogEntry(entry: LogEntry): Promise<void> {
  const db = await getDb();
  const tx = db.transaction("logs", "readwrite");
  await tx.store.put(entry);

  // Keep the log bounded: drop the oldest entries beyond MAX_LOGS
  const count = await tx.store.count();
  let excess = count - MAX_LOGS;
  if (excess > 0) {
    let cursor = await tx.store.index("by-created").openCursor();
    while (cursor && excess > 0) {
      await cursor.delete();
      excess -= 1;
      cursor = await cursor.continue();
    }
  }
  await tx.done;
}

/** Newest first */
export async function getLogEntries(limit: number): Promise<LogEntry[]> {
  const db = await getDb();
  const index = db.transaction("logs").store.index("by-created");
  const results: LogEntry[] = [];

  let cursor = await index.openCursor(null, "prev");
  while (cursor && results.length < limit) {
    results.push(cursor.value);
    cursor = await cursor.continue();
  }
  return results;
}

export async function clearLogEntries(): Promise<void> {
  const db = await getDb();
  await db.clear("logs");
}
