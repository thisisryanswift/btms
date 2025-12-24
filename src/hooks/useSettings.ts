import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { SettingsService } from '../services/SettingsService';
import type { BTMSSettings } from '../types/settings';

// Query keys for React Query
export const SETTINGS_QUERY_KEY = ['settings'] as const;

// Read hooks
export function useSettings() {
  return useQuery({
    queryKey: SETTINGS_QUERY_KEY,
    queryFn: () => SettingsService.getInstance().getSettings(),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

export function useSetting<K extends keyof BTMSSettings>(key: K) {
  const settingsQuery = useSettings();
  return {
    ...settingsQuery,
    data: settingsQuery.data?.[key],
  };
}

// Write hooks
export function useUpdateSettings() {
  const queryClient = useQueryClient();
  const settingsService = SettingsService.getInstance();

  return useMutation({
    mutationFn: (updates: Partial<BTMSSettings>) => 
      settingsService.updateSettings(updates),
    onSuccess: (newSettings) => {
      queryClient.setQueryData(SETTINGS_QUERY_KEY, newSettings);
    },
    onError: (error) => {
      console.error('Failed to update settings:', error);
    },
  });
}

export function useUpdateSetting<K extends keyof BTMSSettings>(key: K) {
  const queryClient = useQueryClient();
  const settingsService = SettingsService.getInstance();

  return useMutation({
    mutationFn: (value: BTMSSettings[K]) => 
      settingsService.updateSetting(key, value),
    onSuccess: (newSettings) => {
      queryClient.setQueryData(SETTINGS_QUERY_KEY, newSettings);
    },
    onError: (error) => {
      console.error(`Failed to update ${String(key)}:`, error);
    },
  });
}

export function useResetSettings() {
  const queryClient = useQueryClient();
  const settingsService = SettingsService.getInstance();

  return useMutation({
    mutationFn: () => settingsService.resetSettings(),
    onSuccess: (newSettings) => {
      queryClient.setQueryData(SETTINGS_QUERY_KEY, newSettings);
    },
    onError: (error) => {
      console.error('Failed to reset settings:', error);
    },
  });
}

// Export/Import hooks
export function useExportSettings() {
  return useMutation({
    mutationFn: () => SettingsService.getInstance().exportSettings(),
    onError: (error) => {
      console.error('Failed to export settings:', error);
    },
  });
}

export function useImportSettings() {
  const queryClient = useQueryClient();
  const settingsService = SettingsService.getInstance();

  return useMutation({
    mutationFn: (jsonString: string) => 
      settingsService.importSettings(jsonString),
    onSuccess: (newSettings) => {
      queryClient.setQueryData(SETTINGS_QUERY_KEY, newSettings);
    },
    onError: (error) => {
      console.error('Failed to import settings:', error);
    },
  });
}

// Hook for listening to settings changes
export function useSettingsListener(callback: (settings: BTMSSettings) => void) {
  React.useEffect(() => {
    const settingsService = SettingsService.getInstance();
    settingsService.onSettingsChanged(callback);

    return () => {
      // Cleanup not needed for chrome.storage.onChanged
    };
  }, [callback]);
}