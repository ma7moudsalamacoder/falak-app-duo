// Single IndexedDB-backed key/value store for every piece of client-side
// persistence (auth token, locale, theme, remembered login, demo database).
// The app never uses localStorage/sessionStorage.
//
// IndexedDB is asynchronous, but a few call sites need a value synchronously
// (the axios Authorization header, the theme applied in App.vue). To support
// that we keep an in-memory mirror of every key and hydrate it once at boot
// via `ready()` — main.js awaits it before mounting. `getSync` then reads the
// mirror. Writes update the mirror immediately and persist to IndexedDB in the
// background, so the UI never blocks on disk.
import { openDB } from "idb";

const DB_NAME = "falak_app";
const STORE_NAME = "kv";
const DB_VERSION = 1;

let dbPromise = null;
function getDB() {
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains(STORE_NAME)) db.createObjectStore(STORE_NAME);
      },
    });
  }
  return dbPromise;
}

const mirror = new Map();
let readyPromise = null;

async function hydrate() {
  try {
    const db = await getDB();
    const keys = await db.getAllKeys(STORE_NAME);
    const values = await db.getAll(STORE_NAME);
    keys.forEach((key, index) => {
      // Don't clobber a value written while hydration was in flight.
      if (!mirror.has(key)) mirror.set(key, values[index]);
    });
  } catch {
    // IndexedDB unavailable (private mode / SSR / tests) — stay in-memory.
  }
}

// Resolves once the mirror has been populated from IndexedDB.
export function ready() {
  if (!readyPromise) readyPromise = hydrate();
  return readyPromise;
}

// Synchronous read from the in-memory mirror (populated after ready()).
export function getSync(key, fallback = null) {
  return mirror.has(key) ? mirror.get(key) : fallback;
}

// Asynchronous read — always reflects the persisted value.
export async function get(key, fallback = null) {
  await ready();
  return mirror.has(key) ? mirror.get(key) : fallback;
}

export async function set(key, value) {
  mirror.set(key, value);
  await ready();
  try {
    const db = await getDB();
    await db.put(STORE_NAME, value, key);
  } catch {
    // Persist failed — the in-memory mirror still holds the value.
  }
}

export async function remove(key) {
  mirror.delete(key);
  await ready();
  try {
    const db = await getDB();
    await db.delete(STORE_NAME, key);
  } catch {
    // Nothing persisted to remove.
  }
}

const storage = { ready, get, getSync, set, remove };
export default storage;
