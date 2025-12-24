import { openDB, IDBPDatabase } from 'idb';
import { DB_NAME, DB_VERSION, SESSIONS_STORE, INDEXES, type BTMSDatabase } from './db';

// Singleton database instance
let dbInstance: IDBPDatabase<BTMSDatabase> | null = null;

/**
 * Open the IndexedDB database with proper schema setup
 */
export async function openDatabase(): Promise<IDBPDatabase<BTMSDatabase>> {
  if (dbInstance) {
    return dbInstance;
  }

  dbInstance = await openDB<BTMSDatabase>(DB_NAME, DB_VERSION, {
    upgrade(db) {
      // Create sessions object store if it doesn't exist
      if (!db.objectStoreNames.contains(SESSIONS_STORE)) {
        const store = db.createObjectStore(SESSIONS_STORE, {
          keyPath: 'id'
        });

        // Create indexes for efficient querying
        store.createIndex(INDEXES.createdAt, 'createdAt');
        store.createIndex(INDEXES.updatedAt, 'updatedAt');
        store.createIndex(INDEXES.name, 'name', { unique: false });
        store.createIndex(INDEXES.tags, 'tags', {
          unique: false,
          multiEntry: true // For filtering array of tags
        });

        console.log(`Created ${SESSIONS_STORE} store with indexes`);
      }
    },
    blocked() {
      console.error('Database upgrade blocked - close other tabs');
    },
    blocking() {
      console.log('Database upgrade blocking other connections');
    },
  });

  return dbInstance;
}

/**
 * Get the sessions object store with write access
 */
export async function getSessionsStore(mode: IDBTransactionMode = 'readonly') {
  const db = await openDatabase();
  const tx = db.transaction(SESSIONS_STORE, mode);
  return tx.objectStore(SESSIONS_STORE);
}