import type { Session } from '../types/session';
import { generatePrefixedSessionId } from '../lib/uuid';
import { getSessions, saveSessions } from '../lib/storage';

/**
 * Service for importing and exporting session data
 * Uses centralized storage utilities for consistency
 */
export class ImportExportService {
  private static instance: ImportExportService;

  private constructor() { }

  static getInstance(): ImportExportService {
    if (!ImportExportService.instance) {
      ImportExportService.instance = new ImportExportService();
    }
    return ImportExportService.instance;
  }

  /**
   * Export all sessions to JSON string
   */
  async exportSessions(): Promise<string> {
    console.log('📤 Exporting sessions...');

    try {
      const sessions = await getSessions();

      const exportData = {
        version: '1.0.0',
        exportDate: new Date().toISOString(),
        totalSessions: sessions.length,
        sessions: sessions.map(session => ({
          ...session,
          exported: true
        }))
      };

      const jsonString = JSON.stringify(exportData, null, 2);
      console.log(`✅ Exported ${sessions.length} sessions`);

      return jsonString;
    } catch (error) {
      console.error('❌ Failed to export sessions:', error);
      throw new Error('Failed to export sessions');
    }
  }

  /**
   * Export a single session to JSON string
   */
  async exportSingleSession(sessionId: string): Promise<string> {
    console.log(`📤 Exporting session ${sessionId}...`);

    const sessions = await getSessions();
    const session = sessions.find(s => s.id === sessionId);

    if (!session) {
      throw new Error(`Session ${sessionId} not found`);
    }

    const exportData = {
      version: '1.0.0',
      exportDate: new Date().toISOString(),
      totalSessions: 1,
      sessions: [{ ...session, exported: true }]
    };

    return JSON.stringify(exportData, null, 2);
  }

  /**
   * Import sessions from JSON string
   */
  async importSessions(jsonString: string): Promise<{
    imported: number;
    duplicates: number;
    errors: string[];
  }> {
    console.log('📥 Importing sessions...');

    const result = {
      imported: 0,
      duplicates: 0,
      errors: [] as string[]
    };

    try {
      // Parse the JSON
      const importData = JSON.parse(jsonString);

      // Validate the import data
      const validation = this.validateImportData(importData);
      if (!validation.valid) {
        throw new Error(`Invalid import data: ${validation.errors.join(', ')}`);
      }

      // Get existing sessions to check for duplicates
      const existingSessions = await getSessions();
      const newSessions: Session[] = [...existingSessions];

      // Import each session
      for (const sessionData of importData.sessions) {
        try {
          // Create new session with fresh ID and timestamps
          const newSession: Session = {
            ...sessionData,
            id: generatePrefixedSessionId('import'),
            createdAt: Date.now(),
            updatedAt: Date.now(),
            source: 'import' as const,
            isAutoSave: false,
          };

          // Remove exported flag
          delete (newSession as any).exported;

          // Check for duplicate content (same name and similar tabs)
          const isDuplicate = this.isDuplicateContent(newSession, existingSessions);
          if (isDuplicate) {
            result.duplicates++;
            console.log(`⚠️ Skipped duplicate: ${sessionData.name}`);
            continue;
          }

          // Add to sessions array
          newSessions.unshift(newSession); // Add at beginning
          result.imported++;

        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          console.error(`❌ Failed to import session "${sessionData.name}":`, error);
          result.errors.push(`Failed to import "${sessionData.name}": ${errorMessage}`);
        }
      }

      // Save all sessions
      await saveSessions(newSessions);

      console.log(`✅ Import completed: ${result.imported} imported, ${result.duplicates} skipped as duplicates`);

      return result;

    } catch (error) {
      console.error('❌ Import failed:', error);
      throw error;
    }
  }

  /**
   * Validate import data structure
   */
  private validateImportData(data: any): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Check basic structure
    if (!data || typeof data !== 'object') {
      errors.push('Import data must be a valid JSON object');
      return { valid: false, errors };
    }

    // Check sessions array
    if (!Array.isArray(data.sessions)) {
      errors.push('Sessions must be an array');
      return { valid: false, errors };
    }

    if (data.sessions.length === 0) {
      errors.push('No sessions found in import data');
      return { valid: false, errors };
    }

    // Validate each session
    data.sessions.forEach((session: any, index: number) => {
      const sessionErrors = this.validateSession(session, index);
      errors.push(...sessionErrors);
    });

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Validate individual session structure
   */
  private validateSession(session: any, index: number): string[] {
    const errors: string[] = [];

    if (!session.name) {
      errors.push(`Session ${index + 1}: Missing name`);
    }

    if (!Array.isArray(session.windows)) {
      errors.push(`Session ${index + 1}: Windows must be an array`);
    } else {
      session.windows.forEach((window: any, windowIndex: number) => {
        if (!Array.isArray(window.tabs)) {
          errors.push(`Session ${index + 1}, Window ${windowIndex + 1}: Tabs must be an array`);
        } else {
          window.tabs.forEach((tab: any, tabIndex: number) => {
            if (!tab.url) {
              errors.push(`Session ${index + 1}, Window ${windowIndex + 1}, Tab ${tabIndex + 1}: Missing URL`);
            }
          });
        }
      });
    }

    return errors;
  }

  /**
   * Check if session content is duplicated
   */
  private isDuplicateContent(newSession: Session, existingSessions: Session[]): boolean {
    return existingSessions.some(existing => {
      // Check for same name with similar content
      if (existing.name === newSession.name) {
        // Check if they have similar number of tabs/windows
        const tabCountMatch = Math.abs(existing.tabCount - newSession.tabCount) <= 1;
        const windowCountMatch = existing.windowCount === newSession.windowCount;

        return tabCountMatch && windowCountMatch;
      }
      return false;
    });
  }

  /**
   * Get import/export statistics
   */
  async getStatistics(): Promise<{
    totalSessions: number;
    autoSaves: number;
    manualSaves: number;
    importedSessions: number;
  }> {
    const sessions = await getSessions();

    return {
      totalSessions: sessions.length,
      autoSaves: sessions.filter(s => s.isAutoSave).length,
      manualSaves: sessions.filter(s => !s.isAutoSave && s.source !== 'import').length,
      importedSessions: sessions.filter(s => s.source === 'import').length,
    };
  }
}