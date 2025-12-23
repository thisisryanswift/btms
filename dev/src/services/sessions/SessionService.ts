import { Session, SessionWindow, SessionTab } from '../../types/session';
import { captureTabs, TabCaptureOptions } from './capture';
import { StorageService } from '../storage/StorageService';
import { generateSessionId } from '../../lib/uuid';

/**
 * Service for managing browser sessions
 * Handles capturing, restoring, and managing session data
 */
export class SessionService {
  private storage: StorageService;

  constructor() {
    this.storage = StorageService.getInstance();
  }

  /**
   * Create a new session from current browser state
   */
  async createSession(options: {
    name?: string;
    autoSave?: boolean;
    captureOptions?: TabCaptureOptions;
  }): Promise<Session> {
    console.log('🚀 SessionService.createSession called with options:', options);
    
    // Capture current tabs
    console.log('📸 Capturing tabs with options:', options.captureOptions);
    const tabs = await captureTabs(options.captureOptions);
    console.log('✅ Captured tabs:', tabs.length, 'tabs total');
    
    // Group tabs by window
    console.log('🗂️ Grouping tabs by window');
    const windowsMap = new Map<number, SessionTab[]>();
    
    tabs.forEach(tab => {
      const windowId = tab.windowId;
      if (!windowsMap.has(windowId)) {
        windowsMap.set(windowId, []);
      }
      windowsMap.get(windowId)!.push(tab);
    });
    
    console.log('📊 Created', windowsMap.size, 'windows from tabs');
    for (const [windowId, windowTabs] of windowsMap.entries()) {
      console.log(`  Window ${windowId}: ${windowTabs.length} tabs`);
    }

    // Convert to SessionWindow format
    console.log('🔄 Converting to SessionWindow format');
    const windows: SessionWindow[] = Array.from(windowsMap.entries()).map(([windowId, tabs]) => ({
      id: windowId,
      focused: false, // Could be enhanced to detect actual focused window
      incognito: false, // Will be filtered out during capture
      state: 'normal', // Could be enhanced to detect actual window state
      tabs: tabs
    }));
    console.log('✅ Created SessionWindow objects:', windows.length, 'windows');

    // Create session object
    console.log('🏗️ Creating session object');
    const session: Session = {
      id: generateSessionId(),
      name: options.name || `Session ${new Date().toLocaleString()}`,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      tags: [],
      windows,
      tabCount: tabs.length,
      windowCount: windows.length,
      isAutoSave: options.autoSave ?? false,
      source: 'manual',
    };

    console.log('📦 Session object created:', {
      id: session.id,
      name: session.name,
      tabCount: session.tabCount,
      windowCount: session.windowCount,
      isAutoSave: session.isAutoSave,
      source: session.source,
    });

    // Save to storage
    console.log('💾 Saving session to storage');
    await this.storage.createSession(session);
    console.log('✅ Session saved successfully!');
    
    return session;
  }

  /**
   * Restore a session by opening all saved tabs and windows
   */
  async restoreSession(sessionId: string): Promise<void> {
    const session = await this.storage.getSession(sessionId);
    if (!session) {
      throw new Error(`Session ${sessionId} not found`);
    }

    // Group tabs by window and restore
    for (const window of session.windows) {
      if (window.tabs.length === 0) continue;
      
      // Create new window with tabs
      const newWindow = await chrome.windows.create({
        url: window.tabs.map(tab => tab.url),
        focused: window.focused,
        state: window.state as any, // Chrome window state
      });
      
      // If we have tab positions and groups, restore them
      if (newWindow.id) {
        await this.restoreTabDetails(newWindow.id, window.tabs);
      }
    }
  }

  /**
   * Get single session with full details
   */
  async getSession(sessionId: string): Promise<Session | null> {
    return this.storage.getSession(sessionId);
  }

  /**
   * Get all sessions (metadata only, faster)
   */
  async getAllSessions(): Promise<Session[]> {
    return this.storage.getAllSessions();
  }

  /**
   * Delete a session
   */
  async deleteSession(sessionId: string): Promise<void> {
    await this.storage.deleteSession(sessionId);
  }

  /**
   * Update session metadata
   */
  async updateSession(sessionId: string, updates: Partial<Session>): Promise<Session> {
    const session = await this.storage.getSession(sessionId);
    if (!session) {
      throw new Error(`Session ${sessionId} not found`);
    }

    const updatedSession = {
      ...session,
      ...updates,
      updatedAt: Date.now(),
    };

    await this.storage.updateSession(sessionId, updatedSession);
    return updatedSession;
  }

  /**
   * Clean up old auto-saved sessions (keep only last N)
   */
  async cleanupAutoSavedSessions(keepCount: number = 10): Promise<void> {
    const autoSessions = await this.storage.getAutoSavedSessions();
    
    if (autoSessions.length > keepCount) {
      // Sort by creation date (newest first)
      const sorted = autoSessions.sort((a, b) => b.createdAt - a.createdAt);
      
      // Delete oldest sessions beyond keepCount
      const toDelete = sorted.slice(keepCount);
      
      for (const session of toDelete) {
        await this.storage.deleteSession(session.id);
      }
    }
  }

  

  /**
   * Restore tab-specific details (position, groups, etc.)
   */
  private async restoreTabDetails(windowId: number, tabs: SessionTab[]): Promise<void> {
    try {
      const chromeTabs = await chrome.tabs.query({ windowId });
      
      for (let i = 0; i < Math.min(chromeTabs.length, tabs.length); i++) {
        const chromeTab = chromeTabs[i];
        const savedTab = tabs[i];
        
        // Update tab position
        if (chromeTab.id && savedTab.index !== undefined) {
          await chrome.tabs.move(chromeTab.id, {
            index: savedTab.index,
          });
        }
        
        // Update pin state
        if (chromeTab.id && savedTab.pinned !== chromeTab.pinned) {
          await chrome.tabs.update(chromeTab.id, {
            pinned: savedTab.pinned,
          });
        }
        
        // TODO: Restore tab groups when Chrome API supports it programmatically
        // Chrome doesn't allow creating tab groups via API yet
      }
    } catch (error) {
      console.warn('Failed to restore some tab details:', error);
      // Don't fail the whole restore operation for minor details
    }
  }
}