import { useQuery } from '@tanstack/react-query';
import type { Session } from '../types/session';
import { getSessions, getSession } from '../lib/storage';

// Query keys for React Query
export const QUERY_KEYS = {
  sessions: ['sessions'] as const,
  sessionsById: (id: string) => ['sessions', id] as const,
} as const;

// Use centralized storage utility
async function getAllSessionsFromStorage(): Promise<Session[]> {
  try {
    return await getSessions();
  } catch (error) {
    console.error('Failed to get sessions:', error);
    return [];
  }
}

async function getSessionById(id: string): Promise<Session | null> {
  try {
    return await getSession(id);
  } catch (error) {
    console.error('Failed to get session:', error);
    return null;
  }
}

async function getStatsFromStorage(): Promise<{ count: number; totalTabs: number }> {
  try {
    const sessions = await getAllSessionsFromStorage();
    const totalTabs = sessions.reduce((sum, s) => sum + (s.tabCount || 0), 0);
    return { count: sessions.length, totalTabs };
  } catch (error) {
    console.error('Failed to get stats:', error);
    return { count: 0, totalTabs: 0 };
  }
}

// Read Hooks
export function useSessions() {
  return useQuery({
    queryKey: QUERY_KEYS.sessions,
    queryFn: getAllSessionsFromStorage,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

// Single session by ID
export function useSession(id: string) {
  return useQuery({
    queryKey: QUERY_KEYS.sessionsById(id),
    queryFn: () => getSessionById(id),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Session Stats
export function useSessionStats() {
  return useQuery({
    queryKey: ['sessions', 'stats'],
    queryFn: getStatsFromStorage,
    staleTime: 1 * 60 * 1000, // 1 minute
  });
}