import { getSessionsStore, waitForTransaction } from './connection';
import type { Session } from '../../types/session';
import { INDEXES } from './db';

/**
 * Get a specific session by ID
 */
export async function getSession(id: string): Promise<Session | null> {
  const store = await getSessionsStore('readonly');
  const session = await store.get(id);
  return session || null;
}

/**
 * Get all sessions, sorted by updatedAt descending (most recent first)
 */
export async function getAllSessions(): Promise<Session[]> {
  const store = await getSessionsStore('readonly');
  const index = store.index(INDEXES.updatedAt);
  const sessions = await index.getAll();
  
  // Sort by updatedAt descending (newest first)
  return sessions.reverse();
}

/**
 * Get sessions by name (partial match)
 */
export async function getSessionsByName(nameQuery: string): Promise<Session[]> {
  const store = await getSessionsStore('readonly');
  const index = store.index(INDEXES.name);
  const sessions = await index.getAll();
  
  // Filter sessions where name contains the query (case-insensitive)
  return sessions.filter(session => 
    session.name.toLowerCase().includes(nameQuery.toLowerCase())
  );
}

/**
 * Get sessions with specific tag
 */
export async function getSessionsByTag(tag: string): Promise<Session[]> {
  const store = await getSessionsStore('readonly');
  const index = store.index(INDEXES.tags);
  const sessions = await index.getAll(tag);
  
  // Sort by updatedAt descending
  return sessions.sort((a, b) => b.updatedAt - a.updatedAt);
}

/**
 * Get sessions with any of the specified tags
 */
export async function getSessionsByTags(tags: string[]): Promise<Session[]> {
  const store = await getSessionsStore('readonly');
  const index = store.index(INDEXES.tags);
  
  // Get sessions for each tag and deduplicate
  const sessionMap = new Map<string, Session>();
  
  for (const tag of tags) {
    const sessions = await index.getAll(tag);
    for (const session of sessions) {
      sessionMap.set(session.id, session);
    }
  }
  
  return Array.from(sessionMap.values()).sort((a, b) => b.updatedAt - a.updatedAt);
}

/**
 * Get sessions within date range
 */
export async function getSessionsByDateRange(startDate: number, endDate: number): Promise<Session[]> {
  const store = await getSessionsStore('readonly');
  const sessions = await store.getAll();
  
  return sessions.filter(session => 
    session.updatedAt >= startDate && session.updatedAt <= endDate
  ).sort((a, b) => b.updatedAt - a.updatedAt);
}

// Re-export as getSessions for backward compatibility
export { getSession as getSessions };