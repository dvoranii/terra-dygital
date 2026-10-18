import { openDB, type DBSchema, type IDBPDatabase } from "idb";

export interface QueuedEvent {
  id: string;
  nodeId?: string;
  text: string;
  createdAt: number;
}

interface TerraDB extends DBSchema {
  events: {
    key: string;
    value: QueuedEvent;
    indexes: { "by-created": number };
  };
}

let dbPromise: Promise<IDBPDatabase<TerraDB>> | null = null;

function getDb() {
  dbPromise ??= openDB<TerraDB>("terraview-ops", 1, {
    upgrade(db) {
      const store = db.createObjectStore("events", { keyPath: "id" });
      store.createIndex("by-created", "createdAt");
    },
  });
  return dbPromise;
}

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

export async function countByNode(): Promise<Record<string, number>> {
  const db = await getDb();
  const all = await db.getAll("events");
  const counts: Record<string, number> = {};
  for (const e of all) {
    if (e.nodeId) counts[e.nodeId] = (counts[e.nodeId] ?? 0) + 1;
  }
  return counts;
}
