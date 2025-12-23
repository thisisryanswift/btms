// BTMS Background Service Worker - Auto-save functionality
// Note: defineBackground is auto-imported by WXT

export default defineBackground(() => {
  console.log('🚀 BTMS Background Service Worker initializing...');

  // Background service class
  class BTMSBackground {
    settings: any = null;

    async initialize() {
      try {
        await this.loadSettings();
        this.setupEventListeners();
        await this.setupAutoSave();
        console.log('✅ BTMS Background Service Worker initialized');
      } catch (error) {
        console.error('❌ Failed to initialize background service:', error);
      }
    }

    async loadSettings() {
      try {
        const result = await chrome.storage.sync.get(['btms_settings']);
        this.settings = result.btms_settings || {
          autoSave: { enabled: false, intervalMinutes: 30, maxSessions: 10 },
          ai: { autoNaming: true, summaries: true }
        };
        console.log('📋 Settings loaded:', this.settings);
      } catch (error) {
        console.error('❌ Failed to load settings:', error);
        this.settings = { autoSave: { enabled: false, intervalMinutes: 30, maxSessions: 10 } };
      }
    }

    setupEventListeners() {
      // Listen for settings changes
      chrome.storage.onChanged.addListener((changes, namespace) => {
        if (namespace === 'sync' && changes.btms_settings) {
          this.settings = changes.btms_settings.newValue;
          console.log('🔄 Settings updated, restarting auto-save alarm...');
          this.setupAutoSave();
        }
      });

      // Listen for window close events
      chrome.windows.onRemoved.addListener(async (windowId) => {
        await this.handleWindowClose(windowId);
      });

      // Listen for extension messages
      chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
        this.handleMessage(message, sender, sendResponse);
        return true; // Keep channel open for async response
      });

      // Listen for extension installation/update
      chrome.runtime.onInstalled.addListener(async (details) => {
        console.log(`📦 Extension ${details.reason}`);
        if (details.reason === 'install') {
          await this.handleInstall();
        }
      });

      // Open sidepanel when clicking extension icon (instead of popup)
      chrome.action.onClicked.addListener(async (tab) => {
        if (tab.id) {
          await chrome.sidePanel.open({ tabId: tab.id });
        }
      });
    }

    async setupAutoSave() {
      // Clear existing alarm
      await chrome.alarms.clear('autosave');

      if (!this.settings?.autoSave?.enabled) {
        console.log('⏸️ Auto-save disabled');
        return;
      }

      // Create new alarm
      const intervalMinutes = this.settings.autoSave.intervalMinutes;
      await chrome.alarms.create('autosave', {
        delayInMinutes: intervalMinutes,
        periodInMinutes: intervalMinutes,
      });

      console.log(`⏰ Auto-save alarm set for every ${intervalMinutes} minutes`);
    }

    async handleWindowClose(windowId: number) {
      if (!this.settings?.autoSave?.enabled) return;

      console.log(`🪟 Window ${windowId} closed, checking for auto-save...`);

      // Check if this was the last normal window
      const windows = await chrome.windows.getAll({ windowTypes: ['normal'] });

      // Auto-save when the last window closes (browser shutdown)
      if (windows.length === 0) {
        await this.performAutoSave('browser_close');
      }
    }

    async handleMessage(message: any, _sender: chrome.runtime.MessageSender, sendResponse: (response: any) => void) {
      try {
        switch (message.action) {
          case 'forceAutoSave':
            const session = await this.performAutoSave('manual');
            sendResponse({ success: true, session });
            break;

          case 'getAutoSaveStatus':
            const alarm = await chrome.alarms.get('autosave');
            sendResponse({
              enabled: this.settings?.autoSave?.enabled,
              nextAlarm: alarm?.scheduledTime,
              interval: this.settings?.autoSave?.intervalMinutes
            });
            break;

          default:
            sendResponse({ error: 'Unknown action' });
        }
      } catch (error: any) {
        console.error('❌ Message handling error:', error);
        sendResponse({ error: error.message });
      }
    }

    async performAutoSave(trigger: string) {
      if (!this.settings?.autoSave?.enabled && trigger !== 'manual') {
        console.log('⏸️ Auto-save disabled, skipping');
        return null;
      }

      console.log(`💾 Performing auto-save (trigger: ${trigger})...`);

      try {
        // Use unified capture and ID generation (dynamic import for service worker context)
        const { captureAllWindows } = await import('../src/services/sessions/capture');
        const { generatePrefixedSessionId } = await import('../src/lib/uuid');
        const captured = await captureAllWindows({
          excludeIncognito: true,
          includeGroups: true,
        });

        // Skip if no tabs captured
        if (captured.tabCount === 0) {
          console.log('⏸️ No tabs to save, skipping auto-save');
          return null;
        }

        // Generate session data
        const sessionData = {
          id: generatePrefixedSessionId('auto'),
          name: `Auto-save ${new Date().toLocaleString()}`,
          createdAt: Date.now(),
          updatedAt: Date.now(),
          windows: captured.windows,
          tabCount: captured.tabCount,
          windowCount: captured.windowCount,
          isAutoSave: true,
          source: 'auto' as const,
          tags: ['auto-save'],
        };

        // Save to storage using shared utility
        const { getSessions, saveSessions } = await import('../src/lib/storage');
        const sessions = await getSessions();
        sessions.unshift(sessionData); // Add to beginning
        await saveSessions(sessions);

        // Cleanup old auto-saves
        await this.cleanupOldAutoSaves();

        console.log(`✅ Auto-save completed: ${sessionData.name}`);
        return sessionData;

      } catch (error) {
        console.error('❌ Auto-save failed:', error);
        return null;
      }
    }

    async cleanupOldAutoSaves() {
      if (!this.settings?.autoSave?.maxSessions) return;

      try {
        const { getSessions, saveSessions } = await import('../src/lib/storage');
        const sessions = await getSessions();
        const autoSaves = sessions
          .filter((s: any) => s.isAutoSave)
          .sort((a: any, b: any) => b.createdAt - a.createdAt);

        if (autoSaves.length > this.settings.autoSave.maxSessions) {
          const toDelete = autoSaves.slice(this.settings.autoSave.maxSessions);
          console.log(`🧹 Cleaning up ${toDelete.length} old auto-saves`);

          const toDeleteIds = new Set(toDelete.map((s: any) => s.id));
          const remainingSessions = sessions.filter((s: any) => !toDeleteIds.has(s.id));
          await saveSessions(remainingSessions);
        }
      } catch (error) {
        console.error('❌ Auto-save cleanup failed:', error);
      }
    }

    async handleInstall() {
      console.log('🎉 BTMS installed for the first time');
    }
  }

  // Initialize background service
  const btmsBackground = new BTMSBackground();
  btmsBackground.initialize();

  // Set up alarm listener
  chrome.alarms.onAlarm.addListener(async (alarm) => {
    if (alarm.name === 'autosave') {
      console.log('⏰ Auto-save alarm triggered');
      await btmsBackground.performAutoSave('interval');
    }
  });

  // Expose for debugging in dev mode
  (globalThis as any).btmsBackground = btmsBackground;

  console.log('✅ BTMS background script fully loaded');
});