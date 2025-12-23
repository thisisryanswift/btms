import type { DBSchema } from 'idb';
import type { Session } from '../../types/session';

// Database configuration for BTMS sessions
export const DB_NAME = 'btms-sessions';
export const DB_VERSION = 1;
export const SESSIONS_STORE = 'sessions';

// Index configuration
export const INDEXES = {
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  name: 'name',
  tags: 'tags' // multiEntry for array filtering
} as const;

// Database schema for idb library
export interface BTMSDatabase extends DBSchema {
  sessions: {
    key: string;
    value: Session;
    indexes: {
      'createdAt': number;
      'updatedAt': number;
      'name': string;
      'tags': string;
    };
  };
}