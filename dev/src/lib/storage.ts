/**
 * Shared storage utilities for session data
 * Single source of truth for chrome.storage.local session operations
 */

import type { Session } from '../types/session';
import { SESSIONS_STORAGE_KEY } from './constants';

// Re-export for convenience
export { SESSIONS_STORAGE_KEY };

/**
 * Get all sessions from storage
 */
export async function getSessions(): Promise<Session[]> {
    const result = await chrome.storage.local.get(SESSIONS_STORAGE_KEY);
    return result[SESSIONS_STORAGE_KEY] || [];
}

/**
 * Save sessions to storage
 */
export async function saveSessions(sessions: Session[]): Promise<void> {
    await chrome.storage.local.set({ [SESSIONS_STORAGE_KEY]: sessions });
}

/**
 * Add a session to the beginning of the list
 */
export async function addSession(session: Session): Promise<void> {
    const sessions = await getSessions();
    sessions.unshift(session);
    await saveSessions(sessions);
}

/**
 * Delete a session by ID
 */
export async function deleteSession(id: string): Promise<void> {
    const sessions = await getSessions();
    const filtered = sessions.filter(s => s.id !== id);
    await saveSessions(filtered);
}

/**
 * Get a session by ID
 */
export async function getSession(id: string): Promise<Session | null> {
    const sessions = await getSessions();
    return sessions.find(s => s.id === id) || null;
}
/**
 * Update a session by ID
 */
export async function updateSession(id: string, updates: Partial<Session>): Promise<void> {
    const sessions = await getSessions();
    const index = sessions.findIndex(s => s.id === id);
    if (index !== -1) {
        sessions[index] = { ...sessions[index], ...updates, updatedAt: Date.now() };
        await saveSessions(sessions);
    }
}
