import { getSessionsStore, waitForTransaction } from './connection';
import { getSession } from './read';
import type { Session } from '../../types/session';
import { generateSessionId } from '../../lib/uuid';

/**
 * Create a new session in storage
 */
export async function createSession(sessionData: Omit<Session, 'id' | 'createdAt' | 'updatedAt'>): Promise<Session> {
  const now = Date.now();
  const session: Session = {
    ...sessionData,
    id: generateSessionId(),
    createdAt: now,
    updatedAt: now,
  };

  const store = await getSessionsStore('readwrite');
  await store.add(session);
  await waitForTransaction(store.transaction);
  
  console.log('Created session:', session.id);
  return session;
}

/**
 * Create multiple sessions in batch
 */
export async function createSessions(sessionsData: Omit<Session, 'id' | 'createdAt' | 'updatedAt'>[]): Promise<Session[]> {
  const now = Date.now();
  const sessions: Session[] = sessionsData.map(data => ({
    ...data,
    id: generateSessionId(),
    createdAt: now,
    updatedAt: now,
  }));

  const store = await getSessionsStore('readwrite');
  for (const session of sessions) {
    await store.add(session);
  }
  await waitForTransaction(store.transaction);
  
  console.log(`Created ${sessions.length} sessions`);
  return sessions;
}

/**
 * Update an existing session
 */
export async function updateSession(id: string, updates: Partial<Omit<Session, 'id' | 'createdAt'>>): Promise<Session> {
  const existing = await getSession(id);
  if (!existing) {
    throw new Error(`Session with id ${id} not found`);
  }

  const updated: Session = {
    ...existing,
    ...updates,
    updatedAt: Date.now(),
  };

  const store = await getSessionsStore('readwrite');
  await store.put(updated);
  await waitForTransaction(store.transaction);
  
  console.log('Updated session:', id);
  return updated;
}