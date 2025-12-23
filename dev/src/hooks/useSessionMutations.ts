import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { Session, SessionTab } from '../types/session';

// Simple session capture using chrome APIs
async function captureCurrentSession(options: {
  name?: string;
  autoSave?: boolean;
  activeOnly?: boolean;
  useAINaming?: boolean;
}): Promise<Session> {
  console.log('🚀 Capturing session...');

  // Get all tabs
  const tabs = await chrome.tabs.query({});
  console.log(`📊 Found ${tabs.length} tabs`);

  // Transform to SessionTab format
  const sessionTabs: SessionTab[] = tabs
    .filter(tab => tab.id && tab.url && tab.title && !tab.incognito)
    .map(tab => ({
      id: tab.id!,
      index: tab.index,
      url: tab.url!,
      title: tab.title!,
      favicon: tab.favIconUrl,
      pinned: tab.pinned || false,
      active: tab.active || false,
      windowId: tab.windowId,
    }));

  // Generate AI name if requested and no manual name provided
  let sessionName = options.name;
  if (!sessionName && options.useAINaming) {
    console.log('🤖 Generating AI session name...');
    try {
      // Import AI service dynamically to avoid circular imports
      const { AIService } = await import('../services/ai/AIService');
      const aiService = AIService.getInstance();
      
      const aiResult = await aiService.generateSessionName(sessionTabs);
      if (aiResult.success && aiResult.name) {
        sessionName = aiResult.name;
        console.log('✅ Generated AI name:', sessionName, '(using', aiResult.aiType, 'AI)');
      } else {
        console.warn('⚠️ AI naming failed:', aiResult.error);
      }
    } catch (error) {
      console.error('❌ Error during AI naming:', error);
    }
  }

  // Group by window
  const windowsMap = new Map<number, SessionTab[]>();
  sessionTabs.forEach(tab => {
    const windowId = (tab as any).windowId || 0;
    if (!windowsMap.has(windowId)) {
      windowsMap.set(windowId, []);
    }
    windowsMap.get(windowId)!.push(tab);
  });

  // Create session
  const session: Session = {
    id: crypto.randomUUID(),
    name: sessionName || `Session ${new Date().toLocaleString()}`,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    tags: [],
    windows: Array.from(windowsMap.entries()).map(([windowId, tabs]) => ({
      id: windowId,
      focused: false,
      incognito: false,
      state: 'normal' as const,
      tabs,
    })),
    tabCount: sessionTabs.length,
    windowCount: windowsMap.size,
    isAutoSave: options.autoSave ?? false,
    source: 'manual' as const,
  };

  // Save to chrome.storage
  const existing = await chrome.storage.local.get('sessions');
  const sessions = existing.sessions || [];
  sessions.unshift(session);
  await chrome.storage.local.set({ sessions });

  console.log('✅ Session saved:', session.id);
  return session;
}

export function useCaptureCurrentSession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: captureCurrentSession,
    onSuccess: () => {
      console.log('🔄 Invalidating sessions cache');
      queryClient.invalidateQueries({ queryKey: ['sessions'] });
    },
    onError: (error) => {
      console.error('❌ Failed to capture session:', error);
    },
  });
}

export function useDeleteSession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const result = await chrome.storage.local.get('sessions');
      const sessions = (result.sessions || []).filter((s: Session) => s.id !== id);
      await chrome.storage.local.set({ sessions });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sessions'] });
    },
  });
}

export function useRestoreSession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      console.log('🔄 Restoring session:', id);
      
      // Get the session
      const result = await chrome.storage.local.get('sessions');
      const sessions = result.sessions || [];
      const session = sessions.find((s: Session) => s.id === id);
      
      if (!session) {
        throw new Error('Session not found');
      }

      console.log('📋 Restoring session with', session.windows.length, 'windows and', session.tabCount, 'tabs');

      // Restore each window
      for (const window of session.windows) {
        if (window.tabs.length === 0) continue;

        console.log('🪟 Creating window with', window.tabs.length, 'tabs');
        
        // Create window with tabs
        const newWindow = await chrome.windows.create({
          url: window.tabs.map(tab => tab.url),
          focused: window.focused,
          state: window.state,
        });

        console.log('✅ Created window:', newWindow.id);
      }

      return session;
    },
    onSuccess: (session) => {
      console.log('✅ Session restored successfully:', session.name);
      queryClient.invalidateQueries({ queryKey: ['sessions'] });
    },
    onError: (error) => {
      console.error('❌ Failed to restore session:', error);
    },
  });
}