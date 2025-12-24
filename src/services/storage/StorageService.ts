import * as readOps from './read';
import * as writeOps from './write';
import * as deleteOps from './delete';
import type { Session } from '../../types/session';

/**
 * Unified Storage Service for BTMS sessions
 * Provides a clean API for all session storage operations
 */
export class StorageService {
  private static instance: StorageService;
  
  private constructor() {}
  
  /**
   * Get singleton instance
   */
  static getInstance(): StorageService {
    if (!StorageService.instance) {
      StorageService.instance = new StorageService();
    }
    return StorageService.instance;
  }

  // Read Operations
  async getSession(id: string): Promise<Session | null> {
    return readOps.getSession(id);
  }

  async getAllSessions(): Promise<Session[]> {
    return readOps.getAllSessions();
  }

  async getSessionsByName(nameQuery: string): Promise<Session[]> {
    return readOps.getSessionsByName(nameQuery);
  }

  async getSessionsByTag(tag: string): Promise<Session[]> {
    return readOps.getSessionsByTag(tag);
  }

  async getSessionsByTags(tags: string[]): Promise<Session[]> {
    return readOps.getSessionsByTags(tags);
  }

  async getSessionsByDateRange(startDate: number, endDate: number): Promise<Session[]> {
    return readOps.getSessionsByDateRange(startDate, endDate);
  }

  // Write Operations
  async createSession(sessionData: Omit<Session, 'id' | 'createdAt' | 'updatedAt'>): Promise<Session> {
    return writeOps.createSession(sessionData);
  }

  async createSessions(sessionsData: Omit<Session, 'id' | 'createdAt' | 'updatedAt'>[]): Promise<Session[]> {
    return writeOps.createSessions(sessionsData);
  }

  async updateSession(id: string, updates: Partial<Omit<Session, 'id' | 'createdAt'>>): Promise<Session> {
    return writeOps.updateSession(id, updates);
  }

  // Delete Operations
  async deleteSession(id: string): Promise<void> {
    return deleteOps.deleteSession(id);
  }

  async deleteAllSessions(): Promise<void> {
    return deleteOps.deleteAllSessions();
  }

  async deleteSessions(ids: string[]): Promise<void> {
    return deleteOps.deleteSessions(ids);
  }

  async deleteSessionsOlderThan(date: number): Promise<string[]> {
    return deleteOps.deleteSessionsOlderThan(date);
  }

  // Utility Methods
  async searchSessions(query: string): Promise<Session[]> {
    const byName = await this.getSessionsByName(query);
    // TODO: Add more sophisticated search (by URL, title, etc.)
    return byName;
  }

  async getSessionCount(): Promise<number> {
    const sessions = await this.getAllSessions();
    return sessions.length;
  }

  async getTotalTabCount(): Promise<number> {
    const sessions = await this.getAllSessions();
    return sessions.reduce((total, session) => total + session.tabCount, 0);
  }
}

// Export singleton instance
export const storageService = StorageService.getInstance();