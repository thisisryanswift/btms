import React from 'react';
import { useSettings, useUpdateSettings, useResetSettings, useExportSettings, useImportSettings } from '../hooks/useSettings';
import { useExportSessions, useImportSessions } from '../hooks/useImportExport';
import type { BTMSSettings } from '../types/settings';

export function OptionsApp() {
  const { data: settings, isLoading } = useSettings();
  const updateSettingsMutation = useUpdateSettings();
  const resetSettingsMutation = useResetSettings();
  const exportSettingsMutation = useExportSettings();
  const importSettingsMutation = useImportSettings();
  const exportSessionsMutation = useExportSessions();
  const importSessionsMutation = useImportSessions();
  const [isDirty, setIsDirty] = React.useState(false);
  const [activeSection, setActiveSection] = React.useState('general');

  // Handle form field changes
  const handleSettingChange = (key: string, value: any) => {
    if (settings) {
      const keys = key.split('.');
      let updatedSettings = { ...settings };
      let current: any = updatedSettings;
      
      // Navigate to the nested property
      for (let i = 0; i < keys.length - 1; i++) {
        current[keys[i]] = { ...current[keys[i]] };
        current = current[keys[i]];
      }
      
      // Set the final property
      current[keys[keys.length - 1]] = value;
      
      updateSettingsMutation.mutate(updatedSettings);
      setIsDirty(true);
      // Clear dirty state after successful save
      setTimeout(() => setIsDirty(false), 500);
    }
  };

  // Toggle dark mode
  const toggleDarkMode = () => {
    if (settings) {
      const modes = ['light', 'dark', 'system'];
      const currentIndex = modes.indexOf(settings.appearance.theme);
      const nextIndex = (currentIndex + 1) % modes.length;
      handleSettingChange('appearance.theme', modes[nextIndex]);
    }
  };

  // Render settings sections
  const renderGeneralSettings = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">Appearance</h3>
        
        <div className="space-y-4">
          {/* Theme Toggle */}
          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Theme</label>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Choose your preferred color scheme</p>
            </div>
            <button
              onClick={toggleDarkMode}
              className="flex items-center space-x-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={!settings || updateSettingsMutation.isPending}
            >
              {settings?.appearance.theme === 'dark' && '🌙 Dark'}
              {settings?.appearance.theme === 'light' && '☀️ Light'}
              {settings?.appearance.theme === 'system' && '💻 System'}
              <span className="text-xs">({settings?.appearance.theme})</span>
            </button>
          </div>

          {/* Language */}
          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Language</label>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Display language</p>
            </div>
            <select
              value={settings?.appearance.language || 'en'}
              onChange={(e) => handleSettingChange('appearance.language', e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={!settings || updateSettingsMutation.isPending}
            >
              <option value="en">English</option>
              <option value="es">Español</option>
              <option value="fr">Français</option>
              <option value="de">Deutsch</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );

  const renderAISettings = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">AI Features</h3>
      
      <div className="space-y-4">
        {/* AI Naming */}
        <div className="flex items-center justify-between">
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Automatic Session Naming</label>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Use AI to generate session names</p>
          </div>
          <button
            onClick={() => settings && handleSettingChange('ai.autoNaming', !settings.ai.autoNaming)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              settings?.ai.autoNaming ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'
            }`}
            disabled={!settings || updateSettingsMutation.isPending}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                settings?.ai.autoNaming ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        {/* AI Summaries */}
        <div className="flex items-center justify-between">
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Session Summaries</label>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Generate AI summaries for sessions</p>
          </div>
          <button
            onClick={() => settings && handleSettingChange('ai.summaries', !settings.ai.summaries)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              settings?.ai.summaries ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'
            }`}
            disabled={!settings || updateSettingsMutation.isPending}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                settings?.ai.summaries ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        {/* AI Provider */}
        {settings?.ai.autoNaming && (
          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">AI Provider</label>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Choose AI service for session naming</p>
            </div>
            <select
              value={settings?.ai.provider || 'chrome'}
              onChange={(e) => handleSettingChange('ai.provider', e.target.value as 'chrome' | 'openai' | 'fallback')}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={!settings || updateSettingsMutation.isPending}
            >
              <option value="chrome">Chrome Built-in AI</option>
              <option value="openai">OpenAI GPT</option>
              <option value="fallback">Rule-based Fallback</option>
            </select>
          </div>
        )}
      </div>
    </div>
  );

  const renderAutoSaveSettings = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">Auto-Save</h3>
      
      <div className="space-y-4">
        {/* Auto-Save Enabled */}
        <div className="flex items-center justify-between">
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Enable Auto-Save</label>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Automatically save sessions when closing browser</p>
          </div>
          <button
            onClick={() => settings && handleSettingChange('autoSave.enabled', !settings!.autoSave.enabled)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              settings?.autoSave.enabled ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'
            }`}
            disabled={!settings || updateSettingsMutation.isPending}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                settings?.autoSave.enabled ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        {/* Auto-Save Interval */}
        {settings?.autoSave.enabled && (
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-2">
              Auto-Save Interval: {settings.autoSave.intervalMinutes} minutes
            </label>
            <input
              type="range"
              min="1"
              max="60"
              value={settings.autoSave.intervalMinutes}
              onChange={(e) => handleSettingChange('autoSave.intervalMinutes', parseInt(e.target.value))}
              className="w-full"
              disabled={updateSettingsMutation.isPending}
            />
            <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
              <span>1 min</span>
              <span>30 min</span>
              <span>60 min</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  const renderPrivacySettings = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">Privacy & Data</h3>
      
      <div className="space-y-4">
        {/* Session Export */}
        <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Export/Import Sessions</h4>
          <div className="flex space-x-3 mb-4">
            <button
              onClick={() => exportSessionsMutation.mutate()}
              className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
              disabled={exportSessionsMutation.isPending}
            >
              {exportSessionsMutation.isPending ? 'Exporting...' : 'Export All Sessions'}
            </button>
            
            <label className="px-4 py-2 text-sm bg-green-600 text-white rounded-md hover:bg-green-700 cursor-pointer focus:outline-none focus:ring-2 focus:ring-green-500">
              Import Sessions
              <input
                type="file"
                accept=".json"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onload = (event) => {
                      try {
                        const jsonString = event.target?.result as string;
                        importSessionsMutation.mutate(jsonString, {
                          onSuccess: (result) => {
                            alert(`Import completed! ${result.imported} sessions imported, ${result.duplicates} skipped as duplicates.`);
                            if (result.errors.length > 0) {
                              console.warn('Import warnings:', result.errors);
                            }
                          },
                          onError: (error) => {
                            alert(`Import failed: ${error.message}`);
                          }
                        });
                      } catch (error) {
                        alert('Invalid file format. Please select a valid BTMS export file.');
                      }
                    };
                    reader.readAsText(file);
                  }
                }}
              />
            </label>
          </div>
        </div>
        
        {/* Settings Export */}
        <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Export/Import Settings</h4>
          <div className="flex space-x-3">
            <button
              onClick={() => {
                exportSettingsMutation.mutate(undefined, {
                  onSuccess: (jsonString) => {
                    // Create and download file
                    const blob = new Blob([jsonString], { type: 'application/json' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `btms-settings-${new Date().toISOString().split('T')[0]}.json`;
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                    URL.revokeObjectURL(url);
                  }
                });
              }}
              className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
              disabled={exportSettingsMutation.isPending}
            >
              {exportSettingsMutation.isPending ? 'Exporting...' : 'Export Settings'}
            </button>
            
            <label className="px-4 py-2 text-sm bg-green-600 text-white rounded-md hover:bg-green-700 cursor-pointer focus:outline-none focus:ring-2 focus:ring-green-500">
              Import Settings
              <input
                type="file"
                accept=".json"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onload = (event) => {
                      try {
                        const jsonString = event.target?.result as string;
                        importSettingsMutation.mutate(jsonString);
                      } catch (error) {
                        alert('Invalid settings file');
                      }
                    };
                    reader.readAsText(file);
                  }
                }}
              />
            </label>
          </div>
        </div>

        {/* Reset Settings */}
        <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Reset Settings</h4>
          <button
            onClick={() => {
              if (confirm('Are you sure you want to reset all settings to defaults?')) {
                resetSettingsMutation.mutate();
              }
            }}
            className="px-4 py-2 text-sm bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50"
            disabled={resetSettingsMutation.isPending}
          >
            {resetSettingsMutation.isPending ? 'Resetting...' : 'Reset to Defaults'}
          </button>
        </div>
      </div>
    </div>
  );

  const renderAboutSection = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">About BTMS</h3>
      
      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-400">Version:</span>
            <span className="font-medium text-gray-900 dark:text-gray-100">0.2.0</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-400">Build:</span>
            <span className="font-medium text-gray-900 dark:text-gray-100">Development</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-400">Chrome Extension:</span>
            <span className="font-medium text-green-600">Active</span>
          </div>
        </div>
      </div>

      <div className="text-center space-y-2">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Better Tab Management System
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-500">
          AI-powered browser session management
        </p>
        <div className="pt-2 space-x-4">
          <a href="https://github.com/rswift/btms" className="text-blue-600 hover:text-blue-800 text-sm">
            GitHub
          </a>
          <a href="https://docs.btms.dev" className="text-blue-600 hover:text-blue-800 text-sm">
            Documentation
          </a>
        </div>
      </div>
    </div>
  );

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="loading loading-spinner loading-lg"></div>
      </div>
    );
  }

  // Get current section content
  const renderCurrentSection = () => {
    switch (activeSection) {
      case 'general': return renderGeneralSettings();
      case 'ai': return renderAISettings();
      case 'autosave': return renderAutoSaveSettings();
      case 'privacy': return renderPrivacySettings();
      case 'about': return renderAboutSection();
      default: return renderGeneralSettings();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-6xl mx-auto py-6 px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Settings</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Configure your BTMS experience</p>
        </div>

        <div className="flex gap-6">
          {/* Sidebar Navigation */}
          <div className="w-64 flex-shrink-0">
            <nav className="space-y-1">
              {[
                { id: 'general', label: 'General', icon: '⚙️' },
                { id: 'ai', label: 'AI Features', icon: '🤖' },
                { id: 'autosave', label: 'Auto-Save', icon: '💾' },
                { id: 'privacy', label: 'Privacy & Data', icon: '🔒' },
                { id: 'about', label: 'About', icon: 'ℹ️' },
              ].map((section) => (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={`w-full flex items-center space-x-3 px-3 py-2 text-left rounded-md transition-colors ${
                    activeSection === section.id
                      ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 font-medium'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}
                >
                  <span>{section.icon}</span>
                  <span>{section.label}</span>
                </button>
              ))}
            </nav>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="p-6">
                {renderCurrentSection()}
              </div>
            </div>
          </div>
        </div>

        {/* Save Status */}
        {isDirty && (
          <div className="fixed bottom-4 right-4 bg-green-100 border border-green-400 text-green-700 px-4 py-2 rounded-md shadow-sm">
            Settings saved ✓
          </div>
        )}
      </div>
    </div>
  );
}