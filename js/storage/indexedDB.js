const DB_NAME = 'GlobalBusinessEmpire';
const DB_VERSION = 1;
const STORE_SAVES = 'saves';
const STORE_BACKUPS = 'backups';

let dbPromise = null;

function openDB() {
  if (dbPromise) return dbPromise;
  dbPromise = new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onerror = () => reject(req.error);
    req.onsuccess = () => resolve(req.result);
    req.onupgradeneeded = (e) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains(STORE_SAVES)) {
        const saves = db.createObjectStore(STORE_SAVES, { keyPath: 'key' });
        saves.createIndex('userId', 'userId', { unique: false });
        saves.createIndex('slot', 'slot', { unique: false });
      }
      if (!db.objectStoreNames.contains(STORE_BACKUPS)) {
        db.createObjectStore(STORE_BACKUPS, { keyPath: 'key' });
      }
    };
  });
  return dbPromise;
}

function tx(store, mode = 'readonly') {
  return openDB().then((db) => db.transaction(store, mode).objectStore(store));
}

export const IDB = {
  async get(key) {
    const store = await tx(STORE_SAVES);
    return new Promise((resolve, reject) => {
      const req = store.get(key);
      req.onsuccess = () => resolve(req.result?.data ?? null);
      req.onerror = () => reject(req.error);
    });
  },

  async put(key, data, meta = {}) {
    const store = await tx(STORE_SAVES, 'readwrite');
    return new Promise((resolve, reject) => {
      const req = store.put({ key, data, ...meta, updatedAt: Date.now() });
      req.onsuccess = () => resolve(true);
      req.onerror = () => reject(req.error);
    });
  },

  async delete(key) {
    const store = await tx(STORE_SAVES, 'readwrite');
    return new Promise((resolve, reject) => {
      const req = store.delete(key);
      req.onsuccess = () => resolve(true);
      req.onerror = () => reject(req.error);
    });
  },

  async listByUser(userId) {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const store = db.transaction(STORE_SAVES, 'readonly').objectStore(STORE_SAVES);
      const idx = store.index('userId');
      const req = idx.getAll(userId);
      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => reject(req.error);
    });
  },

  async backup(key, data) {
    const store = await tx(STORE_BACKUPS, 'readwrite');
    return new Promise((resolve, reject) => {
      const req = store.put({ key: `${key}-${Date.now()}`, data, createdAt: Date.now() });
      req.onsuccess = () => resolve(true);
      req.onerror = () => reject(req.error);
    });
  },
};

export function saveKey(userId, slot) {
  return `save-${userId}-slot-${slot}`;
}

export function metaKey(userId, slot) {
  return `meta-${userId}-slot-${slot}`;
}
