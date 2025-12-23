/**
 * Settings interface for BTMS preferences
 * Uses nested structure for organized settings
 */
export interface BTMSSettings {
  appearance: {
    theme: 'light' | 'dark' | 'system';
    language: string;
  };

  ai: {
    autoNaming: boolean;
    summaries: boolean;
    tags: boolean;
    provider: 'chrome' | 'openai' | 'fallback';
  };

  autoSave: {
    enabled: boolean;
    intervalMinutes: number;
    maxSessions: number;
  };

session: {
    retentionDays: number;
    cleanupEnabled: boolean;
    lazyLoadTabs: boolean;
  };

  ui: {
    showTabCount: boolean;
    showWindowCount: boolean;
    compactView: boolean;
  };

  privacy: {
    saveIncognito: boolean;
    trackStats: boolean;
  };
}

/**
 * Default settings for BTMS
 */
export const DEFAULT_SETTINGS: BTMSSettings = {
  appearance: {
    theme: 'system',
    language: 'en',
  },
  ai: {
    autoNaming: true,
    summaries: true,
    tags: true,
    provider: 'chrome',
  },
  autoSave: {
    enabled: false,
    intervalMinutes: 30,
    maxSessions: 10,
  },
  session: {
    retentionDays: 30,
    cleanupEnabled: true,
    lazyLoadTabs: false,
  },
  ui: {
    showTabCount: true,
    showWindowCount: true,
    compactView: false,
  },
  privacy: {
    saveIncognito: false,
    trackStats: true,
  },
};