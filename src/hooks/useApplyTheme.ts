import { useEffect } from 'react';
import { useSettings } from './useSettings';

/**
 * Hook to apply the current theme setting to the document
 */
export function useApplyTheme() {
    const { data: settings } = useSettings();

    useEffect(() => {
        if (!settings?.appearance?.theme) return;

        const applyTheme = (isDark: boolean) => {
            document.documentElement.classList.toggle('dark', isDark);
        };

        if (settings.appearance.theme === 'dark') {
            applyTheme(true);
        } else if (settings.appearance.theme === 'light') {
            applyTheme(false);
        } else {
            // System preference
            const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
            applyTheme(mediaQuery.matches);

            // Listen for system changes
            const handler = (e: MediaQueryListEvent) => {
                if (settings.appearance.theme === 'system') {
                    applyTheme(e.matches);
                }
            };
            mediaQuery.addEventListener('change', handler);
            return () => mediaQuery.removeEventListener('change', handler);
        }
    }, [settings?.appearance?.theme]);
}
