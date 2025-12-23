import type { SessionTab } from '../../types/session';

export interface TabCaptureOptions {
  active?: boolean;           // Only capture active tabs
  currentWindow?: boolean;    // Only capture tabs from current window
  excludeIncognito?: boolean; // Exclude incognito windows/tabs
  excludeUrls?: string[];     // URL patterns to exclude
  includeGroups?: boolean;    // Include tab group information
}

export interface CaptureOptions {
  includeIncognito?: boolean;
  excludeUrls?: string[];
  includeActiveOnly?: boolean;
}

/**
 * Capture tabs from the current browser session
 */
export async function captureTabs(options: TabCaptureOptions = {}): Promise<SessionTab[]> {
  const {
    excludeIncognito = false,
    excludeUrls = [],
    active = false
  } = options;

  try {
    // Query all tabs
    console.log('🔍 Querying all tabs from Chrome API');
    const tabs = await chrome.tabs.query({});
    console.log(`📊 Found ${tabs.length} tabs from Chrome API`);

    // Filter and transform tabs
    const sessionTabs: SessionTab[] = [];
    let excludedCount = 0;

    for (const tab of tabs) {
      // Skip if tab is missing required properties
      if (!tab.id || !tab.url || !tab.title) {
        console.debug('⚠️ Skipping tab - missing required properties');
        continue;
      }

      // Filter incognito tabs if excluded
      if (excludeIncognito && tab.incognito) {
        console.debug('🕵️ Skipping incognito tab:', tab.url);
        continue;
      }

      // Filter out excluded URLs
      const isExcluded = excludeUrls.some(pattern => {
        // Support wildcards in patterns
        const regex = new RegExp(pattern.replace(/\*/g, '.*'));
        return regex.test(tab.url!);
      });

      if (isExcluded) {
        console.debug('🚫 Skipping excluded URL:', tab.url);
        excludedCount++;
        continue;
      }

      // Filter active only if requested
      if (active && !tab.active) {
        console.debug('⏸️ Skipping inactive tab:', tab.url);
        continue;
      }

      const sessionTab: SessionTab = {
        id: tab.id,
        index: tab.index,
        url: tab.url!,
        title: tab.title!,
        favicon: tab.favIconUrl,
        pinned: tab.pinned || false,
        active: tab.active || false,
      };

      // Add tab group information if available (Chrome-specific)
      if (tab.groupId && tab.groupId !== chrome.tabGroups.TAB_GROUP_ID_NONE) {
        sessionTab.groupId = tab.groupId;

        try {
          const group = await chrome.tabGroups.get(tab.groupId);
          sessionTab.groupColor = group.color;
          sessionTab.groupTitle = group.title;
        } catch (error) {
          console.warn(`Could not get tab group info for ${tab.groupId}:`, error);
        }
      }

      sessionTabs.push(sessionTab);
    }

    console.log(`✅ Captured ${sessionTabs.length} tabs (${excludedCount} excluded)`);
    console.log('📋 Sample of captured tabs:', sessionTabs.slice(0, 3).map(t => ({
      url: t.url,
      title: t.title,
      active: t.active,
      pinned: t.pinned
    })));
    return sessionTabs;

  } catch (error) {
    console.error('❌ Failed to capture tabs:', error);
    throw new Error(`Tab capture failed: ${error}`);
  }
}

/**
 * Capture tabs from a specific window
 */
export async function captureTabsFromWindow(windowId: number, options: CaptureOptions = {}): Promise<SessionTab[]> {
  try {
    const tabs = await chrome.tabs.query({ windowId });

    const sessionTabs: SessionTab[] = [];

    for (const tab of tabs) {
      if (!tab.id || !tab.url || !tab.title) continue;

      if (!options.includeIncognito && tab.incognito) continue;

      const sessionTab: SessionTab = {
        id: tab.id,
        index: tab.index,
        url: tab.url,
        title: tab.title,
        favicon: tab.favIconUrl,
        pinned: tab.pinned || false,
        active: tab.active || false,
      };

      sessionTabs.push(sessionTab);
    }

    return sessionTabs;

  } catch (error) {
    console.error(`Failed to capture tabs from window ${windowId}:`, error);
    throw new Error(`Window tab capture failed: ${error}`);
  }
}

export interface CaptureAllWindowsOptions {
  excludeIncognito?: boolean;
  excludeUrls?: string[];
  includeGroups?: boolean;
}

export interface CapturedSession {
  windows: import('../../types/session').SessionWindow[];
  tabCount: number;
  windowCount: number;
}

/**
 * Capture all windows with their tabs - unified function for session creation
 * This is the single source of truth for capturing browser state.
 * Used by both useSessionMutations hook and background auto-save.
 */
export async function captureAllWindows(options: CaptureAllWindowsOptions = {}): Promise<CapturedSession> {
  const {
    excludeIncognito = true,
    excludeUrls = [],
    includeGroups = true,
  } = options;

  console.log('🔍 Capturing all windows and tabs...');

  try {
    // Get all normal windows with their tabs
    const windows = await chrome.windows.getAll({ populate: true, windowTypes: ['normal'] });

    const sessionWindows: import('../../types/session').SessionWindow[] = [];
    let totalTabCount = 0;

    for (const window of windows) {
      // Skip incognito windows if excluded
      if (excludeIncognito && window.incognito) {
        continue;
      }

      const tabs = window.tabs || [];
      const sessionTabs: SessionTab[] = [];

      for (const tab of tabs) {
        // Skip tabs missing required properties
        if (!tab.id || !tab.url || !tab.title) continue;

        // Skip incognito tabs if excluding
        if (excludeIncognito && tab.incognito) continue;

        // Check URL exclusion patterns
        if (excludeUrls.length > 0) {
          const isExcluded = excludeUrls.some(pattern => {
            const regex = new RegExp(pattern.replace(/\*/g, '.*'));
            return regex.test(tab.url!);
          });
          if (isExcluded) continue;
        }

        const sessionTab: SessionTab = {
          id: tab.id,
          index: tab.index,
          url: tab.url,
          title: tab.title,
          favicon: tab.favIconUrl,
          pinned: tab.pinned || false,
          active: tab.active || false,
        };

        // Add tab group information if requested
        if (includeGroups && tab.groupId && tab.groupId !== chrome.tabGroups.TAB_GROUP_ID_NONE) {
          sessionTab.groupId = tab.groupId;
          try {
            const group = await chrome.tabGroups.get(tab.groupId);
            sessionTab.groupColor = group.color;
            sessionTab.groupTitle = group.title;
          } catch {
            // Tab group may have been removed, ignore error
          }
        }

        sessionTabs.push(sessionTab);
      }

      // Only include windows with at least one tab
      if (sessionTabs.length > 0) {
        sessionWindows.push({
          id: window.id!,
          focused: window.focused || false,
          incognito: window.incognito || false,
          state: (window.state as 'normal' | 'minimized' | 'maximized' | 'fullscreen') || 'normal',
          tabs: sessionTabs,
        });
        totalTabCount += sessionTabs.length;
      }
    }

    console.log(`✅ Captured ${totalTabCount} tabs across ${sessionWindows.length} windows`);

    return {
      windows: sessionWindows,
      tabCount: totalTabCount,
      windowCount: sessionWindows.length,
    };

  } catch (error) {
    console.error('❌ Failed to capture windows:', error);
    throw new Error(`Window capture failed: ${error}`);
  }
}