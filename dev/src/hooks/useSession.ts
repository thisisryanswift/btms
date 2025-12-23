import { useQuery } from '@tanstack/react-query';
import type { Session } from '../types/session';
import { getSessions } from '../lib/storage';

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

// Session Stats
export function useSessionStats() {
  return useQuery({
    queryKey: ['sessions', 'stats'],
    queryFn: getStatsFromStorage,
    staleTime: 1 * 60 * 1000, // 1 minute
  });
}