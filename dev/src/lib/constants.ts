/**
 * Centralized storage keys for chrome.storage
 * Single source of truth for all storage key names
 */

/** Key for session data in chrome.storage.local */
export const SESSIONS_STORAGE_KEY = 'sessions';

/** Key for settings in chrome.storage.sync */
export const SETTINGS_STORAGE_KEY = 'btms_settings';

/** React Query cache keys */
export const QUERY_KEYS = {
    sessions: ['sessions'] as const,
    sessionsById: (id: string) => ['sessions', id] as const,
    sessionStats: ['sessions', 'stats'] as const,
    settings: ['settings'] as const,
} as const;
