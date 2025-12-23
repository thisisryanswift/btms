import { getSessionsStore, waitForTransaction } from './connection';
import type { Session } from '../../types/session';

/**
 * Delete a specific session by ID
 */
export async function deleteSession(id: string): Promise<void> {
  const store = await getSessionsStore('readwrite');
  await store.delete(id);
  await waitForTransaction(store.transaction);
  console.log('Deleted session:', id);
}

/**
 * Delete all sessions
 */
export async function deleteAllSessions(): Promise<void> {
  const store = await getSessionsStore('readwrite');
  await store.clear();
  await waitForTransaction(store.transaction);
  console.log('Deleted all sessions');
}

/**
 * Delete multiple sessions by IDs
 */
export async function deleteSessions(ids: string[]): Promise<void> {
  const store = await getSessionsStore('readwrite');
  
  for (const id of ids) {
    await store.delete(id);
  }
  
  await waitForTransaction(store.transaction);
  console.log(`Deleted ${ids.length} sessions`);
}

/**
 * Delete sessions older than specified date
 */
export async function deleteSessionsOlderThan(date: number): Promise<string[]> {
  const allSessions = await getAllSessions();
  const oldSessions = allSessions.filter(session => session.updatedAt < date);
  
  if (oldSessions.length > 0) {
    const ids = oldSessions.map(s => s.id);
    await deleteSessions(ids);
    console.log(`Deleted ${oldSessions.length} old sessions`);
  }
  
  return oldSessions.map(s => s.id);
}

// Import getAllSessions for internal use
import { getAllSessions } from './read';