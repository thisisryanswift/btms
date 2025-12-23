import { DEFAULT_SETTINGS, type BTMSSettings } from '../types/settings';
import { SETTINGS_STORAGE_KEY } from '../lib/constants';

/**
 * Service for managing BTMS settings using chrome.storage.sync
 * Settings are synced across user's Chrome profile
 */
export class SettingsService {
  private static instance: SettingsService;

  private constructor() { }

  static getInstance(): SettingsService {
    if (!SettingsService.instance) {
      SettingsService.instance = new SettingsService();
    }
    return SettingsService.instance;
  }

  /**
   * Get all settings with deep merge with defaults
   */
  async getSettings(): Promise<BTMSSettings> {
    try {
      const result = await chrome.storage.sync.get(SETTINGS_STORAGE_KEY);
      const storedSettings = result[SETTINGS_STORAGE_KEY] || {};

      // Deep merge with defaults to handle new/nested settings
      const mergedSettings = this.deepMerge(DEFAULT_SETTINGS, storedSettings);

      console.log('📋 Loaded settings:', mergedSettings);
      return mergedSettings;
    } catch (error) {
      console.error('❌ Failed to load settings:', error);
      return DEFAULT_SETTINGS;
    }
  }

  /**
   * Update settings (partial update supported)
   */
  async updateSettings(updates: Partial<BTMSSettings>): Promise<BTMSSettings> {
    try {
      const currentSettings = await this.getSettings();
      const newSettings = this.deepMerge(currentSettings, updates);

      await chrome.storage.sync.set({
        [SETTINGS_STORAGE_KEY]: newSettings
      });

      console.log('💾 Updated settings:', newSettings);
      return newSettings;
    } catch (error) {
      console.error('❌ Failed to update settings:', error);
      throw error;
    }
  }

  /**
   * Reset all settings to defaults
   */
  async resetSettings(): Promise<BTMSSettings> {
    try {
      await chrome.storage.sync.set({
        [SETTINGS_STORAGE_KEY]: DEFAULT_SETTINGS
      });

      console.log('🔄 Reset settings to defaults');
      return DEFAULT_SETTINGS;
    } catch (error) {
      console.error('❌ Failed to reset settings:', error);
      throw error;
    }
  }

  /**
   * Export settings as JSON
   */
  async exportSettings(): Promise<string> {
    const settings = await this.getSettings();
    return JSON.stringify(settings, null, 2);
  }

  /**
   * Import settings from JSON
   */
  async importSettings(jsonString: string): Promise<BTMSSettings> {
    try {
      const importedSettings = JSON.parse(jsonString);
      return this.updateSettings(importedSettings);
    } catch (error) {
      console.error('❌ Failed to import settings:', error);
      throw new Error('Invalid settings file format');
    }
  }

  /**
   * Listen for settings changes
   */
  onSettingsChanged(callback: (settings: BTMSSettings) => void): void {
    chrome.storage.onChanged.addListener((changes: { [key: string]: chrome.storage.StorageChange }, namespace: string) => {
      if (namespace === 'sync' && changes[SETTINGS_STORAGE_KEY]) {
        const newSettings = changes[SETTINGS_STORAGE_KEY].newValue;
        console.log('🔄 Settings changed:', newSettings);
        callback(newSettings);
      }
    });
  }

  // Private helper: deep merge objects
  private deepMerge<T extends object>(target: T, source: Partial<T>): T {
    const result = { ...target };

    for (const key in source) {
      if (source.hasOwnProperty(key)) {
        const sourceValue = source[key];
        const targetValue = result[key];

        if (
          sourceValue !== null &&
          typeof sourceValue === 'object' &&
          !Array.isArray(sourceValue) &&
          targetValue !== null &&
          typeof targetValue === 'object' &&
          !Array.isArray(targetValue)
        ) {
          // Recursively merge nested objects
          (result as any)[key] = this.deepMerge(targetValue as object, sourceValue as object);
        } else if (sourceValue !== undefined) {
          (result as any)[key] = sourceValue;
        }
      }
    }

    return result;
  }
}